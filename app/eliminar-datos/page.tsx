import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/lib/config/business";
import { LegalContact } from "../LegalContact";

export const metadata: Metadata = {
  title: `Eliminar mis datos — ${business.name}`,
};

export default function DeleteDataPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-foreground">
      <h1 className="font-display text-3xl font-semibold">Eliminar mis datos</h1>
      <p className="mt-1 text-sm opacity-70">Última actualización: 6 de octubre de 2026</p>

      <p className="mt-6 text-sm leading-relaxed">
        Puede pedir que eliminemos los datos personales que nos dio al hacer un pedido en cualquier momento. Es el
        derecho de Cancelación descrito en el{" "}
        <Link href="/privacidad" className="underline">
          Aviso de Privacidad
        </Link>
        .
      </p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="font-semibold">Cómo solicitarlo</h2>
        <p>
          Escríbanos por <LegalContact /> con el mensaje &quot;Eliminación de datos&quot;, indicando:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Su nombre.</li>
          <li>El teléfono con el que hizo su pedido.</li>
        </ul>

        <h2 className="font-semibold">Qué pasa después</h2>
        <p>
          Eliminamos su información (nombre, teléfono, dirección e historial de pedidos) en un plazo máximo de 20 días
          hábiles, salvo lo que debamos conservar por una obligación legal o fiscal.
        </p>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/" className="underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  );
}
