export type HairColorOption = {
  id: string;
  label: string;
  value: string;
};

export const SKIN_COLOR_OPTIONS: HairColorOption[] = [
  { id: "skin-1", label: "Piel 1", value: "#f7dbc2" },
  { id: "skin-2", label: "Piel 2", value: "#efc6a4" },
  { id: "skin-3", label: "Piel 3", value: "#dca77d" },
  { id: "skin-4", label: "Piel 4", value: "#b97852" },
  { id: "skin-5", label: "Piel 5", value: "#8f5639" },
  { id: "skin-6", label: "Piel 6", value: "#5f3525" },
  { id: "skin-7", label: "Piel 7", value: "#2f1b14" },
];

export const DEFAULT_SKIN_COLOR = SKIN_COLOR_OPTIONS[1].value;

export const HAIR_COLOR_OPTIONS: HairColorOption[] = [
  { id: "blond", label: "Rubio", value: "#f0d99b" },
  { id: "brown", label: "Castano", value: "#8a5a3c" },
  { id: "dark", label: "Moreno", value: "#2f2724" },
  { id: "red", label: "Pelirrojo", value: "#b85b35" },
  { id: "gray", label: "Gris", value: "#9ca3af" },
  { id: "white", label: "Blanco", value: "#f8f5ed" },
];

export const DEFAULT_HAIR_COLOR = HAIR_COLOR_OPTIONS[0].value;

export const BROW_COLOR_OPTIONS: HairColorOption[] = [
  { id: "black", label: "Negro", value: "#111827" },
  { id: "dark-brown", label: "Castano oscuro", value: "#3b2a22" },
  { id: "brown", label: "Castano", value: "#7a4a2c" },
  { id: "red", label: "Pelirrojo", value: "#8f3f24" },
  { id: "gray", label: "Gris", value: "#6b7280" },
  { id: "blond", label: "Rubio", value: "#b68b42" },
];

export const DEFAULT_BROW_COLOR = BROW_COLOR_OPTIONS[0].value;
