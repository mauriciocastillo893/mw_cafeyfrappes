"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { business } from "@/lib/config/business";
import { InstallGuideModal } from "./InstallGuideModal";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "other";

function subscribeNever(): () => void {
  return () => {};
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Sección "Instala la app" de la landing (pedido del usuario 2026-10-06).
 *
 * El botón "Instalar app" está siempre a la vista: si el navegador permite
 * instalar con un toque (`beforeinstallprompt`: Chrome/Edge en Android y
 * computadora) lo hace directo; si no —iPhone nunca, porque Safari no deja
 * que ninguna página instale—, abre una guía con la interfaz simulada del
 * celular (`InstallGuideModal`), también disponible con "¿No te permite
 * instalarla?". Si la página ya se abrió desde la app instalada, la sección
 * no aparece.
 */
export function InstallApp({ iconUrl }: { iconUrl: string | null }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const standalone = useSyncExternalStore(subscribeNever, isStandalone, () => false);
  const platform = useSyncExternalStore(subscribeNever, detectPlatform, (): Platform => "other");
  const closeGuide = useCallback(() => setGuideOpen(false), []);

  useEffect(() => {
    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }
    function handleInstalled() {
      setInstallPrompt(null);
      setJustInstalled(true);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    // El navegador puede avisar antes de que React cargue; `app/layout.tsx`
    // guarda ese aviso en `window.__installPrompt` para no perderlo.
    const early = (window as Window & { __installPrompt?: BeforeInstallPromptEvent }).__installPrompt;
    const timer = setTimeout(() => {
      if (early) setInstallPrompt(early);
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (standalone) return null;

  async function install() {
    if (!installPrompt) {
      setGuideOpen(true);
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (outcome === "dismissed") setGuideOpen(true);
  }

  return (
    <section id="app" className="scroll-mt-20 bg-brand-sand text-brand-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-20 sm:px-10">
        <div>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-medium">Instala la app</h2>
          <p className="mt-2 max-w-md text-sm opacity-70">
            Ten {business.shortName} en la pantalla de inicio de tu celular, sin descargar nada de una tienda, para
            ver el menú y pedir con un toque.
          </p>
        </div>

        {justInstalled ? (
          <p className="text-sm font-medium">¡Listo! Ya tienes la app instalada.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              onClick={install}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[20px] border border-brand-ink bg-brand-ink py-[10px] pl-5 pr-[18px] text-sm font-medium text-brand-cream"
            >
              Instalar app <span aria-hidden>↓</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="cursor-pointer text-sm underline underline-offset-4"
            >
              ¿No te permite instalarla?
            </button>
          </div>
        )}

        <p className="max-w-md text-xs opacity-60">
          {platform === "ios"
            ? "En iPhone la instalación es manual (Apple no permite hacerla con un botón): toca \"Instalar app\" y te mostramos cómo."
            : "Si tu navegador no la instala con un toque, te mostramos cómo hacerlo paso a paso."}
        </p>
      </div>

      {guideOpen && (
        <InstallGuideModal initialTab={platform === "android" ? "android" : "ios"} iconUrl={iconUrl} onClose={closeGuide} />
      )}
    </section>
  );
}
