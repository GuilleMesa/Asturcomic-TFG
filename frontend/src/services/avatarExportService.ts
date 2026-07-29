import type { Box, CanvasSize, CompositeAsset } from "../types/avatar";

type AvatarRenderInput = {
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
  speechBubble?: CompositeAsset;
  speechBubbleBox: Box;
  skinColor: string;
  hairColor: string;
  browColor: string;
  faceBox: Box;
};

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function getAssetUrl(src: string): string {
  return new URL(src, window.location.origin).toString();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const url = getAssetUrl(src);
  const cachedImage = imageCache.get(url);

  if (cachedImage) {
    return cachedImage;
  }

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    image.src = url;
  });

  imageCache.set(url, imagePromise);
  return imagePromise;
}

function createFullBox(canvas: CanvasSize): Box {
  return { x: 0, y: 0, w: canvas.w, h: canvas.h };
}

function getLayerBox(
  asset: CompositeAsset,
  canvas: CanvasSize,
  groupBox: Box
): Box {
  const layerCanvas = asset.canvas ?? canvas;
  const offset = asset.offset ?? { x: 0, y: 0 };

  return {
    x: groupBox.x + (offset.x / canvas.w) * groupBox.w,
    y: groupBox.y + (offset.y / canvas.h) * groupBox.h,
    w: (layerCanvas.w / canvas.w) * groupBox.w,
    h: (layerCanvas.h / canvas.h) * groupBox.h,
  };
}

function getContainBox(image: HTMLImageElement, target: Box): Box {
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const targetAspect = target.w / target.h;

  if (!Number.isFinite(imageAspect) || imageAspect <= 0) {
    return target;
  }

  if (imageAspect > targetAspect) {
    const h = target.w / imageAspect;
    return {
      x: target.x,
      y: target.y + (target.h - h) / 2,
      w: target.w,
      h,
    };
  }

  const w = target.h * imageAspect;
  return {
    x: target.x + (target.w - w) / 2,
    y: target.y,
    w,
    h: target.h,
  };
}

function getCompositeOperation(
  blendMode: CompositeAsset["layers"][number]["blendMode"]
): GlobalCompositeOperation {
  if (blendMode === "multiply" || blendMode === "screen" || blendMode === "overlay") {
    return blendMode;
  }

  return "source-over";
}

async function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  src: string,
  target: Box,
  operation: GlobalCompositeOperation = "source-over"
) {
  if (target.w <= 0 || target.h <= 0) return;

  const image = await loadImage(src);
  const containBox = getContainBox(image, target);

  ctx.save();
  ctx.globalCompositeOperation = operation;
  ctx.drawImage(
    image,
    containBox.x,
    containBox.y,
    containBox.w,
    containBox.h
  );
  ctx.restore();
}

async function drawColorMask(
  ctx: CanvasRenderingContext2D,
  src: string,
  color: string,
  target: Box
) {
  if (target.w <= 0 || target.h <= 0) return;

  const mask = await loadImage(src);
  const maskCanvas = document.createElement("canvas");
  const maskWidth = Math.max(1, Math.round(target.w));
  const maskHeight = Math.max(1, Math.round(target.h));
  maskCanvas.width = maskWidth;
  maskCanvas.height = maskHeight;

  const maskCtx = maskCanvas.getContext("2d");
  if (!maskCtx) {
    throw new Error("No se pudo preparar la mascara de color");
  }

  maskCtx.drawImage(mask, 0, 0, maskWidth, maskHeight);
  maskCtx.globalCompositeOperation = "source-in";
  maskCtx.fillStyle = color;
  maskCtx.fillRect(0, 0, maskWidth, maskHeight);

  ctx.drawImage(maskCanvas, target.x, target.y, target.w, target.h);
}

async function drawComposite(
  ctx: CanvasRenderingContext2D,
  asset: CompositeAsset | undefined,
  canvas: CanvasSize,
  groupBox: Box,
  colorableLayerColor?: string
) {
  if (!asset) return;

  const target = getLayerBox(asset, canvas, groupBox);

  for (const layer of asset.layers) {
    if (layer.colorable && colorableLayerColor) {
      const colorMode = layer.colorMode ?? "fill";
      const maskSrc = layer.maskSrc ?? layer.src;

      await drawColorMask(ctx, maskSrc, colorableLayerColor, target);

      if (colorMode === "fill") {
        await drawImageLayer(ctx, layer.src, target, "multiply");
      }

      continue;
    }

    await drawImageLayer(
      ctx,
      layer.src,
      target,
      getCompositeOperation(layer.blendMode)
    );
  }
}

export async function renderAvatarPngBlob(
  input: AvatarRenderInput
): Promise<Blob> {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = input.canvas.w;
  canvasElement.height = input.canvas.h;

  const ctx = canvasElement.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo preparar el lienzo de exportacion");
  }

  const fullBox = createFullBox(input.canvas);

  await drawComposite(ctx, input.pose, input.canvas, fullBox);
  await drawComposite(ctx, input.leftEar, input.canvas, input.faceBox, input.skinColor);
  await drawComposite(ctx, input.rightEar, input.canvas, input.faceBox, input.skinColor);
  await drawComposite(ctx, input.head, input.canvas, input.faceBox, input.skinColor);
  await drawComposite(ctx, input.leftBrow, input.canvas, input.faceBox, input.browColor);
  await drawComposite(ctx, input.rightBrow, input.canvas, input.faceBox, input.browColor);
  await drawComposite(ctx, input.hair, input.canvas, input.faceBox, input.hairColor);
  await drawComposite(ctx, input.leftEye, input.canvas, input.faceBox);
  await drawComposite(ctx, input.rightEye, input.canvas, input.faceBox);
  await drawComposite(ctx, input.leftLash, input.canvas, input.faceBox);
  await drawComposite(ctx, input.rightLash, input.canvas, input.faceBox);
  await drawComposite(ctx, input.nose, input.canvas, input.faceBox);
  await drawComposite(ctx, input.mouth, input.canvas, input.faceBox);

  const speechBubbleLayer = input.speechBubble?.layers[0];
  if (speechBubbleLayer) {
    await drawImageLayer(ctx, speechBubbleLayer.src, input.speechBubbleBox);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvasElement.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("No se pudo generar el PNG"));
    }, "image/png");
  });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
