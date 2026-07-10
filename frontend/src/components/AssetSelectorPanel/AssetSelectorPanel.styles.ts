import type { CSSProperties } from "react";

export const selectorStyles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1rem",
    position: "sticky",
    top: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontWeight: 600,
  },
  subLabel: {
    color: "#4b5563",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  colorGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    paddingTop: "0.25rem",
  },
  swatches: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  swatch: {
    width: "1.6rem",
    height: "1.6rem",
    border: "2px solid #d1d5db",
    borderRadius: "999px",
    cursor: "pointer",
    padding: 0,
  },
  colorInput: {
    width: "2rem",
    height: "2rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    padding: "0.1rem",
    backgroundColor: "#ffffff",
  },
};
