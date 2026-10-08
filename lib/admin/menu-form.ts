/**
 * Validación de los formularios de /admin/menu, sin tocar la BD: el
 * servidor la corre en cada Server Action (y las pruebas en
 * `menu-form.test.ts`). Los mensajes de error son los que ve Franco.
 */

import { MENU_TAGS, type MenuTag } from "../menu";
import { parsePesosToCents } from "../money";

/** "Frappé de Oreo" → "frappe-de-oreo" (para la URL `?producto=`). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Agrega "-2", "-3"… si el slug ya lo usa otro producto. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "producto";
  if (!taken.has(root)) return root;
  for (let n = 2; ; n++) {
    const candidate = `${root}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export type FormResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Lo que llega del formulario: `FormData` en el servidor, un objeto simple en las pruebas. */
export interface FormLike {
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): FormDataEntryValue[];
}

function text(form: FormLike, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export const PRODUCT_NAME_MAX = 60;
export const PRODUCT_DESCRIPTION_MAX = 240;
export const SIZE_NAME_MAX = 20;
export const MAX_SIZES = 6;

export interface ProductInput {
  name: string;
  description: string | null;
  categoryId: string;
  basePriceCents: number;
  tags: MenuTag[];
  showOnLanding: boolean;
  isAvailable: boolean;
  active: boolean;
  sizes: { name: string; priceCents: number }[];
  extraGroupIds: string[];
}

/**
 * Tamaños: listas paralelas `size_name` / `size_price`. Las filas con los
 * dos campos vacíos se ignoran (la fila en blanco para agregar uno nuevo).
 */
export function parseSizes(form: FormLike): FormResult<{ name: string; priceCents: number }[]> {
  const names = form.getAll("size_name").map((v) => String(v).trim());
  const prices = form.getAll("size_price").map((v) => String(v).trim());
  const sizes: { name: string; priceCents: number }[] = [];

  for (let i = 0; i < Math.max(names.length, prices.length); i++) {
    const name = names[i] ?? "";
    const price = prices[i] ?? "";
    if (!name && !price) continue;
    if (!name) return { ok: false, error: "A un tamaño le falta el nombre (por ejemplo, 16 oz)." };
    if (name.length > SIZE_NAME_MAX) return { ok: false, error: `El tamaño "${name}" es muy largo (máx. ${SIZE_NAME_MAX} letras).` };
    const cents = parsePesosToCents(price);
    if (cents === null) return { ok: false, error: `Revisa el precio del tamaño "${name}".` };
    if (sizes.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      return { ok: false, error: `El tamaño "${name}" está repetido.` };
    sizes.push({ name, priceCents: cents });
  }

  if (sizes.length > MAX_SIZES) return { ok: false, error: `Máximo ${MAX_SIZES} tamaños por producto.` };
  return { ok: true, value: sizes };
}

export function parseProductForm(form: FormLike): FormResult<ProductInput> {
  const name = text(form, "name");
  if (!name) return { ok: false, error: "Escribe el nombre del producto." };
  if (name.length > PRODUCT_NAME_MAX) return { ok: false, error: `El nombre puede tener máximo ${PRODUCT_NAME_MAX} letras.` };

  const description = text(form, "description");
  if (description.length > PRODUCT_DESCRIPTION_MAX)
    return { ok: false, error: `La descripción puede tener máximo ${PRODUCT_DESCRIPTION_MAX} letras.` };

  const categoryId = text(form, "category_id");
  if (!categoryId) return { ok: false, error: "Elige la categoría." };

  const sizes = parseSizes(form);
  if (!sizes.ok) return sizes;

  // Con tamaños, el precio base no se usa (manda el de cada tamaño):
  // se guarda el del más barato para que nunca quede en 0.
  const rawPrice = text(form, "base_price");
  let basePriceCents: number;
  if (sizes.value.length > 0) {
    basePriceCents = Math.min(...sizes.value.map((s) => s.priceCents));
  } else {
    const cents = parsePesosToCents(rawPrice);
    if (cents === null) return { ok: false, error: "Escribe el precio (por ejemplo, 65 o 65.50)." };
    basePriceCents = cents;
  }

  const tags = form
    .getAll("tags")
    .map(String)
    .filter((tag): tag is MenuTag => (MENU_TAGS as readonly string[]).includes(tag));
  if (tags.includes("frio") && tags.includes("caliente"))
    return { ok: false, error: "Un producto no puede ser frío y caliente a la vez." };

  return {
    ok: true,
    value: {
      name,
      description: description || null,
      categoryId,
      basePriceCents,
      tags: [...new Set(tags)],
      showOnLanding: form.get("show_on_landing") === "on",
      isAvailable: form.get("is_available") === "on",
      active: form.get("active") === "on",
      sizes: sizes.value,
      extraGroupIds: [...new Set(form.getAll("extra_group_ids").map(String).filter(Boolean))],
    },
  };
}

export const CATEGORY_NAME_MAX = 40;

export function parseCategoryForm(form: FormLike): FormResult<{ name: string; description: string | null; active: boolean }> {
  const name = text(form, "name");
  if (!name) return { ok: false, error: "Escribe el nombre de la categoría." };
  if (name.length > CATEGORY_NAME_MAX) return { ok: false, error: `El nombre puede tener máximo ${CATEGORY_NAME_MAX} letras.` };
  const description = text(form, "description");
  return { ok: true, value: { name, description: description || null, active: form.get("active") === "on" } };
}

export const EXTRA_NAME_MAX = 40;

export function parseExtraGroupForm(
  form: FormLike
): FormResult<{ name: string; minSelect: number; maxSelect: number | null }> {
  const name = text(form, "name");
  if (!name) return { ok: false, error: "Escribe el nombre del grupo." };
  if (name.length > EXTRA_NAME_MAX) return { ok: false, error: `El nombre puede tener máximo ${EXTRA_NAME_MAX} letras.` };

  const minRaw = text(form, "min_select") || "0";
  const maxRaw = text(form, "max_select");
  if (!/^\d{1,2}$/.test(minRaw)) return { ok: false, error: "El mínimo debe ser un número (0 = opcional)." };
  const minSelect = Number(minRaw);
  let maxSelect: number | null = null;
  if (maxRaw) {
    if (!/^\d{1,2}$/.test(maxRaw) || Number(maxRaw) < 1) return { ok: false, error: "El máximo debe ser 1 o más (vacío = sin límite)." };
    maxSelect = Number(maxRaw);
    if (maxSelect < minSelect) return { ok: false, error: "El máximo no puede ser menor que el mínimo." };
  }
  return { ok: true, value: { name, minSelect, maxSelect } };
}

export function parseExtraForm(form: FormLike): FormResult<{ name: string; priceCents: number; isAvailable: boolean }> {
  const name = text(form, "name");
  if (!name) return { ok: false, error: "Escribe el nombre del extra." };
  if (name.length > EXTRA_NAME_MAX) return { ok: false, error: `El nombre puede tener máximo ${EXTRA_NAME_MAX} letras.` };
  const priceCents = parsePesosToCents(text(form, "price") || "0");
  if (priceCents === null) return { ok: false, error: `Revisa el precio de "${name}".` };
  return { ok: true, value: { name, priceCents, isAvailable: form.get("is_available") === "on" } };
}

/** Intercambia un elemento con su vecino y renumera todos 1…n (así se corrigen órdenes repetidos del seed). `[]` si no se puede mover. */
export function moveInOrder(ids: string[], id: string, direction: "up" | "down"): { id: string; sortOrder: number }[] {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return [];
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((value, i) => ({ id: value, sortOrder: i + 1 }));
}
