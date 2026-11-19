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
export type Gender = "male" | "female" | "nonBinary";
export type PoseGender = Gender;
export type ClothingPart = "shirt" | "pants";
export type ClothingColors = Record<ClothingPart, string>;
export type BodyColorPart = "skin" | ClothingPart;

export type AvatarLayer = {
  id: string;
  src: string;
  alt?: string;
  maskSrc?: string;
  colorable?: boolean;
  color?: string;
  colorMode?: ColorMode;
  blendMode?: LayerBlendMode;
  opacity?: number;
};

export type CompositeAsset = {
  id: string;
  label: string;
  thumbnailBox?: Box;
  lensShapeId?: string;
  gender?: PoseGender;
  canvas?: CanvasSize;
  offset?: {
    x: number;
    y: number;
  };
  layers: AvatarLayer[];
};

export type PoseAsset = CompositeAsset & {
  bodyColorMasks?: Record<BodyColorPart, string>;
  foregroundMaskSrc?: string;
};

export type Catalog = {
  canvas: CanvasSize;
  defaultPoseByGender?: Partial<Record<Gender, string>>;
  poses: PoseAsset[];
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
  glasses: CompositeAsset[];
  glassesLenses: CompositeAsset[];
  speechBubbles: CompositeAsset[];
};

export type SelectedAvatar = {
  poses: string;
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
  glasses: string;
  glassesLenses: string;
};

export type SelectableCategory = keyof SelectedAvatar;

export type AvatarConfigFile = {
  app: "asturcomic-avatar";
  version: 1;
  savedAt: string;
  canvas: CanvasSize;
  gender: Gender;
  selected: SelectedAvatar;
  colors: {
    skin: string;
    hair: string;
    brow: string;
    shirt?: string;
    pants?: string;
  };
  faceBox: Box;
  speechBubble: {
    id: string;
    box: Box;
  };
};
