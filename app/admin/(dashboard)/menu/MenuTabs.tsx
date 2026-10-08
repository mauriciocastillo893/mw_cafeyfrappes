"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/menu", label: "Productos" },
  { href: "/admin/menu/categorias", label: "Categorías" },
  { href: "/admin/menu/extras", label: "Extras" },
];

export function MenuTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones del menú" className="flex gap-1 rounded-full border border-brand-border bg-brand-sand/60 p-1 text-sm">
      {TABS.map((tab) => {
        const active = tab.href === "/admin/menu" ? pathname === tab.href || pathname.startsWith("/admin/menu/producto") : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
              active ? "bg-brand-ink text-brand-cream" : "text-brand-ink/70 hover:bg-brand-sand"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
