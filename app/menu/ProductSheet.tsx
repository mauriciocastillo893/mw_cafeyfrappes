"use client";

import { useEffect, useRef, useState } from "react";
import { computeItemPrice, extraGroupHint, type PricedExtraGroup } from "@/lib/item-price";
import { formatMXN } from "@/lib/money";
import { ProductPhoto, TagList } from "./ProductBits";
import type { MenuProductView } from "./types";

/**
 * Detalle de un producto: hoja que sube desde abajo en el celular y
 * ventana centrada en pantallas grandes (`<dialog>` nativo: Esc, foco y
 * fondo inerte gratis). El cliente elige tamaño y extras y ve el total;
 * el botón de agregar al pedido llega en la Fase 5.
 */
export function ProductSheet({ product, onClose }: { product: MenuProductView; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sizeId, setSizeId] = useState<string | null>(product.product_sizes[0]?.id ?? null);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const soldOut = !product.is_available;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const toggleExtra = (group: PricedExtraGroup, extraId: string) => {
    setExtraIds((previous) => {
      if (previous.includes(extraId)) return previous.filter((id) => id !== extraId);
      const inGroup = previous.filter((id) => group.extras.some((extra) => extra.id === id));
      // Grupo de "elige 1": la nueva opción reemplaza a la anterior.
      if (group.max_select === 1) return [...previous.filter((id) => !inGroup.includes(id)), extraId];
      if (group.max_select !== null && inGroup.length >= group.max_select) return previous;
      return [...previous, extraId];
    });
  };

  const sizePrice = product.product_sizes.find((s) => s.id === sizeId)?.price_cents ?? product.base_price_cents;
  const extrasPrice = product.extra_groups
    .flatMap((group) => group.extras)
    .filter((extra) => extraIds.includes(extra.id))
    .reduce((sum, extra) => sum + extra.price_cents, 0);
  const result = computeItemPrice(product, { sizeId, extraIds });
  const missingGroup = !result.ok && result.reason === "group_min" ? result.groupName : null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Clic en el fondo oscuro (fuera de la hoja) cierra.
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
      aria-labelledby="product-sheet-title"
      className="mx-0 mb-0 mt-auto h-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[22px] bg-brand-cream p-0 text-brand-ink backdrop:bg-black/55 sm:m-auto sm:max-h-[88dvh] sm:max-w-lg sm:rounded-[22px]"
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="overflow-y-auto overscroll-contain">
          <div className="relative">
            <ProductPhoto product={product} className={`aspect-[4/3] w-full ${soldOut ? "opacity-60 grayscale" : ""}`} sizes="(min-width: 640px) 512px, 100vw" />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream/90 text-brand-ink shadow-sm"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-5 px-5 pb-6 pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <h2 id="product-sheet-title" className="font-display text-2xl font-bold leading-tight">
                  {product.name}
                </h2>
                <span className="shrink-0 pt-1 font-semibold tabular-nums text-brand-accent">{product.priceLabel}</span>
              </div>
              {product.description && <p className="text-sm text-brand-ink/75">{product.description}</p>}
              <TagList tags={product.tags} soldOut={soldOut} />
            </div>

            {!soldOut && product.product_sizes.length > 0 && (
              <fieldset>
                <legend className="text-sm font-semibold">Tamaño</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.product_sizes.map((size) => (
                    <label
                      key={size.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-accent ${
                        sizeId === size.id ? "border-brand-ink bg-brand-ink text-brand-cream" : "border-brand-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.id}
                        checked={sizeId === size.id}
                        onChange={() => setSizeId(size.id)}
                        className="sr-only"
                      />
                      <span className="font-medium">{size.name}</span>
                      <span className="tabular-nums opacity-80">{formatMXN(size.price_cents)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {!soldOut &&
              product.extra_groups.map((group) => {
                const chosen = group.extras.filter((extra) => extraIds.includes(extra.id)).length;
                const full = group.max_select !== null && group.max_select > 1 && chosen >= group.max_select;
                return (
                  <fieldset key={group.id}>
                    <legend className="flex w-full items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold">{group.name}</span>
                      <span className="text-xs text-brand-ink/65">{extraGroupHint(group.min_select, group.max_select)}</span>
                    </legend>
                    <ul className="mt-2 divide-y divide-brand-border rounded-[14px] border border-brand-border">
                      {group.extras.map((extra) => {
                        const checked = extraIds.includes(extra.id);
                        const disabled = !extra.is_available || (!checked && full);
                        return (
                          <li key={extra.id}>
                            <label
                              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm ${disabled ? "opacity-50" : "cursor-pointer"}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggleExtra(group, extra.id)}
                                className="h-4 w-4 accent-[var(--brand-accent)]"
                              />
                              <span className="flex-1">
                                {extra.name}
                                {!extra.is_available && <span className="text-brand-ink/60"> · agotado</span>}
                              </span>
                              <span className="tabular-nums text-brand-ink/75">
                                {extra.price_cents > 0 ? `+${formatMXN(extra.price_cents)}` : "Sin costo"}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </fieldset>
                );
              })}
          </div>
        </div>

        <div className="border-t border-brand-border bg-brand-cream px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3">
          {soldOut ? (
            <p className="py-2 text-center text-sm font-semibold text-brand-ink/70">Agotado por ahora</p>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-brand-ink/65">{missingGroup ? `Falta elegir: ${missingGroup}` : "Total"}</p>
                <p className="text-xl font-bold tabular-nums">{formatMXN(sizePrice + extrasPrice)}</p>
              </div>
              <p className="max-w-[12rem] text-right text-xs text-brand-ink/65">Muy pronto vas a poder pedir desde aquí.</p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
