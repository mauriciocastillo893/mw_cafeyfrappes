/**
 * Lecturas de `/admin` con `service_role` (ve también lo oculto y lo
 * agotado). Cada página llama antes a `requireAdminUser()`.
 */

import { getServiceSupabase } from "../supabase";
import type { Tables } from "../database.types";

export type BusinessSettingsRow = Tables<"business_settings">;

export async function getBusinessSettingsAdmin(): Promise<BusinessSettingsRow> {
  const { data, error } = await getServiceSupabase().from("business_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export interface MenuSummary {
  categories: number;
  products: number;
  hidden: number;
  soldOut: number;
  samples: number;
  withoutPhoto: number;
  with3d: number;
}

/** Números del inicio del panel. */
export async function getMenuSummaryAdmin(): Promise<MenuSummary> {
  const supabase = getServiceSupabase();
  const [categories, products] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("products").select("active, is_available, is_sample, photo_path, model_glb_path"),
  ]);
  if (categories.error) throw categories.error;
  if (products.error) throw products.error;

  const rows = products.data;
  return {
    categories: categories.count ?? 0,
    products: rows.length,
    hidden: rows.filter((p) => !p.active).length,
    soldOut: rows.filter((p) => p.active && !p.is_available).length,
    samples: rows.filter((p) => p.is_sample).length,
    withoutPhoto: rows.filter((p) => !p.photo_path).length,
    with3d: rows.filter((p) => p.model_glb_path).length,
  };
}
