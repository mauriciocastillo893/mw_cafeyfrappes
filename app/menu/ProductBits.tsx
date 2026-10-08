import Image from "next/image";
import { MENU_TAG_LABELS, type MenuTag } from "@/lib/menu";
import type { MenuProductView } from "./types";

export function TagList({ tags, soldOut, className = "" }: { tags: string[]; soldOut: boolean; className?: string }) {
  const known = tags.filter((tag): tag is MenuTag => tag in MENU_TAG_LABELS);
  if (!soldOut && known.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {soldOut && (
        <li className="rounded-full bg-brand-ink px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-cream">
          Agotado
        </li>
      )}
      {known.map((tag) => (
        <li
          key={tag}
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            tag === "nuevo" || tag === "favorito" ? "bg-brand-rosa/60 text-brand-ink" : "border border-brand-border text-brand-ink/75"
          }`}
        >
          {MENU_TAG_LABELS[tag]}
        </li>
      ))}
    </ul>
  );
}

/** `decorative`: en la tarjeta el nombre ya está escrito al lado; la foto no se anuncia dos veces. */
export function ProductPhoto({
  product,
  className,
  sizes,
  decorative = false,
}: {
  product: MenuProductView;
  className: string;
  sizes: string;
  decorative?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-brand-kraft ${className}`}>
      {product.photoUrl ? (
        <Image src={product.photoUrl} alt={decorative ? "" : product.name} fill sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-3xl font-bold text-brand-ink/25">
          MW
        </span>
      )}
    </div>
  );
}
