import Image from "next/image";
import Link from "next/link";
import { requireAdminUser } from "@/lib/admin/auth";
import { getMenuAdmin, type ProductAdminRow } from "@/lib/admin/data";
import { moveProductAction, setProductFlagAction } from "@/lib/admin/menu-actions";
import { productPriceLabel } from "@/lib/money";
import { getMenuPhotoUrl } from "@/lib/storage";
import { primaryButtonClass, smallButtonClass } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  await requireAdminUser();
  const categories = await getMenuAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-brand-ink/70">
          <strong className="font-semibold text-brand-ink">Agotado</strong> se sigue viendo en el menú pero no se puede
          pedir. <strong className="font-semibold text-brand-ink">Oculto</strong> no aparece. Los cambios se ven en el
          sitio al momento.
        </p>
        <Link href="/admin/menu/producto/nuevo" className={primaryButtonClass}>
          + Nuevo producto
        </Link>
      </div>

      {categories.map((category) => (
        <section key={category.id} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">
              {category.name}
              {!category.active && (
                <span className="ml-2 rounded-full bg-brand-stone/30 px-2 py-0.5 align-middle font-sans text-xs font-medium">
                  Categoría oculta
                </span>
              )}
            </h2>
            <Link
              href={`/admin/menu/producto/nuevo?categoria=${category.id}`}
              className="text-sm font-medium text-brand-accent underline-offset-4 hover:underline"
            >
              + Agregar a {category.name}
            </Link>
          </div>
          {category.products.length === 0 ? (
            <p className="rounded-[14px] border border-dashed border-brand-border p-4 text-sm text-brand-ink/60">
              Sin productos todavía.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-brand-border overflow-hidden rounded-[14px] border border-brand-border bg-brand-sand/40">
              {category.products.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isFirst={index === 0}
                  isLast={index === category.products.length - 1}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function ProductRow({ product, isFirst, isLast }: { product: ProductAdminRow; isFirst: boolean; isLast: boolean }) {
  const photoUrl = getMenuPhotoUrl(product.photo_path);
  const dimmed = !product.active || !product.is_available;

  return (
    <li id={`producto-${product.id}`} className="flex scroll-mt-24 flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
      <div className="flex shrink-0 flex-col gap-1">
        <form action={moveProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="direction" value="up" />
          <button type="submit" disabled={isFirst} aria-label={`Subir ${product.name}`} className={`${smallButtonClass} px-2`}>
            ↑
          </button>
        </form>
        <form action={moveProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="direction" value="down" />
          <button type="submit" disabled={isLast} aria-label={`Bajar ${product.name}`} className={`${smallButtonClass} px-2`}>
            ↓
          </button>
        </form>
      </div>

      <Link href={`/admin/menu/producto/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-brand-kraft ${dimmed ? "opacity-50" : ""}`}>
          {photoUrl ? (
            <Image src={photoUrl} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-brand-ink/50">Sin foto</span>
          )}
        </div>
        <div className="min-w-0">
          <p className={`truncate font-semibold ${dimmed ? "text-brand-ink/60" : ""}`}>{product.name}</p>
          <p className="text-sm tabular-nums text-brand-ink/70">{productPriceLabel(product)}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {!product.active && <Badge>Oculto</Badge>}
            {product.active && !product.is_available && <Badge strong>Agotado</Badge>}
            {product.show_on_landing && <Badge>En portada</Badge>}
            {product.is_sample && <Badge>Ejemplo</Badge>}
          </div>
        </div>
      </Link>

      <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
        <FlagButton product={product} flag="is_available" />
        <FlagButton product={product} flag="active" />
        <Link href={`/admin/menu/producto/${product.id}`} className={smallButtonClass}>
          Editar
        </Link>
      </div>
    </li>
  );
}

/** Cambio rápido de agotado / visible sin entrar al producto. */
function FlagButton({ product, flag }: { product: ProductAdminRow; flag: "is_available" | "active" }) {
  const current = product[flag];
  const label =
    flag === "is_available" ? (current ? "Marcar agotado" : "Ya hay") : current ? "Ocultar" : "Mostrar";
  return (
    <form action={setProductFlagAction}>
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="value" value={String(!current)} />
      <input type="hidden" name="return_to" value={`/admin/menu#producto-${product.id}`} />
      <button
        type="submit"
        className={`${smallButtonClass} ${
          flag === "is_available" && !current ? "border-brand-ink bg-brand-ink text-brand-cream hover:bg-brand-ink" : ""
        }`}
      >
        {label}
      </button>
    </form>
  );
}

function Badge({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        strong ? "bg-brand-ink text-brand-cream" : "border border-brand-border text-brand-ink/70"
      }`}
    >
      {children}
    </span>
  );
}
