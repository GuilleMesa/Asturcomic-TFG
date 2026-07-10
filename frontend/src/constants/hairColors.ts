export type HairColorOption = {
  id: string;
  label: string;
  value: string;
};

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
