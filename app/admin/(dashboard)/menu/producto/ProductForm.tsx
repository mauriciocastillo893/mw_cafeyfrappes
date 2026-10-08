"use client";

import { useState } from "react";
import type { CategoryRow, ExtraGroupAdmin, ProductAdminRow } from "@/lib/admin/data";
import { saveProductAction } from "@/lib/admin/menu-actions";
import { MAX_SIZES, PRODUCT_DESCRIPTION_MAX, PRODUCT_NAME_MAX, SIZE_NAME_MAX } from "@/lib/admin/menu-form";
import { extraGroupHint } from "@/lib/item-price";
import { formatMXN } from "@/lib/money";
import { Toggle } from "../../Toggle";
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, smallButtonClass } from "../../ui";

/** Centavos → texto del campo de precio ("65" o "65.50"). */
function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

interface SizeDraft {
  key: number;
  name: string;
  price: string;
}

export function ProductForm({
  product,
  categories,
  extraGroups,
  defaultCategoryId,
}: {
  product: ProductAdminRow | null;
  categories: CategoryRow[];
  extraGroups: ExtraGroupAdmin[];
  defaultCategoryId: string | null;
}) {
  const [sizes, setSizes] = useState<SizeDraft[]>(
    (product?.product_sizes ?? []).map((size, index) => ({ key: index, name: size.name, price: centsToInput(size.price_cents) }))
  );
  const [nextKey, setNextKey] = useState(sizes.length);
  const temperature = product?.tags.includes("frio") ? "frio" : product?.tags.includes("caliente") ? "caliente" : "";

  const addSize = () => {
    setSizes((current) => [...current, { key: nextKey, name: "", price: "" }]);
    setNextKey((key) => key + 1);
  };

  return (
    <form action={saveProductAction} className="flex flex-col gap-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className={`${cardClass} grid gap-4 sm:grid-cols-2`}>
        <label className={`${labelClass} sm:col-span-2`}>
          Nombre
          <input name="name" required maxLength={PRODUCT_NAME_MAX} defaultValue={product?.name} className={inputClass} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Descripción <span className={hintClass}>Opcional. Lo que lleva, en una o dos líneas.</span>
          <textarea
            name="description"
            rows={2}
            maxLength={PRODUCT_DESCRIPTION_MAX}
            defaultValue={product?.description ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Categoría
          <select
            name="category_id"
            required
            defaultValue={product?.category_id ?? defaultCategoryId ?? categories[0]?.id}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.active ? "" : " (oculta)"}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Precio
          <span className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/60">$</span>
            <input
              name="base_price"
              inputMode="decimal"
              disabled={sizes.length > 0}
              required={sizes.length === 0}
              defaultValue={product ? centsToInput(product.base_price_cents) : ""}
              placeholder={sizes.length > 0 ? "Por tamaño" : "65"}
              className={`${inputClass} pl-7 disabled:opacity-50`}
            />
          </span>
          {sizes.length > 0 && <span className={hintClass}>Con tamaños, cada uno lleva su propio precio.</span>}
        </label>
      </div>

      <fieldset className={`${cardClass} flex flex-col gap-3`}>
        <legend className="sr-only">Tamaños</legend>
        <div>
          <p className="text-sm font-semibold">Tamaños</p>
          <p className={hintClass}>Opcional. Escribe el precio completo de cada tamaño (no la diferencia).</p>
        </div>
        {sizes.map((size, index) => (
          <div key={size.key} className="flex items-center gap-2">
            <input
              name="size_name"
              aria-label={`Nombre del tamaño ${index + 1}`}
              placeholder="16 oz"
              maxLength={SIZE_NAME_MAX}
              value={size.name}
              onChange={(e) => setSizes((all) => all.map((s) => (s.key === size.key ? { ...s, name: e.target.value } : s)))}
              className={`${inputClass} flex-1`}
              required
            />
            <span className="relative w-32">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/60">$</span>
              <input
                name="size_price"
                aria-label={`Precio del tamaño ${index + 1}`}
                inputMode="decimal"
                placeholder="70"
                value={size.price}
                onChange={(e) => setSizes((all) => all.map((s) => (s.key === size.key ? { ...s, price: e.target.value } : s)))}
                className={`${inputClass} pl-7`}
                required
              />
            </span>
            <button
              type="button"
              onClick={() => setSizes((all) => all.filter((s) => s.key !== size.key))}
              aria-label={`Quitar tamaño ${size.name || index + 1}`}
              className={smallButtonClass}
            >
              Quitar
            </button>
          </div>
        ))}
        {sizes.length < MAX_SIZES && (
          <button type="button" onClick={addSize} className={`${smallButtonClass} self-start`}>
            + Agregar tamaño
          </button>
        )}
      </fieldset>

      <fieldset className={`${cardClass} flex flex-col gap-3`}>
        <legend className="sr-only">Extras</legend>
        <div>
          <p className="text-sm font-semibold">Extras que se le pueden agregar</p>
          <p className={hintClass}>Los grupos y sus precios se editan en la pestaña Extras.</p>
        </div>
        {extraGroups.length === 0 ? (
          <p className="text-sm text-brand-ink/60">Todavía no hay grupos de extras.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {extraGroups.map((group) => (
              <label
                key={group.id}
                className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-brand-border bg-brand-cream p-3 text-sm has-[:checked]:border-brand-accent"
              >
                <input
                  type="checkbox"
                  name="extra_group_ids"
                  value={group.id}
                  defaultChecked={product?.extraGroupIds.includes(group.id)}
                  className="mt-0.5 h-4 w-4 accent-[var(--brand-accent)]"
                />
                <span className="min-w-0">
                  <span className="font-medium">{group.name}</span>
                  <span className="block text-xs text-brand-ink/60">
                    {extraGroupHint(group.min_select, group.max_select)} ·{" "}
                    {group.extras.length === 0
                      ? "sin extras"
                      : group.extras
                          .slice(0, 4)
                          .map((extra) => `${extra.name} ${extra.price_cents > 0 ? formatMXN(extra.price_cents) : ""}`.trim())
                          .join(", ") + (group.extras.length > 4 ? "…" : "")}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className={`${cardClass} grid gap-4 sm:grid-cols-2`}>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">Temperatura</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "No aplica" },
              { value: "frio", label: "Frío" },
              { value: "caliente", label: "Caliente" },
            ].map((option) => (
              <label
                key={option.value}
                className="cursor-pointer rounded-full border border-brand-border px-3 py-1.5 text-sm has-[:checked]:border-brand-ink has-[:checked]:bg-brand-ink has-[:checked]:text-brand-cream"
              >
                <input type="radio" name="tags" value={option.value} defaultChecked={temperature === option.value} className="sr-only" />
                {option.label}
              </label>
            ))}
          </div>
          <span className={hintClass}>Para el filtro Frío / Caliente del menú.</span>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">Etiquetas</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "nuevo", label: "Nuevo" },
              { value: "favorito", label: "Favorito" },
            ].map((option) => (
              <label
                key={option.value}
                className="cursor-pointer rounded-full border border-brand-border px-3 py-1.5 text-sm has-[:checked]:border-brand-ink has-[:checked]:bg-brand-ink has-[:checked]:text-brand-cream"
              >
                <input
                  type="checkbox"
                  name="tags"
                  value={option.value}
                  defaultChecked={product?.tags.includes(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={`${cardClass} flex flex-col gap-3`}>
        <Toggle name="active" label="Se muestra en el menú" defaultChecked={product?.active ?? true} />
        <Toggle name="is_available" label="Hay existencia (si lo apagas, aparece como agotado)" defaultChecked={product?.is_available ?? true} />
        <Toggle name="show_on_landing" label="Mostrar en los favoritos de la portada" defaultChecked={product?.show_on_landing ?? false} />
      </div>

      <div className="sticky bottom-24 z-10 flex justify-end sm:bottom-4">
        <button type="submit" className={`${primaryButtonClass} px-6 py-2.5 shadow-lg`}>
          {product ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}
