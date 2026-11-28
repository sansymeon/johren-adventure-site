"""HTTP handlers for the local postcard studio. Called by the admin server."""

import json
import secrets
import zipfile
from io import BytesIO
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import render
import store

HERE = Path(__file__).resolve().parent
STUDIO_HTML = HERE / "studio.html"
REGISTRY_HTML = HERE / "registry.html"


def _json_body(handler):
    raw = handler.read_body() or b""
    try:
        body = json.loads(raw.decode() or "{}")
    except json.JSONDecodeError:
        return None
    return body if isinstance(body, dict) else None


def _design_from_body(body, existing=None):
    design, error = render.clean_design(body, existing)
    if error:
        return None, error
    if not design.get("id"):
        design["id"] = "pc-" + secrets.token_hex(4)
    if not design.get("createdAt"):
        design["createdAt"] = store.now()
    return design, ""


def _margin_scale(values, fallback):
    raw = values[0] if values else fallback
    try:
        value = round(float(raw), 2)
    except (TypeError, ValueError):
        value = None
    allowed = {round(item, 2): item for item in render.MARGIN_SCALES}
    if value in allowed:
        return allowed[value]
    return allowed.get(round(float(fallback), 2), 1)


def _send_file(handler, data, kind, filename=None):
    handler.send_response(200)
    handler.send_header("Content-Type", kind)
    handler.send_header("Cache-Control", "no-store")
    if filename:
        handler.send_header("Content-Disposition", "attachment; filename=\"%s\"" % filename)
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def handle_get(handler, path):
    if path in ("/postcards", "/postcards/"):
        _send_file(handler, STUDIO_HTML.read_bytes(), "text/html; charset=utf-8")
        return True
    if path in ("/postcards/registry", "/postcards/registry/"):
        _send_file(handler, REGISTRY_HTML.read_bytes(), "text/html; charset=utf-8")
        return True
    if path == "/api/postcards":
        handler.send_json(200, {"designs": store.list_designs(), "images": _images()})
        return True
    if path == "/api/postcards/design":
        design_id = parse_qs(urlparse(handler.path).query).get("id", [""])[0]
        design = store.read_design(design_id)
        if design is None:
            handler.send_json(404, {"error": "Unknown design"})
            return True
        handler.send_json(200, {"design": design, "landing": render.landing_hint(design["qr"]["id"])})
        return True
    if path == "/api/qr":
        handler.send_json(200, {"registry": store.load_registry(), "intro": store.INTRO_PATH})
        return True
    if path == "/api/qr/backup":
        payload = json.dumps({
            "registry": store.load_registry(),
            "designs": _all_designs(),
        }, indent=2, ensure_ascii=False).encode()
        _send_file(handler, payload, "application/json", "postcard-backup.json")
        return True
    if path == "/api/postcards/backup.zip":
        _send_file(handler, _zip_data(), "application/zip", "postcard-data.zip")
        return True
    if path.startswith("/postcards/image/"):
        name = Path(path.split("/")[-1]).name
        file_path = (store.IMAGES / name).resolve()
        if not str(file_path).startswith(str(store.IMAGES.resolve())) or not file_path.is_file():
            handler.send_json(404, {"error": "Missing image"})
            return True
        kind = "image/png" if file_path.suffix.lower() == ".png" else "image/jpeg"
        _send_file(handler, file_path.read_bytes(), kind)
        return True
    return False


