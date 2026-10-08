"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { removeProductPhotoAction, uploadProductPhotoAction } from "@/lib/admin/menu-actions";
import { ConfirmSubmit } from "../../ConfirmSubmit";
import { shrinkImage, submitWithFile } from "../../shrink-image";
import { dangerLinkClass, hintClass, secondaryButtonClass } from "../../ui";

/** Lado más largo de la foto que se guarda: suficiente para el detalle a pantalla completa en celular. */
const MAX_SIDE_PX = 1600;

export function PhotoUploader({ productId, productName, photoUrl }: { productId: string; productName: string; photoUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setWorking(true);
    try {
      submitWithFile(inputRef.current!, await shrinkImage(file, { maxSide: MAX_SIDE_PX, type: "image/jpeg" }));
    } catch {
      setError("No pudimos leer esa imagen. Prueba con una foto JPG o PNG.");
      event.target.value = "";
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-[12px] bg-brand-kraft">
        {photoUrl ? (
          <Image src={photoUrl} alt={productName} fill sizes="160px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-brand-ink/50">Sin foto</span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <form action={uploadProductPhotoAction}>
          <input type="hidden" name="id" value={productId} />
          <label className={`${secondaryButtonClass} ${working ? "pointer-events-none opacity-60" : ""}`}>
            {working ? "Preparando foto…" : photoUrl ? "Cambiar foto" : "Subir foto"}
            <input ref={inputRef} type="file" name="photo" accept="image/*" onChange={onPick} className="sr-only" />
          </label>
        </form>
        <p className={hintClass}>Mejor vertical u horizontal 4:3, con buena luz. Se ajusta sola.</p>
        {error && <p className="text-xs text-red-700 dark:text-red-400">{error}</p>}
        {photoUrl && (
          <form action={removeProductPhotoAction}>
            <input type="hidden" name="id" value={productId} />
            <ConfirmSubmit message="¿Quitar la foto de este producto?" className={dangerLinkClass}>
              Quitar foto
            </ConfirmSubmit>
          </form>
        )}
      </div>
    </div>
  );
}
