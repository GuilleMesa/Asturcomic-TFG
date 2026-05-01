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
};