def handle_post(handler, path):
    if path == "/api/postcards/preview":
        body = _json_body(handler)
        if body is None:
            handler.send_json(400, {"error": "Expected a design"})
            return True
        existing = store.read_design(body.get("id") or "")
        design, error = _design_from_body(body, existing)
        if error:
            handler.send_json(400, {"error": error})
            return True
        side = body.get("side") if body.get("side") in ("front", "back") else "front"
        boxes = render.text_boxes(render.side_content(design, side).get("texts") or [], design.get("orientation") or "portrait", render.PREVIEW_DPI)
        handler.send_response(200)
        handler.send_header("Content-Type", "image/jpeg")
        handler.send_header("Cache-Control", "no-store")
        handler.send_header("X-Postcard-Text", json.dumps(boxes, separators=(",", ":")))
        data = render.preview_bytes(design, side)
        handler.send_header("Content-Length", str(len(data)))
        handler.end_headers()
        handler.wfile.write(data)
        return True
    if path == "/api/postcards/save":
        body = _json_body(handler)
        if body is None:
            handler.send_json(400, {"error": "Expected a design"})
            return True
        existing = store.read_design(body.get("id") or "")
        design, error = _design_from_body(body, existing)
        if error:
            handler.send_json(400, {"error": error})
            return True
        if existing is None and store.design_path(design["id"]).exists():
            handler.send_json(400, {"error": "That design id already exists"})
            return True
        store.save_design(design)
        handler.send_json(200, {"design": design})
        return True
    if path == "/api/postcards/assign-qr":
        row = store.new_code()
        handler.send_json(200, {"id": row["id"], "url": "https://johrenadventure.com/q/" + row["id"]})
        return True
    if path == "/api/postcards/new":
        body = _json_body(handler) or {}
        qr_kind = body.get("kind") if body.get("kind") in ("general", "none") else "merchant"
        if qr_kind == "merchant":
            row = store.new_code()
            qr = {"kind": "merchant", "id": row["id"], "url": "https://johrenadventure.com/q/" + row["id"], "sizeMm": 22, "x": 0.78, "y": 0.82}
        elif qr_kind == "general":
            qr = {"kind": "general", "id": "", "url": "https://johrenadventure.com/", "sizeMm": 22, "x": 0.78, "y": 0.82}
        else:
            qr = {"kind": "none", "id": "", "url": "", "sizeMm": 22, "x": 0.78, "y": 0.82}
        design = {
            "id": "pc-" + secrets.token_hex(4),
            "title": "",
            "orientation": "portrait",
            "image": "",
            "texts": [{"lang": "ja", "text": "", "sizeMm": 8, "color": "#ffffff", "x": 0.5, "y": 0.18, "font": "noto"}],
            "layers": [],
            "sides": {
                "front": {"image": "", "texts": [{"lang": "ja", "text": "", "sizeMm": 8, "color": "#ffffff", "x": 0.5, "y": 0.18, "font": "noto"}], "layers": []},
                "back": {"image": "", "texts": [], "layers": []},
            },
            "qr": qr,
            "createdAt": store.now(),
        }
        store.save_design(design)
        handler.send_json(200, {"design": design})
        return True
    if path == "/api/postcards/duplicate":
        body = _json_body(handler) or {}
        source = store.read_design(body.get("id") or "")
        if source is None:
            handler.send_json(404, {"error": "Unknown design"})
            return True
        copy = json.loads(json.dumps(source))
        copy["id"] = "pc-" + secrets.token_hex(4)
        copy["title"] = (source.get("title") or "Postcard") + " copy"
        qr_kind = (copy.get("qr") or {}).get("kind") or "merchant"
        if qr_kind == "merchant":
            row = store.new_code()
            copy["qr"]["kind"] = "merchant"
            copy["qr"]["id"] = row["id"]
            copy["qr"]["url"] = "https://johrenadventure.com/q/" + row["id"]
        elif qr_kind == "general":
            copy["qr"]["id"] = ""
            copy["qr"]["url"] = "https://johrenadventure.com/"
        else:
            copy["qr"]["kind"] = "none"
            copy["qr"]["id"] = ""
            copy["qr"]["url"] = ""
        copy["createdAt"] = store.now()
        store.save_design(copy)
        handler.send_json(200, {"design": copy})
        return True
    if path == "/api/postcards/upload":
        _upload(handler)
        return True
    if path == "/api/postcards/export":
        body = _json_body(handler)
        if body is None:
            handler.send_json(400, {"error": "Expected a design"})
            return True
        query = parse_qs(urlparse(handler.path).query)
        kind = query.get("format", ["png"])[0]
        if kind not in ("png", "jpeg", "pdf", "preview", "duplex"):
            handler.send_json(400, {"error": "Use png, jpeg, or pdf"})
            return True
        existing = store.read_design(body.get("id") or "")
        design, error = _design_from_body(body, existing)
        if error:
            handler.send_json(400, {"error": error})
            return True
        scale = _margin_scale(query.get("scaleFront", query.get("scale", ["1"])), 1)
        back_scale = _margin_scale(query.get("scaleBack", query.get("scale", [str(scale)])), scale)
        if kind == "preview":
            _send_file(handler, render.preview_scaled(design, scale, back_scale), "image/jpeg", None)
            return True
        if kind == "duplex":
            _send_file(handler, render.pdf_a4_copies(design, scale, back_scale), "application/pdf", "postcard-duplex.pdf")
            return True
        side = body.get("side") if body.get("side") in ("front", "back") else "front"
        layout = "margin" if kind == "pdf" else "standard"
        data, mime, ext = render.export_bytes(design, kind, side, layout, scale, back_scale)
        filename = "%s-%s.%s" % (design["qr"]["id"], design["id"], ext)
        _send_file(handler, data, mime, filename)
        return True
    if path == "/api/postcards/export-batch":
        body = _json_body(handler) or {}
        ids = body.get("ids") if isinstance(body.get("ids"), list) else []
        scale = _margin_scale([body.get("scaleFront", body.get("scale", 1))], 1)
        back_scale = _margin_scale([body.get("scaleBack", body.get("scale", scale))], scale)
        designs = []
        missing = []
        for code_id in ids:
            row = store.find_code(str(code_id))
            design = store.read_design((row or {}).get("designId") or "") if row else None
            if design is None:
                missing.append(str(code_id))
            else:
                designs.append(design)
        if missing or not designs:
            handler.send_json(400, {"error": "No saved design for " + ", ".join(missing or ["the selection"])})
            return True
        data = render.pdf_a4_batch(designs, scale, back_scale)
        _send_file(handler, data, "application/pdf", "postcards-a4-duplex.pdf")
        return True
    if path == "/api/qr/save":
        body = _json_body(handler) or {}
        row, error = store.update_code(body.get("id") or "", body)
        if error:
            handler.send_json(400, {"error": error})
            return True
        handler.send_json(200, {"code": row})
        return True
    if path == "/api/qr/publish-file":
        payload = store.write_public_registry()
        handler.send_json(200, {
            "ok": True,
            "count": len(payload["entries"]),
            "file": "site/data/qr/destinations.json",
            "message": "The public lookup file is updated on this computer. johrenadventure.com changes only after you publish the site from Admin home.",
        })
        return True
    if path == "/api/qr/restore":
        body = _json_body(handler)
        if body is None or not isinstance(body.get("registry"), dict):
            handler.send_json(400, {"error": "Expected a backup with a registry"})
            return True
        error = _restore(body)
        if error:
            handler.send_json(400, {"error": error})
            return True
        handler.send_json(200, {"ok": True, "registry": store.load_registry()})
        return True
    return False


