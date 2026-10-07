import { business } from "@/lib/config/business";

/**
 * Cómo contactar al responsable en las páginas legales. Mientras no
 * tengamos el correo del negocio (P1), el contacto es el WhatsApp.
 */
export function LegalContact() {
  if (business.legalContactEmail) {
    return <>el correo {business.legalContactEmail}</>;
  }
  return (
    <>
      el WhatsApp del negocio,{" "}
      <a href={`https://wa.me/52${business.legalContactWhatsapp.replace(/\D/g, "")}`} className="underline">
        {business.legalContactWhatsapp}
      </a>
    </>
  );
}
