import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/auth";
import { getCategoriesAdmin, getExtraGroupsAdmin, getProductAdmin } from "@/lib/admin/data";
import { deleteProductAction } from "@/lib/admin/menu-actions";
import { getMenuPhotoUrl } from "@/lib/storage";
import { ConfirmSubmit } from "../../../ConfirmSubmit";
import { cardClass, dangerLinkClass } from "../../../ui";
import { PhotoUploader } from "../PhotoUploader";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: PageProps<"/admin/menu/producto/[id]">) {
  await requireAdminUser();
  const { id } = await params;
  const [product, categories, extraGroups] = await Promise.all([getProductAdmin(id), getCategoriesAdmin(), getExtraGroupsAdmin()]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/admin/menu#producto-${product.id}`} className="text-sm text-brand-ink/70 underline-offset-4 hover:underline">
            ← Productos
          </Link>
          <h2 className="mt-1 font-display text-2xl font-semibold">{product.name}</h2>
        </div>
        <Link
          href={`/menu?producto=${product.slug}`}
          target="_blank"
          className="text-sm font-medium text-brand-accent underline-offset-4 hover:underline"
        >
          Ver en el menú ↗
        </Link>
      </div>

      {product.is_sample && (
        <p className="rounded-[10px] border border-brand-accent/40 bg-brand-accent-wash p-3 text-sm">
          Este producto es de <strong>ejemplo</strong> (nombre, precio y foto provisionales). Al guardarlo deja de
          marcarse así.
        </p>
      )}

      <section className={cardClass}>
        <h3 className="mb-3 text-sm font-semibold">Foto</h3>
        <PhotoUploader productId={product.id} productName={product.name} photoUrl={getMenuPhotoUrl(product.photo_path)} />
      </section>

      <ProductForm product={product} categories={categories} extraGroups={extraGroups} defaultCategoryId={null} />

      <form action={deleteProductAction} className="flex justify-start border-t border-brand-border pt-4">
        <input type="hidden" name="id" value={product.id} />
        <ConfirmSubmit
          message={`¿Borrar "${product.name}" para siempre? Si solo no hay por hoy, mejor márcalo como agotado.`}
          className={dangerLinkClass}
        >
          Borrar producto
        </ConfirmSubmit>
      </form>
    </div>
  );
}
