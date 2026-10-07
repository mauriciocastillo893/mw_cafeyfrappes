/**
 * Cron diario de Vercel (`vercel.json`; Hobby permite uno solo). Por ahora
 * solo toca la base para que Supabase Free no se pause tras 7 días sin
 * actividad. Aquí se irán juntando las tareas diarias: renovar el token
 * de Instagram (Fase 7), limpiar carritos viejos, etc.
 */

import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/config/business";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await getServiceSupabase().from("business_settings").select("id").eq("id", 1).single();
  if (error) {
    console.error("[cron] keep-alive falló", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
