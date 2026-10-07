/**
 * Switch estilizado en vez del checkbox nativo (pedido del usuario
 * 2026-09-30: "se miran simples"). Es un `<input type="checkbox">` real
 * (sigue funcionando dentro de un `<form action={...}>` normal, sin
 * JavaScript de cliente) escondido con `peer` + un `<span>` pintado a
 * mano con clases `peer-checked:` — no necesita ser un componente de
 * cliente en el caso simple (`defaultChecked`, sin controlar).
 *
 * Cuando una vista previa en vivo necesita reaccionar al toggle (ej.
 * `ServiceEditor`, "Mostrar precio"), se pasa `checked` + `onChange`
 * para volverlo controlado — sigue siendo un checkbox normal dentro del
 * `<form>`, solo que ahora el estado vive afuera.
 */
export function Toggle({
  name,
  label,
  defaultChecked,
  checked,
  onChange,
}: {
  name: string;
  label: React.ReactNode;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const checkboxProps =
    checked !== undefined
      ? { checked, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.checked) }
      : { defaultChecked };

  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm select-none">
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input type="checkbox" name={name} className="peer sr-only" {...checkboxProps} />
        <span className="absolute inset-0 rounded-full bg-brand-border transition-colors peer-checked:bg-brand-primary peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary/50" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label}
    </label>
  );
}
