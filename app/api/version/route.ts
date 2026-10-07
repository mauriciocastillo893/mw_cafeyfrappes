// Versión publicada del sitio (`NEXT_PUBLIC_BUILD_ID`, fijada en
// next.config.ts al compilar). `app/AppUpdateBanner.tsx` la compara con la
// versión con la que se cargó la página para avisar "hay una versión nueva".
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { version: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
