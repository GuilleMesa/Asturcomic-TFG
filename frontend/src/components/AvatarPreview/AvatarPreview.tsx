import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Box, CanvasSize, CompositeAsset } from "../../types/avatar";
import { previewStyles } from "./AvatarPreview.styles";

type Props = {
  canvas: CanvasSize;
  pose?: CompositeAsset;
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
  glasses?: CompositeAsset;
  speechBubble?: CompositeAsset;
  speechBubbleBox: Box;
  skinColor: string;
  hairColor: string;
  browColor: string;
  faceBox: Box;
  onSpeechBubbleBoxChange: (box: Box) => void;
};

const PREVIEW_W = 480;
const MIN_SPEECH_BUBBLE_W = 180;
const MIN_SPEECH_BUBBLE_H = 90;
const HAIR_FRONT_MASK_SRC = "/assets/ColorMasks/HairFrontMask.png?v=3";

type BubbleInteraction = {
  type: "move" | "resize";
  pointerId: number;
  startPoint: {
    x: number;
    y: number;
  };
  startBox: Box;
  aspect: number;
};

function mapFaceBoxToPreview(faceBox: Box, canvas: CanvasSize): Box {
  const previewHeight = Math.round((PREVIEW_W / canvas.w) * canvas.h);

  return {
    x: (faceBox.x / canvas.w) * PREVIEW_W,
    y: (faceBox.y / canvas.h) * previewHeight,
    w: (faceBox.w / canvas.w) * PREVIEW_W,
    h: (faceBox.h / canvas.h) * previewHeight,
  };
}

function getPointerCanvasPoint(
  event: PointerEvent<HTMLElement>,
  element: HTMLElement,
  canvas: CanvasSize
) {
  const rect = element.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.w,
    y: ((event.clientY - rect.top) / rect.height) * canvas.h,
  };
}

function clampBox(box: Box, canvas: CanvasSize): Box {
  const w = Math.min(Math.max(Math.round(box.w), MIN_SPEECH_BUBBLE_W), canvas.w);
  const h = Math.min(Math.max(Math.round(box.h), MIN_SPEECH_BUBBLE_H), canvas.h);

  return {
    x: Math.min(Math.max(Math.round(box.x), 0), canvas.w - w),
    y: Math.min(Math.max(Math.round(box.y), 0), canvas.h - h),
    w,
    h,
  };
}

function resizeBoxFromPoint(
  startBox: Box,
  point: { x: number; y: number },
  canvas: CanvasSize,
  aspect: number
): Box {
  const maxW = canvas.w - startBox.x;
  const maxH = canvas.h - startBox.y;
  let nextW = Math.max(MIN_SPEECH_BUBBLE_W, point.x - startBox.x);
  let nextH = Math.max(MIN_SPEECH_BUBBLE_H, point.y - startBox.y);

  if (aspect > 0) {
    if (nextW / aspect < nextH) {
      nextW = nextH * aspect;
    } else {
      nextH = nextW / aspect;
    }

    if (nextW > maxW) {
      nextW = maxW;
      nextH = nextW / aspect;
    }

    if (nextH > maxH) {
      nextH = maxH;
      nextW = nextH * aspect;
    }
  }

  return clampBox({ ...startBox, w: nextW, h: nextH }, canvas);
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
  opacity: number | undefined,
  canvas: CanvasSize
): CSSProperties {
  return {
    ...previewStyles.fullCanvasLayer,
    ...getLayerPlacementStyle(asset, canvas),
    mixBlendMode: layerBlendMode,
    opacity,
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
  colorableLayerColor?: string,
  maskSrc?: string
) {
  if (!asset) return null;

  const content = (
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
                style={getLayerStyle(asset, "multiply", layer.opacity, canvas)}
              />
            </div>
          );
        }

        return (
          <img
            key={layer.id}
            src={layer.src}
            alt={alt}
            style={getLayerStyle(asset, layer.blendMode, layer.opacity, canvas)}
          />
        );
      })}
    </>
  );

  if (!maskSrc) {
    return content;
  }

  const maskUrl = `url("${maskSrc}")`;

  return (
    <div
      style={{
        ...previewStyles.fullCanvasLayer,
        maskImage: maskUrl,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "100% 100%",
        WebkitMaskImage: maskUrl,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "100% 100%",
      }}
    >
      {content}
    </div>
  );
}

