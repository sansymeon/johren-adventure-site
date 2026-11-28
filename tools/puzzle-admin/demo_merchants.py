"""Fictional merchant reward demos. Not discovery-map places.

QR codes are new registry rows. Existing assigned destinations are left as they are.
"""

import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
STORE = SITE / "data" / "merchants" / "merchants.json"
LEGACY = SITE / "data" / "merchants" / "demo.json"
PUBLIC_QR = SITE / "data" / "qr" / "destinations.json"
POSTCARD = ROOT / "tools" / "postcard-studio"
if str(POSTCARD) not in sys.path:
    sys.path.insert(0, str(POSTCARD))
if str(POSTCARD / "vendor") not in sys.path:
    sys.path.insert(0, str(POSTCARD / "vendor"))

import store  # noqa: E402

CHARACTERS = [
    {"id": "turbo", "file": "/media/turbo/poses/turbo_confident_transparent.webp", "ja": "ターボ", "en": "Turbo"},
    {"id": "seagull", "file": "/media/heroes/transparent/captain_seagull_flying.webp", "ja": "キャプテン・シーガル", "en": "Captain Seagull"},
    {"id": "nibbles", "file": "/media/heroes/transparent/nibbles_dragon.webp", "ja": "ニブルズ", "en": "Nibbles"},
    {"id": "lola", "file": "/media/heroes/transparent/madame_lola_flamingo_moviestar.webp", "ja": "ローラ", "en": "Lola"},
    {"id": "hooves", "file": "/media/heroes/transparent/sargeant_hooves_royalguard.webp", "ja": "フーズ軍曹", "en": "Sergeant Hooves"},
    {"id": "henrietta", "file": "/media/heroes/transparent/dame_henrietta_cluckington_chicken.webp", "ja": "アンリエッタ", "en": "Henrietta"},
    {"id": "bubbles", "file": "/media/heroes/transparent/bubbles_babydragon.webp", "ja": "バブルス", "en": "Bubbles"},
    {"id": "humphrey", "file": "/media/heroes/transparent/sir_humphrey_proboscis.webp", "ja": "ハンフリー", "en": "Humphrey"},
]
PUZZLES = [
    "/media/puzzles/5_piece_christmas_916.jpg",
    "/media/puzzles/5_piece_winter_villaga_carolers.jpg",
]
PHOTO = "/shops/demo/bistro-turbo-cafe.jpg"
PLANS = ("free", "standard", "premium")


def empty_store():
    return {"version": 1, "next": 1, "characters": CHARACTERS, "puzzles": PUZZLES, "merchants": {}}


def issue_id(data):
    number = int(data.get("next") or 1)
    data["next"] = number + 1
    return "TS-%06d" % number


def merchant(mid, plan, ja, en, character="", puzzle="", alias="", demo=False):
    return {
        "id": mid,
        "alias": alias,
        "demo": demo,
        "plan": plan,
        "name": {"ja": ja, "en": en},
        "welcome": {
            "ja": "いらっしゃいませ。今日のご来店の記念に、店のステッカーをお受け取りください。",
            "en": "Welcome in. Please take a sticker as a memento of your visit today.",
        },
        "about": {
            "ja": "糸島の海岸沿いにある、小さなビストロです。昼はテラス、夜は静かな席で過ごせます。",
            "en": "A small bistro along the Itoshima coast. A terrace at lunch, and a quiet table in the evening.",
        },
        "address": {"ja": "福岡県糸島市", "en": "Itoshima, Fukuoka"},
        "hours": {"ja": "11:30–15:00、18:00–21:00（火曜定休）", "en": "11:30–15:00 and 18:00–21:00. Closed Tuesday."},
        "photo": PHOTO,
        "character": character,
        "puzzle": puzzle,
        "calendar": "/shops/demo/bistro-turbo-january.jpg" if plan == "premium" else "",
        "website": "https://example.com" if plan == "premium" else "",
        "qrs": [],
        "enabled": True,
    }


def load():
    if STORE.exists():
        data = json.loads(STORE.read_text(encoding="utf-8"))
    elif LEGACY.exists():
        data = migrate_legacy(json.loads(LEGACY.read_text(encoding="utf-8")))
    else:
        data = empty_store()
    data.setdefault("characters", CHARACTERS)
    data.setdefault("puzzles", PUZZLES)
    data.setdefault("merchants", {})
    data.setdefault("next", 1)
    if not data["merchants"]:
        seed_demos(data)
    ensure_codes(data)
    save(data)
    for row in data["merchants"].values():
        write_pages(row)
    return data


def migrate_legacy(old):
    data = empty_store()
    order = [("bistro-a", "demo-a"), ("bistro-b", "demo-b"), ("bistro-c", "demo-c")]
    for old_id, alias in order:
        source = (old.get("merchants") or {}).get(old_id)
        if not source:
            continue
        mid = issue_id(data)
        source["id"] = mid
        source["alias"] = alias
        source["demo"] = True
        source["legacyId"] = old_id
        source["qrs"] = [source.pop("qr")] if source.get("qr") else []
        data["merchants"][mid] = source
    return data


def seed_demos(data):
    specs = [
        ("demo-a", "free", "ビストロ・ターボA", "Bistro Turbo A", "", ""),
        ("demo-b", "standard", "ビストロ・ターボB", "Bistro Turbo B", "lola", ""),
        ("demo-c", "premium", "ビストロ・ターボC", "Bistro Turbo C", "turbo", PUZZLES[0]),
    ]
    for alias, plan, ja, en, character, puzzle in specs:
        mid = issue_id(data)
        data["merchants"][mid] = merchant(mid, plan, ja, en, character, puzzle, alias, True)


