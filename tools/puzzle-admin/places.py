"""Map and merchant edits. The original map files stay put.

Edits live in site/data/places/overrides.json and a matching overrides.js
that the public map loads. A previous copy is kept before every save.
"""

import json
import math
import secrets
import shutil
import subprocess
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
JAPAN = SITE / "data" / "japan" / "map-data.js"
MALAYSIA = SITE / "data" / "malaysia" / "map-data.js"
STORE = SITE / "data" / "places" / "overrides.json"
PUBLIC = SITE / "data" / "places" / "overrides.js"
BACKUPS = Path(__file__).resolve().parent / "backups" / "places"
PRIVATE = Path(__file__).resolve().parent / "data" / "provenance.json"
PHOTO_DIR = SITE / "media" / "merchants"

ID_RE = __import__("re").compile(r"^[a-z][a-z0-9_]{1,63}$")
TYPES = [
    "station", "airport", "church", "shrine", "temple", "museum", "castle",
    "castle_ruins", "historic", "mosque", "beach", "waterfall", "forest",
    "mountain", "viewpoint", "nature", "landmark", "coffee", "restaurant",
    "supermarket", "market", "shop", "merchant",
]
PIN_GROUPS = {
    "railway": ["station"],
    "airport": ["airport"],
    "cultural": ["church", "shrine", "temple", "museum", "castle", "castle_ruins", "historic", "mosque"],
    "discovery": ["beach", "waterfall", "forest", "mountain", "viewpoint", "nature", "landmark", "coffee", "restaurant", "supermarket", "market", "shop"],
    "merchant": ["merchant"],
}
TIERS = ["", "free", "optional"]
COUNTRIES = ["japan", "malaysia"]
SOURCES = ("merchant", "admin", "online", "legacy")
PREFECTURES = {
    "北海道": "hokkaido", "青森県": "aomori", "岩手県": "iwate", "宮城県": "miyagi",
    "秋田県": "akita", "山形県": "yamagata", "福島県": "fukushima", "茨城県": "ibaraki",
    "栃木県": "tochigi", "群馬県": "gunma", "埼玉県": "saitama", "千葉県": "chiba",
    "東京都": "tokyo", "神奈川県": "kanagawa", "新潟県": "niigata", "富山県": "toyama",
    "石川県": "ishikawa", "福井県": "fukui", "山梨県": "yamanashi", "長野県": "nagano",
    "岐阜県": "gifu", "静岡県": "shizuoka", "愛知県": "aichi", "三重県": "mie",
    "滋賀県": "shiga", "京都府": "kyoto", "大阪府": "osaka", "兵庫県": "hyogo",
    "奈良県": "nara", "和歌山県": "wakayama", "鳥取県": "tottori", "島根県": "shimane",
    "岡山県": "okayama", "広島県": "hiroshima", "山口県": "yamaguchi", "徳島県": "tokushima",
    "香川県": "kagawa", "愛媛県": "ehime", "高知県": "kochi", "福岡県": "fukuoka",
    "佐賀県": "saga", "長崎県": "nagasaki", "熊本県": "kumamoto", "大分県": "oita",
    "宮崎県": "miyazaki", "鹿児島県": "kagoshima", "沖縄県": "okinawa",
}
COUNTRY_CODES = {"jp": "japan", "my": "malaysia"}
ISO_PREFECTURES = {
    "JP-01": "hokkaido", "JP-02": "aomori", "JP-03": "iwate", "JP-04": "miyagi",
    "JP-05": "akita", "JP-06": "yamagata", "JP-07": "fukushima", "JP-08": "ibaraki",
    "JP-09": "tochigi", "JP-10": "gunma", "JP-11": "saitama", "JP-12": "chiba",
    "JP-13": "tokyo", "JP-14": "kanagawa", "JP-15": "niigata", "JP-16": "toyama",
    "JP-17": "ishikawa", "JP-18": "fukui", "JP-19": "yamanashi", "JP-20": "nagano",
    "JP-21": "gifu", "JP-22": "shizuoka", "JP-23": "aichi", "JP-24": "mie",
    "JP-25": "shiga", "JP-26": "kyoto", "JP-27": "osaka", "JP-28": "hyogo",
    "JP-29": "nara", "JP-30": "wakayama", "JP-31": "tottori", "JP-32": "shimane",
    "JP-33": "okayama", "JP-34": "hiroshima", "JP-35": "yamaguchi", "JP-36": "tokushima",
    "JP-37": "kagawa", "JP-38": "ehime", "JP-39": "kochi", "JP-40": "fukuoka",
    "JP-41": "saga", "JP-42": "nagasaki", "JP-43": "kumamoto", "JP-44": "oita",
    "JP-45": "miyazaki", "JP-46": "kagoshima", "JP-47": "okinawa",
}

