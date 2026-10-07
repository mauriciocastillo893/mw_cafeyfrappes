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
export type PublicProduct = Tables<"products"> & {
  product_sizes: Tables<"product_sizes">[];
};

export async function getPublicBusinessSettings(): Promise<PublicBusinessSettings> {
  const { data, error } = await getPublicSupabase().from("business_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export interface PublicMenuCategory extends PublicCategory {
  products: PublicProduct[];
}

/** Menú completo: categorías activas en orden, cada una con sus productos visibles y tamaños. */
export async function getPublicMenu(): Promise<PublicMenuCategory[]> {
  const supabase = getPublicSupabase();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*, product_sizes(*)").order("sort_order"),
  ]);
  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;

  return categoriesResult.data.map((category) => ({
    ...category,
    products: productsResult.data
      .filter((product) => product.category_id === category.id)
      .map((product) => ({
        ...product,
        product_sizes: [...product.product_sizes].sort((a, b) => a.sort_order - b.sort_order),
      })),
  }));
}
