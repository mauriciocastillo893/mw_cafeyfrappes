import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/config/business";
import { getPublicBusinessSettings, getPublicMenu } from "@/lib/public-data";
import { getMenuPhotoUrl } from "@/lib/storage";
import { productPriceLabel } from "@/lib/money";
import { parseTimeFormat } from "@/lib/time-format";
import { isOpenAt, parseWeeklyHours, summarizeWeeklyHours } from "@/lib/weekly-hours";
import { buildLocalBusinessJsonLd, jsonLdScript, resolveSiteBaseUrl } from "@/lib/seo";
import { AdminGestureListener } from "./AdminGestureListener";

// Portada provisional de la Fase 1: identidad, horario, contacto y una
// probada del menú. La landing completa llega en la Fase 3.
export const revalidate = 60;

export default async function HomePage() {
  const [settings, menu] = await Promise.all([getPublicBusinessSettings(), getPublicMenu()]);
  const hours = parseWeeklyHours(settings.weekly_hours);
  const hoursLines = summarizeWeeklyHours(hours, parseTimeFormat(settings.time_format));
  const open = isOpenAt(hours, new Date());
  const featured = menu.flatMap((c) => c.products).filter((p) => p.show_on_landing && p.photo_path).slice(0, 3);
  const siteUrl = resolveSiteBaseUrl(settings);
  const whatsappUrl = settings.business_whatsapp ? `https://wa.me/${settings.business_whatsapp}` : null;

  return (
    <main className="flex flex-1 flex-col bg-brand-cream text-brand-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(buildLocalBusinessJsonLd({ settings, siteUrl, logoUrl: `${siteUrl}/brand/icon-512.png` })),
        }}
      />
      <AdminGestureListener />

      <section className="bg-brand-kraft">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 pb-14 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] text-center sm:px-10">
          <Image
            src="/brand/mw-logo-espresso.png"
            alt={business.name}
            width={168}
            height={168}
            priority
            className="h-36 w-36 dark:hidden sm:h-42 sm:w-42"
          />
          <Image
            src="/brand/mw-logo-crema.png"
            alt=""
            width={168}
            height={168}
            priority
            className="hidden h-36 w-36 dark:block sm:h-42 sm:w-42"
          />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/70">
              Extensión de {settings.parent_store_name}
            </p>
            <h1 className="font-display text-[clamp(2.25rem,7vw,3.75rem)] font-bold leading-[1.05]">
              Café, frappés <span className="italic text-brand-accent">y waffles</span>
            </h1>
            <p className="mx-auto max-w-md text-base text-brand-ink/80">
              Nuestro menú en línea está por llegar: muy pronto vas a poder verlo y pedir desde tu mesa, para recoger o a
              domicilio.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-brand-on-primary transition-opacity hover:opacity-90"
              >
                Escríbenos por WhatsApp
              </a>
            )}
            {settings.social_instagram_url && (
              <a
                href={settings.social_instagram_url}
                className="rounded-full border border-brand-ink/30 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-sand"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-10">
          <h2 className="font-display text-2xl font-semibold">Los favoritos de la casa</h2>
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {featured.map((product) => (
              <li key={product.id} className="flex flex-col gap-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] bg-brand-sand">
                  <Image
                    src={getMenuPhotoUrl(product.photo_path)!}
                    alt={product.name}
                    fill
                    sizes="(min-width: 640px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className="shrink-0 font-semibold tabular-nums text-brand-accent">{productPriceLabel(product)}</span>
                </div>
                {product.description && <p className="-mt-2 text-sm text-brand-ink/70">{product.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-brand-border">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-12 sm:grid-cols-2 sm:px-10">
          <div>
            <h2 className="flex items-center gap-3 font-display text-xl font-semibold">
              Horario
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border px-2.5 py-0.5 font-sans text-xs font-medium">
                <span aria-hidden className={`h-2 w-2 rounded-full ${open ? "bg-green-600" : "bg-brand-stone"}`} />
                {open ? "Abierto ahora" : "Cerrado ahora"}
              </span>
            </h2>
            <ul className="mt-3 space-y-1 text-sm">
              {hoursLines.map((line) => (
                <li key={line.days}>
                  <span className="font-medium">{line.days}</span> · <span className="tabular-nums">{line.hours}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Dónde estamos</h2>
            {settings.business_address && <p className="mt-3 text-sm">{settings.business_address}</p>}
            {settings.maps_url && (
              <a href={settings.maps_url} className="mt-2 inline-block text-sm font-medium underline underline-offset-4">
                Abrir en Google Maps
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-brand-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-6 text-xs text-brand-ink/70 sm:px-10">
          <p>
            © {new Date().getFullYear()} {business.name} · {business.tagline}
          </p>
          <nav className="flex gap-4">
            <Link href="/privacidad" className="underline underline-offset-4">
              Privacidad
            </Link>
            <Link href="/terminos" className="underline underline-offset-4">
              Términos
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
