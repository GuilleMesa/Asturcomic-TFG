import json
import math
import re
from pathlib import Path
from xml.etree import ElementTree

import numpy as np
from PIL import Image

from process_face_assets import ASSETS_ROOT, REPO_ROOT, decode_embedded_png


Box = tuple[float, float, float, float]
SVG_IMAGE_TAG = "{http://www.w3.org/2000/svg}image"


def visible_bounds(image: Image.Image) -> Box | None:
    alpha = np.asarray(image.getchannel("A"))
    weight = np.where(alpha >= 16, alpha, 0)
    total = weight.sum()
    if not total:
        return None

    # Ignore sparse marks outside the drawing that would expand the thumbnail.
    axes = [weight.sum(axis=axis).cumsum() for axis in (0, 1)]
    start_x, start_y = (int(np.searchsorted(axis, total * 0.005)) for axis in axes)
    end_x, end_y = (int(np.searchsorted(axis, total * 0.995)) + 1 for axis in axes)
    return start_x, start_y, end_x, end_y


def layer_geometry(path: Path) -> tuple[float, float, Box | None]:
    if path.suffix.lower() != ".svg":
        with Image.open(path) as image:
            return image.width, image.height, visible_bounds(image.convert("RGBA"))

    root = ElementTree.parse(path).getroot()
    if "data-content-box" in root.attrib:
        _, _, width, height = map(float, root.attrib["viewBox"].split())
        bounds = tuple(map(float, root.attrib["data-content-box"].split()))
        return width, height, bounds

    # Source SVGs contain one raster image scaled to the artboard.
    elements = list(root)
    if len(elements) != 1 or elements[0].tag != SVG_IMAGE_TAG:
        raise ValueError(f"Expected a single embedded image in {path.name}")

    embedded = elements[0]
    transform = embedded.get("transform", "scale(1)")
    match = re.fullmatch(r"scale\((\d*\.?\d+)\)", transform)
    if match is None:
        raise ValueError(f"Unexpected image transform in {path.name}: {transform}")

    image = decode_embedded_png(path)
    bounds = visible_bounds(image)
    view_x, view_y, width, height = map(float, root.attrib["viewBox"].split())
    if bounds is None:
        return width, height, None

    scale = float(match[1])
    x = float(embedded.get("x", 0)) * scale - view_x
    y = float(embedded.get("y", 0)) * scale - view_y
    sx = float(embedded.attrib["width"]) * scale / image.width
    sy = float(embedded.attrib["height"]) * scale / image.height
    left, top, right, bottom = bounds
    return width, height, (
        max(0, x + left * sx),
        max(0, y + top * sy),
        min(width, x + right * sx),
        min(height, y + bottom * sy),
    )


def thumbnail_box(asset: dict, canvas: dict) -> dict | None:
    placement = asset.get("canvas", canvas)
    width, height = placement["w"], placement["h"]
    offset = asset.get("offset", {"x": 0, "y": 0})
    boxes = []

    for layer in asset["layers"]:
        sources = []
        if layer.get("colorable"):
            sources.append((layer.get("maskSrc", layer["src"]), True))
        if not layer.get("colorable") or layer.get("colorMode") != "tint":
            sources.append((layer["src"], False))

        for src, is_mask in sources:
            path = ASSETS_ROOT / src.removeprefix("/assets/")
            image_w, image_h, bounds = layer_geometry(path)
            if bounds is None:
                continue

            sx, sy = width / image_w, height / image_h
            if not is_mask:
                sx = sy = min(sx, sy)
            x = offset["x"] + (width - image_w * sx) / 2
            y = offset["y"] + (height - image_h * sy) / 2
            left, top, right, bottom = bounds
            boxes.append((x + left * sx, y + top * sy, x + right * sx, y + bottom * sy))

    if not boxes:
        return None
    left, top = (math.floor(min(box[i] for box in boxes)) for i in (0, 1))
    right, bottom = (math.ceil(max(box[i] for box in boxes)) for i in (2, 3))
    return {"x": left, "y": top, "w": right - left, "h": bottom - top}


def main() -> None:
    catalog_path = REPO_ROOT / "backend" / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    count = 0
    for group, assets in catalog.items():
        if not isinstance(assets, list) or group == "speechBubbles":
            continue
        for asset in assets:
            box = thumbnail_box(asset, catalog["canvas"])
            if box is None:
                asset.pop("thumbnailBox", None)
                continue
            asset["thumbnailBox"] = box
            count += 1

    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {count} thumbnail boxes.")


if __name__ == "__main__":
    main()
