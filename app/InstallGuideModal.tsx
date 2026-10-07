"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { business } from "@/lib/config/business";

type Tab = "ios" | "android";

/** Lo que el celular muestra en la barra de direcciones; en el servidor, un valor genérico. */
const SITE_HOST = typeof window === "undefined" ? "mw-cafeyfrappes.vercel.app" : window.location.host;
const APP_NAME = business.shortName;

/* ------------------------------------------------------------------ */
/* Piezas visuales: imitan lo que el usuario ve en su celular          */
/* ------------------------------------------------------------------ */

function Tap({
  children,
  label,
  labelBelow,
  alignRight,
}: {
  children: React.ReactNode;
  label?: string;
  labelBelow?: boolean;
  alignRight?: boolean;
}) {
  return (
    <span className="relative inline-flex">
      <span aria-hidden className="pointer-events-none absolute -inset-1.5 animate-pulse rounded-full ring-2 ring-brand-accent" />
      {children}
      {label && (
        <span
          className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-full bg-brand-ink px-2 py-0.5 text-[10px] font-medium text-brand-cream ${
            alignRight ? "-right-1" : "left-1/2 -translate-x-1/2"
          } ${labelBelow ? "top-[calc(100%+10px)]" : "bottom-[calc(100%+10px)]"}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}

function RowTap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg bg-brand-accent-wash">
      <span aria-hidden className="pointer-events-none absolute inset-0 animate-pulse rounded-lg ring-2 ring-brand-accent" />
      {children}
      <span className="absolute -top-2 right-2 rounded-full bg-brand-ink px-2 py-0.5 text-[10px] font-medium text-brand-cream">
        Toca aquí
      </span>
    </div>
  );
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function ShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg {...iconProps} width={size} height={size}>
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}
function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg {...iconProps}>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z" />
      <path d="M18 19v2H6" />
    </svg>
  );
}
function TabsIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="8" width="12" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}
function PlusSquareIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function KebabIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="5" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg {...iconProps} width={12} height={12}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function InstallPhoneIcon() {
  return (
    <svg {...iconProps}>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M12 8v6M9.5 11.5 12 14l2.5-2.5" />
    </svg>
  );
}
function GenericRowIcon() {
  return <span aria-hidden className="h-3.5 w-3.5 rounded-sm border border-neutral-400" />;
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-[300px] w-full max-w-[260px] flex-col overflow-hidden rounded-[26px] border-[6px] border-neutral-800 bg-white shadow-md">
      {children}
    </div>
  );
}

/** El sitio, en miniatura, como fondo de las pantallas simuladas. */
function PagePeek({ dim }: { dim?: boolean }) {
  return (
    <div className={`flex-1 overflow-hidden bg-brand-cream ${dim ? "opacity-60" : ""}`}>
      <div className="h-24 bg-brand-primary/40 px-3 pt-5">
        <div className="h-2.5 w-24 rounded bg-brand-ink/70" />
        <div className="mt-2 h-2.5 w-32 rounded bg-brand-ink/70" />
      </div>
      <div className="flex flex-col gap-2 px-3 py-3">
        <div className="h-2 w-full rounded bg-brand-ink/15" />
        <div className="h-2 w-5/6 rounded bg-brand-ink/15" />
        <div className="h-2 w-2/3 rounded bg-brand-ink/15" />
      </div>
    </div>
  );
}

function AppTile({ iconUrl, size = 40 }: { iconUrl: string | null; size?: number }) {
  return iconUrl ? (
    <Image
      src={iconUrl}
      alt=""
      width={size}
      height={size}
      className="rounded-[10px] border border-black/10 bg-brand-cream object-contain p-0.5"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-[10px] bg-brand-primary font-medium text-brand-cream"
      style={{ width: size, height: size }}
    >
      A
    </span>
  );
}

/* ------------------------------ iPhone ----------------------------- */

function IosStepShare() {
  return (
    <PhoneFrame>
      <PagePeek />
      <div className="border-t border-neutral-200 bg-neutral-100 px-3 pb-3 pt-2">
        <div className="mx-auto flex items-center justify-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] text-neutral-600">
          <LockIcon /> {SITE_HOST}
        </div>
        <div className="mt-3 flex items-center justify-between px-1 text-[#007aff]">
          <ChevronIcon dir="left" />
          <span className="text-neutral-400">
            <ChevronIcon dir="right" />
          </span>
          <Tap label="Toca aquí">
            <ShareIcon size={22} />
          </Tap>
          <BookIcon />
          <TabsIcon />
        </div>
      </div>
    </PhoneFrame>
  );
}

