#!/usr/bin/env python3
"""Local Puzzle Admin. Binds to 127.0.0.1 only. Not part of the Netlify site."""

import hashlib
import hmac
import json
import os
import re
import secrets
import subprocess
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "site"
CONFIG_PATH = SITE / "data" / "puzzle" / "config.json"
ACTIVE_JS = SITE / "data" / "puzzle" / "active.js"
PUZZLE_DIR = SITE / "media" / "puzzles"
SECRET_PATH = ROOT / "admin.secret"
BACKUP_DIR = Path(__file__).resolve().parent / "backups"
UI = Path(__file__).resolve().parent / "admin.html"
STUDIO = ROOT / "tools" / "creator-studio"
MASTERS = ROOT / "artwork"
LIBRARY = MASTERS / "studio_library"
LIBRARY_MANIFEST = LIBRARY / "manifest.json"
HOST = "127.0.0.1"
PORT = 8770
POSTCARD = ROOT / "tools" / "postcard-studio"
if str(POSTCARD) not in sys.path:
    sys.path.insert(0, str(POSTCARD))
import api as postcard_api
COOKIE = "turbo_admin"
MAX_UPLOAD = 15 * 1024 * 1024

LIBRARY_ROOTS = [
    SITE / "media" / "puzzles",
    SITE / "media" / "scenes",
]
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
UPLOAD_EXT = {".jpg", ".jpeg", ".png"}


def load_secret():
    if not SECRET_PATH.exists():
        password = secrets.token_urlsafe(18)
        SECRET_PATH.write_text(password + "\n", encoding="utf-8")
        os.chmod(SECRET_PATH, 0o600)
        print("Created admin.secret. This password is not deployed.")
        print("Admin password:", password)
    return SECRET_PATH.read_text(encoding="utf-8").strip()


SECRET = load_secret()


