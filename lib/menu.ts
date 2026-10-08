/**
 * Lógica pura del menú digital (`/menu`): búsqueda y filtro, número de
 * mesa del QR y "Abrimos el jueves a las 7:00 p. m." cuando está cerrado.
 */

import { atTimeEs, formatTimeOfDay, type TimeFormat } from "./time-format";
import { DAY_NAMES, timeToMinutes, toMexicoLocal, type WeeklyHour } from "./weekly-hours";

export const MENU_TAGS = ["frio", "caliente", "nuevo", "favorito"] as const;
export type MenuTag = (typeof MENU_TAGS)[number];

export const MENU_TAG_LABELS: Record<MenuTag, string> = {
  frio: "Frío",
  caliente: "Caliente",
  nuevo: "Nuevo",
  favorito: "Favorito",
};

/** Filtro de temperatura del menú: solo productos con esa etiqueta. */
export type TemperatureFilter = "frio" | "caliente";

/** Minúsculas y sin acentos: "Frappé" encuentra "frappe" y al revés. */
export function normalizeSearchText(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

interface FilterableProduct {
  name: string;
  description: string | null;
  tags: string[];
}

interface FilterableCategory<P extends FilterableProduct> {
  name: string;
  products: P[];
}

/**
 * Deja solo los productos que coinciden con la búsqueda (todas las
 * palabras, en nombre, descripción o categoría) y con el filtro de
 * temperatura. Las categorías que se quedan vacías se quitan.
 */
export function filterMenu<P extends FilterableProduct, C extends FilterableCategory<P>>(
  categories: C[],
  { query, temperature }: { query: string; temperature: TemperatureFilter | null }
): C[] {
  const words = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  return categories
    .map((category) => ({
      ...category,
      products: category.products.filter((product) => {
        if (temperature && !product.tags.includes(temperature)) return false;
        if (words.length === 0) return true;
        const haystack = normalizeSearchText(`${product.name} ${product.description ?? ""} ${category.name}`);
        return words.every((word) => haystack.includes(word));
      }),
    }))
    .filter((category) => category.products.length > 0);
}

/** Tope de mesas aceptado en `?mesa=N` mientras no sepamos cuántas hay (P12). */
export const MAX_TABLE_NUMBER = 99;

/** `?mesa=4` → 4. Cualquier otra cosa (vacío, 0, letras, decimales, >99) → null. */
export function parseTableNumber(raw: string | null | undefined): number | null {
  if (!raw || !/^\d{1,3}$/.test(raw.trim())) return null;
  const value = Number(raw.trim());
  return value >= 1 && value <= MAX_TABLE_NUMBER ? value : null;
}

export interface NextOpening {
  /** 0 = hoy, 1 = mañana… */
  daysAhead: number;
  day: number;
  /** Minutos desde la medianoche, hora de México. */
  minutes: number;
}

/** La próxima vez que abre a partir de `date` (sin contar si ya está abierto). `null` si no hay horario. */
export function getNextOpening(hours: WeeklyHour[], date: Date): NextOpening | null {
  if (hours.length === 0) return null;
  const { day: today, minutes: nowMinutes } = toMexicoLocal(date);
  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const day = (today + daysAhead) % 7;
    const starts = hours
      .filter((entry) => entry.day === day)
      .map((entry) => timeToMinutes(entry.start))
      .filter((start) => daysAhead > 0 || start > nowMinutes)
      .sort((a, b) => a - b);
    if (starts.length > 0) return { daysAhead, day, minutes: starts[0] };
  }
  return null;
}

/** "hoy a las 7:00 p. m." / "mañana a las 7:00 p. m." / "el jueves a las 7:00 p. m." */
export function describeNextOpening(opening: NextOpening, format: TimeFormat): string {
  const when = opening.daysAhead === 0 ? "hoy" : opening.daysAhead === 1 ? "mañana" : `el ${DAY_NAMES[opening.day]}`;
  return `${when} ${atTimeEs(formatTimeOfDay(opening.minutes, format))}`;
}
