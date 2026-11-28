"""Print a postcard at 100 × 148 mm. Preview uses the same layout at a lower dpi."""

import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

VENDOR = Path(__file__).resolve().parent / "vendor"
if str(VENDOR) not in sys.path:
    sys.path.insert(0, str(VENDOR))
import segno

from store import IMAGES, SITE_MEDIA, find_code, public_path_for

FONT_PATH = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
FONT_BOLD = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
MASTERS = Path(__file__).resolve().parents[2] / "artwork"
CARD_SHORT_MM = 100
CARD_LONG_MM = 148
MIN_QR_MM = 18
MAX_QR_MM = 48
PRINT_DPI = 300
PREVIEW_DPI = 110

_FONT = {}


def card_px(orientation, dpi):
    short = round(CARD_SHORT_MM / 25.4 * dpi)
    long = round(CARD_LONG_MM / 25.4 * dpi)
    if orientation == "landscape":
        return long, short
    return short, long


def mm_to_px(mm, dpi):
    return mm / 25.4 * dpi


def font(px, bold=False):
    px = max(8, int(px))
    key = (px, bool(bold))
    if key not in _FONT:
        path = FONT_BOLD if bold else FONT_PATH
        _FONT[key] = ImageFont.truetype(path, px, index=0)
    return _FONT[key]


def card_mm(orientation):
    if orientation == "landscape":
        return CARD_LONG_MM, CARD_SHORT_MM
    return CARD_SHORT_MM, CARD_LONG_MM


def clamp_center(x, y, size_mm, orientation):
    """Keep a square of size_mm, centred on x,y fractions, inside the card."""
    width_mm, height_mm = card_mm(orientation)
    half = float(size_mm) / 2
    cx = min(width_mm - half, max(half, float(x) * width_mm))
    cy = min(height_mm - half, max(half, float(y) * height_mm))
    return cx / width_mm, cy / height_mm


def resolve_image(ref):
    if not ref:
        return None
    if ref.startswith("local:"):
        name = Path(ref.split(":", 1)[1]).name
        path = (IMAGES / name).resolve()
        if str(path).startswith(str(IMAGES.resolve())) and path.is_file():
            return path
        return None
    if ref.startswith("/media/"):
        path = (SITE_MEDIA.parent / ref.lstrip("/")).resolve()
        if str(path).startswith(str(SITE_MEDIA.resolve())) and path.is_file():
            return path
    return None


def resolve_master(ref):
    if not ref or ".." in Path(str(ref)).parts or str(ref).startswith("/"):
        return None
    path = (MASTERS / str(ref)).resolve()
    if str(path).startswith(str(MASTERS.resolve())) and path.is_file():
        return path
    return None


