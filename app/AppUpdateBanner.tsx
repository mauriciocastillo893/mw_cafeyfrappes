"use client";

import { useEffect, useState } from "react";

const CHECK_EVERY_MS = 5 * 60 * 1000;
const LOADED_VERSION = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

/**
 * Aviso de versión nueva (pedido del usuario 2026-10-06): una app instalada
 * en la pantalla de inicio —sobre todo en iPhone— sigue mostrando la versión
 * con la que se abrió hasta que se cierra del todo. Aquí se compara la
 * versión con la que cargó la página contra la que está publicada
 * (`/api/version`) al abrir, al volver a la app y cada 5 minutos; si no
 * coinciden, un aviso deja recargar con un toque.
 */
export function AppUpdateBanner() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const { version } = (await res.json()) as { version?: string };
        if (!cancelled && version && version !== LOADED_VERSION) setHasUpdate(true);
      } catch {
        // Sin conexión: se vuelve a intentar en la siguiente revisión.
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") void check();
    }

    void check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (!hasUpdate || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-brand-ink px-4 py-3 text-sm text-brand-cream shadow-lg"
    >
      <p>Hay una versión nueva del sitio.</p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="cursor-pointer px-2 py-1 text-xs opacity-70"
        >
          Más tarde
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="cursor-pointer rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-ink"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
