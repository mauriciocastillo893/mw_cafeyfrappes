import { describe, expect, it } from "vitest";
import { isOpenAt, parseWeeklyHours, summarizeWeeklyHours, type WeeklyHour } from "./weekly-hours";

const MW_HOURS: WeeklyHour[] = [
  { day: 4, start: "19:00", end: "23:00" },
  { day: 5, start: "19:00", end: "23:00" },
  { day: 6, start: "19:00", end: "23:00" },
  { day: 0, start: "19:00", end: "23:00" },
];

describe("parseWeeklyHours", () => {
  it("descarta entradas mal formadas y ordena de lunes a domingo", () => {
    const parsed = parseWeeklyHours([
      { day: 0, start: "19:00", end: "23:00" },
      { day: 9, start: "19:00", end: "23:00" },
      { day: 4, start: "7pm", end: "23:00" },
      { day: 5, start: "19:00", end: "23:00" },
      null,
    ]);
    expect(parsed.map((h) => h.day)).toEqual([5, 0]);
  });

  it("regresa [] si no es un arreglo", () => {
    expect(parseWeeklyHours({ day: 1 })).toEqual([]);
  });
});

describe("summarizeWeeklyHours", () => {
  it("agrupa jueves a domingo con el mismo horario", () => {
    expect(summarizeWeeklyHours(parseWeeklyHours(MW_HOURS), "12h")).toEqual([
      { days: "Jueves a domingo", hours: "7:00 p. m. – 11:00 p. m." },
    ]);
  });

  it("separa días con horario distinto y usa 'y' para dos días", () => {
    const hours = parseWeeklyHours([
      { day: 4, start: "19:00", end: "23:00" },
      { day: 5, start: "19:00", end: "23:00" },
      { day: 6, start: "17:00", end: "23:00" },
    ]);
    expect(summarizeWeeklyHours(hours, "24h")).toEqual([
      { days: "Jueves y viernes", hours: "19:00 – 23:00" },
      { days: "Sábado", hours: "17:00 – 23:00" },
    ]);
  });
});

describe("isOpenAt (hora de México, UTC−6)", () => {
  // Jueves 8 de octubre de 2026.
  it("abierto el jueves a las 8 pm", () => {
    expect(isOpenAt(MW_HOURS, new Date("2026-10-09T02:00:00Z"))).toBe(true);
  });

  it("cerrado el jueves a las 11 pm en punto", () => {
    expect(isOpenAt(MW_HOURS, new Date("2026-10-09T05:00:00Z"))).toBe(false);
  });

  it("cerrado el miércoles a las 8 pm", () => {
    expect(isOpenAt(MW_HOURS, new Date("2026-10-08T02:00:00Z"))).toBe(false);
  });

  it("un horario que cruza la medianoche sigue abierto a la 1 am del día siguiente", () => {
    const late: WeeklyHour[] = [{ day: 6, start: "20:00", end: "02:00" }];
    // Domingo 11 de octubre, 1:00 am local.
    expect(isOpenAt(late, new Date("2026-10-11T07:00:00Z"))).toBe(true);
    expect(isOpenAt(late, new Date("2026-10-11T08:30:00Z"))).toBe(false);
  });
});
