import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { requireAdminUser } from "@/lib/admin/auth";
import { signOutAction } from "@/lib/admin/actions";
import { getBusinessSettingsAdmin } from "@/lib/admin/data";
import { getSiteAssetUrl } from "@/lib/storage";
import { business } from "@/lib/config/business";
import { AdminNav } from "./AdminNav";
import { AdminMobileNav } from "./AdminMobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { Toast } from "./Toast";
import { SubmitOverlay } from "./SubmitOverlay";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, settings, cookieStore] = await Promise.all([requireAdminUser(), getBusinessSettingsAdmin(), cookies()]);
  const logoUrl = getSiteAssetUrl(settings.logo_path) ?? "/brand/icon-192.png";
  // Leído server-side (cookie) para que el primer render ya traiga el tema
  // correcto. Sin cookie: claro (Franco lo cambia con el botón sol/luna).
  const theme: "light" | "dark" = cookieStore.get("admin-theme")?.value === "dark" ? "dark" : "light";

  return (
    <div id="admin-shell" data-theme={theme} className="min-h-screen bg-brand-cream text-brand-ink">
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-brand-border bg-brand-cream/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/admin" className="flex shrink-0 items-center gap-2">
              <Image src={logoUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-contain" />
              <span className="font-display text-base font-semibold">{business.shortName}</span>
            </Link>
            <div className="hidden sm:block">
              <AdminNav />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-ink/70">
            <span className="hidden sm:inline">{admin.email}</span>
            <ThemeToggle initialTheme={theme} />
            <form action={signOutAction}>
              <button type="submit" className="underline hover:text-brand-ink">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:pb-8">{children}</main>
      <AdminMobileNav />
      <Suspense fallback={null}>
        <Toast />
      </Suspense>
      <Suspense fallback={null}>
        <SubmitOverlay />
      </Suspense>
    </div>
  );
}
