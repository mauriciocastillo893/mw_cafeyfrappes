import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { business } from "@/lib/config/business";
import { getAdminUser } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/admin/supabase-server";
import { signInAction, signOutAction } from "@/lib/admin/actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: `Entrar — ${business.name} admin`,
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const adminUser = await getAdminUser();

  if (adminUser) {
    redirect("/admin");
  }

  // Sesión válida en Supabase Auth pero el correo no está en `admin_users`
  // (caso A5): no se redirige a /admin (formaría un loop), se avisa aquí.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();
  const supabaseSessionButNotAdmin = Boolean(sessionUser);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center bg-brand-cream px-4 py-12 text-brand-ink">
      <Image src="/brand/icon-192.png" alt="" width={56} height={56} className="mb-4 h-14 w-14 rounded-full" />
      <h1 className="font-display text-2xl font-semibold">{business.shortName} — panel</h1>
      <p className="mt-1 text-sm opacity-70">Acceso solo para Franco y el desarrollador.</p>

      {error && (
        <p className="mt-4 rounded-[10px] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {supabaseSessionButNotAdmin ? (
        <div className="mt-6 flex flex-col gap-3">
          <p className="rounded-[10px] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
            La cuenta {sessionUser?.email} no tiene acceso a este panel.
          </p>
          <form action={signOutAction}>
            <button type="submit" className="text-sm underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : (
        <form action={signInAction} className="mt-6 flex flex-col gap-3">
          <label className="text-sm">
            Correo
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-brand-border bg-brand-cream text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/40 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Contraseña
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-brand-border bg-brand-cream text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/40 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-brand-on-primary transition-colors hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      )}

      <Link href="/" className="mt-6 text-center text-sm underline">
        Volver al sitio
      </Link>
    </main>
  );
}
