import { describe, expect, it } from "vitest";
import { atTimeEs, formatTimeOfDay } from "./time-format";

describe("formatTimeOfDay", () => {
  it.each([
    [9 * 60, "24h", "09:00"],
    [13 * 60 + 30, "24h", "13:30"],
    [13 * 60, "12h", "1:00 p. m."],
    [9 * 60 + 15, "12h", "9:15 a. m."],
    [9 * 60, "words", "9 de la mañana"],
    [12 * 60, "words", "12 del día"],
    [12 * 60 + 30, "words", "12:30 del día"],
    [13 * 60, "words", "1 de la tarde"],
    [13 * 60, "words_upper", "1 DE LA TARDE"],
    [19 * 60 + 45, "words", "7:45 de la tarde"],
    [20 * 60, "words", "8 de la noche"],
    [23 * 60, "words", "11 de la noche"],
    [0, "words", "12 de la noche"],
    [3 * 60, "words", "3 de la madrugada"],
  ] as const)("%i min en %s -> %s", (minutes, format, expected) => {
    expect(formatTimeOfDay(minutes, format)).toBe(expected);
  });
});

describe("atTimeEs", () => {
  it.each([
    ["1 de la tarde", "a la 1 de la tarde"],
    ["1:30 de la tarde", "a la 1:30 de la tarde"],
    ["1:00 p. m.", "a la 1:00 p. m."],
    ["1 DE LA TARDE", "a la 1 DE LA TARDE"],
    ["3 de la tarde", "a las 3 de la tarde"],
    ["10 de la mañana", "a las 10 de la mañana"],
    ["12 del día", "a las 12 del día"],
    ["13:00", "a las 13:00"],
    ["11:00", "a las 11:00"],
  ])("%s -> %s", (label, expected) => {
    expect(atTimeEs(label)).toBe(expected);
  });
});
