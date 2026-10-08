"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { removeLogoAction, uploadLogoAction } from "@/lib/admin/business-actions";
import { ConfirmSubmit } from "../ConfirmSubmit";
import { shrinkImage, submitWithFile } from "../shrink-image";
import { dangerLinkClass, hintClass, secondaryButtonClass } from "../ui";

/** El ícono se usa a 512 px como máximo (pantalla de inicio del celular); PNG para conservar la transparencia. */
const LOGO_SIDE_PX = 512;

export function LogoUploader({ logoUrl }: { logoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      submitWithFile(inputRef.current!, await shrinkImage(file, { maxSide: LOGO_SIDE_PX, type: "image/png" }));
    } catch {
      setError("No pudimos leer esa imagen. Prueba con un PNG o JPG.");
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] border border-brand-border bg-brand-cream">
        <Image src={logoUrl ?? "/brand/icon-192.png"} alt="Ícono actual" fill sizes="80px" className="object-contain" />
      </div>
      <div className="flex flex-col items-start gap-2">
        <form action={uploadLogoAction}>
          <label className={secondaryButtonClass}>
            {logoUrl ? "Cambiar ícono" : "Subir otro ícono"}
            <input ref={inputRef} type="file" name="logo" accept="image/png,image/jpeg,image/webp" onChange={onPick} className="sr-only" />
          </label>
        </form>
        <p className={hintClass}>Cuadrado, de preferencia PNG. Se usa en la pestaña del navegador, al compartir el link y en el panel.</p>
        {error && <p className="text-xs text-red-700 dark:text-red-400">{error}</p>}
        {logoUrl && (
          <form action={removeLogoAction}>
            <ConfirmSubmit message="¿Quitar este ícono y volver al de MW?" className={dangerLinkClass}>
              Volver al ícono de MW
            </ConfirmSubmit>
          </form>
        )}
      </div>
    </div>
  );
}