def sign(value):
    mac = hmac.new(SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()
    return value + "." + mac


def session_ok(header):
    if not header:
        return False
    token = ""
    for part in header.split(";"):
        part = part.strip()
        if part.startswith(COOKIE + "="):
            token = part.split("=", 1)[1]
    if "." not in token:
        return False
    value, mac = token.rsplit(".", 1)
    expected = hmac.new(SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(mac, expected):
        return False
    try:
        expiry = int(value)
    except ValueError:
        return False
    return expiry > int(time.time())


def image_size(path):
    data = path.read_bytes()[:64]
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(path.read_bytes()) >= 24:
        raw = path.read_bytes()
        width = int.from_bytes(raw[16:20], "big")
        height = int.from_bytes(raw[20:24], "big")
        return width, height
    raw = path.read_bytes()
    if raw[:2] == b"\xff\xd8":
        i = 2
        while i < len(raw) - 8:
            if raw[i] != 0xFF:
                i += 1
                continue
            marker = raw[i + 1]
            if marker in (0xC0, 0xC1, 0xC2):
                height = int.from_bytes(raw[i + 5:i + 7], "big")
                width = int.from_bytes(raw[i + 7:i + 9], "big")
                return width, height
            if marker == 0xD8 or marker == 0xD9:
                i += 2
                continue
            size = int.from_bytes(raw[i + 2:i + 4], "big")
            i += 2 + size
    return 1600, 900


def public_path(path):
    rel = path.resolve().relative_to(SITE.resolve())
    return "/" + rel.as_posix()


PUZZLE_LEVELS = ("5", "10", "25", "50")


def image_record(source, include_reveal=False):
    record = {
        "image": source.get("image") or "",
        "imageWidth": int(source.get("imageWidth") or 1600),
        "imageHeight": int(source.get("imageHeight") or 900),
    }
    if include_reveal and source.get("revealImage"):
        record["revealImage"] = source["revealImage"]
        record["revealImageWidth"] = int(source.get("revealImageWidth") or record["imageWidth"])
        record["revealImageHeight"] = int(source.get("revealImageHeight") or record["imageHeight"])
    if source.get("wallpaper"):
        record["wallpaper"] = source["wallpaper"]
        record["wallpaperWidth"] = int(source.get("wallpaperWidth") or 1080)
        record["wallpaperHeight"] = int(source.get("wallpaperHeight") or 1920)
    if source.get("celebration"):
        record["celebration"] = source["celebration"]
    if source.get("merchantWebsite"):
        record["merchantWebsite"] = source["merchantWebsite"]
    if source.get("merchantSponsored") is True:
        record["merchantSponsored"] = True
    return record


def normalize_config(config):
    if not isinstance(config, dict):
        config = {}
    levels = config.get("levels") if isinstance(config.get("levels"), dict) else None
    if not levels:
        levels = {}
        for key in PUZZLE_LEVELS:
            levels[key] = image_record(config, include_reveal=(key == "5"))
    else:
        fallback = image_record(config)
        for key in PUZZLE_LEVELS:
            row = levels.get(key) if isinstance(levels.get(key), dict) else None
            if not row or not row.get("image"):
                levels[key] = dict(fallback)
            else:
                levels[key] = image_record(row, include_reveal=True)
    first = levels["5"]
    return {
        "version": 2,
        "image": first["image"],
        "imageWidth": first["imageWidth"],
        "imageHeight": first["imageHeight"],
        "levels": levels,
        "note": "Each railway level has its own picture and optional final reveal. A puzzle already started keeps its picture.",
    }


def read_config():
    return normalize_config(json.loads(CONFIG_PATH.read_text(encoding="utf-8")))


def write_config(config):
    config = normalize_config(config)
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    active = {
        "version": 2,
        "image": config["image"],
        "imageWidth": config["imageWidth"],
        "imageHeight": config["imageHeight"],
        "levels": config["levels"],
    }
    ACTIVE_JS.write_text(
        "/* Generated from site/data/puzzle/config.json. Do not edit by hand. */\n"
        "window.TURBO_PUZZLE_ACTIVE = "
        + json.dumps(active, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    return config


def media_file(image):
    if not image.startswith("/media/"):
        return None
    file_path = (SITE / image.lstrip("/")).resolve()
    if not str(file_path).startswith(str(SITE.resolve())) or not file_path.is_file():
        return None
    if file_path.suffix.lower() not in ALLOWED_EXT:
        return None
    return file_path


def list_images():
    found = []
    for folder in LIBRARY_ROOTS:
        if not folder.exists():
            continue
        for path in sorted(folder.rglob("*")):
            if path.suffix.lower() not in ALLOWED_EXT or not path.is_file():
                continue
            width, height = image_size(path)
            found.append({
                "path": public_path(path),
                "name": path.name,
                "width": width,
                "height": height,
            })
    return found


def safe_name(name):
    stem = Path(name).stem.lower()
    stem = re.sub(r"[^a-z0-9_-]+", "-", stem).strip("-") or "puzzle"
    ext = Path(name).suffix.lower()
    if ext == ".jpeg":
        ext = ".jpg"
    return stem + ext


def read_demo():
    path = SITE / "data" / "create" / "demo.json"
    if not path.is_file():
        return {"version": 1, "characters": [], "backgrounds": []}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"version": 1, "characters": [], "backgrounds": []}
    cleaned = clean_demo(data)
    return cleaned or {"version": 1, "characters": [], "backgrounds": []}


def demo_files():
    folder = SITE / "media" / "create-demo"
    if not folder.is_dir():
        return []
    return [public_path(path) for path in sorted(folder.iterdir()) if path.is_file() and path.suffix.lower() in ALLOWED_EXT]


def clean_demo(body):
    if not isinstance(body, dict):
        return None
    characters = []
    backgrounds = []
    for item in body.get("characters") or []:
        if not isinstance(item, dict):
            continue
        file_name = item.get("file") or ""
        if not file_name.startswith("/media/create-demo/") or media_file(file_name) is None:
            return None
        characters.append({
            "id": re.sub(r"[^a-z0-9_-]+", "_", str(item.get("id") or "character").lower())[:40] or "character",
            "name": str(item.get("name") or "")[:80],
            "nameEn": str(item.get("nameEn") or "")[:80],
            "label": str(item.get("label") or "")[:40],
            "labelEn": str(item.get("labelEn") or "")[:40],
            "file": file_name,
            "width": int(item.get("width") or 1024),
            "height": int(item.get("height") or 1024),
        })
    for item in body.get("backgrounds") or []:
        if not isinstance(item, dict):
            continue
        file_name = item.get("file") or ""
        if not file_name.startswith("/media/create-demo/") or media_file(file_name) is None:
            return None
        shape = item.get("format") if item.get("format") in ("landscape", "portrait") else "landscape"
        backgrounds.append({
            "id": re.sub(r"[^a-z0-9_-]+", "_", str(item.get("id") or "background").lower())[:40] or "background",
            "name": str(item.get("name") or "")[:80],
            "nameEn": str(item.get("nameEn") or "")[:80],
            "file": file_name,
            "width": int(item.get("width") or 1600),
            "height": int(item.get("height") or 900),
            "format": shape,
        })
    return {"version": 1, "characters": characters, "backgrounds": backgrounds}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[admin]", fmt % args)

    def send_json(self, code, payload, cookie=None):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)

    def authed(self):
        return session_ok(self.headers.get("Cookie"))

    def read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_UPLOAD:
            return None
        return self.rfile.read(length)

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/admin"):
            data = UI.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if path == "/api/session":
            self.send_json(200, {"ok": self.authed()})
            return
        if not self.authed():
            self.send_json(401, {"error": "Sign in required"})
            return
        if path == "/api/catalogue/library":
            self.send_json(200, read_library())
            return
        if path == "/api/puzzle":
            self.send_json(200, {"config": read_config(), "library": list_images()})
            return
        if path in ("/creator", "/creator/", "/studio", "/studio/"):
            self.send_response(302)
            self.send_header("Location", "/studio/index.html")
            self.end_headers()
            return
        if path.startswith("/studio/") or path.startswith("/masters/"):
            self.send_creator_file(path)
            return
        if path == "/api/artwork":
            self.send_json(200, {"folders": artwork_summary()})
            return
        if path == "/api/backups":
            names = sorted(p.name for p in BACKUP_DIR.glob("*.json")) if BACKUP_DIR.exists() else []
            self.send_json(200, {"backups": names})
            return
        if path in ("/artwork", "/map", "/merchant", "/settings", "/backup"):
            self.send_page(path)
            return
        if path in ("/create-demo", "/create-demo/"):
            self.send_file(Path(__file__).resolve().parent / "demo.html", "text/html; charset=utf-8")
            return
        if path == "/api/demo":
            self.send_json(200, {"config": read_demo(), "files": demo_files()})
            return
        if path in ("/puzzle-test", "/puzzle-test/"):
            self.send_file(Path(__file__).resolve().parent / "puzzle-test.html", "text/html; charset=utf-8")
            return
        if path == "/puzzle-test/frame":
            self.send_file(Path(__file__).resolve().parent / "puzzle-test-frame.html", "text/html; charset=utf-8")
            return
        if path.startswith("/player/"):
            self.send_site_file(path[len("/player/"):])
            return
        if path.startswith("/media/") or path.startswith("/data/"):
            self.send_site_file(path.lstrip("/"))
            return
        if path.startswith("/preview/"):
            rel = path[len("/preview/"):]
            file_path = (SITE / rel).resolve()
            if not str(file_path).startswith(str(SITE.resolve())) or not file_path.is_file():
                self.send_json(404, {"error": "Missing image"})
                return
            data = file_path.read_bytes()
            kind = "image/png" if file_path.suffix.lower() == ".png" else "image/jpeg"
            if file_path.suffix.lower() == ".webp":
                kind = "image/webp"
            self.send_response(200)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
            return
        if postcard_api.handle_get(self, path):
            return
        self.send_json(404, {"error": "Not found"})

    def send_creator_file(self, path):
        if path.startswith("/studio/"):
            root = STUDIO
            rel = path[len("/studio/"):]
        else:
            root = MASTERS
            rel = path[len("/masters/"):]
        rel = rel.split("?", 1)[0]
        if rel.startswith(".") or ".." in rel.split("/"):
            self.send_json(403, {"error": "Blocked"})
            return
        file_path = (root / rel).resolve()
        if not str(file_path).startswith(str(root.resolve())) or not file_path.is_file():
            self.send_json(404, {"error": "Missing studio file"})
            return
        kind = "application/octet-stream"
        if file_path.suffix == ".html":
            kind = "text/html; charset=utf-8"
        elif file_path.suffix == ".js":
            kind = "text/javascript; charset=utf-8"
        elif file_path.suffix == ".css":
            kind = "text/css; charset=utf-8"
        elif file_path.suffix.lower() in (".jpg", ".jpeg"):
            kind = "image/jpeg"
        elif file_path.suffix.lower() == ".png":
            kind = "image/png"
        elif file_path.suffix.lower() == ".webp":
            kind = "image/webp"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def send_file(self, file_path, kind):
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def send_site_file(self, rel):
        rel = rel.split("?", 1)[0]
        if not rel or rel.startswith(".") or ".." in rel.split("/"):
            self.send_json(403, {"error": "Blocked"})
            return
        file_path = (SITE / rel).resolve()
        if not str(file_path).startswith(str(SITE.resolve())) or not file_path.is_file():
            self.send_json(404, {"error": "Missing file"})
            return
        kinds = {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".mp3": "audio/mpeg",
        }
        self.send_file(file_path, kinds.get(file_path.suffix.lower(), "application/octet-stream"))

    def send_page(self, path):
        pages = {
            "/artwork": ("Artwork Library", "Master files live in <code>artwork/</code>, copied from <code>japanese.jp/turbo_adventure</code>. The originals are still there. This folder is not on the public site and is not in Git."),
            "/map": ("Map Manager", "The player map is unchanged. Open the local site at <a href=\"http://127.0.0.1:8765/map/\">http://127.0.0.1:8765/map/</a>. Station data is <code>site/data/japan/map-data.js</code>."),
            "/merchant": ("Merchant Manager", "Postcard designs and QR assignment stay on this computer. Open <a href=\"/postcards\">Postcard Studio</a> and the <a href=\"/postcards/registry\">QR registry</a>. Printed codes use https://johrenadventure.com/q/TA-######. The live site reads them only after the public registry file is written and the site is published. There is no scanner and no payment model."),
            "/settings": ("Settings", "Admin listens on 127.0.0.1:8770. The public site folder is <code>site/</code>. The password file is <code>admin.secret</code> and is not deployed."),
            "/backup": ("Backup and Restore", "Puzzle settings are copied into <code>tools/puzzle-admin/backups/</code> before each change. Restore from the Puzzle Manager. Backups are not deployed."),
        }
        title, body = pages[path]
        html = (
            "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
            "<title>" + title + "</title></head><body style=\"font:16px/1.5 system-ui,sans-serif;margin:24px\">"
            "<p><a href=\"/\">Admin home</a></p><h1>" + title + "</h1><p>" + body + "</p></body></html>"
        ).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(html)))
        self.end_headers()
        self.wfile.write(html)

    def save_library_image(self):
        content_type = self.headers.get("Content-Type", "")
        if "boundary=" not in content_type:
            self.send_json(400, {"error": "Expected an image upload"})
            return
        raw = self.read_body()
        if raw is None:
            self.send_json(413, {"error": "File is larger than 15 MB"})
            return
        boundary = content_type.split("boundary=")[-1].strip().encode()
        name, blob = parse_upload(raw, boundary)
        fields = upload_fields(raw, boundary)
        kind = fields.get("kind") or ""
        label = (fields.get("name") or "").strip()[:80]
        replace_id = (fields.get("replaceId") or "").strip()
        if kind not in ("background", "character") or not label or not blob:
            self.send_json(400, {"error": "Name, kind, and image are required."})
            return
        ext = Path(name).suffix.lower()
        if kind == "character" and ext != ".png":
            self.send_json(400, {"error": "A character must be a PNG."})
            return
        if ext not in (".png", ".jpg", ".jpeg"):
            self.send_json(400, {"error": "Use a PNG or JPG."})
            return
        item_id = replace_id or ("studio_" + kind[:2] + "_" + secrets.token_hex(4))
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", item_id):
            self.send_json(400, {"error": "That catalogue id cannot be replaced."})
            return
        LIBRARY.mkdir(parents=True, exist_ok=True)
        stored = "studio_library/" + item_id + "-" + secrets.token_hex(3) + ext
        dest = MASTERS / stored
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(blob)
        width, height = image_size(dest)
        data = read_library()
        record = {"id": item_id, "kind": kind, "name": label, "file": stored, "width": width, "height": height}
        data["items"] = [item for item in data["items"] if item.get("id") != item_id]
        data["items"].append(record)
        LIBRARY_MANIFEST.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        self.send_json(200, {"ok": True, "item": record, "library": data})

    def publish_site(self):
        raw = self.read_body() or b""
        try:
            body = json.loads(raw.decode() or "{}")
        except json.JSONDecodeError:
            body = {}
        if body.get("confirm") != "PUBLISH":
            self.send_json(400, {"error": "Type PUBLISH to confirm a production deployment."})
            return
        script = ROOT / "tools" / "publish-site.sh"
        completed = subprocess.run(["/bin/sh", str(script)], cwd="/tmp", capture_output=True, text=True)
        self.send_json(200 if completed.returncode == 0 else 500, {
            "ok": completed.returncode == 0,
            "output": (completed.stdout + completed.stderr)[-4000:],
        })

    def backup_config(self, config):
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        stamp = time.strftime("%Y%m%d-%H%M%S")
        (BACKUP_DIR / ("config-" + stamp + ".json")).write_text(
            json.dumps(config, indent=2) + "\n", encoding="utf-8"
        )

    def save_demo(self):
        raw = self.read_body() or b""
        try:
            body = json.loads(raw.decode() or "{}")
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Expected demo settings"})
            return
        config = clean_demo(body)
        if config is None:
            self.send_json(400, {"error": "Demo images must stay in site/media/create-demo"})
            return
        path = SITE / "data" / "create" / "demo.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
        self.send_json(200, {"config": config})

    def upload_demo(self):
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type or "boundary=" not in content_type:
            self.send_json(400, {"error": "Expected an image upload"})
            return
        raw = self.read_body()
        if raw is None:
            self.send_json(413, {"error": "File is larger than 15 MB"})
            return
        boundary = content_type.split("boundary=")[-1].strip().encode()
        try:
            name, blob = parse_upload(raw, boundary)
        except ValueError:
            self.send_json(400, {"error": "Missing image"})
            return
        ext = Path(name).suffix.lower()
        if ext not in (".png", ".jpg", ".jpeg"):
            self.send_json(400, {"error": "Upload a PNG or JPG"})
            return
        folder = SITE / "media" / "create-demo"
        folder.mkdir(parents=True, exist_ok=True)
        dest = folder / safe_name(name)
        if dest.exists():
            dest = folder / (dest.stem + "-" + secrets.token_hex(3) + dest.suffix)
        dest.write_bytes(blob)
        self.send_json(200, {"path": public_path(dest)})

    def save_puzzle_level(self):
        raw = self.read_body() or b""
        try:
            body = json.loads(raw.decode() or "{}")
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Expected puzzle settings"})
            return
        level = str(body.get("level") or "")
        if level not in PUZZLE_LEVELS:
            self.send_json(400, {"error": "Unknown puzzle level"})
            return
        picture = media_file(body.get("image") or "")
        if picture is None:
            self.send_json(400, {"error": "Choose a primary image inside site/media"})
            return
        reveal = body.get("revealImage") or ""
        reveal_path = None
        if reveal:
            reveal_path = media_file(reveal)
            if reveal_path is None:
                self.send_json(400, {"error": "Choose a final reveal image inside site/media"})
                return
        config = read_config()
        self.backup_config(config)
        width, height = image_size(picture)
        row = {
            "image": public_path(picture),
            "imageWidth": width,
            "imageHeight": height,
        }
        if reveal_path is not None:
            reveal_width, reveal_height = image_size(reveal_path)
            row["revealImage"] = public_path(reveal_path)
            row["revealImageWidth"] = reveal_width
            row["revealImageHeight"] = reveal_height
        wallpaper = body.get("wallpaper") or ""
        if wallpaper:
            wallpaper_path = media_file(wallpaper)
            if wallpaper_path is None:
                self.send_json(400, {"error": "Choose a wallpaper image inside site/media"})
                return
            wall_width, wall_height = image_size(wallpaper_path)
            row["wallpaper"] = public_path(wallpaper_path)
            row["wallpaperWidth"] = wall_width
            row["wallpaperHeight"] = wall_height
        previous = config["levels"].get(level) if isinstance(config["levels"].get(level), dict) else {}
        if body.get("celebration") == "fireworks" or previous.get("celebration") == "fireworks":
            row["celebration"] = "fireworks"
        if body.get("merchantWebsite") or previous.get("merchantWebsite"):
            row["merchantWebsite"] = str(body.get("merchantWebsite") or previous.get("merchantWebsite"))
        if body.get("merchantSponsored") is True or previous.get("merchantSponsored") is True:
            row["merchantSponsored"] = True
        config["levels"][level] = row
        config = write_config(config)
        self.send_json(200, {"config": config})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/login":
            raw = self.read_body() or b""
            try:
                password = json.loads(raw.decode()).get("password", "")
            except json.JSONDecodeError:
                password = ""
            password = str(password).strip()
            expected = load_secret()
            if not hmac.compare_digest(password, expected):
                self.send_json(401, {"error": "Wrong password. The saved password is %s characters." % len(expected)})
                return
            expiry = str(int(time.time()) + 12 * 3600)
            cookie = COOKIE + "=" + sign(expiry) + "; HttpOnly; SameSite=Lax; Path=/"
            self.send_json(200, {"ok": True}, cookie)
            return
        if path == "/api/logout":
            cookie = COOKIE + "=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
            self.send_json(200, {"ok": True}, cookie)
            return
        if not self.authed():
            self.send_json(401, {"error": "Sign in required"})
            return
        if path == "/api/activate":
            raw = self.read_body() or b""
            body = json.loads(raw.decode())
            image = body.get("image", "")
            if not image.startswith("/media/"):
                self.send_json(400, {"error": "Choose an image inside site/media"})
                return
            file_path = (SITE / image.lstrip("/")).resolve()
            if not str(file_path).startswith(str(SITE.resolve())) or not file_path.is_file():
                self.send_json(404, {"error": "Image is not in site/"})
                return
            if file_path.suffix.lower() not in ALLOWED_EXT:
                self.send_json(400, {"error": "Use JPG or PNG. The current WebP default can stay."})
                return
            width, height = image_size(file_path)
            config = read_config()
            self.backup_config(config)
            image = public_path(file_path)
            for key in PUZZLE_LEVELS:
                row = config["levels"][key]
                same_picture = row.get("image") == image
                row.update({
                    "image": image,
                    "imageWidth": width,
                    "imageHeight": height,
                })
                if not same_picture:
                    row.pop("revealImage", None)
                    row.pop("revealImageWidth", None)
                    row.pop("revealImageHeight", None)
            config = write_config(config)
            self.send_json(200, {"config": config})
            return
        if path == "/api/upload":
            content_type = self.headers.get("Content-Type", "")
            if "multipart/form-data" not in content_type:
                self.send_json(400, {"error": "Expected a file upload"})
                return
            raw = self.read_body()
            if raw is None:
                self.send_json(413, {"error": "File is larger than 15 MB"})
                return
            boundary = content_type.split("boundary=")[-1].encode()
            name, blob = parse_upload(raw, boundary)
            ext = Path(name).suffix.lower()
            if ext not in UPLOAD_EXT:
                self.send_json(400, {"error": "Upload JPG or PNG. Use PNG when the picture needs transparency."})
                return
            PUZZLE_DIR.mkdir(parents=True, exist_ok=True)
            dest = PUZZLE_DIR / safe_name(name)
            if dest.exists():
                dest = PUZZLE_DIR / (dest.stem + "-" + secrets.token_hex(3) + dest.suffix)
            dest.write_bytes(blob)
            width, height = image_size(dest)
            self.send_json(200, {
                "path": public_path(dest),
                "name": dest.name,
                "width": width,
                "height": height,
            })
            return
        if path == "/api/puzzle-image":
            raw = self.read_body()
            if raw is None or len(raw) < 100:
                self.send_json(400, {"error": "Missing JPEG"})
                return
            if not raw.startswith(b"\xff\xd8"):
                self.send_json(400, {"error": "Puzzle images must be JPG"})
                return
            name = safe_name(self.headers.get("X-Filename") or "puzzle.jpg")
            if not name.endswith(".jpg"):
                name = Path(name).stem + ".jpg"
            PUZZLE_DIR.mkdir(parents=True, exist_ok=True)
            dest = PUZZLE_DIR / name
            if dest.exists():
                dest = PUZZLE_DIR / (dest.stem + "-" + secrets.token_hex(3) + ".jpg")
            dest.write_bytes(raw)
            self.send_json(200, {"path": public_path(dest)})
            return
        if path == "/api/demo":
            self.save_demo()
            return
        if path == "/api/demo-upload":
            self.upload_demo()
            return
        if path == "/api/puzzle-level":
            self.save_puzzle_level()
            return
        if path == "/api/reveal":
            raw = self.read_body() or b""
            body = json.loads(raw.decode())
            image = body.get("image") or ""
            level = str(body.get("level") or "5")
            config = read_config()
            if level not in config["levels"]:
                self.send_json(400, {"error": "Unknown puzzle level"})
                return
            self.backup_config(config)
            row = config["levels"][level]
            if image == "":
                row.pop("revealImage", None)
                row.pop("revealImageWidth", None)
                row.pop("revealImageHeight", None)
            else:
                file_path = media_file(image)
                if file_path is None:
                    self.send_json(400, {"error": "Choose an image inside site/media"})
                    return
                width, height = image_size(file_path)
                row["revealImage"] = public_path(file_path)
                row["revealImageWidth"] = width
                row["revealImageHeight"] = height
            config = write_config(config)
            self.send_json(200, {"config": config})
            return
        if path == "/api/catalogue/library":
            self.save_library_image()
            return
        if path == "/api/publish":
            self.publish_site()
            return
        if path == "/api/restore":
            raw = self.read_body() or b""
            body = json.loads(raw.decode())
            config = normalize_config(body)
            for key in PUZZLE_LEVELS:
                row = config["levels"][key]
                if media_file(row.get("image") or "") is None:
                    self.send_json(400, {"error": "Backup image is not in site/media"})
                    return
                if row.get("revealImage") and media_file(row["revealImage"]) is None:
                    self.send_json(400, {"error": "Backup reveal image is not in site/media"})
                    return
            config = write_config(config)
            self.send_json(200, {"config": config})
            return
        if postcard_api.handle_post(self, path):
            return
        self.send_json(404, {"error": "Not found"})


