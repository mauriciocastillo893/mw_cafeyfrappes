"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mw-cafe-pwa-icon";

/**
 * Aviso de ícono nuevo (Fase 8, punto 9 del pedido del usuario
 * 2026-10-01): el favicon/ícono del manifest ya se refresca solo en
 * cada visita (URL con timestamp de Supabase Storage, `lib/storage.ts`),
 * pero el ícono de la pantalla de inicio de una PWA ya instalada lo
 * cachea el sistema operativo — sobre todo iOS, donde no hay forma de
 * forzarlo por código; hay que quitar el acceso directo y volver a
 * agregarlo. Esto solo avisa que hay uno nuevo; no puede arreglar esa
 * limitación del sistema.
 */
export function PwaUpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/manifest.webmanifest", { cache: "no-store" })
      .then((res) => res.json())
      .then((manifest: { icons?: { src?: string }[] }) => {
        if (cancelled) return;
        const currentIcon = manifest.icons?.[0]?.src;
        if (!currentIcon) return;

        let lastSeen: string | null = null;
        try {
          lastSeen = localStorage.getItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, currentIcon);
        } catch {
          return; // localStorage bloqueado (ej. navegación privada): sin aviso, sin romper la página
        }

        if (lastSeen && lastSeen !== currentIcon) {
          setShowBanner(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 bg-brand-ink px-4 py-3 text-sm text-brand-cream">
      <p>
        Hay un ícono nuevo del sitio. Si lo agregaste a tu pantalla de inicio, bórralo y vuelve a agregarlo para
        verlo.
      </p>
      <button
        type="button"
        onClick={() => setShowBanner(false)}
        className="shrink-0 cursor-pointer rounded-full border border-brand-cream/40 px-3 py-1 text-xs font-medium"
      >
        Entendido
      </button>
    </div>
  );
}
