"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "./nav-items";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              active ? "bg-brand-ink text-brand-cream" : "text-brand-ink/70 hover:bg-brand-sand"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