_CACHE = {"stamp": None, "pins": []}


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%S-%fZ")


def load_store():
    if not STORE.exists():
        return {"version": 1, "places": {}}
    try:
        data = json.loads(STORE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"version": 1, "places": {}}
    if not isinstance(data.get("places"), dict):
        data["places"] = {}
    data["version"] = 1
    return data


def load_private():
    if not PRIVATE.exists():
        return {"version": 1, "places": {}}
    try:
        data = json.loads(PRIVATE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"version": 1, "places": {}}
    if not isinstance(data.get("places"), dict):
        data["places"] = {}
    return data


def provenance_for(place_id, data=None):
    data = load_private() if data is None else data
    places = data.get("places") or {}
    row = places.get(place_id) or {}
    source = row.get("source") if row.get("source") in SOURCES else "legacy"
    verified = str(row.get("verified") or "")
    if len(verified) != 10:
        verified = ""
    return {
        "source": source,
        "sourceDetails": str(row.get("sourceDetails") or ""),
        "verified": verified,
        "notes": str(row.get("notes") or ""),
        "recorded": place_id in places,
    }


def save_provenance(place_id, body):
    if "source" not in body and "sourceDetails" not in body and "notes" not in body and "verified" not in body:
        return
    data = load_private()
    source = body.get("source") if body.get("source") in SOURCES else "legacy"
    verified = str(body.get("verified") or "").strip()
    if len(verified) != 10 or verified[4] != "-" or verified[7] != "-":
        verified = ""
    data["places"][place_id] = {
        "source": source,
        "sourceDetails": str(body.get("sourceDetails") or "").strip()[:300],
        "verified": verified,
        "notes": str(body.get("notes") or "").strip()[:1000],
    }
    PRIVATE.parent.mkdir(parents=True, exist_ok=True)
    PRIVATE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _write(data):
    STORE.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    STORE.write_text(text, encoding="utf-8")
    PUBLIC.write_text("window.TURBO_PLACE_OVERRIDES = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")


def backup_and_write(data):
    BACKUPS.mkdir(parents=True, exist_ok=True)
    if STORE.exists():
        shutil.copy2(STORE, BACKUPS / (_now() + ".json"))
    _write(data)
    copies = sorted(BACKUPS.glob("*.json"))
    for old in copies[:-30]:
        old.unlink()


def base_pins():
    stamp = (JAPAN.stat().st_mtime, MALAYSIA.stat().st_mtime)
    if _CACHE["stamp"] == stamp:
        return _CACHE["pins"]
    script = r"""
const fs = require("fs");
const vm = require("vm");
function load(file) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx);
  return ctx.window;
}
const japan = load(process.argv[1]).MAP_DATA.pins || [];
const malaysia = load(process.argv[2]).SABAH_MAP_DATA.pins || [];
japan.forEach((pin) => { pin.country = "japan"; });
malaysia.forEach((pin) => { pin.country = "malaysia"; });
process.stdout.write(JSON.stringify(japan.concat(malaysia)));
"""
    raw = subprocess.check_output(["node", "-e", script, str(JAPAN), str(MALAYSIA)], cwd=str(ROOT))
    pins = json.loads(raw.decode("utf-8"))
    _CACHE["stamp"] = stamp
    _CACHE["pins"] = pins
    return pins


def _view(pin, override):
    row = dict(pin)
    row["disabled"] = False
    row["managed"] = False
    if override:
        row.update({key: override.get(key) for key in override if key != "id"})
        row["id"] = pin.get("id") or override.get("id")
        row["managed"] = True
        row["disabled"] = bool(override.get("disabled"))
    row["country"] = row.get("country") or "japan"
    return row


def catalogue():
    base = {}
    order = []
    for pin in base_pins():
        pid = pin.get("id")
        if not pid or pid in base:
            continue
        base[pid] = pin
        order.append(pid)
    store = load_store()["places"]
    rows = []
    for pid in order:
        override = store.get(pid)
        if override and override.get("deleted"):
            continue
        rows.append(_view(base[pid], override))
    for pid, override in store.items():
        if override.get("deleted") or pid in base:
            continue
        rows.append(_view({"id": pid, "country": override.get("country") or "japan"}, override))
    return rows


