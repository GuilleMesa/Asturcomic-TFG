export type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CanvasSize = {
  w: number;
  h: number;
};

export type LayerBlendMode = "normal" | "multiply" | "screen" | "overlay";
export type ColorMode = "fill" | "tint";

export type AvatarLayer = {
  id: string;
  src: string;
  alt?: string;
  maskSrc?: string;
  colorable?: boolean;
  colorMode?: ColorMode;
  blendMode?: LayerBlendMode;
};

export type CompositeAsset = {
  id: string;
  label: string;
  canvas?: CanvasSize;
  offset?: {
    x: number;
    y: number;
  };
  layers: AvatarLayer[];
};

export type Catalog = {
  canvas: CanvasSize;
  heads: CompositeAsset[];
  leftEars: CompositeAsset[];
  rightEars: CompositeAsset[];
  hairs: CompositeAsset[];
  leftEyes: CompositeAsset[];
  rightEyes: CompositeAsset[];
  leftLashes: CompositeAsset[];
  rightLashes: CompositeAsset[];
  leftBrows: CompositeAsset[];
  rightBrows: CompositeAsset[];
  noses: CompositeAsset[];
  mouths: CompositeAsset[];
  poses?: CompositeAsset[];
};

export type SelectedAvatar = {
  heads: string;
  leftEars: string;
  rightEars: string;
  hairs: string;
  leftEyes: string;
  rightEyes: string;
  leftLashes: string;
  rightLashes: string;
  leftBrows: string;
  rightBrows: string;
  noses: string;
  mouths: string;
};

export type SelectableCategory = keyof SelectedAvatar;
