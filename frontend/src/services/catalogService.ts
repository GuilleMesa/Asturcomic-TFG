import type { Catalog } from "../types/avatar";

export async function fetchCatalog(): Promise<Catalog> {
  const res = await fetch("/api/catalog", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudo cargar el catálogo");
  }
  return res.json();
}
