import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/lib/config/business";
import { LegalContact } from "../LegalContact";

export const metadata: Metadata = {
  title: `Términos y condiciones — ${business.name}`,
};

// Borrador hasta confirmar responsable legal, domicilio y correo (P13, P5, P1).
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-foreground">
      <h1 className="font-display text-3xl font-semibold">Términos y condiciones</h1>
      <p className="mt-1 text-sm opacity-70">Última actualización: 6 de octubre de 2026</p>

      <ol className="mt-8 list-none space-y-6 text-sm leading-relaxed">
        <li>
          <h2 className="font-semibold">1. Quién ofrece el servicio</h2>
          <p className="mt-2">
            Este sitio y los productos que se venden en él los ofrece {business.legalResponsibleName}, persona física
            con actividad empresarial, con domicilio en {business.legalAddress}, bajo el nombre comercial &quot;
            {business.name}&quot;, extensión de Mundo Waffle Huatulco.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">2. Menú y precios</h2>
          <p className="mt-2">
            Los precios están en pesos mexicanos e incluyen IVA. Las fotos son ilustrativas. Un producto marcado como
            &quot;agotado&quot; no se puede pedir hasta que vuelva a estar disponible.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">3. Pedidos</h2>
          <p className="mt-2">
            Puede pedir para recoger en el mostrador, en su mesa o a domicilio, para ahora o programado a una hora
            dentro del horario de servicio. Los pedidos a domicilio tienen un monto mínimo, que se indica al pedir. Un
            pedido se considera aceptado cuando el sitio le muestra su número de pedido.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">4. Pago</h2>
          <p className="mt-2">
            Los pedidos a domicilio se pagan en línea con tarjeta, Google Pay o Apple Pay, a través de Stripe. Los
            pedidos para recoger o en mesa se pagan en el local, en efectivo o por transferencia, según las opciones
            que el sitio muestre al pedir.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">5. Cancelaciones y reembolsos</h2>
          <p className="mt-2">
            Si necesita cancelar, contáctenos por <LegalContact /> lo antes posible. Si el pedido ya se pagó en línea y
            aún no se preparaba, le reembolsamos el total al mismo medio de pago.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">6. Propiedad intelectual</h2>
          <p className="mt-2">
            Los textos, fotos, diseño, marca y logotipo &quot;{business.name}&quot; no pueden reproducirse sin
            autorización.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">7. Legislación aplicable</h2>
          <p className="mt-2">
            Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las
            partes se someten a los tribunales competentes de {business.city}, {business.region}.
          </p>
        </li>
        <li>
          <h2 className="font-semibold">8. Contacto</h2>
          <p className="mt-2">
            Para preguntas sobre estos términos, escríbanos por <LegalContact />.
          </p>
        </li>
      </ol>

      <p className="mt-10 text-sm">
        <Link href="/" className="underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  );
}
