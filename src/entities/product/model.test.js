import { describe, expect, it } from "vitest";
import { isKgUnit, normalizeProduct, roundStockForUnit } from "./model";

describe("product model", () => {
  it("normaliza productos del backend", () => {
    expect(
      normalizeProduct({
        id: " 1 ",
        nombre: " Milanesa ",
        precio: "1200",
        stock: "5",
        activo: "FALSE",
      })
    ).toMatchObject({
      id: "1",
      nombre: "Milanesa",
      precio: 1200,
      stock: 5,
      activo: false,
      unidad: "UN",
    });
  });

  it("detecta productos por kilo", () => {
    expect(isKgUnit("KG")).toBe(true);
    expect(isKgUnit("un")).toBe(false);
  });

  it("redondea stock segun unidad", () => {
    expect(roundStockForUnit(2.3456, "KG")).toBe(2.346);
    expect(roundStockForUnit(2.9, "UN")).toBe(3);
  });
});