def search(query, country, area, category, source="", limit=40):
    query = (query or "").strip().lower()
    private = load_private()
    rows = []
    for row in catalogue():
        if country and row.get("country") != country:
            continue
        if area and row.get("area") != area:
            continue
        kind = row.get("type") or ""
        if category in PIN_GROUPS:
            if kind not in PIN_GROUPS[category]:
                continue
        elif category and kind != category:
            continue
        if source in SOURCES and provenance_for(row.get("id"), private).get("source") != source:
            continue
        blob = " ".join(str(row.get(key) or "") for key in ("id", "name", "nameEn", "area", "postcardId")).lower()
        if query and query not in blob:
            continue
        rows.append({
            "id": row.get("id"),
            "name": row.get("name") or "",
            "nameEn": row.get("nameEn") or "",
            "country": row.get("country") or "japan",
            "area": row.get("area") or "",
            "type": row.get("type") or "",
            "lat": row.get("lat"),
            "lng": row.get("lng"),
            "disabled": bool(row.get("disabled")),
            "managed": bool(row.get("managed")),
        })
    return rows[:limit], len(rows)


def get_place(place_id):
    for row in catalogue():
        if row.get("id") == place_id:
            row.update(provenance_for(place_id))
            return row
    return None


def _distance(a_lat, a_lng, b_lat, b_lng):
    radius = 6371000
    p1 = math.radians(a_lat)
    p2 = math.radians(b_lat)
    dlat = math.radians(b_lat - a_lat)
    dlng = math.radians(b_lng - a_lng)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlng / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


def duplicates(place_id, name, lat, lng):
    found = []
    if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
        return found
    folded = (name or "").strip().lower()
    for row in catalogue():
        if row.get("id") == place_id or row.get("disabled"):
            continue
        if not isinstance(row.get("lat"), (int, float)):
            continue
        distance = _distance(lat, lng, row["lat"], row["lng"])
        same_name = folded and folded in ((row.get("name") or "").lower(), (row.get("nameEn") or "").lower())
        if distance <= 80 or (same_name and distance <= 400):
            found.append({"id": row["id"], "name": row.get("name") or row["id"], "meters": round(distance)})
        if len(found) >= 5:
            break
    return found


def clean_record(body, existing):
    place_id = (body.get("id") or "").strip()
    if existing:
        place_id = existing
    if not ID_RE.match(place_id):
        raise ValueError("Use a permanent id of lowercase letters, numbers, and underscores.")
    country = body.get("country") if body.get("country") in COUNTRIES else "japan"
    kind = body.get("type") if body.get("type") in TYPES else "shop"
    try:
        lat = round(float(body.get("lat")), 6)
        lng = round(float(body.get("lng")), 6)
    except (TypeError, ValueError):
        raise ValueError("Latitude and longitude are required.")
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        raise ValueError("Those coordinates are outside the world map.")
    name = str(body.get("name") or "").strip()
    if not name:
        raise ValueError("A Japanese or local name is required.")
    tier = body.get("serviceTier") if body.get("serviceTier") in TIERS else ""
    record = {
        "id": place_id,
        "country": country,
        "area": str(body.get("area") or "").strip()[:40],
        "type": kind,
        "name": name[:120],
        "nameEn": str(body.get("nameEn") or "").strip()[:120],
        "description": str(body.get("description") or "").strip()[:600],
        "descriptionEn": str(body.get("descriptionEn") or "").strip()[:600],
        "lat": lat,
        "lng": lng,
        "address": str(body.get("address") or "").strip()[:240],
        "line": str(body.get("line") or "").strip()[:80],
        "website": str(body.get("website") or "").strip()[:200],
        "image": str(body.get("image") or "").strip()[:200],
        "serviceTier": tier,
        "postcardId": str(body.get("postcardId") or "").strip()[:20],
        "disabled": bool(body.get("disabled")),
    }
    if body.get("radiusMeters") not in ("", None):
        try:
            radius = int(body.get("radiusMeters"))
        except (TypeError, ValueError):
            raise ValueError("GPS radius must be a whole number of metres.")
        if not 30 <= radius <= 500:
            raise ValueError("GPS radius must be between 30 and 500 metres.")
        record["radiusMeters"] = radius
    return record


def allocate_id(reserved=None):
    """New permanent ids. Existing map ids are never passed through here."""
    taken = set(reserved or ())
    for _ in range(12):
        candidate = "p_" + secrets.token_hex(8)
        if candidate not in taken and not get_place(candidate):
            return candidate
    raise ValueError("Could not assign a unique permanent id.")


