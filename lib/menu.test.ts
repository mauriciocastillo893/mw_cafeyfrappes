import { describe, expect, it } from "vitest";
import { describeNextOpening, filterMenu, getNextOpening, normalizeSearchText, parseTableNumber } from "./menu";
import type { WeeklyHour } from "./weekly-hours";

const MW_HOURS: WeeklyHour[] = [
  { day: 4, start: "19:00", end: "23:00" },
  { day: 5, start: "19:00", end: "23:00" },
  { day: 6, start: "19:00", end: "23:00" },
  { day: 0, start: "19:00", end: "23:00" },
];

/** Hora de México (UTC−6). 2026-01-01 es jueves. */
const mx = (local: string) => new Date(`${local}:00-06:00`);

const MENU = [
  {
    name: "Café",
    products: [
      { name: "Capuchino", description: "Espresso con leche vaporizada", tags: ["caliente"] },
      { name: "Affogato", description: "Espresso sobre helado de vainilla", tags: ["nuevo"] },
    ],
  },
  {
    name: "Frappés",
    products: [{ name: "Frappé moka", description: "Café y chocolate con hielo", tags: ["frio", "favorito"] }],
  },
  { name: "Waffles", products: [{ name: "Waffle clásico", description: null, tags: ["caliente"] }] },
];

describe("normalizeSearchText", () => {
  it("quita acentos y mayúsculas", () => {
    expect(normalizeSearchText("  Frappé MÓKA ")).toBe("frappe moka");
  });
});

describe("filterMenu", () => {
  it("sin búsqueda ni filtro deja todo", () => {
    expect(filterMenu(MENU, { query: "", temperature: null })).toEqual(MENU);
  });

  it("busca sin acentos en nombre y descripción", () => {
    const result = filterMenu(MENU, { query: "frappe", temperature: null });
    expect(result.map((c) => c.name)).toEqual(["Frappés"]);
  });

  it("todas las palabras deben coincidir", () => {
    const result = filterMenu(MENU, { query: "espresso vainilla", temperature: null });
    expect(result.flatMap((c) => c.products.map((p) => p.name))).toEqual(["Affogato"]);
  });

  it("el nombre de la categoría también cuenta", () => {
    const result = filterMenu(MENU, { query: "waffles", temperature: null });
    expect(result.flatMap((c) => c.products.map((p) => p.name))).toEqual(["Waffle clásico"]);
  });

  it("filtro frío/caliente por etiqueta y quita categorías vacías", () => {
    expect(filterMenu(MENU, { query: "", temperature: "frio" }).map((c) => c.name)).toEqual(["Frappés"]);
    const hot = filterMenu(MENU, { query: "", temperature: "caliente" });
    expect(hot.flatMap((c) => c.products.map((p) => p.name))).toEqual(["Capuchino", "Waffle clásico"]);
  });

  it("sin resultados regresa []", () => {
    expect(filterMenu(MENU, { query: "pizza", temperature: null })).toEqual([]);
  });
});

describe("parseTableNumber", () => {
  it("acepta 1 a 99", () => {
    expect(parseTableNumber("4")).toBe(4);
    expect(parseTableNumber("04")).toBe(4);
    expect(parseTableNumber("99")).toBe(99);
  });

  it("rechaza todo lo demás", () => {
    for (const raw of [null, undefined, "", "0", "-1", "3.5", "abc", "100", "4a"]) {
      expect(parseTableNumber(raw)).toBeNull();
    }
  });
});

describe("getNextOpening", () => {
  it("jueves antes de abrir → hoy", () => {
    expect(getNextOpening(MW_HOURS, mx("2026-01-01T18:00"))).toEqual({ daysAhead: 0, day: 4, minutes: 19 * 60 });
  });

  it("jueves después de cerrar → mañana viernes", () => {
    expect(getNextOpening(MW_HOURS, mx("2026-01-01T23:30"))).toEqual({ daysAhead: 1, day: 5, minutes: 19 * 60 });
  });

  it("lunes → el jueves", () => {
    expect(getNextOpening(MW_HOURS, mx("2026-01-05T10:00"))).toEqual({ daysAhead: 3, day: 4, minutes: 19 * 60 });
  });

  it("domingo después de cerrar → el jueves siguiente", () => {
    expect(getNextOpening(MW_HOURS, mx("2026-01-04T23:30"))?.daysAhead).toBe(4);
  });

  it("un solo día a la semana, ya cerró → ese día de la otra semana", () => {
    const onlyThursday = [{ day: 4, start: "19:00", end: "23:00" }];
    expect(getNextOpening(onlyThursday, mx("2026-01-01T23:30"))).toEqual({ daysAhead: 7, day: 4, minutes: 19 * 60 });
  });

  it("sin horario → null", () => {
    expect(getNextOpening([], mx("2026-01-01T18:00"))).toBeNull();
  });
});

describe("describeNextOpening", () => {
  it("hoy, mañana o el día de la semana", () => {
    expect(describeNextOpening({ daysAhead: 0, day: 4, minutes: 1140 }, "12h")).toBe("hoy a las 7:00 p. m.");
    expect(describeNextOpening({ daysAhead: 1, day: 5, minutes: 1140 }, "12h")).toBe("mañana a las 7:00 p. m.");
    expect(describeNextOpening({ daysAhead: 3, day: 4, minutes: 1140 }, "12h")).toBe("el jueves a las 7:00 p. m.");
  });

  it("dice 'a la' para la una", () => {
    expect(describeNextOpening({ daysAhead: 2, day: 6, minutes: 13 * 60 }, "12h")).toBe("el sábado a la 1:00 p. m.");
  });
});
