import Link from "next/link";
import { requireAdminUser } from "@/lib/admin/auth";
import { getCategoriesAdmin, getExtraGroupsAdmin } from "@/lib/admin/data";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage({ searchParams }: PageProps<"/admin/menu/producto/nuevo">) {
  await requireAdminUser();
  const [{ categoria }, categories, extraGroups] = await Promise.all([searchParams, getCategoriesAdmin(), getExtraGroupsAdmin()]);
  const defaultCategoryId = typeof categoria === "string" && categories.some((c) => c.id === categoria) ? categoria : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link href="/admin/menu" className="text-sm text-brand-ink/70 underline-offset-4 hover:underline">
          ← Productos
        </Link>
        <h2 className="mt-1 font-display text-2xl font-semibold">Nuevo producto</h2>
        <p className="mt-1 text-sm text-brand-ink/70">La foto se sube después de crearlo.</p>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm">
          Primero crea una categoría en{" "}
          <Link href="/admin/menu/categorias" className="underline">
            Categorías
          </Link>
          .
        </p>
      ) : (
        <ProductForm product={null} categories={categories} extraGroups={extraGroups} defaultCategoryId={defaultCategoryId} />
      )}
    </div>
  );
}
