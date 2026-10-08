/**
 * Precio de UN producto con el tamaño y los extras que eligió el cliente.
 *
 * En el menú (Fase 2) solo muestra el total mientras el cliente elige. En
 * la Fase 5 el servidor lo vuelve a correr con los datos de la BD para
 * cobrar: nunca se confía en el precio que manda el navegador
 * (CLAUDE.md 5.3).
 */

export interface PricedSize {
  id: string;
  price_cents: number;
}

export interface PricedExtra {
  id: string;
  name: string;
  price_cents: number;
  is_available: boolean;
}

export interface PricedExtraGroup {
  id: string;
  name: string;
  min_select: number;
  /** null = sin límite. */
  max_select: number | null;
  extras: PricedExtra[];
}

export interface PricedProduct {
  base_price_cents: number;
  is_available: boolean;
  product_sizes: PricedSize[];
  extra_groups: PricedExtraGroup[];
}

export interface ItemSelection {
  sizeId: string | null;
  extraIds: string[];
}

export type ItemPriceResult =
  | { ok: true; unitCents: number }
  | { ok: false; reason: "unavailable" | "size_required" | "unknown_size" | "unknown_extra" | "extra_unavailable" | "duplicate_extra" }
  | { ok: false; reason: "group_min" | "group_max"; groupName: string };

export function computeItemPrice(product: PricedProduct, selection: ItemSelection): ItemPriceResult {
  if (!product.is_available) return { ok: false, reason: "unavailable" };

  let unitCents = product.base_price_cents;
  if (product.product_sizes.length > 0) {
    if (!selection.sizeId) return { ok: false, reason: "size_required" };
    const size = product.product_sizes.find((s) => s.id === selection.sizeId);
    if (!size) return { ok: false, reason: "unknown_size" };
    unitCents = size.price_cents;
  } else if (selection.sizeId) {
    return { ok: false, reason: "unknown_size" };
  }

  if (new Set(selection.extraIds).size !== selection.extraIds.length) return { ok: false, reason: "duplicate_extra" };

  const groupOf = new Map<string, { group: PricedExtraGroup; extra: PricedExtra }>();
  for (const group of product.extra_groups) {
    for (const extra of group.extras) groupOf.set(extra.id, { group, extra });
  }

  const countByGroup = new Map<string, number>();
  for (const extraId of selection.extraIds) {
    const found = groupOf.get(extraId);
    if (!found) return { ok: false, reason: "unknown_extra" };
    if (!found.extra.is_available) return { ok: false, reason: "extra_unavailable" };
    unitCents += found.extra.price_cents;
    countByGroup.set(found.group.id, (countByGroup.get(found.group.id) ?? 0) + 1);
  }

  for (const group of product.extra_groups) {
    const count = countByGroup.get(group.id) ?? 0;
    if (count < group.min_select) return { ok: false, reason: "group_min", groupName: group.name };
    if (group.max_select !== null && count > group.max_select) return { ok: false, reason: "group_max", groupName: group.name };
  }

  return { ok: true, unitCents };
}

/** Texto bajo el nombre del grupo: "Opcional · hasta 5", "Elige 1", "Elige de 1 a 3"… */
export function extraGroupHint(min: number, max: number | null): string {
  if (min === 0) return max === null ? "Opcional" : max === 1 ? "Opcional · elige 1" : `Opcional · hasta ${max}`;
  if (max === null) return `Elige al menos ${min}`;
  if (max === min) return `Elige ${min}`;
  return `Elige de ${min} a ${max}`;
}
