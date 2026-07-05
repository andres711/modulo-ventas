import { isKgUnit } from "../entities/product/model";

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export function formatStock(value, unit = "KG") {
  const isKg = isKgUnit(unit);

  return Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: isKg ? 2 : 0,
    maximumFractionDigits: isKg ? 2 : 0,
  });
}

export function getNameInitials(value) {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";

  const uppercaseWords = words.filter((word) => {
    const firstChar = word[0] || "";
    return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
  });

  const sourceWords = uppercaseWords.length > 0 ? uppercaseWords : words;

  return sourceWords
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}
