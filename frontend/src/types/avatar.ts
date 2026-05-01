export type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type AssetItem = {
  id: string;
  src: string;
  box?: Box;
};

export type Catalog = {
  heads: AssetItem[];
  eyes: AssetItem[];
  brows: AssetItem[];
  noses: AssetItem[];
  mouths: AssetItem[];
  poses?: AssetItem[];
};

export type SelectedAvatar = {
  heads: string;
  eyes: string;
  brows: string;
  noses: string;
  mouths: string;
};

export type AdjustableKey = "eyes" | "brows" | "noses" | "mouths";

export type AdjustableBoxes = Record<AdjustableKey, Box>;