function IosStepMenu({ iconUrl }: { iconUrl: string | null }) {
  const row = "flex items-center justify-between px-3 py-2.5 text-[12px] text-neutral-800";
  return (
    <PhoneFrame>
      <div className="flex h-[64px] shrink-0 flex-col overflow-hidden bg-neutral-500/40">
        <PagePeek dim />
      </div>
      <div className="flex-1 rounded-t-2xl bg-neutral-100 px-3 pb-3 pt-3">
        <div className="mb-2.5 flex items-center gap-2">
          <AppTile iconUrl={iconUrl} size={30} />
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-neutral-900">{APP_NAME}</p>
            <p className="truncate text-[10px] text-neutral-500">{SITE_HOST}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-white p-1">
          <div className={row}>
            Copiar <GenericRowIcon />
          </div>
          <div className={row}>
            Añadir a marcadores <BookIcon />
          </div>
          <RowTap>
            <div className={`${row} font-medium`}>
              Añadir a pantalla de inicio <PlusSquareIcon />
            </div>
          </RowTap>
        </div>
      </div>
    </PhoneFrame>
  );
}

function IosStepConfirm({ iconUrl }: { iconUrl: string | null }) {
  return (
    <PhoneFrame>
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-3 py-2.5 text-[11px]">
        <span className="text-[#007aff]">Cancelar</span>
        <span className="font-medium text-neutral-900">Añadir a pantalla de inicio</span>
        <Tap label="Toca aquí" labelBelow alignRight>
          <span className="font-semibold text-[#007aff]">Añadir</span>
        </Tap>
      </div>
      <div className="flex-1 bg-neutral-100 px-3 pt-5">
        <div className="flex items-center gap-3 rounded-xl bg-white p-3">
          <AppTile iconUrl={iconUrl} size={44} />
          <div className="min-w-0 flex-1 border-l border-neutral-200 pl-3">
            <p className="text-[13px] font-medium text-neutral-900">{APP_NAME}</p>
            <p className="truncate text-[10px] text-neutral-500">https://{SITE_HOST}</p>
          </div>
        </div>
        <p className="mt-3 px-1 text-[10px] leading-snug text-neutral-500">
          Se agregará un ícono a tu pantalla de inicio para que puedas abrir este sitio rápidamente.
        </p>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------ Android ---------------------------- */

function AndroidStepMenu() {
  return (
    <PhoneFrame>
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-2.5 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1.5 text-[10px] text-neutral-700">
          <LockIcon />
          <span className="truncate">{SITE_HOST}</span>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded border-2 border-neutral-700 text-[9px] font-bold text-neutral-700">
          1
        </span>
        <span className="mr-0.5 text-neutral-700">
          <Tap label="Toca aquí" labelBelow alignRight>
            <KebabIcon />
          </Tap>
        </span>
      </div>
      <PagePeek />
    </PhoneFrame>
  );
}

function AndroidStepInstall() {
  const row = "flex items-center gap-2.5 px-3 py-2 text-[12px] text-neutral-800";
  return (
    <PhoneFrame>
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-2.5 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1.5 text-[10px] text-neutral-700">
          <LockIcon />
          <span className="truncate">{SITE_HOST}</span>
        </div>
        <span className="text-neutral-700">
          <KebabIcon />
        </span>
      </div>
      <div className="relative flex-1 bg-neutral-500/30">
        <div className="absolute right-2 top-1 w-[200px] rounded-xl bg-white py-1 shadow-lg">
          <div className={row}>
            <GenericRowIcon /> Nueva pestaña
          </div>
          <div className={row}>
            <GenericRowIcon /> Historial
          </div>
          <div className="px-1.5 py-0.5">
            <RowTap>
              <div className={`${row} font-medium`}>
                <InstallPhoneIcon /> Instalar app
              </div>
            </RowTap>
          </div>
          <div className={row}>
            <GenericRowIcon /> Compartir…
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function AndroidStepConfirm({ iconUrl }: { iconUrl: string | null }) {
  return (
    <PhoneFrame>
      <div className="relative flex-1 bg-neutral-600/50">
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl">
          <p className="text-[13px] font-medium text-neutral-900">¿Instalar app?</p>
          <div className="mt-3 flex items-center gap-3">
            <AppTile iconUrl={iconUrl} size={40} />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-neutral-900">{APP_NAME}</p>
              <p className="truncate text-[10px] text-neutral-500">{SITE_HOST}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-5 text-[12px] font-medium">
            <span className="text-neutral-600">Cancelar</span>
            <Tap label="Toca aquí" labelBelow alignRight>
              <span className="rounded-full bg-[#1a73e8] px-3.5 py-1 text-white">Instalar</span>
            </Tap>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

interface Step {
  title: string;
  text: string;
  visual: (iconUrl: string | null) => React.ReactNode;
}

const STEPS: Record<Tab, Step[]> = {
  ios: [
    {
      title: "Toca el botón Compartir",
      text: "En Safari está abajo, al centro: un cuadro con una flecha hacia arriba. Si usas Chrome en el iPhone, está arriba a la derecha, junto a la barra de direcciones.",
      visual: () => <IosStepShare />,
    },
    {
      title: "Elige «Añadir a pantalla de inicio»",
      text: "Se abre una lista de opciones. Si no la ves, desliza la lista hacia arriba hasta encontrarla.",
      visual: (iconUrl) => <IosStepMenu iconUrl={iconUrl} />,
    },
    {
      title: "Toca «Añadir»",
      text: `Arriba a la derecha. El ícono de ${APP_NAME} queda junto a tus demás apps.`,
      visual: (iconUrl) => <IosStepConfirm iconUrl={iconUrl} />,
    },
  ],
  android: [
    {
      title: "Abre el menú de Chrome",
      text: "Son los tres puntos de arriba a la derecha, junto a la barra de direcciones.",
      visual: () => <AndroidStepMenu />,
    },
    {
      title: "Elige «Instalar app»",
      text: "Si no aparece con ese nombre, busca «Añadir a pantalla de inicio»: hace lo mismo.",
      visual: () => <AndroidStepInstall />,
    },
    {
      title: "Confirma con «Instalar»",
      text: `El ícono de ${APP_NAME} se agrega a tu pantalla de inicio y a tus apps.`,
      visual: (iconUrl) => <AndroidStepConfirm iconUrl={iconUrl} />,
    },
  ],
};

export function InstallGuideModal({
  initialTab,
  iconUrl,
  onClose,
}: {
  initialTab: Tab;
  iconUrl: string | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [stepIndex, setStepIndex] = useState(0);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const steps = STEPS[tab];
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function chooseTab(next: Tab) {
    setTab(next);
    setStepIndex(0);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-[20px] bg-brand-cream p-5 text-brand-ink shadow-xl sm:rounded-[20px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="text-lg font-medium">
              Cómo instalar la app
            </h3>
            <p className="mt-0.5 text-xs opacity-70">Así se ve en tu celular. Sigue los puntos que parpadean.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl leading-none hover:bg-brand-sand"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-full bg-brand-sand p-1 text-sm font-medium">
          {(["ios", "android"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => chooseTab(value)}
              className={`cursor-pointer rounded-full px-3 py-1.5 transition-colors ${
                tab === value ? "bg-brand-ink text-brand-cream" : "hover:bg-brand-cream/70"
              }`}
            >
              {value === "ios" ? "iPhone" : "Android"}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide opacity-60">
            Paso {stepIndex + 1} de {steps.length}
          </p>
          <p className="mt-1 text-base font-medium">{step.title}</p>
          <p className="mt-1 text-sm opacity-75">{step.text}</p>
        </div>

        <div key={`${tab}-${stepIndex}`}>{step.visual(iconUrl)}</div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="cursor-pointer rounded-full border border-brand-ink px-4 py-1.5 text-sm font-medium disabled:cursor-default disabled:opacity-30"
          >
            Anterior
          </button>
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === stepIndex ? "bg-brand-ink" : "bg-brand-ink/25"}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (isLast ? onClose() : setStepIndex((i) => i + 1))}
            className="cursor-pointer rounded-full bg-brand-ink px-4 py-1.5 text-sm font-medium text-brand-cream"
          >
            {isLast ? "Listo" : "Siguiente"}
          </button>
        </div>

        <p className="text-xs opacity-60">
          ¿Ya la instalaste? Ábrela desde el ícono de tu pantalla de inicio. Si estás en una pestaña privada, el
          navegador no permite instalar.
        </p>
      </div>
    </div>
  );
}
