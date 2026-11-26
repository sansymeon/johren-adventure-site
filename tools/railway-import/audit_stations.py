#!/usr/bin/env python3
"""Audit JR passenger stations against the map. Does not replace the map.

The structured source is the ekidata CSV published with
piuccio/open-data-jp-railway-stations (input/station20180330free.csv).
That file is a snapshot dated 2018-03-30. piuccio stations.json cannot
filter JR West, JR Central, JR Shikoku, or JR Kyushu: most line_code
values in it are blank. The MLIT railway GIS (国土数値情報 N02) is the
official national dataset, but it is a shapefile of tracks and stations
for every operator and has no English names, so it is not the input here.

Preview only, unless --apply is given an edited preview file.
--apply appends approved stations and never edits an existing id.
"""

import argparse
import json
import math
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAP_PATH = ROOT / "site" / "data" / "japan" / "map-data.js"
CSV_PATH = Path(__file__).resolve().parent / "cache" / "station20180330free.csv"
PREVIEW_DIR = Path(__file__).resolve().parent / "preview"

# JIS prefecture code -> map area slug.
PREFECTURES = {
    "1": "hokkaido", "2": "aomori", "3": "iwate", "4": "miyagi", "5": "akita",
    "6": "yamagata", "7": "fukushima", "8": "ibaraki", "9": "tochigi",
    "10": "gunma", "11": "saitama", "12": "chiba", "13": "tokyo",
    "14": "kanagawa", "15": "niigata", "16": "toyama", "17": "ishikawa",
    "18": "fukui", "19": "yamanashi", "20": "nagano", "21": "gifu",
    "22": "shizuoka", "23": "aichi", "24": "mie", "25": "shiga",
    "26": "kyoto", "27": "osaka", "28": "hyogo", "29": "nara",
    "30": "wakayama", "31": "tottori", "32": "shimane", "33": "okayama",
    "34": "hiroshima", "35": "yamaguchi", "36": "tokushima", "37": "kagawa",
    "38": "ehime", "39": "kochi", "40": "fukuoka", "41": "saga",
    "42": "nagasaki", "43": "kumamoto", "44": "oita", "45": "miyazaki",
    "46": "kagoshima", "47": "okinawa",
}
ALIASES = {
    "itoshima": "fukuoka",
    "tokuyama": "yamaguchi",
    "kobe": "hyogo",
    "nagoya": "aichi",
}
# ekidata line_cd prefixes. 114 is shared by JR East and JR West.
JR_EAST_114 = {
    "11401", "11402", "11403", "11404", "11406", "11407", "11408", "11409",
    "11410", "11411", "11412", "11413",
}
JR_WEST_114 = {"11415", "11416", "11417", "11418", "11419", "11421", "11422"}
PREFIX_COMPANY = {
    "111": "jr_hokkaido",
    "112": "jr_east",
    "113": "jr_east",
    "115": "jr_central",
    "116": "jr_west",
    "117": "jr_west",
    "118": "jr_shikoku",
    "119": "jr_kyushu",
}


def company_for(line_cd):
    if line_cd in JR_EAST_114:
        return "jr_east"
    if line_cd in JR_WEST_114:
        return "jr_west"
    return PREFIX_COMPANY.get(line_cd[:3])


def haversine(lat1, lng1, lat2, lng2):
    r = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlng / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def canonical(area):
    return ALIASES.get(area or "", area or "")


def load_map():
    raw = subprocess.check_output(
        [
            "node",
            "-e",
            (
                "const fs=require('fs');const vm=require('vm');const c={window:{}};"
                "vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),c);"
                "process.stdout.write(JSON.stringify(c.window.MAP_DATA.pins));"
            ),
            str(MAP_PATH),
        ],
        text=True,
    )
    return json.loads(raw)


