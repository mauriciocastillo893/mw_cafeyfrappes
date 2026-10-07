"use server";

/**
 * Server Actions de `/admin`. Cada una vuelve a validar sesión y lista
 * blanca con `requireAdminUser()` (no basta con que el proxy haya dejado
 * pasar la request) y escribe con `service_role`. Los errores de
 * validación se mandan por query string (`?error=...`) a la misma página
 * y los éxitos con `?saved=...` (los muestra `Toast.tsx`).
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// ---------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    fail("/admin/login", "Escribe tu correo y tu contraseña.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    fail("/admin/login", "Correo o contraseña incorrectos.");
  }

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
