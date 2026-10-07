/**
 * Dinero: en la base siempre en centavos (`integer`), para el cliente en
 * pesos. Sin decimales si son pesos cerrados ("$85"), con dos si no ("$85.50").
 */

export function formatMXN(cents: number): string {
  const pesos = cents / 100;
  const hasCents = cents % 100 !== 0;
  return `$${pesos.toLocaleString("es-MX", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** "85" / "85.5" / "$85.50" → 8550. `null` si no es un monto válido. */
export function parsePesosToCents(input: string): number | null {
  const clean = input.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

/** Precio que se muestra en el menú: con tamaños, "desde" el más barato. */
export function productPriceLabel(product: { base_price_cents: number; product_sizes: { price_cents: number }[] }): string {
  if (product.product_sizes.length === 0) return formatMXN(product.base_price_cents);
  const prices = product.product_sizes.map((s) => s.price_cents);
  const min = Math.min(...prices);
  return Math.max(...prices) === min ? formatMXN(min) : `desde ${formatMXN(min)}`;
}
