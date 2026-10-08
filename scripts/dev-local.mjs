/**
 * `pnpm dev` contra el Supabase LOCAL (Docker), sin tocar `.env.local`
 * (que puede tener las llaves de producción). Lee URL y llaves de
 * `supabase status` y se las pasa a `next dev`; las variables del
 * proceso le ganan a `.env.local`.
 *
 *   pnpm exec supabase start
 *   node scripts/dev-local.mjs
 */

import { execSync, spawn } from "node:child_process";

const status = execSync("pnpm exec supabase status -o env", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const vars = Object.fromEntries(
  status
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2]])
);

if (!vars.API_URL || !vars.ANON_KEY || !vars.SERVICE_ROLE_KEY) {
  console.error("No encontré Supabase local. Corre primero: pnpm exec supabase start");
  process.exit(1);
}

const child = spawn("pnpm", ["exec", "next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: vars.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: vars.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: vars.SERVICE_ROLE_KEY,
  },
});
child.on("exit", (code) => process.exit(code ?? 0));