def cover(image, width, height):
    image = image.convert("RGB")
    scale = max(width / image.width, height / image.height)
    resized = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - width) // 2)
    top = max(0, (resized.height - height) // 2)
    return resized.crop((left, top, left + width, top + height))


def qr_image(url, size_px):
    code = segno.make(url, error="m")
    modules = code.symbol_size(scale=1, border=4)[0]
    scale = max(4, int(round(size_px / modules)))
    buffer = io.BytesIO()
    code.save(buffer, kind="png", scale=scale, border=4)
    image = Image.open(buffer).convert("RGB")
    edge = max(1, int(round(size_px)))
    if image.size != (edge, edge):
        image = image.resize((edge, edge), Image.Resampling.NEAREST)
    return image


def hex_color(value):
    text = str(value or "#17332f").strip()
    if len(text) == 7 and text.startswith("#"):
        try:
            return tuple(int(text[i:i + 2], 16) for i in (1, 3, 5))
        except ValueError:
            pass
    return (23, 51, 47)


def side_content(design, which):
    sides = design.get("sides") if isinstance(design.get("sides"), dict) else {}
    side = sides.get(which) if isinstance(sides.get(which), dict) else {}
    if which == "front" and not side:
        return {
            "image": design.get("image") or "",
            "texts": design.get("texts") or [],
            "layers": design.get("layers") or [],
        }
    return {
        "image": side.get("image") or "",
        "texts": side.get("texts") or [],
        "layers": side.get("layers") or [],
    }


def composite(card, sprite, left, top):
    """Paint an RGBA sprite onto an RGB card. The sprite alpha is the only mask."""
    overlay = Image.new("RGBA", card.size, (0, 0, 0, 0))
    overlay.paste(sprite, (int(left), int(top)))
    return Image.alpha_composite(card.convert("RGBA"), overlay).convert("RGB")


def draw_characters(card, layers, dpi):
    width, height = card.size
    for layer in layers or []:
        path = resolve_master(layer.get("file") or "") or resolve_image(layer.get("file") or "")
        if path is None:
            continue
        sprite = Image.open(path).convert("RGBA")
        if layer.get("flip"):
            sprite = sprite.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        target_h = max(1, int(round(mm_to_px(float(layer.get("heightMm") or 40), dpi))))
        target_w = max(1, int(round(sprite.width * (target_h / max(1, sprite.height)))))
        sprite = sprite.resize((target_w, target_h), Image.Resampling.LANCZOS)
        rotation = float(layer.get("rotation") or 0)
        if rotation:
            sprite = sprite.rotate(-rotation, expand=True, resample=Image.Resampling.BICUBIC)
        cx = float(layer.get("x") or 0.5) * width
        cy = float(layer.get("y") or 0.5) * height
        left = int(cx - sprite.width / 2)
        top = int(cy - sprite.height / 2)
        if layer.get("shadow"):
            alpha = sprite.getchannel("A")
            shade = Image.new("RGBA", sprite.size, (0, 0, 0, 0))
            shade.putalpha(alpha.point(lambda value: min(120, value)))
            shade = shade.filter(ImageFilter.GaussianBlur(radius=max(1, sprite.width // 70)))
            card = composite(card, shade, left, top + target_h * 0.04)
        card = composite(card, sprite, left, top)
    return card


_NO_START = set("、。，．,.！？!?：；:;)）」』】〕〉》・…ー")
_NO_END = set("（「『【〔〈《(")


def _wrap_paragraph(text, face, max_px):
    """Wrap one manual line. Spaces stay. Japanese breaks by character, with kinsoku."""
    if text == "":
        return [""]
    if max_px is None or face.getlength(text) <= max_px:
        return [text]
    lines = []
    current = ""
    for ch in text:
        trial = current + ch
        if face.getlength(trial) <= max_px or current == "":
            current = trial
            continue
        split_at = current.rfind(" ")
        if split_at > 0:
            lines.append(current[:split_at])
            current = (current[split_at + 1:] + ch).lstrip(" ")
            if face.getlength(current) > max_px and len(current) > 1:
                lines.append(current[:-1])
                current = current[-1]
            continue
        if ch in _NO_START and len(current) > 1:
            lines.append(current[:-1])
            current = current[-1] + ch
            continue
        if current[-1] in _NO_END and len(current) > 1:
            lines.append(current[:-1])
            current = current[-1] + ch
            continue
        lines.append(current)
        current = ch
    if current:
        lines.append(current)
    return lines or [""]


def layout_text(block, dpi, card_width_mm):
    """Lines and the block size in millimetres. Manual newlines are kept."""
    text = str(block.get("text") or "")
    size_mm = float(block.get("sizeMm") or 6)
    size_px = max(1, mm_to_px(size_mm, dpi))
    face = font(size_px, block.get("bold"))
    try:
        line_spacing = float(block.get("lineSpacing") if block.get("lineSpacing") is not None else 1.25)
    except (TypeError, ValueError):
        line_spacing = 1.25
    line_spacing = min(3, max(0.8, line_spacing))
    align = block.get("align") if block.get("align") in ("left", "center", "right") else "center"
    width_mm = block.get("widthMm")
    max_px = None
    if width_mm not in (None, ""):
        try:
            max_px = max(1, mm_to_px(min(card_width_mm, max(8, float(width_mm))), dpi))
        except (TypeError, ValueError):
            max_px = None
    lines = []
    for paragraph in text.split("\n"):
        lines.extend(_wrap_paragraph(paragraph, face, max_px))
    if not lines:
        lines = [""]
    ascent, descent = face.getmetrics()
    line_px = ascent + descent
    extra_px = max(0, (line_spacing - 1) * size_px)
    widest = max((face.getlength(line) for line in lines), default=0)
    box_px = widest if max_px is None else max(widest, max_px)
    height_px = line_px * len(lines) + extra_px * max(0, len(lines) - 1)
    return {
        "lines": lines,
        "align": align,
        "face": face,
        "size_px": size_px,
        "line_px": line_px,
        "extra_px": extra_px,
        "width_px": box_px,
        "height_px": height_px,
        "width_mm": box_px / dpi * 25.4,
        "height_mm": height_px / dpi * 25.4,
    }


def text_boxes(blocks, orientation, dpi):
    card_width = CARD_LONG_MM if orientation == "landscape" else CARD_SHORT_MM
    boxes = []
    for block in blocks or []:
        laid = layout_text(block, dpi, card_width)
        boxes.append({"w": round(laid["width_mm"], 2), "h": round(laid["height_mm"], 2)})
    return boxes


def draw_texts(card, blocks, dpi, orientation="portrait"):
    draw = ImageDraw.Draw(card)
    width, height = card.size
    card_width = CARD_LONG_MM if orientation == "landscape" else CARD_SHORT_MM
    for block in blocks or []:
        text = str(block.get("text") or "")
        if not text:
            continue
        laid = layout_text(block, dpi, card_width)
        x = float(block.get("x") or 0.5) * width
        y = float(block.get("y") or 0.2) * height
        fill = hex_color(block.get("color"))
        box_w = laid["width_px"]
        box_h = laid["height_px"]
        left = x - box_w / 2
        top = y - box_h / 2

        def paint(dx, dy, color):
            for index, line in enumerate(laid["lines"]):
                line_w = laid["face"].getlength(line)
                if laid["align"] == "left":
                    lx = left
                elif laid["align"] == "right":
                    lx = left + box_w - line_w
                else:
                    lx = left + (box_w - line_w) / 2
                ly = top + index * (laid["line_px"] + laid["extra_px"])
                draw.text((lx + dx, ly + dy), line, font=laid["face"], fill=color, anchor="lt")

        size_px = laid["size_px"]
        if block.get("shadow"):
            paint(size_px * 0.06, size_px * 0.08, (0, 0, 0))
        if block.get("outline"):
            stroke = max(1, int(size_px * 0.08))
            edge = (255, 255, 255) if sum(fill) < 380 else (0, 0, 0)
            for ox in (-stroke, 0, stroke):
                for oy in (-stroke, 0, stroke):
                    if ox == 0 and oy == 0:
                        continue
                    paint(ox, oy, edge)
        paint(0, 0, fill)


def render(design, dpi, which="front", include_qr=True):
    orientation = design.get("orientation") if design.get("orientation") in ("portrait", "landscape") else "portrait"
    width, height = card_px(orientation, dpi)
    side = side_content(design, which if which in ("front", "back") else "front")
    source = resolve_image(side.get("image") or "") or resolve_master(side.get("image") or "")
    if source is None:
        card = Image.new("RGB", (width, height), (246, 243, 236))
    else:
        card = cover(Image.open(source), width, height)
    card = draw_characters(card, side.get("layers") or [], dpi)
    draw_texts(card, side.get("texts") or [], dpi, orientation)
    qr = design.get("qr") or {}
    kind = qr.get("kind") if qr.get("kind") in ("merchant", "general", "none") else "merchant"
    if which != "back" and include_qr and kind != "none":
        if kind == "general":
            url = "https://johrenadventure.com/"
        else:
            url = "https://johrenadventure.com/q/" + (qr.get("id") or "")
        size_mm = min(MAX_QR_MM, max(MIN_QR_MM, float(qr.get("sizeMm") or 22)))
        placed_x, placed_y = clamp_center(qr.get("x") if qr.get("x") is not None else 0.78, qr.get("y") if qr.get("y") is not None else 0.8, size_mm, orientation)
        mark = qr_image(url, mm_to_px(size_mm, dpi))
        qx = int(placed_x * width - mark.width / 2)
        qy = int(placed_y * height - mark.height / 2)
        qx = max(0, min(width - mark.width, qx))
        qy = max(0, min(height - mark.height, qy))
        card.paste(mark, (qx, qy))
    return card


A4_MM = (210, 297)
MARGIN_SCALES = (0.85, 0.90, 0.95, 1.0)


def pdf_bytes(pages):
    buffer = io.BytesIO()
    pages[0].save(buffer, format="PDF", resolution=PRINT_DPI, save_all=True, append_images=pages[1:])
    return buffer.getvalue()


def side_image(design, which):
    return render(design, PRINT_DPI, which).convert("RGB")


def contain(image, box_w, box_h, scale):
    """Scale artwork to fit inside the finished card. Never crop it."""
    scale = min(1.0, max(0.85, float(scale)))
    if image.size == (box_w, box_h) and abs(scale - 1) < 0.001:
        return image.copy()
    fit = min(box_w / image.width, box_h / image.height) * scale
    width = max(1, round(image.width * fit))
    height = max(1, round(image.height * fit))
    small = image.resize((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (box_w, box_h), "white")
    canvas.paste(small, ((box_w - width) // 2, (box_h - height) // 2))
    return canvas


def crop_marks(draw, box):
    left, top, right, bottom = box
    gap = round(mm_to_px(1.2, PRINT_DPI))
    length = round(mm_to_px(5, PRINT_DPI))
    width = max(1, round(mm_to_px(0.15, PRINT_DPI)))
    color = (90, 90, 90)
    for x, y, sx, sy in (
        (left, top, -1, -1),
        (right, top, 1, -1),
        (left, bottom, -1, 1),
        (right, bottom, 1, 1),
    ):
        draw.line((x + sx * gap, y, x + sx * (gap + length), y), fill=color, width=width)
        draw.line((x, y + sy * gap, x, y + sy * (gap + length)), fill=color, width=width)


def a4_sheet(top_card, bottom_card):
    page_w = round(mm_to_px(A4_MM[0], PRINT_DPI))
    page_h = round(mm_to_px(A4_MM[1], PRINT_DPI))
    slot_w, slot_h = card_px("landscape", PRINT_DPI)
    page = Image.new("RGB", (page_w, page_h), "white")
    gap = round(mm_to_px(16, PRINT_DPI))
    block_h = slot_h * 2 + gap
    top = (page_h - block_h) // 2
    left = (page_w - slot_w) // 2
    draw = ImageDraw.Draw(page)
    slots = ((top_card, top), (bottom_card, top + slot_h + gap))
    for card, y in slots:
        if card is None:
            continue
        page.paste(card, (left, y))
        crop_marks(draw, (left, y, left + slot_w, y + slot_h))
    return page


def pdf_standard(design):
    return pdf_bytes([side_image(design, "front"), side_image(design, "back")])


def pdf_margin(design, front_scale, back_scale=None):
    if back_scale is None:
        back_scale = front_scale
    front = side_image(design, "front")
    back = side_image(design, "back")
    return pdf_bytes([
        contain(front, front.width, front.height, front_scale),
        contain(back, back.width, back.height, back_scale),
    ])


def pdf_a4_proof(design):
    slot_w, slot_h = card_px("landscape", PRINT_DPI)
    front = contain(side_image(design, "front"), slot_w, slot_h, 1)
    back = contain(side_image(design, "back"), slot_w, slot_h, 1)
    return pdf_bytes([a4_sheet(front, back)])


def pdf_a4_batch(designs, front_scale, back_scale=None):
    if back_scale is None:
        back_scale = front_scale
    if len(designs) == 1:
        return pdf_a4_copies(designs[0], front_scale, back_scale)
    slot_w, slot_h = card_px("landscape", PRINT_DPI)
    pages = []
    for index in range(0, len(designs), 2):
        pair = designs[index:index + 2]
        fronts = [contain(side_image(design, "front"), slot_w, slot_h, front_scale) for design in pair]
        backs = [contain(side_image(design, "back"), slot_w, slot_h, back_scale) for design in pair]
        while len(fronts) < 2:
            fronts.append(None)
            backs.append(None)
        pages.append(a4_sheet(fronts[0], fronts[1]))
        pages.append(a4_sheet(backs[0], backs[1]))
    return pdf_bytes(pages)


def pdf_a4_copies(design, front_scale, back_scale=None):
    """Two identical fronts, then two identical backs, on the existing duplex sheets."""
    if back_scale is None:
        back_scale = front_scale
    slot_w, slot_h = card_px("landscape", PRINT_DPI)
    front = contain(side_image(design, "front"), slot_w, slot_h, front_scale)
    back = contain(side_image(design, "back"), slot_w, slot_h, back_scale)
    return pdf_bytes([a4_sheet(front, front), a4_sheet(back, back)])


def export_bytes(design, kind, which="front", layout="standard", scale=0.95, back_scale=None):
    which = which if which in ("front", "back") else "front"
    buffer = io.BytesIO()
    if kind == "pdf":
        if layout == "margin":
            data = pdf_margin(design, scale, back_scale)
        elif layout == "a4":
            data = pdf_a4_proof(design)
        else:
            data = pdf_standard(design)
        return data, "application/pdf", "pdf"
    card = render(design, PRINT_DPI, which)
    if kind == "jpeg":
        card.save(buffer, format="JPEG", quality=95, subsampling=0, dpi=(PRINT_DPI, PRINT_DPI))
        return buffer.getvalue(), "image/jpeg", "jpg"
    card.save(buffer, format="PNG", dpi=(PRINT_DPI, PRINT_DPI))
    return buffer.getvalue(), "image/png", "png"


def preview_scaled(design, front_scale, back_scale=None):
    """Front above back, each centred inside the unchanged postcard boundary."""
    if back_scale is None:
        back_scale = front_scale
    front = render(design, PREVIEW_DPI, "front").convert("RGB")
    back = render(design, PREVIEW_DPI, "back").convert("RGB")
    front = contain(front, front.width, front.height, front_scale)
    back = contain(back, back.width, back.height, back_scale)
    gap = 10
    sheet = Image.new("RGB", (front.width, front.height + gap + back.height), "white")
    sheet.paste(front, (0, 0))
    sheet.paste(back, (0, front.height + gap))
    buffer = io.BytesIO()
    sheet.save(buffer, format="JPEG", quality=82)
    return buffer.getvalue()


def preview_bytes(design, which="front"):
    card = render(design, PREVIEW_DPI, which if which in ("front", "back") else "front")
    buffer = io.BytesIO()
    card.save(buffer, format="JPEG", quality=80, dpi=(PREVIEW_DPI, PREVIEW_DPI))
    return buffer.getvalue()


def _flag(value):
    return value in (True, "true", 1, "1")


def clean_texts(raw, orientation="portrait"):
    texts = []
    card_width = CARD_LONG_MM if orientation == "landscape" else CARD_SHORT_MM
    for block in raw or []:
        if not isinstance(block, dict):
            continue
        lang = block.get("lang") if block.get("lang") in ("ja", "en") else "ja"
        try:
            size = float(block.get("sizeMm") or 6)
            x = float(block.get("x") if block.get("x") is not None else 0.5)
            y = float(block.get("y") if block.get("y") is not None else 0.2)
        except (TypeError, ValueError):
            return None, "Text position or size is not a number"
        item = {
            "lang": lang,
            "text": str(block.get("text") or "")[:400],
            "sizeMm": min(24, max(3, size)),
            "color": "#%02x%02x%02x" % hex_color(block.get("color")),
            "x": min(1, max(0, x)),
            "y": min(1, max(0, y)),
            "font": "noto",
        }
        align = block.get("align") if block.get("align") in ("left", "center", "right") else "center"
        if align != "center":
            item["align"] = align
        if block.get("widthMm") not in (None, ""):
            try:
                item["widthMm"] = min(card_width, max(8, float(block.get("widthMm"))))
            except (TypeError, ValueError):
                return None, "Text width is not a number"
        if block.get("lineSpacing") not in (None, ""):
            try:
                item["lineSpacing"] = min(3, max(0.8, float(block.get("lineSpacing"))))
            except (TypeError, ValueError):
                return None, "Line spacing is not a number"
        if _flag(block.get("bold")):
            item["bold"] = True
        if _flag(block.get("outline")):
            item["outline"] = True
        if _flag(block.get("shadow")):
            item["shadow"] = True
        texts.append(item)
    return texts[:12], ""


def clean_layers(raw):
    layers = []
    for block in raw or []:
        if not isinstance(block, dict):
            continue
        file_ref = str(block.get("file") or "")
        if resolve_master(file_ref) is None and resolve_image(file_ref) is None:
            return None, "A character file is not in the artwork library or the uploads"
        try:
            x = float(block.get("x") if block.get("x") is not None else 0.5)
            y = float(block.get("y") if block.get("y") is not None else 0.55)
            height = float(block.get("heightMm") or 50)
            rotation = float(block.get("rotation") or 0)
        except (TypeError, ValueError):
            return None, "Character position or size is not a number"
        item = {
            "id": str(block.get("id") or "")[:40] or "layer",
            "file": file_ref,
            "x": min(1, max(0, x)),
            "y": min(1, max(0, y)),
            "heightMm": min(130, max(8, height)),
            "rotation": min(18, max(-18, rotation)),
        }
        item["flip"] = _flag(block.get("flip"))
        item["shadow"] = True if "shadow" not in block else _flag(block.get("shadow"))
        layers.append(item)
    return layers[:16], ""


def clean_picture(ref):
    ref = str(ref or "")
    if not ref:
        return "", ""
    if resolve_image(ref) is None and resolve_master(ref) is None:
        return None, "Choose a background from artwork or from this studio"
    return ref, ""


def clean_side(raw, fallback, orientation="portrait"):
    raw = raw if isinstance(raw, dict) else {}
    image, error = clean_picture(raw.get("image") if "image" in raw else fallback.get("image") or "")
    if error:
        return None, error
    texts, error = clean_texts(raw.get("texts") if "texts" in raw else fallback.get("texts") or [], orientation)
    if error:
        return None, error
    layers, error = clean_layers(raw.get("layers") if "layers" in raw else fallback.get("layers") or [])
    if error:
        return None, error
    return {"image": image, "texts": texts, "layers": layers}, ""


def clean_design(body, existing=None):
    """Return a design dict or an error string."""
    orientation = body.get("orientation") if body.get("orientation") in ("portrait", "landscape") else "portrait"
    qr = body.get("qr") if isinstance(body.get("qr"), dict) else {}
    previous = (existing or {}).get("qr") if isinstance((existing or {}).get("qr"), dict) else {}
    kind = qr.get("kind") if qr.get("kind") in ("merchant", "general", "none") else previous.get("kind") or "merchant"
    code_id = str(qr.get("id") or previous.get("id") or "")
    if kind == "merchant":
        if find_code(code_id) is None:
            return None, "QR id is not in the registry"
        qr_url = "https://johrenadventure.com/q/" + code_id
    elif kind == "general":
        code_id = ""
        qr_url = "https://johrenadventure.com/"
    else:
        code_id = ""
        qr_url = ""
    incoming = body.get("sides") if isinstance(body.get("sides"), dict) else {}
    front, error = clean_side(incoming.get("front"), {"image": body.get("image"), "texts": body.get("texts"), "layers": body.get("layers")}, orientation)
    if error:
        return None, error
    back, error = clean_side(incoming.get("back"), {"image": "", "texts": [], "layers": []}, orientation)
    if error:
        return None, error
    try:
        qr_size = min(MAX_QR_MM, max(MIN_QR_MM, float(qr.get("sizeMm") or 22)))
        qr_x = float(qr.get("x") if qr.get("x") is not None else 0.78)
        qr_y = float(qr.get("y") if qr.get("y") is not None else 0.8)
    except (TypeError, ValueError):
        return None, "QR position or size is not a number"
    qr_x, qr_y = clamp_center(qr_x, qr_y, qr_size, orientation)
    design = {
        "id": (existing or {}).get("id") or body.get("id"),
        "title": str(body.get("title") or "")[:120],
        "orientation": orientation,
        "image": front["image"],
        "texts": front["texts"],
        "layers": front["layers"],
        "sides": {"front": front, "back": back},
        "qr": {
            "kind": kind,
            "id": code_id,
            "url": qr_url,
            "sizeMm": qr_size,
            "x": qr_x,
            "y": qr_y,
        },
        "createdAt": (existing or {}).get("createdAt"),
    }
    return design, ""


def landing_hint(code_id):
    row = find_code(code_id)
    if row is None:
        return ""
    return public_path_for(row)
