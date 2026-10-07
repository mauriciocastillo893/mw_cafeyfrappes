/**
 * Da de alta una cuenta de /admin: crea el usuario en Supabase Auth con
 * una contraseña temporal y lo agrega a `admin_users`. No hay registro
 * público a propósito (CLAUDE.md sección 7).
 *
 * Uso (lee NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de .env.local):
 *   node --env-file=.env.local scripts/create-admin.mjs correo@ejemplo.com
 *
 * La contraseña temporal se imprime una sola vez en la terminal: compártela
 * por un canal privado y pide que la cambien. Si el correo ya existe en
 * Auth, solo lo agrega a admin_users (sin cambiar su contraseña).
 */

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Uso: node --env-file=.env.local scripts/create-admin.mjs correo@ejemplo.com");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function findUserByEmail(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUserByEmail(email);
let tempPassword = null;

if (!user) {
  tempPassword = randomBytes(9).toString("base64url");
  const { data, error } = await supabase.auth.admin.createUser({ email, password: tempPassword, email_confirm: true });
  if (error) {
    console.error("No se pudo crear el usuario:", error.message);
    process.exit(1);
  }
  user = data.user;
}

const { error: insertError } = await supabase.from("admin_users").upsert({ user_id: user.id });
if (insertError) {
  console.error("No se pudo agregar a admin_users:", insertError.message);
  process.exit(1);
}

console.log(`Listo: ${email} tiene acceso a /admin.`);
if (tempPassword) console.log(`Contraseña temporal (se muestra solo esta vez): ${tempPassword}`);
else console.log("La cuenta ya existía; se conservó su contraseña.");
