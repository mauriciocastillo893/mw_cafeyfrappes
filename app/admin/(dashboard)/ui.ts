/** Clases compartidas de los formularios del panel (mismo look en todas las secciones). */

export const inputClass =
  "w-full rounded-[10px] border border-brand-border bg-brand-cream px-3 py-2 text-base text-brand-ink placeholder:text-brand-stone focus:border-brand-accent focus:outline-none sm:text-sm";

export const labelClass = "flex flex-col gap-1.5 text-sm font-medium";

export const hintClass = "text-xs font-normal text-brand-ink/60";

export const cardClass = "rounded-[14px] border border-brand-border bg-brand-sand/50 p-4";

export const primaryButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-ink/25 px-4 py-2 text-sm font-semibold transition-colors hover:bg-brand-sand";

export const smallButtonClass =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-brand-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-brand-sand disabled:cursor-not-allowed disabled:opacity-40";

export const dangerLinkClass = "cursor-pointer text-xs font-medium text-red-700 underline-offset-4 hover:underline dark:text-red-400";
