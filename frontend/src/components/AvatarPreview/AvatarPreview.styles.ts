import type { CSSProperties } from "react";

export const previewStyles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
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
  canvas: {
    position: "relative",
    width: 360,
    height: 360,
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  faceGroup: {
    position: "absolute",
  },
  fullCanvasLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    pointerEvents: "none",
    userSelect: "none",
  },
};