def _images():
    rows = []
    if store.IMAGES.is_dir():
        for path in sorted(store.IMAGES.iterdir()):
            if path.suffix.lower() in (".jpg", ".jpeg", ".png"):
                rows.append({"ref": "local:" + path.name, "name": path.name})
    puzzles = store.SITE_MEDIA / "puzzles"
    if puzzles.is_dir():
        for path in sorted(puzzles.iterdir()):
            if path.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
                rows.append({"ref": "/media/puzzles/" + path.name, "name": path.name})
    return rows


def _all_designs():
    designs = []
    if not store.DESIGNS.is_dir():
        return designs
    for path in sorted(store.DESIGNS.glob("pc-*.json")):
        try:
            designs.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            continue
    return designs


def _upload(handler):
    content_type = handler.headers.get("Content-Type", "")
    if "boundary=" not in content_type:
        handler.send_json(400, {"error": "Expected an image upload"})
        return
    raw = handler.read_body()
    if raw is None:
        handler.send_json(413, {"error": "File is larger than 15 MB"})
        return
    boundary = content_type.split("boundary=")[-1].strip().encode()
    marker = b"--" + boundary
    name, blob = "", b""
    for part in raw.split(marker):
        if b"filename=" not in part:
            continue
        header, _, data = part.partition(b"\r\n\r\n")
        if data.endswith(b"\r\n"):
            data = data[:-2]
        match_name = header.split(b'filename="', 1)[-1].split(b'"', 1)[0].decode("utf-8", "replace")
        name, blob = match_name, data
        break
    ext = Path(name).suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png") or not blob:
        handler.send_json(400, {"error": "Upload a JPG or PNG"})
        return
    store.IMAGES.mkdir(parents=True, exist_ok=True)
    stored = "card-" + secrets.token_hex(4) + ext
    (store.IMAGES / stored).write_bytes(blob)
    width, height = 1, 1
    try:
        with render.Image.open(BytesIO(blob)) as picture:
            width, height = picture.size
    except render.Image.UnidentifiedImageError:
        pass
    handler.send_json(200, {"ref": "local:" + stored, "name": stored, "width": width, "height": height})


def _zip_data():
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        if store.DATA.is_dir():
            for path in store.DATA.rglob("*"):
                if path.is_file():
                    archive.write(path, path.relative_to(store.DATA).as_posix())
    return buffer.getvalue()


def _restore(body):
    registry = body["registry"]
    codes = registry.get("codes")
    if not isinstance(codes, list):
        return "Backup registry has no codes"
    seen = set()
    for row in codes:
        code = row.get("id")
        if not store.ID_RE.match(code or "") or code in seen:
            return "Backup has a missing or duplicate QR id"
        seen.add(code)
        if row.get("status") not in store.STATUSES:
            return "Backup has an unknown status"
        if row.get("destination") and not store.destination_ok(row.get("destination")):
            return "Backup has a destination that is not a path or https URL"
    highest = 0
    for code in seen:
        highest = max(highest, int(code.split("-")[1]))
    registry = {
        "version": 1,
        "next": max(int(registry.get("next") or 1), highest + 1),
        "codes": codes,
    }
    stamp = store.DATA / ("registry-before-restore-" + store.now().replace(":", "") + ".json")
    if store.REGISTRY_PATH.is_file():
        store.DATA.mkdir(parents=True, exist_ok=True)
        stamp.write_bytes(store.REGISTRY_PATH.read_bytes())
    store.save_registry(registry)
    designs = body.get("designs")
    if isinstance(designs, list):
        store.DESIGNS.mkdir(parents=True, exist_ok=True)
        for design in designs:
            design_id = design.get("id") if isinstance(design, dict) else ""
            if store.DESIGN_RE.match(design_id or ""):
                store.design_path(design_id).write_text(json.dumps(design, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return ""