export function AvatarPreview({
  canvas,
  pose,
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
  glasses,
  speechBubble,
  speechBubbleBox,
  skinColor,
  hairColor,
  browColor,
  faceBox,
  onSpeechBubbleBoxChange,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleInteraction, setBubbleInteraction] =
    useState<BubbleInteraction | null>(null);
  const previewHeight = Math.round((PREVIEW_W / canvas.w) * canvas.h);
  const mappedFaceBox = mapFaceBoxToPreview(faceBox, canvas);
  const mappedSpeechBubbleBox = mapFaceBoxToPreview(speechBubbleBox, canvas);
  const speechBubbleLayer = speechBubble?.layers[0];
  const speechBubbleAspect =
    speechBubble?.canvas && speechBubble.canvas.h > 0
      ? speechBubble.canvas.w / speechBubble.canvas.h
      : speechBubbleBox.w / speechBubbleBox.h;

  function handleBubblePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!canvasRef.current || !speechBubbleLayer) return;

    event.preventDefault();
    speechBubbleRef.current?.setPointerCapture(event.pointerId);
    setBubbleInteraction({
      type: "move",
      pointerId: event.pointerId,
      startPoint: getPointerCanvasPoint(event, canvasRef.current, canvas),
      startBox: speechBubbleBox,
      aspect: speechBubbleAspect,
    });
  }

  function handleResizePointerDown(event: PointerEvent<HTMLSpanElement>) {
    if (!canvasRef.current || !speechBubbleLayer) return;

    event.preventDefault();
    event.stopPropagation();
    speechBubbleRef.current?.setPointerCapture(event.pointerId);
    setBubbleInteraction({
      type: "resize",
      pointerId: event.pointerId,
      startPoint: getPointerCanvasPoint(event, canvasRef.current, canvas),
      startBox: speechBubbleBox,
      aspect: speechBubbleAspect,
    });
  }

  function handleBubblePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      !bubbleInteraction ||
      bubbleInteraction.pointerId !== event.pointerId ||
      !canvasRef.current
    ) {
      return;
    }

    const point = getPointerCanvasPoint(event, canvasRef.current, canvas);

    if (bubbleInteraction.type === "resize") {
      onSpeechBubbleBoxChange(
        resizeBoxFromPoint(
          bubbleInteraction.startBox,
          point,
          canvas,
          bubbleInteraction.aspect
        )
      );
      return;
    }

    const dx = point.x - bubbleInteraction.startPoint.x;
    const dy = point.y - bubbleInteraction.startPoint.y;
    onSpeechBubbleBoxChange(
      clampBox(
        {
          ...bubbleInteraction.startBox,
          x: bubbleInteraction.startBox.x + dx,
          y: bubbleInteraction.startBox.y + dy,
        },
        canvas
      )
    );
  }

  function handleBubblePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!bubbleInteraction || bubbleInteraction.pointerId !== event.pointerId) {
      return;
    }

    if (speechBubbleRef.current?.hasPointerCapture(event.pointerId)) {
      speechBubbleRef.current.releasePointerCapture(event.pointerId);
    }

    setBubbleInteraction(null);
  }

  return (
    <section style={previewStyles.wrapper}>
      <div style={previewStyles.titleRow}>
        <div>
          <h2 style={previewStyles.title}>Vista previa</h2>
          <p style={previewStyles.subtitle}>Composición actual</p>
        </div>
        <span style={previewStyles.canvasMeta}>
          {canvas.w} x {canvas.h}
        </span>
      </div>

      <div
        ref={canvasRef}
        style={{
          ...previewStyles.canvas,
          width: PREVIEW_W,
          height: previewHeight,
        }}
      >
        {renderComposite(hair, "Pelo", canvas, hairColor)}
        {renderComposite(pose, "Pose", canvas)}

        <div
          style={{
            ...previewStyles.faceGroup,
            left: mappedFaceBox.x,
            top: mappedFaceBox.y,
            width: mappedFaceBox.w,
            height: mappedFaceBox.h,
          }}
        >
          {renderComposite(leftEar, "Oreja izquierda", canvas, skinColor)}
          {renderComposite(rightEar, "Oreja derecha", canvas, skinColor)}
          {renderComposite(head, "Cabeza", canvas, skinColor)}
          {renderComposite(leftBrow, "Ceja izquierda", canvas, browColor)}
          {renderComposite(rightBrow, "Ceja derecha", canvas, browColor)}
          {renderComposite(leftEye, "Ojo izquierdo", canvas)}
          {renderComposite(rightEye, "Ojo derecho", canvas)}
          {renderComposite(leftLash, "Pestana izquierda", canvas)}
          {renderComposite(rightLash, "Pestana derecha", canvas)}
          {renderComposite(nose, "Nariz", canvas)}
          {renderComposite(glasses, "Gafas", canvas)}
          {renderComposite(mouth, "Boca", canvas)}
          {renderComposite(
            hair,
            "Pelo",
            canvas,
            hairColor,
            HAIR_FRONT_MASK_SRC
          )}
        </div>

        {speechBubbleLayer && (
          <div
            ref={speechBubbleRef}
            role="img"
            aria-label={speechBubble.label}
            onPointerDown={handleBubblePointerDown}
            onPointerMove={handleBubblePointerMove}
            onPointerUp={handleBubblePointerUp}
            onPointerCancel={handleBubblePointerUp}
            style={{
              ...previewStyles.speechBubbleFrame,
              left: mappedSpeechBubbleBox.x,
              top: mappedSpeechBubbleBox.y,
              width: mappedSpeechBubbleBox.w,
              height: mappedSpeechBubbleBox.h,
            }}
          >
            <img
              src={speechBubbleLayer.src}
              alt=""
              draggable={false}
              style={previewStyles.speechBubbleImage}
            />
            <span
              aria-hidden="true"
              onPointerDown={handleResizePointerDown}
              style={previewStyles.speechBubbleResizeHandle}
            />
          </div>
        )}
      </div>
    </section>
  );
}
