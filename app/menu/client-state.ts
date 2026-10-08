"use client";

/**
 * Estado del menú que vive fuera de React: la URL (`?producto=`, `?mesa=`),
 * el reloj (abierto/cerrado) y la mesa guardada en la sesión.
 *
 * Todo con `useSyncExternalStore`: el servidor renderiza con valores
 * neutros (sin producto abierto, sin mesa, la hora del render) y el
 * navegador los corrige al hidratar, sin parpadeos ni `setState` en efectos.
 * Así la página puede seguir siendo estática (ISR) aunque lea la URL.
 */

import { useSyncExternalStore } from "react";
import { parseTableNumber } from "@/lib/menu";

const URL_CHANGE_EVENT = "mw:urlchange";

function subscribeToUrl(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(URL_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(URL_CHANGE_EVENT, callback);
  };
}

export function useSearchParam(name: string): string | null {
  return useSyncExternalStore(
    subscribeToUrl,
    () => new URLSearchParams(window.location.search).get(name),
    () => null
  );
}

/**
 * Cambia un parámetro de la URL sin recargar. `push` agrega una entrada al
 * historial: abrir un producto con `push` hace que "atrás" en el celular
 * lo cierre en vez de salir del menú.
 */
export function setSearchParam(name: string, value: string | null, mode: "push" | "replace") {
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  if (mode === "push") window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

/** Clave de `sessionStorage` con la mesa del QR; la usa el pedido (Fase 5). */
export const TABLE_STORAGE_KEY = "mw-mesa";

function readStoredTable(): string | null {
  try {
    return window.sessionStorage.getItem(TABLE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Mesa de `?mesa=N`; si ya no está en la URL (volvió de la portada), la guardada en esta pestaña. */
export function useTableNumber(): number | null {
  return useSyncExternalStore(
    subscribeToUrl,
    () => parseTableNumber(new URLSearchParams(window.location.search).get("mesa")) ?? parseTableNumber(readStoredTable()),
    () => null
  );
}

export function rememberTable(table: number) {
  try {
    window.sessionStorage.setItem(TABLE_STORAGE_KEY, String(table));
  } catch {
    // Modo privado o almacenamiento bloqueado: la mesa sigue en la URL.
  }
}

const MINUTE = 60_000;

function subscribeToClock(callback: () => void) {
  const id = window.setInterval(callback, 15_000);
  return () => window.clearInterval(id);
}

/** Hora actual redondeada al minuto. En el servidor (y al hidratar) usa `serverNow`. */
export function useMinuteClock(serverNow: number): number {
  return useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / MINUTE) * MINUTE,
    () => serverNow
  );
}
