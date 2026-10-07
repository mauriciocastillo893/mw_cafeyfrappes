"use client";

import { useEffect } from "react";

/** Registra `public/sw.js` (PWA — sección 5 del pedido del usuario 2026-09-30). */
export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin soporte o bloqueado (ej. contexto no seguro): la página sigue funcionando normal.
      });
    }
  }, []);

  return null;
}
