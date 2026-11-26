#!/usr/bin/env python3
"""Check QR ids, print size, and the public lookup file. Uses the local data folder."""

import io
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import render
import store
from PIL import Image

def main():
    previous_public = store.PUBLIC_PATH.read_text(encoding="utf-8")
    first = store.new_code()
    second = store.new_code()
    assert first["id"] != second["id"]
    assert first["id"].startswith("TA-")
    design, error = render.clean_design({
        "title": "Check",
        "orientation": "portrait",
        "image": "",
        "texts": [{"lang": "ja", "text": "こんにちは", "sizeMm": 8, "color": "#ffffff", "x": 0.5, "y": 0.2}],
        "qr": {"id": first["id"], "sizeMm": 12, "x": 0.8, "y": 0.8},
    })
    assert error == "", error
    assert design["qr"]["sizeMm"] == 18
    assert "outline" not in design["texts"][0]
    outlined, outline_error = render.clean_design({
        "title": "Check",
        "orientation": "portrait",
        "image": "",
        "texts": [{"lang": "en", "text": "Hello", "sizeMm": 6, "color": "#ffffff", "x": 0.4, "y": 0.4, "outline": True}],
        "qr": {"id": first["id"], "sizeMm": 22, "x": 0.5, "y": 0.5},
    })
    assert outline_error == "", outline_error
    assert outlined["texts"][0]["outline"] is True
    assert outlined["qr"]["id"] == first["id"]
    render.preview_bytes(outlined)
    layered, layer_error = render.clean_design({
        "title": "Layers",
        "orientation": "portrait",
        "sides": {
            "front": {
                "image": "backgrounds/london_mobile.png",
                "texts": [{"lang": "en", "text": "Hello", "sizeMm": 8, "color": "#ffffff", "x": 0.5, "y": 0.2, "bold": True, "shadow": True, "outline": True}],
                "layers": [{"id": "ly1", "file": "turbo/turbo_selfie.png", "x": 0.4, "y": 0.6, "heightMm": 40, "flip": True, "shadow": True}],
            },
            "back": {"image": "", "texts": [{"lang": "ja", "text": "裏", "sizeMm": 8, "color": "#17332f", "x": 0.5, "y": 0.5}], "layers": []},
        },
        "qr": {"id": first["id"], "sizeMm": 22, "x": 0.02, "y": 0.02},
    })
    assert layer_error == "", layer_error
    assert layered["qr"]["id"] == first["id"]
    assert layered["qr"]["x"] > 0.05
    assert layered["layers"][0]["file"] == "turbo/turbo_selfie.png"
    plain = dict(layered)
    plain["sides"] = {"front": dict(layered["sides"]["front"], layers=[]), "back": layered["sides"]["back"]}
    plain["layers"] = []
    with_character = Image.open(io.BytesIO(render.preview_bytes(layered, "front")))
    without = Image.open(io.BytesIO(render.preview_bytes(plain, "front")))
    from PIL import ImageChops, ImageStat
    assert ImageStat.Stat(ImageChops.difference(with_character, without)).mean[0] > 5
    for rel in (
        "turbo/turbo_selfie.png",
        "turbo/turbo_standing_transparent.png",
        "npc/jamie_front.png",
        "heroes/international_heroes/transparent_backgrounds/captain_seagull_flying.png",
    ):
        one = dict(layered)
        one["sides"] = {"front": dict(layered["sides"]["front"], layers=[{"id": "ly", "file": rel, "x": 0.45, "y": 0.6, "heightMm": 70, "shadow": True}]), "back": layered["sides"]["back"]}
        seen = Image.open(io.BytesIO(render.preview_bytes(one, "front")))
        assert ImageStat.Stat(ImageChops.difference(seen, without)).mean[0] > 5, rel
    front_png, _, _ = render.export_bytes(layered, "png", "front")
    back_png, _, _ = render.export_bytes(layered, "png", "back")
    assert Image.open(io.BytesIO(front_png)).size == Image.open(io.BytesIO(back_png)).size
    pdf, _, _ = render.export_bytes(layered, "pdf")
    assert pdf[:4] == b"%PDF"
    design["id"] = "pc-" + "abcd1234"
    design["createdAt"] = store.now()
    store.save_design(design)
    png, mime, ext = render.export_bytes(design, "png")
    image = Image.open(io.BytesIO(png))
    assert image.size == render.card_px("portrait", 300), image.size
    assert mime == "image/png" and ext == "png"
    pdf, pdf_mime, pdf_ext = render.export_bytes(design, "pdf")
    assert pdf_mime == "application/pdf" and b"/MediaBox" in pdf
    wide, _ = render.card_px("landscape", 300)
    landscape = dict(design)
    landscape["orientation"] = "landscape"
    jpg, _, _ = render.export_bytes(landscape, "jpeg")
    assert Image.open(io.BytesIO(jpg)).size[0] == wide
    row, error = store.update_code(first["id"], {"status": "assigned", "merchant": "Shop", "destination": ""})
    assert row is None and error
    row, error = store.update_code(first["id"], {"status": "assigned", "merchant": "Shop", "destination": "/shops/demo/"})
    assert error == "" and row["status"] == "assigned"
    public = store.write_public_registry()
    assert public["entries"][first["id"]]["path"] == "/shops/demo/"
    assert public["entries"][second["id"]]["path"] == "/shops/"
    bad = store._restore if False else None
    import api
    assert api._restore({"registry": {"codes": [dict(row), dict(row)], "next": 3}})
    data = store.load_registry()
    data["codes"] = [item for item in data["codes"] if item["id"] not in (first["id"], second["id"])]
    store.save_registry(data)
    store.design_path(design["id"]).unlink(missing_ok=True)
    store.PUBLIC_PATH.write_text(previous_public, encoding="utf-8")
    plain, plain_error = render.clean_texts([{"text": "Hello\nthere", "sizeMm": 6}])
    assert plain_error == "" and "align" not in plain[0] and "widthMm" not in plain[0]
    fitted, fit_error = render.clean_texts([{"text": "Hello", "align": "left", "widthMm": 40, "lineSpacing": 1.6}])
    assert fit_error == "" and fitted[0]["align"] == "left" and fitted[0]["widthMm"] == 40
    kept = render.layout_text({"text": "あ\nい", "sizeMm": 8, "widthMm": 80}, 110, 100)
    assert kept["lines"] == ["あ", "い"]
    wrapped = render.layout_text({"text": "あいうえおかきくけこさしすせそ", "sizeMm": 8, "widthMm": 18}, 110, 100)
    assert len(wrapped["lines"]) > 1
    assert all(not line.startswith("。") for line in render.layout_text({"text": "こんにちは。ありがとう", "sizeMm": 8, "widthMm": 22}, 110, 100)["lines"])
    print("postcard self-check ok", image.size, first["id"])

if __name__ == "__main__":
    main()
