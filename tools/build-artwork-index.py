#!/usr/bin/env python3
"""Regenerate the local artwork catalogue.

Reads artwork/ (image masters and source-map.json) and checks site/ for the
same basename. Writes artwork/thumbs/*.jpg, artwork/catalogue.json, and
artwork/index.html. Does not modify masters or anything under site/.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

REPO = Path(__file__).resolve().parents[1]
ART = REPO / "artwork"
SITE = REPO / "site"
THUMBS = ART / "thumbs"
MAX_EDGE = 240
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def load_source_map() -> dict[str, dict]:
    path = ART / "source-map.json"
    if not path.is_file():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return {item["dest"]: item for item in data}


def site_basenames() -> dict[str, list[str]]:
    found: dict[str, list[str]] = {}
    if not SITE.is_dir():
        return found
    for path in SITE.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(REPO).as_posix()
        found.setdefault(path.name, []).append(rel)
    return found


def thumb_name(rel: str) -> str:
    return rel.replace("/", "__") + ".jpg"


def make_thumb(src: Path, dest: Path) -> None:
    with Image.open(src) as im:
        im = im.convert("RGBA")
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        background = Image.new("RGB", im.size, (245, 241, 232))
        background.paste(im, mask=im.getchannel("A"))
        dest.parent.mkdir(parents=True, exist_ok=True)
        background.save(dest, "JPEG", quality=80, optimize=True)


def html_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def main() -> int:
    if not ART.is_dir():
        print("artwork/ is missing", file=sys.stderr)
        return 1
    sources = load_source_map()
    on_site = site_basenames()
    masters = sorted(
        p for p in ART.rglob("*")
        if p.is_file()
        and p.suffix.lower() in IMAGE_EXT
        and THUMBS not in p.parents
    )
    catalogue = []
    for src in masters:
        rel = src.relative_to(ART).as_posix()
        meta = sources.get(rel, {})
        category = meta.get("category") or rel.split("/")[0]
        thumb_rel = "thumbs/" + thumb_name(rel)
        make_thumb(src, ART / thumb_rel)
        site_hits = on_site.get(src.name, [])
        catalogue.append({
            "dest": rel,
            "category": category,
            "filename": src.name,
            "source": meta.get("source", ""),
            "thumb": thumb_rel,
            "site_matches": site_hits,
        })

    (ART / "catalogue.json").write_text(
        json.dumps(catalogue, indent=2) + "\n",
        encoding="utf-8",
    )

    groups: dict[str, list[dict]] = {}
    for item in catalogue:
        groups.setdefault(item["category"], []).append(item)

    parts = [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '<meta charset="utf-8">',
        "<title>Artwork masters</title>",
        "<style>",
        "body{font:15px/1.4 sans-serif;margin:24px;background:#f6f3ec;color:#222}",
        "h1{font-size:1.4rem} h2{margin-top:2rem;font-size:1.1rem}",
        "figure{display:inline-block;width:220px;margin:8px;vertical-align:top;background:#fff;padding:8px;border:1px solid #ddd}",
        "img{width:200px;height:160px;object-fit:contain;background:#efeae2}",
        "figcaption{font-size:12px;word-break:break-word}",
        ".src{color:#555} .hit{color:#0a6}",
        "</style>",
        "</head>",
        "<body>",
        "<h1>Local artwork masters</h1>",
        f"<p>{len(catalogue)} images. This folder is gitignored. Open this file from disk.</p>",
    ]
    for category in sorted(groups):
        items = groups[category]
        parts.append(f"<h2>{html_escape(category)} ({len(items)})</h2>")
        for item in items:
            hits = item["site_matches"]
            if hits:
                site_line = "site: " + ", ".join(hits)
                klass = "hit"
            else:
                site_line = "site: no file with this name"
                klass = "src"
            source = item["source"] or "source not in source-map.json"
            parts.append("<figure>")
            parts.append(
                f'<a href="{html_escape(item["dest"])}"><img src="{html_escape(item["thumb"])}" alt=""></a>'
            )
            parts.append("<figcaption>")
            parts.append(html_escape(item["filename"]))
            parts.append(f'<br><span class="src">{html_escape(source)}</span>')
            parts.append(f'<br><span class="{klass}">{html_escape(site_line)}</span>')
            parts.append("</figcaption></figure>")
    parts.append("</body></html>\n")
    (ART / "index.html").write_text("\n".join(parts), encoding="utf-8")
    print(f"wrote {len(catalogue)} entries to artwork/index.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
