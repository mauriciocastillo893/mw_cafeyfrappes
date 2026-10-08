import { describe, expect, it } from "vitest";
import {
  moveInOrder,
  parseCategoryForm,
  parseExtraForm,
  parseExtraGroupForm,
  parseProductForm,
  slugify,
  uniqueSlug,
  type FormLike,
} from "./menu-form";

/** FormData de prueba: cada campo puede repetirse (listas). */
function form(fields: Record<string, string | string[]>): FormLike {
  return {
    get: (name) => {
      const value = fields[name];
      return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
    },
    getAll: (name) => {
      const value = fields[name];
      return value === undefined ? [] : Array.isArray(value) ? value : [value];
    },
  };
}

const BASE = { name: "Frappé moka", category_id: "cat-1", base_price: "70", active: "on", is_available: "on" };

describe("slugify / uniqueSlug", () => {
  it("quita acentos y símbolos", () => {
    expect(slugify("Frappé de Oreo")).toBe("frappe-de-oreo");
    expect(slugify("  Café & Crepa!! ")).toBe("cafe-y-crepa");
    expect(slugify("Soda 20 oz")).toBe("soda-20-oz");
  });

  it("agrega número si ya existe", () => {
    expect(uniqueSlug("latte", new Set())).toBe("latte");
    expect(uniqueSlug("latte", new Set(["latte", "latte-2"]))).toBe("latte-3");
    expect(uniqueSlug("", new Set())).toBe("producto");
  });
});

describe("parseProductForm", () => {
  it("producto sin tamaños usa el precio base en centavos", () => {
    const result = parseProductForm(form({ ...BASE, base_price: "65.50", tags: ["frio", "favorito"] }));
    expect(result).toEqual({
      ok: true,
      value: {
        name: "Frappé moka",
        description: null,
        categoryId: "cat-1",
        basePriceCents: 6550,
        tags: ["frio", "favorito"],
        showOnLanding: false,
        isAvailable: true,
        active: true,
        sizes: [],
        extraGroupIds: [],
      },
    });
  });

  it("agotado y oculto son independientes", () => {
    const result = parseProductForm(form({ name: "Latte", category_id: "c", base_price: "55" }));
    expect(result.ok && result.value.isAvailable).toBe(false);
    expect(result.ok && result.value.active).toBe(false);
  });

  it("con tamaños, el precio base es el del más barato y se ignora la fila vacía", () => {
    const result = parseProductForm(
      form({ ...BASE, base_price: "", size_name: ["16 oz", "20 oz", ""], size_price: ["70", "85", ""] })
    );
    expect(result.ok && result.value.basePriceCents).toBe(7000);
    expect(result.ok && result.value.sizes).toEqual([
      { name: "16 oz", priceCents: 7000 },
      { name: "20 oz", priceCents: 8500 },
    ]);
  });

  it("errores claros", () => {
    expect(parseProductForm(form({ ...BASE, name: " " }))).toEqual({ ok: false, error: "Escribe el nombre del producto." });
    expect(parseProductForm(form({ ...BASE, base_price: "setenta" }))).toMatchObject({ ok: false });
    expect(parseProductForm(form({ ...BASE, category_id: "" }))).toMatchObject({ error: "Elige la categoría." });
    expect(parseProductForm(form({ ...BASE, tags: ["frio", "caliente"] }))).toMatchObject({ ok: false });
    expect(parseProductForm(form({ ...BASE, size_name: ["16 oz"], size_price: ["abc"] }))).toMatchObject({
      error: 'Revisa el precio del tamaño "16 oz".',
    });
    expect(parseProductForm(form({ ...BASE, size_name: ["16 oz", "16 OZ"], size_price: ["70", "80"] }))).toMatchObject({
      error: 'El tamaño "16 OZ" está repetido.',
    });
    expect(parseProductForm(form({ ...BASE, size_name: [""], size_price: ["70"] }))).toMatchObject({ ok: false });
  });

  it("ignora etiquetas desconocidas y grupos repetidos", () => {
    const result = parseProductForm(form({ ...BASE, tags: ["frio", "picante"], extra_group_ids: ["g1", "g1", "g2"] }));
    expect(result.ok && result.value.tags).toEqual(["frio"]);
    expect(result.ok && result.value.extraGroupIds).toEqual(["g1", "g2"]);
  });
});

describe("parseCategoryForm", () => {
  it("valida el nombre", () => {
    expect(parseCategoryForm(form({ name: "Bebidas", active: "on" }))).toEqual({
      ok: true,
      value: { name: "Bebidas", description: null, active: true },
    });
    expect(parseCategoryForm(form({ name: "" }))).toMatchObject({ ok: false });
  });
});

describe("parseExtraGroupForm", () => {
  it("mínimo y máximo", () => {
    expect(parseExtraGroupForm(form({ name: "Toppings", min_select: "0", max_select: "5" }))).toEqual({
      ok: true,
      value: { name: "Toppings", minSelect: 0, maxSelect: 5 },
    });
    expect(parseExtraGroupForm(form({ name: "Leche", min_select: "1", max_select: "" }))).toMatchObject({
      value: { maxSelect: null },
    });
    expect(parseExtraGroupForm(form({ name: "X", min_select: "3", max_select: "2" }))).toMatchObject({ ok: false });
    expect(parseExtraGroupForm(form({ name: "X", min_select: "0", max_select: "0" }))).toMatchObject({ ok: false });
  });
});

describe("parseExtraForm", () => {
  it("precio vacío = sin costo", () => {
    expect(parseExtraForm(form({ name: "Hielo extra", price: "", is_available: "on" }))).toEqual({
      ok: true,
      value: { name: "Hielo extra", priceCents: 0, isAvailable: true },
    });
    expect(parseExtraForm(form({ name: "Nutella", price: "-5" }))).toMatchObject({ ok: false });
  });
});

describe("moveInOrder", () => {
  it("sube y baja renumerando", () => {
    expect(moveInOrder(["a", "b", "c"], "c", "up")).toEqual([
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
      { id: "b", sortOrder: 3 },
    ]);
  });

  it("no se mueve más allá de los bordes", () => {
    expect(moveInOrder(["a", "b"], "a", "up")).toEqual([]);
    expect(moveInOrder(["a", "b"], "b", "down")).toEqual([]);
    expect(moveInOrder(["a"], "z", "down")).toEqual([]);
  });
});
