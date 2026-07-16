from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image


REPO_ROOT = Path(__file__).resolve().parents[2]
ASSETS_ROOT = REPO_ROOT / "backend" / "public" / "assets"
PROCESSED_HAIR_DIR = ASSETS_ROOT / "Processed" / "Pelos"
DETAILS_DIR = PROCESSED_HAIR_DIR / "Details"
MATTES_DIR = ASSETS_ROOT / "HairMattes"


def load_layer(prefix: str, number: int) -> Image.Image:
    return Image.open(PROCESSED_HAIR_DIR / f"{prefix}_{number}.png").convert("RGBA")


def save_hair_matte(number: int) -> None:
    alpha_layers = [
        np.array(load_layer(prefix, number))[:, :, 3]
        for prefix in ("Base", "Oscuro", "Brillo", "Contorno")
    ]
    alpha = np.maximum.reduce(alpha_layers)
    matte_pixels = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    matte_pixels[:, :, :3] = 255
    matte_pixels[:, :, 3] = alpha
    matte = Image.fromarray(matte_pixels, "RGBA")
    output = MATTES_DIR / f"Pelo_{number}_mask.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    matte.save(output, optimize=True)


def save_detail_layer(prefix: str, number: int) -> None:
    base = np.array(load_layer("Base", number))
    layer = np.array(load_layer(prefix, number))

    layer_alpha = layer[:, :, 3] > 0
    base_alpha = base[:, :, 3] > 0
    difference = np.abs(layer[:, :, :3].astype(np.int16) - base[:, :, :3].astype(np.int16))
    different_from_base = difference.max(axis=2) > 12
    dark_enough_without_base = layer[:, :, :3].min(axis=2) < 235

    keep = layer_alpha & (
        (base_alpha & different_from_base)
        | (~base_alpha & dark_enough_without_base)
    )

    output_pixels = layer.copy()
    output_pixels[~keep, 3] = 0
    output = Image.fromarray(output_pixels, "RGBA")
    output_path = DETAILS_DIR / f"{prefix}_{number}.png"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(output_path, optimize=True)


def main() -> None:
    for number in range(1, 11):
        save_hair_matte(number)
        for prefix in ("Oscuro", "Brillo", "Contorno"):
            save_detail_layer(prefix, number)
        print(f"Processed hair {number}")


if __name__ == "__main__":
    main()
