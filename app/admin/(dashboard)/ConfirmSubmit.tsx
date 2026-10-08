"use client";

/**
 * Botón de enviar que pregunta antes ("¿Borrar…?"). Si Franco cancela, se
 * evita el envío desde el clic, así que `SubmitOverlay` ni se entera.
 */
export function ConfirmSubmit({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
