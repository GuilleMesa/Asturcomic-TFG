import type { CSSProperties } from "react";

export const boxControlsStyles: Record<string, CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    backgroundColor: "#ffffff",
    border: "1px solid #dbe2ea",
    borderRadius: "8px",
    padding: "1rem",
    maxHeight: "calc(100vh - 6rem)",
    overflowY: "auto",
    position: "sticky",
    top: "5rem",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1.1rem",
    fontWeight: 800,
  },
  subtitle: {
    margin: "0.15rem 0 0",
    color: "#64748b",
    fontSize: "0.86rem",
  },
  block: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    borderTop: "1px solid #e5eaf0",
    paddingTop: "0.95rem",
  },
  blockTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "1rem",
    fontWeight: 800,
  },
  label: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    marginBottom: "0.4rem",
    color: "#334155",
    fontWeight: 800,
  },
  value: {
    color: "#64748b",
    fontVariantNumeric: "tabular-nums",
  },
  field: {
    marginBottom: "0.1rem",
  },
};
