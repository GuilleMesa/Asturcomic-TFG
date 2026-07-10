import type { CSSProperties } from "react";
import type { Box, CanvasSize, CompositeAsset } from "../../types/avatar";
import { previewStyles } from "./AvatarPreview.styles";

type Props = {
  canvas: CanvasSize;
  leftEar?: CompositeAsset;
  rightEar?: CompositeAsset;
  head?: CompositeAsset;
  hair?: CompositeAsset;
  leftEye?: CompositeAsset;
  rightEye?: CompositeAsset;
  leftLash?: CompositeAsset;
  rightLash?: CompositeAsset;
  leftBrow?: CompositeAsset;
  rightBrow?: CompositeAsset;
  nose?: CompositeAsset;
  mouth?: CompositeAsset;
  hairColor: string;
  browColor: string;
  faceBox: Box;
};

const PREVIEW_W = 360;

function mapFaceBoxToPreview(faceBox: Box, canvas: CanvasSize): Box {
  const previewHeight = Math.round((PREVIEW_W / canvas.w) * canvas.h);

  return {
    x: (faceBox.x / canvas.w) * PREVIEW_W,
    y: (faceBox.y / canvas.h) * previewHeight,
    w: (faceBox.w / canvas.w) * PREVIEW_W,
    h: (faceBox.h / canvas.h) * previewHeight,
  };
}

function getLayerPlacementStyle(
  asset: CompositeAsset,
  canvas: CanvasSize
): CSSProperties {
  const layerCanvas = asset.canvas ?? canvas;
  const offset = asset.offset ?? { x: 0, y: 0 };

  return {
    left: `${(offset.x / canvas.w) * 100}%`,
    top: `${(offset.y / canvas.h) * 100}%`,
    width: `${(layerCanvas.w / canvas.w) * 100}%`,
    height: `${(layerCanvas.h / canvas.h) * 100}%`,
  };
}

function getLayerStyle(
  asset: CompositeAsset,
  layerBlendMode: CompositeAsset["layers"][number]["blendMode"],
  canvas: CanvasSize
): CSSProperties {
  return {
    ...previewStyles.fullCanvasLayer,
    ...getLayerPlacementStyle(asset, canvas),
    mixBlendMode: layerBlendMode,
  };
}

function getColorMaskStyle(
  asset: CompositeAsset,
  layerSrc: string,
  color: string,
  canvas: CanvasSize
): CSSProperties {
  const maskUrl = `url("${layerSrc}")`;

  return {
    ...previewStyles.fullCanvasLayer,
    ...getLayerPlacementStyle(asset, canvas),
    backgroundColor: color,
    maskImage: maskUrl,
    maskPosition: "center",
    maskRepeat: "no-repeat",
    maskSize: "100% 100%",
    WebkitMaskImage: maskUrl,
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%",
  };
}

function renderComposite(
  asset: CompositeAsset | undefined,
  groupLabel: string,
  canvas: CanvasSize,
  colorableLayerColor?: string
) {
  if (!asset) return null;

  return (
    <>
      {asset.layers.map((layer) => {
        const alt = layer.alt ?? `${groupLabel} ${asset.label}`;

        if (layer.colorable && colorableLayerColor) {
          const colorMode = layer.colorMode ?? "fill";

          if (colorMode === "tint") {
            return (
              <div
                key={layer.id}
                aria-label={alt}
                role="img"
                style={getColorMaskStyle(
                  asset,
                  layer.maskSrc ?? layer.src,
                  colorableLayerColor,
                  canvas
                )}
              />
            );
          }

          return (
            <div key={layer.id}>
              <div
                aria-hidden="true"
                style={getColorMaskStyle(
                  asset,
                  layer.maskSrc ?? layer.src,
                  colorableLayerColor,
                  canvas
                )}
              />
              <img
                src={layer.src}
                alt={alt}
                style={getLayerStyle(asset, "multiply", canvas)}
              />
            </div>
          );
        }

        return (
          <img
            key={layer.id}
            src={layer.src}
            alt={alt}
            style={getLayerStyle(asset, layer.blendMode, canvas)}
          />
        );
      })}
    </>
  );
}

export function AvatarPreview({
  canvas,
  leftEar,
  rightEar,
  head,
  hair,
  leftEye,
  rightEye,
  leftLash,
  rightLash,
  leftBrow,
  rightBrow,
  nose,
  mouth,
  hairColor,
  browColor,
  faceBox,
}: Props) {
  const previewHeight = Math.round((PREVIEW_W / canvas.w) * canvas.h);
  const mappedFaceBox = mapFaceBoxToPreview(faceBox, canvas);

  return (
    <section style={previewStyles.wrapper}>
      <h2 style={previewStyles.title}>Vista previa</h2>

      <div
        style={{
          ...previewStyles.canvas,
          width: PREVIEW_W,
          height: previewHeight,
        }}
      >
        <div
          style={{
            ...previewStyles.faceGroup,
            left: mappedFaceBox.x,
            top: mappedFaceBox.y,
            width: mappedFaceBox.w,
            height: mappedFaceBox.h,
          }}
        >
          {renderComposite(leftEar, "Oreja izquierda", canvas)}
          {renderComposite(rightEar, "Oreja derecha", canvas)}
          {renderComposite(head, "Cabeza", canvas)}
          {renderComposite(hair, "Pelo", canvas, hairColor)}
          {renderComposite(leftEye, "Ojo izquierdo", canvas)}
          {renderComposite(rightEye, "Ojo derecho", canvas)}
          {renderComposite(leftLash, "Pestana izquierda", canvas)}
          {renderComposite(rightLash, "Pestana derecha", canvas)}
          {renderComposite(leftBrow, "Ceja izquierda", canvas, browColor)}
          {renderComposite(rightBrow, "Ceja derecha", canvas, browColor)}
          {renderComposite(nose, "Nariz", canvas)}
          {renderComposite(mouth, "Boca", canvas)}
        </div>
      </div>
    </section>
  );
}
