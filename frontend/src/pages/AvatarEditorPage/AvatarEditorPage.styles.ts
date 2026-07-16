import type { CSSProperties } from "react";

export const pageStyles: Record<string, CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f4f7f9",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "360px minmax(500px, 620px) 330px",
    gap: "1.25rem",
    width: "min(100%, 1420px)",
    margin: "0 auto",
    padding: "1.25rem",
    alignItems: "start",
    justifyContent: "center",
  },
};
