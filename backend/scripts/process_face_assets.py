from __future__ import annotations

import argparse
import base64
import re
from collections import deque
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image


REPO_ROOT = Path(__file__).resolve().parents[2]
ASSETS_ROOT = REPO_ROOT / "backend" / "public" / "assets"
SOURCE_DIRS = (
    "Cabezas",
    "Orejas",
    "Ojos",
    "Cejas",
    "Pestañas",
    "Nariz",
    "Bocas",
    "Pelos",
)
TARGET_SIZE = (2836, 3055)
WHITE_THRESHOLD = 246


def decode_embedded_png(svg_path: Path) -> Image.Image:
    text = svg_path.read_text(encoding="utf-8")
    match = re.search(r"base64,([^\"']+)", text)
    if not match:
        raise ValueError(f"No embedded PNG found in {svg_path}")

    image_bytes = base64.b64decode(match.group(1))
    return Image.open(BytesIO(image_bytes)).convert("RGBA")


def transparentize_edge_background(image: Image.Image) -> Image.Image:
    image = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    pixels = np.array(image)
    background = (
        (pixels[:, :, 3] > 0)
        & (pixels[:, :, 0] >= WHITE_THRESHOLD)
        & (pixels[:, :, 1] >= WHITE_THRESHOLD)
        & (pixels[:, :, 2] >= WHITE_THRESHOLD)
    )
    height, width = background.shape
    outside = np.zeros((height, width), dtype=bool)
    stack: deque[tuple[int, int]] = deque()

    for x in np.flatnonzero(background[0]):
        stack.append((int(x), 0))
    for x in np.flatnonzero(background[height - 1]):
        stack.append((int(x), height - 1))
    for y in np.flatnonzero(background[:, 0]):
        stack.append((0, int(y)))
    for y in np.flatnonzero(background[:, width - 1]):
        stack.append((width - 1, int(y)))

    while stack:
        x, y = stack.pop()
        if outside[y, x] or not background[y, x]:
            continue

        row_background = background[y]
        row_outside = outside[y]
        left = x
        while left > 0 and row_background[left - 1] and not row_outside[left - 1]:
            left -= 1

        right = x
        while (
            right + 1 < width
            and row_background[right + 1]
            and not row_outside[right + 1]
        ):
            right += 1

        row_outside[left : right + 1] = True

        for next_y in (y - 1, y + 1):
            if next_y < 0 or next_y >= height:
                continue

            segment = (
                background[next_y, left : right + 1]
                & ~outside[next_y, left : right + 1]
            )
            if not segment.any():
                continue

            relative_indexes = np.flatnonzero(segment)
            gaps = np.flatnonzero(np.diff(relative_indexes) > 1)
            starts = np.r_[0, gaps + 1]
            for start_index in starts:
                stack.append((int(left + relative_indexes[start_index]), next_y))

    pixels[outside, 3] = 0
    return Image.fromarray(pixels, "RGBA")


def process_directory(directory_name: str) -> int:
    source_dir = ASSETS_ROOT / directory_name
    output_dir = ASSETS_ROOT / "Processed" / directory_name
    output_dir.mkdir(parents=True, exist_ok=True)

    count = 0
    for svg_path in sorted(source_dir.glob("*.svg")):
        image = decode_embedded_png(svg_path)
        processed = transparentize_edge_background(image)
        output_path = output_dir / f"{svg_path.stem}.png"
        processed.save(output_path, optimize=True)
        print(f"{svg_path.relative_to(ASSETS_ROOT)} -> {output_path.relative_to(ASSETS_ROOT)}")
        count += 1

    return count


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("directories", nargs="*", default=SOURCE_DIRS)
    args = parser.parse_args()

    total = 0
    for directory_name in args.directories:
        total += process_directory(directory_name)

    print(f"Processed {total} asset(s).")


if __name__ == "__main__":
    main()
