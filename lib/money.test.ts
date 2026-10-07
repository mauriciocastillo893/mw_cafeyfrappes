import { describe, expect, it } from "vitest";
import { formatMXN, parsePesosToCents, productPriceLabel } from "./money";

describe("formatMXN", () => {
  it("pesos cerrados sin decimales", () => {
    expect(formatMXN(8500)).toBe("$85");
  });

  it("con centavos lleva dos decimales", () => {
    expect(formatMXN(8550)).toBe("$85.50");
  });

  it("miles con coma", () => {
    expect(formatMXN(125000)).toBe("$1,250");
  });

  it("cero", () => {
    expect(formatMXN(0)).toBe("$0");
  });
});

describe("parsePesosToCents", () => {
  it.each([
    ["85", 8500],
    ["85.5", 8550],
    ["$85.50", 8550],
    ["1,250", 125000],
    [" 80 ", 8000],
  ])("%s → %d", (input, expected) => {
    expect(parsePesosToCents(input)).toBe(expected);
  });

  it.each(["", "abc", "-5", "8.555", "8."])("rechaza %j", (input) => {
    expect(parsePesosToCents(input)).toBeNull();
  });
});

describe("productPriceLabel", () => {
  it("sin tamaños usa el precio base", () => {
    expect(productPriceLabel({ base_price_cents: 7000, product_sizes: [] })).toBe("$70");
  });

  it("con tamaños distintos dice 'desde' el más barato", () => {
    expect(
      productPriceLabel({ base_price_cents: 0, product_sizes: [{ price_cents: 8500 }, { price_cents: 7000 }] })
    ).toBe("desde $70");
  });

  it("con tamaños del mismo precio no dice 'desde'", () => {
    expect(productPriceLabel({ base_price_cents: 0, product_sizes: [{ price_cents: 7000 }, { price_cents: 7000 }] })).toBe(
      "$70"
    );
  });
});
