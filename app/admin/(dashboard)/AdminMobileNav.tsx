"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "./nav-items";

/** Barra flotante inferior, solo en celular (estilo iOS/Instagram) — en desktop se usa `AdminNav`. */
export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-50 flex justify-center px-3 sm:hidden">
      <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-brand-border bg-brand-cream/90 p-1.5 shadow-lg backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
                active ? "bg-brand-ink text-brand-cream" : "text-brand-ink/60 hover:bg-brand-sand"
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
