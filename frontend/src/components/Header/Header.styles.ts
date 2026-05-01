import type { CSSProperties } from "react";

export const headerStyles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#6b7280",
  },
};