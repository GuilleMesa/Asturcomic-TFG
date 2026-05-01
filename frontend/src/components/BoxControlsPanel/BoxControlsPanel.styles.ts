import type { CSSProperties } from "react";

export const boxControlsStyles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1rem",
    maxHeight: "calc(100vh - 2rem)",
    overflowY: "auto",
    position: "sticky",
    top: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  block: {
    padding: "0.85rem",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
  },
  label: {
    display: "block",
    marginBottom: "0.35rem",
    fontWeight: 600,
  },
  value: {
    marginLeft: "0.4rem",
    color: "#6b7280",
  },
  field: {
    marginBottom: "0.85rem",
  },
};