def read_library():
    if not LIBRARY_MANIFEST.is_file():
        return {"items": []}
    try:
        data = json.loads(LIBRARY_MANIFEST.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"items": []}
    if not isinstance(data.get("items"), list):
        data["items"] = []
    return data


def artwork_summary():
    folders = []
    if not MASTERS.exists():
        return folders
    for child in sorted(MASTERS.iterdir()):
        if not child.is_dir() or child.name.startswith("."):
            continue
        count = sum(1 for path in child.rglob("*") if path.is_file())
        folders.append({"name": child.name, "files": count})
    return folders


def upload_fields(raw, boundary):
    fields = {}
    for part in raw.split(b"--" + boundary):
        if b"name=" not in part or b"filename=" in part:
            continue
        header, _, data = part.partition(b"\r\n\r\n")
        if data.endswith(b"\r\n"):
            data = data[:-2]
        match = re.search(br'name="([^"]*)"', header)
        if match:
            fields[match.group(1).decode()] = data.decode("utf-8", "replace")
    return fields


def parse_upload(raw, boundary):
    marker = b"--" + boundary
    parts = raw.split(marker)
    for part in parts:
        if b"filename=" not in part:
            continue
        header, _, data = part.partition(b"\r\n\r\n")
        if data.endswith(b"\r\n"):
            data = data[:-2]
        match = re.search(br'filename="([^"]*)"', header)
        name = match.group(1).decode() if match else "puzzle.jpg"
        return name, data
    raise ValueError("No file")


if __name__ == "__main__":
    PUZZLE_DIR.mkdir(parents=True, exist_ok=True)
    print("Puzzle Admin: http://%s:%s/" % (HOST, PORT))
    print("This server is local only. Do not deploy tools/puzzle-admin.")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
