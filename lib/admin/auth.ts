/**
 * Autorización de `/admin` (sección 9 de CLAUDE.md): sesión de Supabase
 * Auth + pertenencia a `admin_users` (lista blanca, sin registro
 * público). El middleware (`middleware.ts`) ya redirige a quien no tiene
 * sesión; `requireAdminUser()` es la segunda verificación, del lado del
 * servidor, en cada página/acción de `/admin`.
 */

import { redirect } from "next/navigation";
import { getServiceSupabase } from "../supabase";
import { createSupabaseServerClient } from "./supabase-server";

export interface AdminUser {
  id: string;
  email: string;
}

/** `null` si no hay sesión o si el usuario no está en `admin_users`. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  // Se consulta admin_users con service_role (no con la sesión del
  // usuario): centraliza la verificación de la lista blanca en un solo
  // lugar en vez de depender de que la policy de RLS siga igual.
  const { data } = await getServiceSupabase()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return { id: user.id, email: user.email };
}

/** Redirige a `/admin/login` si no hay sesión o el usuario no es admin (casos A5/A6). */
export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
