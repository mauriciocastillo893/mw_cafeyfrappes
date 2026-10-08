/**
 * Lecturas públicas (landing y menú): usan la `anon key` a través de las
 * policies de solo lectura de `supabase/migrations/20261006000000_init_schema.sql`
 * — nunca `service_role`, porque esto corre para cualquier visitante.
 * Las policies ya esconden categorías y productos ocultos; los agotados
 * sí llegan (con `is_available = false`).
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "./config/business";
import type { Database, Tables } from "./database.types";
import { resolveLandingSections, type LandingSection, type LandingSectionKey } from "./landing-content";

let client: ReturnType<typeof createClient<Database>> | null = null;

function getPublicSupabase() {
  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export type PublicBusinessSettings = Tables<"business_settings">;
export type PublicCategory = Tables<"categories">;
export type PublicExtraGroup = Tables<"extra_groups"> & { extras: Tables<"extras">[] };
export type PublicProduct = Tables<"products"> & {
  product_sizes: Tables<"product_sizes">[];
  /** Grupos de extras que ofrece el producto, en orden, cada uno con sus extras en orden. */
  extra_groups: PublicExtraGroup[];
};

export async function getPublicBusinessSettings(): Promise<PublicBusinessSettings> {
  const { data, error } = await getPublicSupabase().from("business_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export interface PublicMenuCategory extends PublicCategory {
  products: PublicProduct[];
}

/** Menú completo: categorías activas en orden, cada una con sus productos visibles, tamaños y extras. */
export async function getPublicMenu(): Promise<PublicMenuCategory[]> {
  const supabase = getPublicSupabase();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("products")
      .select("*, product_sizes(*), product_extra_groups(sort_order, extra_groups(*, extras(*)))")
      .order("sort_order"),
  ]);
  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;

  return categoriesResult.data.map((category) => ({
    ...category,
    products: productsResult.data
      .filter((product) => product.category_id === category.id)
      .map(({ product_extra_groups, ...product }) => ({
        ...product,
        product_sizes: [...product.product_sizes].sort((a, b) => a.sort_order - b.sort_order),
        extra_groups: [...product_extra_groups]
          .sort((a, b) => a.sort_order - b.sort_order || (a.extra_groups?.sort_order ?? 0) - (b.extra_groups?.sort_order ?? 0))
          .flatMap(({ extra_groups: group }) =>
            group ? [{ ...group, extras: [...group.extras].sort((a, b) => a.sort_order - b.sort_order) }] : []
          ),
      })),
  }));
}

/** Las 6 secciones de la landing con su texto e imagen (editables en /admin/landing), con valores por defecto. */
export async function getPublicLandingSections(): Promise<Record<LandingSectionKey, LandingSection>> {
  const { data, error } = await getPublicSupabase().from("landing_sections").select("key, heading, subheading, image_path");
  if (error) throw error;
  return resolveLandingSections(data);
}
