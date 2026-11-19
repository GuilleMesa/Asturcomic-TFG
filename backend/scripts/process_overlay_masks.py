from pathlib import Path
from xml.etree import ElementTree

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from process_face_assets import ASSETS_ROOT, TARGET_SIZE, decode_embedded_png


HAND_SEEDS = {
    "7F": (1230, 1220),
    "7M": (1230, 1220),
    "10F": (1345, 1170),
    "10M": (1370, 1150),
    "13F": (1360, 1260),
    "13M": (1360, 1260),
}


def mask_path(mask: Image.Image, x_offset: int = 0, y_offset: int = 0) -> str:
    # Merge equal scanline spans into rectangles to keep pixel-exact SVGs compact.
    pixels = np.asarray(mask) > 0
    active = {}
    rectangles = []
    for y in range(pixels.shape[0] + 1):
        row = pixels[y] if y < pixels.shape[0] else np.zeros(pixels.shape[1], dtype=bool)
        edges = np.flatnonzero(np.diff(np.pad(row.astype(np.int8), 1)))
        spans = set(zip(edges[::2].tolist(), edges[1::2].tolist()))
        for span in list(active):
            if span not in spans:
                rectangles.append((*span, active.pop(span), y))
        for span in sorted(spans):
            active.setdefault(span, y)

    return " ".join(
        f"M{left + x_offset} {top + y_offset}h{right - left}v{bottom - top}"
        f"h{left - right}Z"
        for left, right, top, bottom in rectangles
    )


def save_mask(
    path: Path,
    view_box: str,
    data: str,
    bounds: tuple[float, float, float, float],
    transform: str | None = None,
) -> None:
    ElementTree.register_namespace("", "http://www.w3.org/2000/svg")
    root = ElementTree.Element(
        "{http://www.w3.org/2000/svg}svg",
        {"viewBox": view_box, "data-content-box": " ".join(map(str, bounds))},
    )
    attrs = {"fill": "white", "d": data}
    if transform:
        attrs["transform"] = transform
    ElementTree.SubElement(root, "{http://www.w3.org/2000/svg}path", attrs)
    path.parent.mkdir(parents=True, exist_ok=True)
    ElementTree.ElementTree(root).write(path, encoding="utf-8", xml_declaration=True)
    print(f"Generated {path.relative_to(ASSETS_ROOT)}", flush=True)


def lens_masks() -> None:
    for number in (1, 2):
        source = ASSETS_ROOT / "Complementos" / f"Cristales_{number}.svg"
        svg = ElementTree.parse(source).getroot()
        embedded = svg.find("{http://www.w3.org/2000/svg}image")
        if embedded is None or embedded.get("transform") != "scale(.27)":
            raise ValueError(f"Unexpected lens layout in {source.name}")

        image = decode_embedded_png(source)
        box = image.getbbox()
        if box is None:
            raise ValueError(f"Empty lens: {source.name}")
        alpha = np.asarray(image.crop(box).getchannel("A"))
        outline = Image.fromarray(np.pad((alpha >= 32).astype(np.uint8) * 255, 1)).copy()
        ImageDraw.floodfill(outline, (0, 0), 128)
        if outline.histogram()[0] < 1000:
            raise ValueError(f"Lens outline is not closed: {source.name}")

        filled = outline.point([0 if value == 128 else 255 for value in range(256)])
        path = ASSETS_ROOT / "ColorMasks" / "Complementos" / f"Cristales_{number}_fill.svg"
        save_mask(
            path,
            svg.attrib["viewBox"],
            mask_path(filled, box[0] - 1, box[1] - 1),
            tuple(value * 0.27 for value in box),
            embedded.attrib["transform"],
        )


def hand_masks() -> None:
    for suffix, seed in HAND_SEEDS.items():
        pose = decode_embedded_png(ASSETS_ROOT / "Poses" / f"Pose_{suffix}.svg")
        pose = pose.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        pixels = np.asarray(pose)
        distance = np.abs(pixels[:, :, :3].astype(np.int16) - (246, 185, 157)).max(axis=2)
        skin = Image.fromarray(((distance < 65) & (pixels[:, :, 3] > 64)).astype(np.uint8) * 255).copy()
        if skin.getpixel(seed) != 255:
            raise ValueError(f"Hand seed is outside skin for Pose_{suffix}")
        ImageDraw.floodfill(skin, seed, 128)
        hand = skin.point([255 if value == 128 else 0 for value in range(256)])
        box = hand.getbbox()
        if box is None or box[2] - box[0] > 220 or box[3] - box[1] > 280:
            raise ValueError(f"Hand region includes unexpected pose parts for Pose_{suffix}")

        # Include the original ink around the hand without selecting the neck.
        hand = hand.filter(ImageFilter.MaxFilter(13))
        path = ASSETS_ROOT / "ColorMasks" / "Poses" / f"Pose_{suffix}_foreground.svg"
        save_mask(path, f"0 0 {TARGET_SIZE[0]} {TARGET_SIZE[1]}", mask_path(hand), hand.getbbox())


if __name__ == "__main__":
    lens_masks()
    hand_masks()
