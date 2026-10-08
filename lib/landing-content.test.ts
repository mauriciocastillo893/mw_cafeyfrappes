import { describe, expect, it } from "vitest";
import { appleMapsUrl, DEFAULT_LANDING_SECTIONS, googleMapsDirectionsUrl, resolveLandingSections } from "./landing-content";

describe("resolveLandingSections", () => {
  it("sin filas usa todos los valores por defecto", () => {
    const sections = resolveLandingSections([]);
    expect(sections.hero.heading).toBe(DEFAULT_LANDING_SECTIONS.hero.heading);
    expect(sections.nosotros.imagePath).toBe("/sample/local-barra.jpg");
    expect(Object.keys(sections)).toHaveLength(6);
  });

  it("lo guardado manda; vacío o null cae al valor por defecto", () => {
    const sections = resolveLandingSections([
      { key: "hero", heading: "Universo de sabor", subheading: "   ", image_path: "hero-123.jpg" },
      { key: "horario", heading: null, subheading: "Solo de noche", image_path: null },
    ]);
    expect(sections.hero).toEqual({
      key: "hero",
      heading: "Universo de sabor",
      subheading: DEFAULT_LANDING_SECTIONS.hero.subheading,
      imagePath: "hero-123.jpg",
    });
    expect(sections.horario.heading).toBe("Horario");
    expect(sections.horario.subheading).toBe("Solo de noche");
  });

  it("ignora claves desconocidas", () => {
    const sections = resolveLandingSections([{ key: "pago", heading: "X", subheading: null, image_path: null }]);
    expect(sections).not.toHaveProperty("pago");
  });
});

describe("links de mapas", () => {
  it("Google y Apple Maps con coordenadas", () => {
    expect(googleMapsDirectionsUrl(15.7692212, -96.1291265)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=15.7692212,-96.1291265"
    );
    expect(appleMapsUrl(15.77, -96.13, "MW Café & Frappés")).toBe(
      "https://maps.apple.com/?daddr=15.77%2C-96.13&q=MW+Caf%C3%A9+%26+Frapp%C3%A9s"
    );
  });
});
