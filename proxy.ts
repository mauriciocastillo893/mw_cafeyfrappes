/**
 * Protege `/admin/*` (sección 9 de CLAUDE.md, caso A6): sin sesión de
 * Supabase Auth, redirige a `/admin/login`. De paso refresca la cookie
 * de sesión en cada request (patrón recomendado de `@supabase/ssr`).
 *
 * No revisa aquí la lista blanca `admin_users` (eso corre en el
 * servidor, en `lib/admin/auth.ts#requireAdminUser`, con `service_role`):
 * este proxy corre en el Edge Runtime y conviene mantenerlo sin llamadas
 * extra a la base de datos. (Next.js 16 renombró "middleware" a "proxy";
 * mismo mecanismo, nuevo nombre de archivo/función.)
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
