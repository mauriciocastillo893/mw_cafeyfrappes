/**
 * Cliente de Supabase del lado del servidor (service_role, ignora RLS).
 * Lo usan los webhooks y las rutas de `/admin` — nunca el navegador.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./config/business";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

export function getServiceSupabase(): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
