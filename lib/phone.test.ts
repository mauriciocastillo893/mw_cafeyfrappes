import { describe, expect, it } from "vitest";
import { normalizeWaId } from "./phone";

/**
 * Caso en vivo (2026-10-05): una cita agendada en `/agendar` con
 * "9612314743" no aparecía en "Mi cita" del bot porque el `wa_id` de
 * WhatsApp de esa misma persona es `5219612314743`.
 */
describe("normalizeWaId", () => {
  it.each([
    ["9612314743", "5219612314743"],
    ["961 231 4743", "5219612314743"],
    ["(961) 231-4743", "5219612314743"],
    ["+52 961 231 4743", "5219612314743"],
    ["529612314743", "5219612314743"],
    ["5219612314743", "5219612314743"],
    ["+52 1 961 231 4743", "5219612314743"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizeWaId(input)).toBe(expected);
  });

  it("deja pasar un número extranjero ya con lada", () => {
    expect(normalizeWaId("+1 646 589 4168")).toBe("16465894168");
  });

  it.each(["", "abc", "12345", "96123147"])("rechaza %j", (input) => {
    expect(normalizeWaId(input)).toBeNull();
  });
});
