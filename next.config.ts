import type { NextConfig } from "next";

// Derivado de la variable de entorno (no fijo) para que clonar el
// proyecto a otro cliente no requiera tocar este archivo (ver
// docs/clonar-para-otro-cliente.md).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// Identifica la versión publicada: la página la lleva "pegada" al compilarse y
// `/api/version` devuelve la misma; si difieren, hay una versión nueva
// (`app/AppUpdateBanner.tsx`). En Vercel cambia con cada despliegue.
const buildId =
  process.env.NODE_ENV === "production"
    ? (process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "local")
    : "dev";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
  // Next.js 16 le agrega automáticamente a CLAUDE.md un bloque de avisos
  // para agentes de IA en cada `next dev`. CLAUDE.md de este proyecto es
  // un documento de reglas de negocio mantenido a mano (regla 0 de
  // CLAUDE.md) — no queremos que una herramienta lo reescriba solo.
  agentRules: false,
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
