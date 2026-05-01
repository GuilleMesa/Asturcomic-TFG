import type { CSSProperties } from "react";

export const pageStyles: Record<string, CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "280px 420px 360px",
    gap: "1rem",
    padding: "1rem",
    alignItems: "start",
    justifyContent: "center",
  },
};