def save(data):
    STORE.parent.mkdir(parents=True, exist_ok=True)
    STORE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def public_path(row):
    slug = row.get("alias") if row.get("demo") and row.get("alias") else row["id"]
    return "/shops/%s/" % slug


PAGE = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/media/icons/apple-touch-icon.png" sizes="180x180">
<meta name="theme-color" content="#0e7884">
<title>Shop</title>
<link rel="stylesheet" href="/shops/reward/shop.css">
</head>
<body>
<main id="shop"></main>
<script src="/shops/reward/shop.js"></script>
<script src="/js/nav.js"></script>
</body>
</html>
"""


def write_pages(row):
    slugs = [row["id"]]
    if row.get("demo") and row.get("alias"):
        slugs.append(row["alias"])
    for slug in slugs:
        for lang, folder in (("ja", SITE / "shops" / slug), ("en", SITE / "en" / "shops" / slug)):
            folder.mkdir(parents=True, exist_ok=True)
            (folder / "index.html").write_text(PAGE.format(lang=lang), encoding="utf-8")


def patch_destination(code, path, status):
    payload = json.loads(PUBLIC_QR.read_text(encoding="utf-8"))
    entries = payload.setdefault("entries", {})
    if code in entries and entries[code].get("path") not in ("", "/shops/", "/shops/reward/?m=bistro-a", "/shops/reward/?m=bistro-b", "/shops/reward/?m=bistro-c", path):
        if not str(entries[code].get("path") or "").startswith("/shops/reward/") and not str(entries[code].get("path") or "").startswith("/shops/demo-") and not str(entries[code].get("path") or "").startswith("/shops/TS-"):
            return
    entries[code] = {"status": status, "path": path}
    PUBLIC_QR.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_codes(data):
    for row in data["merchants"].values():
        row.setdefault("qrs", [])
        if not row["qrs"]:
            continue
        status = "assigned" if row.get("enabled", True) else "inactive"
        label = row["name"]["en"] + (" (demo)" if row.get("demo") else "")
        for code in list(row["qrs"]):
            if not store.find_code(code):
                continue
            store.update_code(code, {
                "status": status,
                "merchant": label,
                "destination": public_path(row),
            })
            patch_destination(code, public_path(row), status)


def update_merchant(mid, fields):
    data = load()
    row = data["merchants"].get(mid)
    if not row:
        raise ValueError("Unknown merchant")
    plan = fields.get("plan") if fields.get("plan") in PLANS else row["plan"]
    row["plan"] = plan
    name = fields.get("name") if isinstance(fields.get("name"), dict) else {}
    if name.get("ja"):
        row["name"]["ja"] = str(name["ja"])[:80]
    if name.get("en"):
        row["name"]["en"] = str(name["en"])[:80]
    photo = str(fields.get("photo") or row["photo"])
    if photo.startswith("/shops/demo/") or photo.startswith("/media/"):
        row["photo"] = photo
    for key in ("welcome", "about", "address", "hours"):
        incoming = fields.get(key) if isinstance(fields.get(key), dict) else {}
        row.setdefault(key, {"ja": "", "en": ""})
        if incoming.get("ja"):
            row[key]["ja"] = str(incoming["ja"])[:400]
        if incoming.get("en"):
            row[key]["en"] = str(incoming["en"])[:400]
    website = str(fields.get("website") or "")
    row["website"] = website if plan == "premium" and website.startswith("https://") else ""
    calendar = str(fields.get("calendar") or "")
    row["calendar"] = calendar if plan == "premium" and calendar.startswith("/") else ""
    character = str(fields.get("character") or "")
    ids = {item["id"] for item in data["characters"]}
    if plan == "free":
        row["character"] = ""
    elif character in ids:
        row["character"] = character
    puzzle = str(fields.get("puzzle") or "")
    if plan == "premium" and puzzle in data["puzzles"]:
        row["puzzle"] = puzzle
    elif plan != "premium":
        row["puzzle"] = ""
    row["enabled"] = bool(fields.get("enabled", True))
    ensure_codes(data)
    save(data)
    write_pages(row)
    return data


def create_merchant():
    data = load()
    mid = issue_id(data)
    row = merchant(mid, "free", "新しい店舗", "New shop")
    data["merchants"][mid] = row
    save(data)
    write_pages(row)
    return data


def add_qr(mid):
    data = load()
    row = data["merchants"].get(mid)
    if not row:
        raise ValueError("Unknown merchant")
    created = store.new_code()
    code = created["id"]
    row.setdefault("qrs", []).append(code)
    status = "assigned" if row.get("enabled", True) else "inactive"
    store.update_code(code, {
        "status": status,
        "merchant": row["name"]["en"],
        "destination": public_path(row),
        "note": "Merchant page " + row["id"],
    })
    patch_destination(code, public_path(row), status)
    save(data)
    return data


def qr_png(mid):
    import segno
    data = load()
    row = data["merchants"].get(mid)
    codes = (row or {}).get("qrs") or []
    if not row or not codes:
        raise ValueError("Unknown merchant")
    url = "https://johrenadventure.com/q/" + codes[0]
    buffer = io.BytesIO()
    segno.make(url, error="m").save(buffer, kind="png", scale=8, border=2)
    return buffer.getvalue(), url