def save_place(body, confirm=False):
    data = load_store()
    body = dict(body)
    place_id = (body.get("id") or "").strip()
    known = bool(place_id) and (place_id in data["places"] or bool(get_place(place_id)))
    if known and body.get("new"):
        raise ValueError("That id is already used. Keep the existing place, or choose a new id.")
    if known:
        body["id"] = place_id
        existing = place_id
    else:
        if not ID_RE.match(place_id):
            place_id = allocate_id(data["places"])
        body["id"] = place_id
        existing = ""
    record = clean_record(body, existing)
    clashes = duplicates(record["id"], record["name"], record["lat"], record["lng"])
    if clashes and not confirm:
        return {"ok": False, "duplicates": clashes, "place": {"id": record["id"]}}
    data["places"][record["id"]] = record
    backup_and_write(data)
    save_provenance(record["id"], body)
    record.update(provenance_for(record["id"]))
    return {"ok": True, "place": record}


def delete_place(place_id):
    """Remove a place from the published map. A base pin keeps a deleted marker so the original file is not rewritten and the pin does not return. A place that exists only as an edit is dropped. Player collections are not read or written."""
    place_id = (place_id or "").strip()
    current = get_place(place_id)
    if not current:
        raise ValueError("Unknown place")
    data = load_store()
    base_ids = {pin.get("id") for pin in base_pins()}
    if place_id in base_ids:
        data["places"][place_id] = {
            "id": place_id,
            "country": current.get("country") or "japan",
            "name": current.get("name") or place_id,
            "deleted": True,
        }
    else:
        data["places"].pop(place_id, None)
    backup_and_write(data)
    return {"ok": True, "id": place_id}


def set_disabled(place_id, disabled):
    current = get_place(place_id)
    if not current:
        raise ValueError("Unknown place")
    current["disabled"] = bool(disabled)
    current["new"] = False
    return save_place(current, confirm=True)


def list_backups():
    if not BACKUPS.exists():
        return []
    return [path.name for path in sorted(BACKUPS.glob("*.json"), reverse=True)[:30]]


def undo():
    copies = sorted(BACKUPS.glob("*.json"))
    if not copies:
        raise ValueError("There is no earlier map edit to restore.")
    latest = copies[-1]
    data = json.loads(latest.read_text(encoding="utf-8"))
    latest.unlink()
    _write(data)
    return {"restored": latest.name}


def geocode_hit(item):
    """Fields taken only from one geocoder result. Missing values stay blank."""
    address = item.get("address") if isinstance(item.get("address"), dict) else {}
    names = item.get("namedetails") if isinstance(item.get("namedetails"), dict) else {}
    local = names.get("name:ja") or names.get("name") or item.get("name") or ""
    english = names.get("name:en") or ""
    if english == local:
        english = ""
    iso = address.get("ISO3166-2-lvl4") or ""
    state = address.get("state") or address.get("province") or ""
    area = ISO_PREFECTURES.get(iso) or PREFECTURES.get(state, "")
    osm_type = item.get("osm_type") or ""
    osm_id = item.get("osm_id")
    reference = ""
    if osm_type in ("node", "way", "relation") and osm_id:
        reference = "https://www.openstreetmap.org/" + osm_type + "/" + str(osm_id)
    return {
        "label": item.get("display_name") or local,
        "name": local,
        "nameEn": english,
        "country": COUNTRY_CODES.get(address.get("country_code") or "", ""),
        "area": area,
        "address": item.get("display_name") or "",
        "lat": float(item["lat"]),
        "lng": float(item["lon"]),
        "source": "online",
        "sourceDetails": reference,
    }


def geocode(query):
    query = (query or "").strip()
    if len(query) < 3:
        return []
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({
        "q": query,
        "format": "jsonv2",
        "addressdetails": "1",
        "namedetails": "1",
        "limit": "5",
    })
    request = urllib.request.Request(url, headers={"User-Agent": "TurboAdventuresLocalAdmin/1.0"})
    with urllib.request.urlopen(request, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return [geocode_hit(item) for item in payload]


def import_places(rows):
    """Same save path a future CSV or JSON import will use. No interface yet.

    A row with an existing id is updated and keeps that id. A row without an
    id is assigned one. Names and coordinates are required; nothing else is filled in.
    """
    saved = []
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("Each imported place must be an object.")
        saved.append(save_place(row, confirm=True)["place"])
    return saved


def save_photo(place_id, blob, ext):
    if not ID_RE.match(place_id or ""):
        raise ValueError("Save the place before adding a photograph.")
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    path = PHOTO_DIR / (place_id + ext)
    path.write_bytes(blob)
    return "/" + path.resolve().relative_to(SITE.resolve()).as_posix()
