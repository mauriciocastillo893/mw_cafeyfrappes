"use client";

import { describeNextOpening, getNextOpening } from "@/lib/menu";
import type { TimeFormat } from "@/lib/time-format";
import { isOpenAt, type WeeklyHour } from "@/lib/weekly-hours";
import { useMinuteClock } from "./menu/client-state";

/**
 * "Abierto ahora" / "Cerrado · abrimos mañana a las 7:00 p. m.", calculado
 * en el navegador: la portada es estática (ISR) y la hora del render
 * podría ser de hace rato.
 */
export function OpenStatus({
  hours,
  timeFormat,
  serverNow,
  className = "",
}: {
  hours: WeeklyHour[];
  timeFormat: TimeFormat;
  serverNow: number;
  className?: string;
}) {
  const now = new Date(useMinuteClock(serverNow));
  const open = isOpenAt(hours, now);
  const next = open ? null : getNextOpening(hours, now);

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${open ? "bg-green-500" : "bg-brand-stone"}`} />
      {open ? "Abierto ahora" : next ? `Cerrado · abrimos ${describeNextOpening(next, timeFormat)}` : "Cerrado"}
    </span>
  );
}