def load_csv():
    import csv
    with CSV_PATH.open(encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def slug(text):
    text = text.lower().replace("ō", "o").replace("ū", "u").replace("ē", "e")
    text = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return text or "station"


def audit(pref_slug):
    code = next(k for k, v in PREFECTURES.items() if v == pref_slug)
    pins = load_map()
    rows = load_csv()
    existing_ids = {p.get("id") for p in pins}
    here = [p for p in pins if canonical(p.get("area")) == pref_slug and p.get("type") == "station"]
    by_name = defaultdict(list)
    for pin in here:
        by_name[pin.get("name")].append(pin)

    groups = defaultdict(list)
    for row in rows:
        if row["pref_cd"] != code:
            continue
        if company_for(row["line_cd"]) is None:
            continue
        groups[row["station_g_cd"]].append(row)

    matched = []
    missing = []
    closed = []
    conflicts = []
    for group_rows in groups.values():
        open_rows = [r for r in group_rows if r["e_status"] == "0"]
        closed_rows = [r for r in group_rows if r["e_status"] != "0"]
        if not open_rows:
            sample = group_rows[0]
            closed.append({
                "name": sample["station_name"],
                "status": sample["e_status"],
                "closed": sample["close_ymd"],
            })
            continue
        sample = open_rows[0]
        name = sample["station_name"]
        lat = float(sample["lat"])
        lng = float(sample["lon"])
        companies = sorted({company_for(r["line_cd"]) for r in open_rows})
        same = by_name.get(name, [])
        near = []
        for pin in here:
            if pin.get("lat") is None:
                continue
            dist = haversine(lat, lng, pin["lat"], pin["lng"])
            if dist <= 200:
                near.append({"id": pin["id"], "name": pin.get("name"), "meters": round(dist)})
        record = {
            "name": name,
            "nameEn": sample["station_name_r"],
            "lat": lat,
            "lng": lng,
            "line": companies[0],
            "lines": companies,
            "ekidataGroup": sample["station_g_cd"],
            "snapshotStatus": "operating in the 2018-03-30 ekidata snapshot",
        }
        if same:
            record["existingIds"] = [p["id"] for p in same]
            matched.append(record)
            if any(abs(p["lat"] - lat) > 0.01 or abs(p["lng"] - lng) > 0.01 for p in same):
                conflicts.append({
                    "kind": "same name, coordinates differ by more than about 1 km",
                    "name": name,
                    "existing": [{"id": p["id"], "lat": p["lat"], "lng": p["lng"]} for p in same],
                    "dataset": {"lat": lat, "lng": lng},
                })
        else:
            other = [
                p for p in pins
                if p.get("type") == "station" and p.get("name") == name and canonical(p.get("area")) != pref_slug
            ]
            if other:
                conflicts.append({
                    "kind": "same station name in another prefecture",
                    "name": name,
                    "existing": [{"id": p["id"], "area": p.get("area")} for p in other],
                })
            if near:
                conflicts.append({
                    "kind": "within 200 m of an existing station with a different name",
                    "name": name,
                    "near": near,
                })
            missing.append(record)

    map_names = {p.get("name") for p in here}
    dataset_names = {r["station_name"] for rows_ in groups.values() for r in rows_ if r["e_status"] == "0"}
    only_on_map = sorted(map_names - dataset_names)
    return {
        "prefecture": pref_slug,
        "source": "ekidata station CSV dated 2018-03-30, via piuccio/open-data-jp-railway-stations",
        "note": "A station can be suspended or abandoned after this snapshot and still be listed as operating. Review before approving. Mine Line is an example.",
        "onMap": len(here),
        "matched": matched,
        "missing": missing,
        "closedInSnapshot": closed,
        "conflicts": conflicts,
        "onMapButNotInSnapshot": only_on_map,
        "approve": missing,
        "existingIdCount": len(existing_ids),
    }


def print_summary(report):
    print(f"{report['prefecture']}: {report['onMap']} station pins on the map")
    print(f"matched: {len(report['matched'])}")
    print(f"missing from the map: {len(report['missing'])}")
    print(f"closed in the 2018 snapshot and excluded: {len(report['closedInSnapshot'])}")
    print(f"conflicts to review: {len(report['conflicts'])}")
    print(f"on the map but not in the snapshot: {len(report['onMapButNotInSnapshot'])}")
    if report["missing"]:
        print("missing names:", "、".join(item["name"] for item in report["missing"]))
    if report["conflicts"]:
        print("conflicts:")
        for item in report["conflicts"]:
            print(f"  {item['kind']}: {item['name']}")


def apply_preview(path):
    report = json.loads(Path(path).read_text(encoding="utf-8"))
    pins = load_map()
    ids = {p.get("id") for p in pins}
    pref = report["prefecture"]
    here = {
        p.get("name")
        for p in pins
        if canonical(p.get("area")) == pref and p.get("type") == "station"
    }
    blocks = []
    for item in report.get("approve") or []:
        name = item["name"]
        if name in here:
            print(f"skip existing name {name}")
            continue
        base = f"{item.get('line') or 'jr'}_{slug(item.get('nameEn') or name)}"
        sid = base
        n = 2
        while sid in ids:
            sid = f"{base}_{n}"
            n += 1
        ids.add(sid)
        en = item.get("nameEn") or name
        blocks.append(
            "    {\n"
            f'      id: "{sid}",\n'
            f'      line: "{item.get("line") or "jr"}",\n'
            f'      area: "{pref}",\n'
            f'      name: "{name}",\n'
            f'      nameEn: "{en}",\n'
            '      type: "station",\n'
            f'      lat: {item["lat"]},\n'
            f'      lng: {item["lng"]}\n'
            "    },"
        )
    if not blocks:
        print("nothing to add")
        return
    text = MAP_PATH.read_text(encoding="utf-8")
    needle = "  ]\n};"
    idx = text.rfind(needle)
    if idx < 0:
        raise SystemExit("map-data.js has no closing pin list")
    MAP_PATH.write_text(text[:idx] + "\n".join(blocks) + "\n" + text[idx:], encoding="utf-8")
    print(f"appended {len(blocks)} stations. Existing ids were not edited.")


def main():
    parser = argparse.ArgumentParser(description="Preview JR stations missing from the map.")
    parser.add_argument("--prefecture", choices=sorted(set(PREFECTURES.values())))
    parser.add_argument("--apply", help="Append stations still listed under approve in this preview JSON.")
    args = parser.parse_args()
    if not CSV_PATH.exists():
        raise SystemExit(f"Missing {CSV_PATH}. See docs/railway-stations.md.")
    if args.apply:
        apply_preview(args.apply)
        return
    if not args.prefecture:
        raise SystemExit("Pass --prefecture or --apply.")
    report = audit(args.prefecture)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    out = PREVIEW_DIR / f"{args.prefecture}.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print_summary(report)
    print(f"preview: {out}")
    print("Delete unwanted entries from approve, then run with --apply. Existing ids are not changed.")


if __name__ == "__main__":
    main()
