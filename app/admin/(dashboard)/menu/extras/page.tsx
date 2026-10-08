import { requireAdminUser } from "@/lib/admin/auth";
import { getExtraGroupsAdmin, type ExtraRow } from "@/lib/admin/data";
import {
  deleteExtraAction,
  deleteExtraGroupAction,
  moveExtraAction,
  saveExtraAction,
  saveExtraGroupAction,
} from "@/lib/admin/menu-actions";
import { EXTRA_NAME_MAX } from "@/lib/admin/menu-form";
import { extraGroupHint } from "@/lib/item-price";
import { ConfirmSubmit } from "../../ConfirmSubmit";
import { Toggle } from "../../Toggle";
import { cardClass, dangerLinkClass, hintClass, inputClass, labelClass, primaryButtonClass, smallButtonClass } from "../../ui";

export const dynamic = "force-dynamic";

function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

export default async function AdminExtrasPage() {
  await requireAdminUser();
  const groups = await getExtraGroupsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-xl text-sm text-brand-ink/70">
        Un grupo (por ejemplo &quot;Toppings de waffle&quot;) se asigna a los productos desde cada producto. Mínimo 0 =
        opcional; máximo vacío = sin límite.
      </p>

      {groups.map((group) => (
        <section key={group.id} id={`grupo-${group.id}`} className={`${cardClass} flex scroll-mt-24 flex-col gap-4`}>
          <form action={saveExtraGroupAction} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
            <input type="hidden" name="id" value={group.id} />
            <label className={labelClass}>
              Grupo
              <input name="name" required maxLength={EXTRA_NAME_MAX} defaultValue={group.name} className={inputClass} />
            </label>
            <label className={labelClass}>
              Mínimo
              <input name="min_select" inputMode="numeric" defaultValue={group.min_select} className={inputClass} />
            </label>
            <label className={labelClass}>
              Máximo
              <input name="max_select" inputMode="numeric" defaultValue={group.max_select ?? ""} placeholder="Sin límite" className={inputClass} />
            </label>
            <button type="submit" className={smallButtonClass}>
              Guardar
            </button>
          </form>
          <p className={hintClass}>
            El cliente ve: &quot;{extraGroupHint(group.min_select, group.max_select)}&quot; · Lo usan {group.productCount}{" "}
            {group.productCount === 1 ? "producto" : "productos"}.
          </p>

          <ul className="flex flex-col divide-y divide-brand-border rounded-[10px] border border-brand-border bg-brand-cream">
            {group.extras.map((extra, index) => (
              <ExtraRowItem key={extra.id} extra={extra} isFirst={index === 0} isLast={index === group.extras.length - 1} />
            ))}
            <li className="p-3">
              <form action={saveExtraAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="group_id" value={group.id} />
                <input type="hidden" name="is_available" value="on" />
                <input
                  name="name"
                  required
                  maxLength={EXTRA_NAME_MAX}
                  placeholder="Nuevo extra"
                  aria-label={`Nuevo extra en ${group.name}`}
                  className={`${inputClass} min-w-40 flex-1`}
                />
                <PriceInput name="price" defaultValue="" label={`Precio del nuevo extra en ${group.name}`} />
                <button type="submit" className={smallButtonClass}>
                  Agregar
                </button>
              </form>
            </li>
          </ul>

          <form action={deleteExtraGroupAction} className="self-start">
            <input type="hidden" name="id" value={group.id} />
            <ConfirmSubmit
              message={`¿Borrar el grupo "${group.name}" con sus ${group.extras.length} extras? Se quita de ${group.productCount} productos.`}
              className={dangerLinkClass}
            >
              Borrar grupo
            </ConfirmSubmit>
          </form>
        </section>
      ))}

      <form action={saveExtraGroupAction} className={`${cardClass} grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end`}>
        <label className={labelClass}>
          Nuevo grupo
          <input name="name" required maxLength={EXTRA_NAME_MAX} placeholder="Ej. Tipo de leche" className={inputClass} />
        </label>
        <label className={labelClass}>
          Mínimo
          <input name="min_select" inputMode="numeric" defaultValue="0" className={inputClass} />
        </label>
        <label className={labelClass}>
          Máximo
          <input name="max_select" inputMode="numeric" placeholder="Sin límite" className={inputClass} />
        </label>
        <button type="submit" className={primaryButtonClass}>
          Crear
        </button>
      </form>
    </div>
  );
}

function ExtraRowItem({ extra, isFirst, isLast }: { extra: ExtraRow; isFirst: boolean; isLast: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-2 p-3">
      <div className="flex gap-1">
        {(["up", "down"] as const).map((direction) => (
          <form key={direction} action={moveExtraAction}>
            <input type="hidden" name="id" value={extra.id} />
            <input type="hidden" name="group_id" value={extra.group_id} />
            <input type="hidden" name="direction" value={direction} />
            <button
              type="submit"
              disabled={direction === "up" ? isFirst : isLast}
              aria-label={`${direction === "up" ? "Subir" : "Bajar"} ${extra.name}`}
              className={`${smallButtonClass} px-2`}
            >
              {direction === "up" ? "↑" : "↓"}
            </button>
          </form>
        ))}
      </div>
      <form action={saveExtraAction} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={extra.id} />
        <input
          name="name"
          required
          maxLength={EXTRA_NAME_MAX}
          defaultValue={extra.name}
          aria-label="Nombre del extra"
          className={`${inputClass} min-w-36 flex-1`}
        />
        <PriceInput name="price" defaultValue={centsToInput(extra.price_cents)} label={`Precio de ${extra.name}`} />
        <Toggle name="is_available" label="Hay" defaultChecked={extra.is_available} />
        <button type="submit" className={smallButtonClass}>
          Guardar
        </button>
      </form>
      <form action={deleteExtraAction}>
        <input type="hidden" name="id" value={extra.id} />
        <ConfirmSubmit message={`¿Borrar "${extra.name}"?`} className={dangerLinkClass}>
          Borrar
        </ConfirmSubmit>
      </form>
    </li>
  );
}

function PriceInput({ name, defaultValue, label }: { name: string; defaultValue: string; label: string }) {
  return (
    <span className="relative w-24">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-ink/60">$</span>
      <input name={name} inputMode="decimal" defaultValue={defaultValue} placeholder="0" aria-label={label} className={`${inputClass} pl-7`} />
    </span>
  );
}
