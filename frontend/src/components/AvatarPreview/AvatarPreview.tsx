import type {
  AdjustableBoxes,
  AssetItem,
  Box,
} from "../../types/avatar";
import { previewStyles } from "./AvatarPreview.styles";

type Props = {
  head?: AssetItem;
  eyes?: AssetItem;
  brows?: AssetItem;
  noses?: AssetItem;
  mouths?: AssetItem;
  faceBox: Box;
  boxes: AdjustableBoxes;
};

const CANVAS_W = 1855;
const CANVAS_H = 1780;
const PREVIEW_W = 360;
const PREVIEW_H = Math.round((PREVIEW_W / CANVAS_W) * CANVAS_H);

function mapBoxToPreview(innerBox: Box, faceBox: Box): Box {
  const groupLeft = (faceBox.x / CANVAS_W) * PREVIEW_W;
  const groupTop = (faceBox.y / CANVAS_H) * PREVIEW_H;
  const groupWidth = (faceBox.w / CANVAS_W) * PREVIEW_W;
  const groupHeight = (faceBox.h / CANVAS_H) * PREVIEW_H;

  return {
    x: groupLeft + (innerBox.x / CANVAS_W) * groupWidth,
    y: groupTop + (innerBox.y / CANVAS_H) * groupHeight,
    w: (innerBox.w / CANVAS_W) * groupWidth,
    h: (innerBox.h / CANVAS_H) * groupHeight,
  };
}

function renderLayer(src: string | undefined, box: Box, faceBox: Box, alt: string) {
  if (!src) return null;

  const mapped = mapBoxToPreview(box, faceBox);

  return (
    <img
      src={src}
      alt={alt}
      style={{
        ...previewStyles.layer,
        left: mapped.x,
        top: mapped.y,
        width: mapped.w,
        height: mapped.h,
      }}
    />
  );
}

export function AvatarPreview({
  head,
  eyes,
  brows,
  noses,
  mouths,
  faceBox,
  boxes,
}: Props) {
  return (
    <section style={previewStyles.wrapper}>
      <h2 style={previewStyles.title}>Vista previa</h2>

      <div
        style={{
          ...previewStyles.canvas,
          width: PREVIEW_W,
          height: PREVIEW_H,
        }}
      >
        {renderLayer(
          head?.src,
          { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H },
          faceBox,
          "Cabeza"
        )}

        {renderLayer(eyes?.src, boxes.eyes, faceBox, "Ojos")}
        {renderLayer(brows?.src, boxes.brows, faceBox, "Cejas")}
        {renderLayer(noses?.src, boxes.noses, faceBox, "Nariz")}
        {renderLayer(mouths?.src, boxes.mouths, faceBox, "Boca")}
      </div>
    </section>
  );
}