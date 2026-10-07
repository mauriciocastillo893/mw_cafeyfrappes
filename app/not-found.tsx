import Link from "next/link";
import { business } from "@/lib/config/business";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-cream px-5 text-center text-brand-ink">
      <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-60">{business.name}</p>
      <h1 className="text-3xl font-medium">No encontramos esta página</h1>
      <Link href="/" className="mt-2 rounded-[20px] border border-brand-ink bg-brand-ink px-5 py-[10px] text-sm font-medium text-brand-cream">
        Volver al inicio
      </Link>
    </main>
  );
}
