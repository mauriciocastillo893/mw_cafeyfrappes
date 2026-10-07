import type { MetadataRoute } from "next";
import { getPublicBusinessSettings } from "@/lib/public-data";
import { resolveSiteBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicBusinessSettings().catch(() => null);
  const siteUrl = resolveSiteBaseUrl(settings);
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
