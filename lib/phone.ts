/**
 * Convierte lo que escribe una persona en `/agendar` al mismo formato que
 * usa Meta como `wa_id` (solo dígitos; los celulares de México llegan como
 * `521` + 10 dígitos). Sin esto, "961 231 4743" y `5219612314743` son
 * conversaciones distintas y la cita hecha en la web nunca aparece en
 * "Mi cita" del bot (bug real 2026-10-05, ver `docs/decisiones.md`).
 *
 * Devuelve `null` si no parece un número válido.
 */
export function normalizeWaId(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) return `521${digits}`;
  if (digits.length === 12 && digits.startsWith("52")) return `521${digits.slice(2)}`;
  if (digits.length === 13 && digits.startsWith("521")) return digits;
  if (digits.length >= 11 && digits.length <= 15 && !digits.startsWith("52")) return digits;

  return null;
}
