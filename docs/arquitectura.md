# Arquitectura

> Creado 2026-10-06 (Fase 1). Se actualiza con cada fase.

## Piezas

```text
Navegador ──► Next.js en Vercel ──► Supabase (Postgres + Auth + Storage)
                │
                ├─ /                  portada (anon key, lectura pública)
                ├─ /admin/*           panel (proxy.ts exige sesión; requireAdminUser revisa admin_users)
                ├─ /api/cron/daily    cron diario de Vercel (keep-alive de Supabase)
                └─ /privacidad /terminos /eliminar-datos
```

Próximas: `/menu` (Fase 2), `/pedido/<token>` y `/admin/pedidos`
(Fase 5), webhook de Stripe (Fase 6), webhook de Instagram (Fase 7).

## Acceso a datos

| Quién | Cliente | Ve |
|---|---|---|
| Visitante | `lib/public-data.ts` (anon key) | Lo que permiten las policies: categorías y productos activos (agotados incluidos), extras, ajustes del negocio, landing |
| `/admin` | `lib/admin/data.ts`, `lib/admin/actions.ts` (service_role) | Todo. Siempre después de `requireAdminUser()` |
| Login | `lib/admin/supabase-server.ts` (anon + cookies) | Su propia fila de `admin_users` |

## Tablas (Fase 1)

| Tabla | Para qué |
|---|---|
| `business_settings` | Una fila: contacto, dirección, horario (`weekly_hours`), reglas y métodos de pago de pedidos, SEO |
| `categories` | Waffles, Café, Frappés… (`active` oculta) |
| `products` | Producto; `is_available = false` es "agotado", `active = false` es oculto; `photo_path`, `model_glb_path`, `is_sample` |
| `product_sizes` | Tamaños con precio completo |
| `extra_groups`, `extras` | Extras reutilizables con mínimo/máximo |
| `product_extra_groups` | Qué grupos ofrece cada producto |
| `landing_sections` | Textos de la landing (Fase 3) |
| `admin_users` | Lista blanca de `/admin` |

Precios en centavos (`integer`). Formato: `lib/money.ts`.

## Storage

Buckets públicos de lectura: `menu-photos`, `menu-models` (3D),
`site-assets` (logo, imágenes de landing). Las rutas que empiezan con
`/` son archivos de `public/` (fotos de ejemplo en `public/sample`).

## Tema

Tokens `--brand-*` en `app/globals.css`. El sitio sigue el tema del
sistema; `/admin` tiene botón sol/luna (`data-theme` en `#admin-shell`).
La variante `dark:` de Tailwind respeta ambas cosas.
