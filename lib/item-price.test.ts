import { describe, expect, it } from "vitest";
import { computeItemPrice, extraGroupHint, type PricedProduct } from "./item-price";

const TOPPINGS = {
  id: "g-top",
  name: "Extras de frappé",
  min_select: 0,
  max_select: 2,
  extras: [
    { id: "crema", name: "Crema batida", price_cents: 1000, is_available: true },
    { id: "oreo", name: "Galleta Oreo", price_cents: 1200, is_available: true },
    { id: "perlas", name: "Perlas explosivas", price_cents: 1500, is_available: false },
  ],
};

const FRAPPE: PricedProduct = {
  base_price_cents: 7000,
  is_available: true,
  product_sizes: [
    { id: "16", price_cents: 7000 },
    { id: "20", price_cents: 8500 },
  ],
  extra_groups: [TOPPINGS],
};

const WAFFLE: PricedProduct = { base_price_cents: 6000, is_available: true, product_sizes: [], extra_groups: [] };

describe("computeItemPrice", () => {
  it("sin tamaños usa el precio base", () => {
    expect(computeItemPrice(WAFFLE, { sizeId: null, extraIds: [] })).toEqual({ ok: true, unitCents: 6000 });
  });

  it("con tamaño manda el precio completo del tamaño, más extras", () => {
    expect(computeItemPrice(FRAPPE, { sizeId: "20", extraIds: ["crema", "oreo"] })).toEqual({ ok: true, unitCents: 10700 });
  });

  it("producto agotado no se puede pedir", () => {
    expect(computeItemPrice({ ...WAFFLE, is_available: false }, { sizeId: null, extraIds: [] })).toEqual({
      ok: false,
      reason: "unavailable",
    });
  });

  it("si hay tamaños, hay que elegir uno que exista", () => {
    expect(computeItemPrice(FRAPPE, { sizeId: null, extraIds: [] })).toMatchObject({ reason: "size_required" });
    expect(computeItemPrice(FRAPPE, { sizeId: "32", extraIds: [] })).toMatchObject({ reason: "unknown_size" });
    expect(computeItemPrice(WAFFLE, { sizeId: "16", extraIds: [] })).toMatchObject({ reason: "unknown_size" });
  });

  it("extras ajenos, agotados o repetidos se rechazan", () => {
    expect(computeItemPrice(FRAPPE, { sizeId: "16", extraIds: ["nutella"] })).toMatchObject({ reason: "unknown_extra" });
    expect(computeItemPrice(FRAPPE, { sizeId: "16", extraIds: ["perlas"] })).toMatchObject({ reason: "extra_unavailable" });
    expect(computeItemPrice(FRAPPE, { sizeId: "16", extraIds: ["crema", "crema"] })).toMatchObject({ reason: "duplicate_extra" });
  });

  it("respeta mínimo y máximo del grupo", () => {
    const tooMany = { ...FRAPPE, extra_groups: [{ ...TOPPINGS, max_select: 1 }] };
    expect(computeItemPrice(tooMany, { sizeId: "16", extraIds: ["crema", "oreo"] })).toEqual({
      ok: false,
      reason: "group_max",
      groupName: "Extras de frappé",
    });
    const required = { ...FRAPPE, extra_groups: [{ ...TOPPINGS, min_select: 1 }] };
    expect(computeItemPrice(required, { sizeId: "16", extraIds: [] })).toMatchObject({ reason: "group_min" });
  });
});

describe("extraGroupHint", () => {
  it("describe mínimo y máximo", () => {
    expect(extraGroupHint(0, null)).toBe("Opcional");
    expect(extraGroupHint(0, 1)).toBe("Opcional · elige 1");
    expect(extraGroupHint(0, 5)).toBe("Opcional · hasta 5");
    expect(extraGroupHint(1, 1)).toBe("Elige 1");
    expect(extraGroupHint(1, 3)).toBe("Elige de 1 a 3");
    expect(extraGroupHint(2, null)).toBe("Elige al menos 2");
  });
});
