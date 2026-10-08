import type { NextConfig } from "next";

// Derivado de la variable de entorno (no fijo) para que clonar el
// proyecto a otro cliente no requiera tocar este archivo (ver
// docs/clonar-para-otro-cliente.md).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : undefined;
// Supabase local (`scripts/dev-local.mjs`) sirve Storage por http en 127.0.0.1.
const isLocalSupabase = supabaseUrl?.hostname === "127.0.0.1" || supabaseUrl?.hostname === "localhost";

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
  experimental: {
    // Fotos del menú desde /admin. El navegador ya las reduce (~0.5 MB);
    // esto es el tope por si llega una más grande. Vercel corta en 4.5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol === "http:" ? "http" : "https",
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Solo en desarrollo con Supabase local; en producción sigue bloqueado.
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
};

export default nextConfig;
