"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircleIcon, CheckCircleIcon, CloseIcon } from "./Icons";

interface ToastData {
  message: string;
  isError: boolean;
}

/**
 * Aviso de "se guardó" / "hubo un error" tras una Server Action (pedido
 * del usuario 2026-09-30). Las acciones en `lib/admin/actions.ts`
 * terminan con `redirect("<ruta>?saved=...")` o `?error=...` (mismo
 * patrón que ya existía para errores, `fail()`); este componente lee
 * ese query param una sola vez, lo copia a su propio estado y limpia la
 * URL (`router.replace`) para que un refresh no lo vuelva a mostrar.
 *
 * El mensaje se guarda en estado propio (`toast`) en vez de leerse en
 * vivo de `searchParams` en cada render: como el efecto de abajo borra
 * el query param casi de inmediato, si el texto viniera directo de
 * `searchParams.get(...)` desaparecería en el mismo instante que se
 * limpia la URL, antes de que el usuario alcance a verlo (bug real,
 * encontrado probando en `/dev-preview`).
 */
export function Toast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const saved = searchParams.get("saved");
    const error = searchParams.get("error");
    if (!saved && !error) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con el query param de la URL al llegar
    setToast({ message: (saved ?? error)!, isError: Boolean(error) });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("saved");
    params.delete("error");
    const clean = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(clean, { scroll: false });

    const timeout = setTimeout(() => setToast(null), 10000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr cuando cambian los query params, no por pathname/router
  }, [searchParams]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-6">
      <div
        role="status"
        className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-sm animate-[toast-in_0.2s_ease-out] ${
          toast.isError
            ? "border-red-500/30 bg-red-600 text-white"
            : "border-brand-ink/10 bg-brand-ink text-brand-cream"
        }`}
      >
        {toast.isError ? <AlertCircleIcon className="h-4 w-4 shrink-0" /> : <CheckCircleIcon className="h-4 w-4 shrink-0" />}
        <span className="truncate">{toast.message}</span>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="ml-1 cursor-pointer rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
