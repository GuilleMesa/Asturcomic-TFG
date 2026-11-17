from pathlib import Path

import numpy as np
from PIL import Image

from process_face_assets import ASSETS_ROOT, TARGET_SIZE, decode_embedded_png


REFERENCE_COLORS = {
    "skin": (246, 185, 157),
    "shirt": (255, 255, 255),
    "pants": (131, 212, 250),
}
CLOTHING_SOURCES = {
    "shirt": ("Camiseta B\u00e1sica", "Camiseta_B\u00e1sica"),
    "pants": ("Pantal\u00f3n", "Pantal\u00f3n"),
}


def save_color_masks(pose_path: Path, output_dir: Path) -> None:
    pose = decode_embedded_png(pose_path)
    box = pose.getbbox()
    if box is None:
        raise ValueError(f"Empty pose: {pose_path.name}")

    pixels = np.asarray(pose.crop(box), dtype=np.int16)
    rgb, pose_alpha = pixels[:, :, :3], pixels[:, :, 3]
    pose_number = pose_path.stem.removeprefix("Pose_")

    for part, color in REFERENCE_COLORS.items():
        # Fade into the original ink and antialiased edges.
        distance = np.abs(rgb - np.asarray(color, dtype=np.int16)).max(axis=2)
        strength = np.clip((54 - distance) / 48, 0, 1)
        alpha = np.minimum(np.rint(strength * 255), pose_alpha).astype(np.uint8)

        if part in CLOTHING_SOURCES:
            folder, prefix = CLOTHING_SOURCES[part]
            garment = decode_embedded_png(
                ASSETS_ROOT / "Ropa" / folder / f"{prefix}_{pose_number}.svg"
            )
            if garment.size != pose.size:
                raise ValueError(f"Garment does not share pose canvas: {part} {pose_number}")

            # The pose already includes any hands, props and outlines in front of the fabric.
            alpha = np.minimum(alpha, np.asarray(garment.crop(box).getchannel("A")))

        matte = Image.new("L", pose.size)
        matte.paste(Image.fromarray(alpha), box[:2])
        matte = matte.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        if matte.getbbox() is None:
            raise ValueError(f"Empty {part} mask for {pose_path.name}")

        mask = Image.new("RGBA", TARGET_SIZE, "white")
        mask.putalpha(matte)
        mask.save(output_dir / f"{pose_path.stem}_{part}.png", optimize=True)


def main() -> None:
    output_dir = ASSETS_ROOT / "ColorMasks" / "Poses"
    output_dir.mkdir(parents=True, exist_ok=True)

    for path in sorted((ASSETS_ROOT / "Poses").glob("Pose_*.svg")):
        save_color_masks(path, output_dir)
        print(f"Processed color masks for {path.stem}", flush=True)


if __name__ == "__main__":
    main()
