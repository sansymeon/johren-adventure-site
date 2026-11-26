"""Local postcard designs and the QR registry. Not deployed."""

import json
import re
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = Path(__file__).resolve().parent / "data"
IMAGES = DATA / "images"
DESIGNS = DATA / "designs"
REGISTRY_PATH = DATA / "registry.json"
PUBLIC_PATH = ROOT / "site" / "data" / "qr" / "destinations.json"
SITE_MEDIA = ROOT / "site" / "media"

INTRO_PATH = "/shops/"
INACTIVE_PATH = "/q/inactive.html"
STATUSES = ("unassigned", "distributed", "assigned", "inactive")
ID_RE = re.compile(r"^TA-\d{6}$")
DESIGN_RE = re.compile(r"^pc-[a-z0-9]{8}$")

_LOCK = threading.Lock()


def now():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def blank_registry():
    return {"version": 1, "next": 1, "codes": []}


def load_registry():
    if not REGISTRY_PATH.is_file():
        return blank_registry()
    try:
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return blank_registry()
    if not isinstance(data.get("codes"), list):
        data["codes"] = []
    data["next"] = int(data.get("next") or 1)
    data["version"] = 1
    return data


def save_registry(data):
    DATA.mkdir(parents=True, exist_ok=True)
    REGISTRY_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def allocate_id(data):
    used = {row.get("id") for row in data["codes"]}
    number = max(1, int(data.get("next") or 1))
    while True:
        code = "TA-%06d" % number
        number += 1
        if code not in used:
            data["next"] = number
            return code


def public_path_for(row):
    status = row.get("status")
    if status == "inactive":
        return INACTIVE_PATH
    if status in ("unassigned", "distributed"):
        return INTRO_PATH
    destination = (row.get("destination") or "").strip()
    return destination or INTRO_PATH


def destination_ok(value):
    value = (value or "").strip()
    if not value:
        return False
    if value.startswith("/") and not value.startswith("//") and ".." not in value:
        return True
    if value.startswith("https://") and " " not in value:
        return True
    return False


def new_code(design_id=""):
    with _LOCK:
        data = load_registry()
        code = allocate_id(data)
        row = {
            "id": code,
            "createdAt": now(),
            "status": "unassigned",
            "merchant": "",
            "location": "",
            "destination": "",
            "designId": design_id,
            "note": "",
        }
        data["codes"].append(row)
        save_registry(data)
        return row


def find_code(code_id):
    data = load_registry()
    for row in data["codes"]:
        if row.get("id") == code_id:
            return row
    return None


def update_code(code_id, fields):
    with _LOCK:
        data = load_registry()
        row = next((item for item in data["codes"] if item.get("id") == code_id), None)
        if row is None:
            return None, "Unknown QR id"
        if "status" in fields:
            status = fields["status"]
            if status not in STATUSES:
                return None, "Unknown status"
            row["status"] = status
        for key in ("merchant", "location", "note", "designId"):
            if key in fields:
                row[key] = str(fields[key] or "")[:200]
        if "destination" in fields:
            destination = str(fields["destination"] or "").strip()
            if destination and not destination_ok(destination):
                return None, "Destination must be a site path or an https URL"
            row["destination"] = destination
        if row["status"] == "assigned" and not destination_ok(row.get("destination")):
            return None, "An assigned code needs a destination path or https URL"
        save_registry(data)
        return row, ""


def link_design(code_id, design_id):
    with _LOCK:
        data = load_registry()
        row = next((item for item in data["codes"] if item.get("id") == code_id), None)
        if row is None:
            return
        row["designId"] = design_id
        save_registry(data)


def write_public_registry():
    """Write the public lookup file under site/. Does not deploy."""
    data = load_registry()
    entries = {}
    for row in data["codes"]:
        code = row.get("id")
        if not ID_RE.match(code or ""):
            continue
        entries[code] = {"status": row.get("status") or "unassigned", "path": public_path_for(row)}
    payload = {
        "version": 1,
        "updated": now(),
        "defaultPath": INTRO_PATH,
        "note": "Printed QR codes use /q/TA-######. This file is what the public site reads after a site publish. Local admin edits are not live until then.",
        "entries": entries,
    }
    PUBLIC_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return payload


def design_path(design_id):
    return DESIGNS / (design_id + ".json")


def list_designs():
    if not DESIGNS.is_dir():
        return []
    rows = []
    for path in sorted(DESIGNS.glob("pc-*.json")):
        try:
            row = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        rows.append({
            "id": row.get("id"),
            "title": row.get("title") or "",
            "orientation": row.get("orientation") or "portrait",
            "qrId": (row.get("qr") or {}).get("id") or "",
            "updatedAt": row.get("updatedAt") or "",
        })
    return rows


def read_design(design_id):
    if not DESIGN_RE.match(design_id or ""):
        return None
    path = design_path(design_id)
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def save_design(design):
    DESIGNS.mkdir(parents=True, exist_ok=True)
    design["updatedAt"] = now()
    design_path(design["id"]).write_text(json.dumps(design, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    link_design(design["qr"]["id"], design["id"])
    return design
