import { requireAdminUser } from "@/lib/admin/auth";
import { getMenuAdmin } from "@/lib/admin/data";
import { deleteCategoryAction, moveCategoryAction, saveCategoryAction } from "@/lib/admin/menu-actions";
import { CATEGORY_NAME_MAX } from "@/lib/admin/menu-form";
import { ConfirmSubmit } from "../../ConfirmSubmit";
import { Toggle } from "../../Toggle";
import { cardClass, dangerLinkClass, inputClass, labelClass, primaryButtonClass, smallButtonClass } from "../../ui";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdminUser();
  const categories = await getMenuAdmin();

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-xl text-sm text-brand-ink/70">
        El orden de aquí es el orden del menú. Una categoría oculta esconde todos sus productos.
      </p>

      <ul className="flex flex-col gap-3">
        {categories.map((category, index) => (
          <li key={category.id} className={`${cardClass} flex flex-col gap-3 sm:flex-row sm:items-start`}>
            <div className="flex shrink-0 gap-1 sm:flex-col">
              {(["up", "down"] as const).map((direction) => (
                <form key={direction} action={moveCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <input type="hidden" name="direction" value={direction} />
                  <button
                    type="submit"
                    disabled={direction === "up" ? index === 0 : index === categories.length - 1}
                    aria-label={`${direction === "up" ? "Subir" : "Bajar"} ${category.name}`}
                    className={`${smallButtonClass} px-2`}
                  >
                    {direction === "up" ? "↑" : "↓"}
                  </button>
                </form>
              ))}
            </div>

            <form action={saveCategoryAction} className="grid flex-1 gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={category.id} />
              <label className={labelClass}>
                Nombre
                <input name="name" required maxLength={CATEGORY_NAME_MAX} defaultValue={category.name} className={inputClass} />
              </label>
              <label className={labelClass}>
                Descripción
                <input name="description" defaultValue={category.description ?? ""} className={inputClass} />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                <Toggle name="active" label="Se muestra en el menú" defaultChecked={category.active} />
                <span className="text-xs text-brand-ink/60">
                  {category.products.length} {category.products.length === 1 ? "producto" : "productos"}
                </span>
                <button type="submit" className={smallButtonClass}>
                  Guardar
                </button>
              </div>
            </form>

            {category.products.length === 0 && (
              <form action={deleteCategoryAction} className="self-end sm:self-center">
                <input type="hidden" name="id" value={category.id} />
                <ConfirmSubmit message={`¿Borrar la categoría "${category.name}"?`} className={dangerLinkClass}>
                  Borrar
                </ConfirmSubmit>
              </form>
            )}
          </li>
        ))}
      </ul>

      <form action={saveCategoryAction} className={`${cardClass} grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end`}>
        <input type="hidden" name="active" value="on" />
        <label className={labelClass}>
          Nueva categoría
          <input name="name" required maxLength={CATEGORY_NAME_MAX} placeholder="Ej. Malteadas" className={inputClass} />
        </label>
        <label className={labelClass}>
          Descripción
          <input name="description" placeholder="Opcional" className={inputClass} />
        </label>
        <button type="submit" className={primaryButtonClass}>
          Agregar
        </button>
      </form>
    </div>
  );
}
