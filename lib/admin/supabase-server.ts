/**
 * Cliente de Supabase por sesión (cookies), para el login y para leer la
 * sesión actual en Server Components/Actions de `/admin`. Usa la
 * `anon key`: respeta RLS, que solo deja a cada usuario leer su propia
 * fila en `admin_users` (`admin_users_self_read`). Las lecturas y
 * escrituras de datos del panel se hacen aparte con `getServiceSupabase()`
 * (service_role) una vez que `requireAdminUser()` confirma el acceso.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../config/business";
import type { Database } from "../database.types";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Se llama desde un Server Component sin poder escribir cookies
          // (el middleware ya se encarga de refrescar la sesión ahí).
        }
      },
    },
  });
}
