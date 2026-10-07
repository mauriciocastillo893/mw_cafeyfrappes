/**
 * SEO: título y descripción (editables en `/admin/negocio`, con respaldo
 * aquí), datos estructurados de negocio local para Google (JSON-LD
 * `CafeOrCoffeeShop`) y la URL base del sitio para sitemap/robots/Open Graph.
 */

import { business, env, getSiteUrl } from "./config/business";
import type { PublicBusinessSettings } from "./public-data";
import { parseWeeklyHours } from "./weekly-hours";

export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MAX = 200;

export const DEFAULT_SEO_TITLE = `${business.name} — Café, frappés y waffles en Huatulco`;
export const DEFAULT_SEO_DESCRIPTION =
  `Café de grano, frappés y waffles en ${business.city}, Oaxaca. ` +
  `Mira el menú y pide para recoger, en tu mesa o a domicilio. ${business.tagline}.`;

export function resolveSeo(settings: Pick<PublicBusinessSettings, "seo_title" | "seo_description"> | null): {
  title: string;
  description: string;
} {
  return {
    title: settings?.seo_title?.trim() || DEFAULT_SEO_TITLE,
    description: settings?.seo_description?.trim() || DEFAULT_SEO_DESCRIPTION,
  };
}

/** URL pública del sitio sin diagonal final; sin base de datos, `APP_BASE_URL`. */
export function resolveSiteBaseUrl(settings: Pick<PublicBusinessSettings, "site_url"> | null): string {
  const url = settings ? getSiteUrl(settings) : env.appBaseUrl;
  return url.replace(/\/+$/, "");
}

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function buildLocalBusinessJsonLd(params: {
  settings: PublicBusinessSettings;
  siteUrl: string;
  logoUrl: string | null;
}): Record<string, unknown> {
  const { settings, siteUrl, logoUrl } = params;
  const seo = resolveSeo(settings);
  const sameAs = [settings.social_instagram_url, settings.social_facebook_url].filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: settings.business_name || business.name,
    description: seo.description,
    url: siteUrl,
    servesCuisine: ["Café", "Frappés", "Waffles"],
    hasMenu: `${siteUrl}/menu`,
    ...(logoUrl ? { image: logoUrl, logo: logoUrl } : {}),
    ...(settings.business_whatsapp ? { telephone: `+${settings.business_whatsapp}` } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.business_address ?? business.legalAddress,
      addressLocality: business.city,
      addressRegion: business.region,
      addressCountry: "MX",
    },
    ...(settings.business_lat !== null && settings.business_lng !== null
      ? { geo: { "@type": "GeoCoordinates", latitude: settings.business_lat, longitude: settings.business_lng } }
      : {}),
    openingHoursSpecification: parseWeeklyHours(settings.weekly_hours).map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[entry.day],
      opens: entry.start,
      closes: entry.end,
    })),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** `JSON.stringify` seguro para meter dentro de un `<script>` (evita cerrar la etiqueta con `</script>`). */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
