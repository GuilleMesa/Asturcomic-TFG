import json
from pathlib import Path
from xml.etree import ElementTree

import numpy as np
from PIL import Image

from process_face_assets import ASSETS_ROOT, REPO_ROOT, decode_embedded_png
from process_overlay_masks import mask_path
from update_thumbnail_boxes import thumbnail_box, visible_bounds


SVG_NS = "http://www.w3.org/2000/svg"


def process_asset(path: Path, canvas: dict) -> tuple[str, dict]:
    document = ElementTree.parse(path).getroot()
    embedded = document.find(f"{{{SVG_NS}}}image")
    if embedded is None or embedded.get("transform") != "scale(.24)":
        raise ValueError(f"Unexpected footwear layout: {path.name}")

    image = decode_embedded_png(path)
    source_alpha = image.getchannel("A")
    edges = (
        source_alpha.crop((0, 0, image.width, 1)),
        source_alpha.crop((0, image.height - 1, image.width, image.height)),
        source_alpha.crop((0, 0, 1, image.height)),
        source_alpha.crop((image.width - 1, 0, image.width, image.height)),
    )
    if any(edge.getextrema()[1] != 0 for edge in edges):
        raise ValueError(f"Footwear background is not transparent: {path.name}")
    box = source_alpha.getbbox()
    if box is None:
        raise ValueError(f"Empty footwear drawing: {path.name}")
    left, top, _, _ = box
    crop = np.asarray(image.crop(box))

    # Transparency comes directly from the original SVG. Only ankle tint needs a mask.
    mask_dir = ASSETS_ROOT / "ColorMasks" / "Calzado"
    mask_dir.mkdir(parents=True, exist_ok=True)
    bounds = tuple(value * 0.24 for value in (visible_bounds(image) or box))

    distance = np.abs(crop[:, :, :3].astype(np.int16) - (246, 185, 157)).max(axis=2)
    strength = np.clip((54 - distance) / 48, 0, 1)
    alpha = np.minimum(np.rint(strength * 255), crop[:, :, 3])
    levels = np.rint(alpha * (8 / 255)).astype(np.uint8)
    ElementTree.register_namespace("", SVG_NS)
    root = ElementTree.Element(
        f"{{{SVG_NS}}}svg",
        {"viewBox": document.attrib["viewBox"], "data-content-box": " ".join(map(str, bounds))},
    )
    for level in range(1, 9):
        region = Image.fromarray((levels == level).astype(np.uint8) * 255)
        data = mask_path(region, int(left), int(top))
        if data:
            ElementTree.SubElement(
                root,
                f"{{{SVG_NS}}}path",
                {
                    "fill": "white",
                    "fill-opacity": str(level / 8),
                    "transform": embedded.attrib["transform"],
                    "d": data,
                },
            )
    skin_path = mask_dir / f"{path.stem}_skin.svg"
    ElementTree.ElementTree(root).write(skin_path, encoding="utf-8", xml_declaration=True)

    suffix = path.stem.removeprefix("Pose_").lower()
    drawing = {
        "id": f"zapatillas-{suffix}",
        "label": "Zapatillas",
        "layers": [
            {
                "id": f"zapatillas-{suffix}-base",
                "src": f"/assets/Calzado/{path.name}",
            },
            {
                "id": f"zapatillas-{suffix}-skin",
                "src": f"/assets/ColorMasks/Calzado/{skin_path.name}",
                "colorable": True,
                "colorMode": "tint",
            },
        ],
    }
    drawing["thumbnailBox"] = thumbnail_box(drawing, canvas)
    print(f"Registered transparent footwear: {path.name}", flush=True)
    return f"pose-{suffix}", drawing


def main() -> None:
    catalog_path = REPO_ROOT / "backend" / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    pose_ids = {pose["id"] for pose in catalog["poses"]}
    variants = {}
    files = sorted(
        (ASSETS_ROOT / "Calzado").glob("Pose_*.svg"),
        key=lambda path: (int(path.stem[5:-1]), path.stem[-1]),
    )
    for path in files:
        pose_id, drawing = process_asset(path, catalog["canvas"])
        if pose_id not in pose_ids:
            raise ValueError(f"Footwear has no matching pose: {path.name}")
        variants[pose_id] = drawing

    catalog["footwear"] = [
        {"id": "sin-calzado", "label": "Sin calzado", "layers": []},
        {"id": "zapatillas", "label": "Zapatillas", "layers": [], "poseVariants": variants},
    ]
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Registered footwear for {len(variants)} poses.", flush=True)
    print(f"Missing footwear for: {', '.join(sorted(pose_ids - variants.keys()))}", flush=True)


if __name__ == "__main__":
    main()
