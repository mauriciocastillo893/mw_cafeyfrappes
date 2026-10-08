import type { Metadata } from "next";
import { business } from "@/lib/config/business";
import { getPublicBusinessSettings, getPublicMenu } from "@/lib/public-data";
import { getMenuPhotoUrl } from "@/lib/storage";
import { productPriceLabel } from "@/lib/money";
import { parseTimeFormat } from "@/lib/time-format";
import { parseWeeklyHours } from "@/lib/weekly-hours";
import { MenuView } from "./MenuView";
import type { MenuCategoryView } from "./types";

// Estática con revalidación: los cambios de /admin (precio, agotado…) se
// ven en menos de un minuto. Lo que depende de la URL (`?mesa=`,
// `?producto=`) y de la hora se resuelve en el navegador (client-state.ts).
export const revalidate = 60;

export const metadata: Metadata = {
  title: `Menú · ${business.name}`,
  description: "Waffles, café, frappés, crepas y sodas italianas en Huatulco. Mira precios, tamaños y extras.",
  alternates: { canonical: "/menu" },
};

export default async function MenuPage() {
  const [settings, menu] = await Promise.all([getPublicBusinessSettings(), getPublicMenu()]);

  const categories: MenuCategoryView[] = menu
    .filter((category) => category.products.length > 0)
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      products: category.products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        tags: product.tags,
        photoUrl: getMenuPhotoUrl(product.photo_path),
        priceLabel: productPriceLabel(product),
        base_price_cents: product.base_price_cents,
        is_available: product.is_available,
        product_sizes: product.product_sizes.map(({ id, name, price_cents }) => ({ id, name, price_cents })),
        extra_groups: product.extra_groups.map((group) => ({
          id: group.id,
          name: group.name,
          min_select: group.min_select,
          max_select: group.max_select,
          extras: group.extras.map(({ id, name, price_cents, is_available }) => ({ id, name, price_cents, is_available })),
        })),
      })),
    }));

  return (
    <MenuView
      categories={categories}
      hours={parseWeeklyHours(settings.weekly_hours)}
      timeFormat={parseTimeFormat(settings.time_format)}
      serverNow={new Date().getTime()}
    />
  );
}
