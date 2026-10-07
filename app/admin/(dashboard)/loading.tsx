/**
 * Skeleton genérico para cualquier página de `/admin` mientras carga sus
 * datos (pedido del usuario 2026-10-01: antes no había nada aquí, así
 * que cambiar de sección en el menú se sentía "congelado" unos segundos
 * sin ningún aviso). Vive dentro de `<main>` del layout del panel, así
 * que el encabezado y el menú se quedan fijos — solo el contenido
 * parpadea mientras carga.
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-48 animate-pulse rounded-md bg-brand-sand" />
      <div className="flex flex-col gap-3">
        <div className="h-24 w-full animate-pulse rounded-[10px] bg-brand-sand" />
        <div className="h-24 w-full animate-pulse rounded-[10px] bg-brand-sand" />
        <div className="h-24 w-full animate-pulse rounded-[10px] bg-brand-sand" />
      </div>
    </div>
  );
}
