from __future__ import annotations

import base64
import re
import unicodedata
from io import BytesIO
from pathlib import Path

from PIL import Image


REPO_ROOT = Path(__file__).resolve().parents[2]
ASSETS_ROOT = REPO_ROOT / "backend" / "public" / "assets"
SOURCE_DIR = ASSETS_ROOT / "Bocadillos"
OUTPUT_DIR = ASSETS_ROOT / "Processed" / "Bocadillos"
IGNORED_TOKENS = ("conversacion_multiple", "doble")


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "_", value).strip("_")


def should_ignore(path: Path) -> bool:
    normalized = normalize(path.stem)
    return any(token in normalized for token in IGNORED_TOKENS)


def decode_embedded_png(svg_path: Path) -> Image.Image:
    text = svg_path.read_text(encoding="utf-8")
    match = re.search(r"base64,([^\"']+)", text)
    if not match:
        raise ValueError(f"No embedded PNG found in {svg_path}")

    return Image.open(BytesIO(base64.b64decode(match.group(1)))).convert("RGBA")


def crop_visible_content(image: Image.Image, padding: int = 16) -> Image.Image:
    bbox = image.getbbox()
    if bbox is None:
        return image

    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image.width, bbox[2] + padding)
    bottom = min(image.height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    processed = 0
    for svg_path in sorted(SOURCE_DIR.glob("*.svg")):
        if should_ignore(svg_path):
            continue

        image = crop_visible_content(decode_embedded_png(svg_path))
        output_path = OUTPUT_DIR / f"{svg_path.stem}.png"
        image.save(output_path, optimize=True)
        print(f"{svg_path.relative_to(ASSETS_ROOT)} -> {output_path.relative_to(ASSETS_ROOT)}")
        processed += 1

    print(f"Processed {processed} speech bubble asset(s).")


if __name__ == "__main__":
    main()
