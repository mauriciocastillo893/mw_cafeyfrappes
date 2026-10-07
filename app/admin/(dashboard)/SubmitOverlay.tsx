"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SAFETY_TIMEOUT_MS = 15000;

/**
 * Loader de pantalla completa mientras se guarda algo (pedido del
 * usuario 2026-10-01): todas las acciones de `/admin` son
 * `<form action={...}>` normales (sin `useFormStatus` por formulario),
 * así que esto escucha el evento `submit` a nivel de documento — cubre
 * los ~20 formularios existentes sin tocar cada uno.
 *
 * Se quita en cuanto la navegación que sigue al guardado termina —no al
 * "volver a montarse", como decía una versión anterior de este
 * comentario (bug real 2026-10-01, ver docs/decisiones.md): casi todas
 * las acciones de `/admin` (`lib/admin/actions.ts#succeed`/`fail`)
 * redirigen a la **misma** página con un query param nuevo
 * (`?saved=...`/`?error=...`), y como este componente vive en el layout
 * (no en la página), ese tipo de navegación nunca lo desmonta — se
 * quedaba pegado hasta un recargado manual. Por eso se usa el mismo
 * truco que ya usa `Toast.tsx` para el mismo problema: reaccionar a que
 * cambien `pathname`/`searchParams`, que es justo lo que pasa apenas
 * termina esa redirección. La red de seguridad de 15s sigue ahí por si
 * una acción no redirige a ningún lado.
 *
 * OJO: no revisar `event.defaultPrevented` aquí (otro bug encontrado
 * 2026-10-01, ver docs/decisiones.md) — React 19 **siempre** llama
 * `preventDefault()` cuando intercepta un `<form action={fn}>` para
 * correr la Server Action en vez de la petición nativa, así que esa
 * bandera queda en `true` incluso en un guardado normal y exitoso; con
 * esa revisión, el overlay nunca llegaba a mostrarse en ningún
 * formulario del panel. Un formulario que sí cancela la petición de
 * verdad (como un "¿seguro que quieres borrarlo?")
 * tiene que avisarlo con `event.stopPropagation()` en su propio
 * `onSubmit`, no dejándolo llegar hasta aquí.
 */
export function SubmitOverlay() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function handleSubmit(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      setVisible(true);
    }

    document.addEventListener("submit", handleSubmit);
    return () => document.removeEventListener("submit", handleSubmit);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- apagar el overlay cuando la navegación posterior al guardado ya terminó
    setVisible(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => setVisible(false), SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-ink/40 backdrop-blur-[1px]" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-cream/40 border-t-brand-cream" />
      <span className="sr-only">Guardando…</span>
    </div>
  );
}
