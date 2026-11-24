#!/usr/bin/env python3
"""Local Puzzle Admin. Binds to 127.0.0.1 only. Not part of the Netlify site."""

import hashlib
import hmac
import json
import os
import re
import secrets
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
STUDIO = Path("/home/sjnelson/japanese.jp/turbo-adventures-studio")
MASTERS = Path("/home/sjnelson/japanese.jp/turbo_adventure")
HOST = "127.0.0.1"
PORT = 8770
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


def read_config():
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def write_config(config):
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    active = {
        "version": 1,
        "activeId": config["activeId"],
        "image": config["image"],
        "imageWidth": config["imageWidth"],
        "imageHeight": config["imageHeight"],
    }
    if config.get("revealImage"):
        active["revealImage"] = config["revealImage"]
        active["revealImageWidth"] = config.get("revealImageWidth") or config["imageWidth"]
        active["revealImageHeight"] = config.get("revealImageHeight") or config["imageHeight"]
    ACTIVE_JS.write_text(
        "/* Generated from site/data/puzzle/config.json. Do not edit by hand. */\n"
        "window.TURBO_PUZZLE_ACTIVE = "
        + json.dumps(active, indent=2)
        + ";\n",
        encoding="utf-8",
    )


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
        if path == "/api/puzzle":
            self.send_json(200, {"config": read_config(), "library": list_images()})
            return
        if path == "/creator" or path == "/creator/":
            self.send_response(302)
            self.send_header("Location", "/create-game/index.html?creatorTest=1")
            self.end_headers()
            return
        if path.startswith("/create-game/") or path.startswith("/masters/"):
            self.send_creator_file(path)
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
        self.send_json(404, {"error": "Not found"})

    def send_creator_file(self, path):
        if path.startswith("/create-game/"):
            root = SITE / "create"
            rel = path[len("/create-game/"):]
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

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/login":
            raw = self.read_body() or b""
            try:
                password = json.loads(raw.decode()).get("password", "")
            except json.JSONDecodeError:
                password = ""
            if not hmac.compare_digest(password, SECRET):
                self.send_json(401, {"error": "Wrong password"})
                return
            expiry = str(int(time.time()) + 12 * 3600)
            cookie = COOKIE + "=" + sign(expiry) + "; HttpOnly; SameSite=Strict; Path=/"
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
            previous = dict(config)
            image = public_path(file_path)
            same_picture = config.get("image") == image
            config.update({
                "version": 1,
                "activeId": file_path.stem,
                "image": image,
                "imageWidth": width,
                "imageHeight": height,
                "note": "One default railway puzzle image. Levels stay in site/map/js/config/puzzle.js.",
            })
            if not same_picture:
                config.pop("revealImage", None)
                config.pop("revealImageWidth", None)
                config.pop("revealImageHeight", None)
            BACKUP_DIR.mkdir(parents=True, exist_ok=True)
            stamp = time.strftime("%Y%m%d-%H%M%S")
            (BACKUP_DIR / ("config-" + stamp + ".json")).write_text(
                json.dumps(previous, indent=2) + "\n", encoding="utf-8"
            )
            write_config(config)
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
        if path == "/api/reveal":
            raw = self.read_body() or b""
            body = json.loads(raw.decode())
            image = body.get("image") or ""
            config = read_config()
            previous = dict(config)
            if image == "":
                config.pop("revealImage", None)
                config.pop("revealImageWidth", None)
                config.pop("revealImageHeight", None)
            else:
                if not image.startswith("/media/"):
                    self.send_json(400, {"error": "Choose an image inside site/media"})
                    return
                file_path = (SITE / image.lstrip("/")).resolve()
                if not str(file_path).startswith(str(SITE.resolve())) or not file_path.is_file():
                    self.send_json(404, {"error": "Image is not in site/"})
                    return
                if file_path.suffix.lower() not in ALLOWED_EXT:
                    self.send_json(400, {"error": "Use JPG or PNG."})
                    return
                width, height = image_size(file_path)
                config["revealImage"] = public_path(file_path)
                config["revealImageWidth"] = width
                config["revealImageHeight"] = height
            BACKUP_DIR.mkdir(parents=True, exist_ok=True)
            stamp = time.strftime("%Y%m%d-%H%M%S")
            (BACKUP_DIR / ("config-" + stamp + ".json")).write_text(
                json.dumps(previous, indent=2) + "\n", encoding="utf-8"
            )
            write_config(config)
            self.send_json(200, {"config": config})
            return
        if path == "/api/restore":
            raw = self.read_body() or b""
            body = json.loads(raw.decode())
            image = body.get("image", "")
            file_path = (SITE / image.lstrip("/")).resolve()
            if not image.startswith("/media/") or not file_path.is_file():
                self.send_json(400, {"error": "Backup image is not in site/media"})
                return
            width = int(body.get("imageWidth") or 1600)
            height = int(body.get("imageHeight") or 900)
            config = read_config()
            config.update({
                "version": 1,
                "activeId": body.get("activeId") or file_path.stem,
                "image": public_path(file_path),
                "imageWidth": width,
                "imageHeight": height,
                "note": "Restored puzzle default.",
            })
            reveal = body.get("revealImage") or ""
            if reveal:
                reveal_path = (SITE / reveal.lstrip("/")).resolve()
                if reveal.startswith("/media/") and reveal_path.is_file():
                    config["revealImage"] = public_path(reveal_path)
                    config["revealImageWidth"] = int(body.get("revealImageWidth") or width)
                    config["revealImageHeight"] = int(body.get("revealImageHeight") or height)
                else:
                    self.send_json(400, {"error": "Backup reveal image is not in site/media"})
                    return
            else:
                config.pop("revealImage", None)
                config.pop("revealImageWidth", None)
                config.pop("revealImageHeight", None)
            write_config(config)
            self.send_json(200, {"config": config})
            return
        self.send_json(404, {"error": "Not found"})


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
