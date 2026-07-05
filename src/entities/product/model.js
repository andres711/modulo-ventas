import { DEFAULT_PRODUCT_UNIT } from "./constants";

export function isKgUnit(unit) {
  return String(unit || DEFAULT_PRODUCT_UNIT).toUpperCase().trim() === "KG";
}

export function roundStockForUnit(value, unit) {
  const digits = isKgUnit(unit) ? 3 : 0;
  return Number(Number(value || 0).toFixed(digits));
}

export function normalizeProduct(product) {
  return {
    ...product,
    id: String(product?.id || "").trim(),
    categoria: String(product?.categoria || "").trim(),
    nombre: String(product?.nombre || "").trim(),
    descripcion: String(product?.descripcion || "").trim(),
    imagenUrl: String(product?.imagenUrl || "").trim(),
    precio: Number(product?.precio || 0),
    costo:
      product?.costo === "" || product?.costo === null || product?.costo === undefined
        ? ""
        : Number(product?.costo || 0),
    stock: Number(product?.stock || 0),
    activo: String(product?.activo || "TRUE").toUpperCase() !== "FALSE",
    unidad: String(product?.unidad || DEFAULT_PRODUCT_UNIT).toUpperCase().trim(),
  };
}
