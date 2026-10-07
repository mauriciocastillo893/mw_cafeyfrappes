# Decisiones — MW Café & Frappés

## 2026-10-06 — Respuestas a los pendientes P3–P7

- **Fotos (P3):** las historias de clientes (recortadas) se publican por
  ahora, hasta tener fotos oficiales.
- **Menú (P4):** se agregan **Crepas** y **Sodas italianas** al seed, con
  sus propios grupos de extras (inventados, `is_sample`).
- **Dirección (P5):** la de Instagram ("Sector K, sobre la calle
  boulevard Guelaguetza"), editable desde `/admin`.
- **Programados (P7):** anticipación mínima 2 h, una hora cada 30 min,
  máximo 5 pedidos por franja, se puede programar otro día pero solo en
  días y horas de apertura. Todo editable (`scheduled_*` en
  `business_settings`). Se agregó un tope de días adelante
  (`scheduled_max_days_ahead`, 7) para que la lista de horas no sea
  infinita; confirmar el número (P14).
- **Envío (P6):** $40 por defecto, editable, con switch
  **automático/manual** (`delivery_fee_mode`): automático cobra el envío
  fijo; manual deja que la tienda lo fije en cada pedido. Reparte el
  dueño. Falta definir zona de entrega.

## 2026-10-06 — Fase 1: base del proyecto

- **Se copió de Axel solo lo genérico** (stack, `/admin`, PWA, SEO,
  legales, teléfono y formato de hora). Gmail, Calendar y Google Auth se
  quitaron por ahora y vuelven en la Fase 5.
- **Tokens por función** (`brand-primary`, `brand-accent`…) en vez de
  por color (`brand-olive` de Axel), para que cambiar la marca no
  obligue a renombrar clases.
- **Tema:** el sitio sigue el tema del sistema (MW abre de noche: mucha
  gente lo verá en oscuro). `/admin` conserva el botón sol/luna; sin
  cookie arranca en claro. La variante `dark:` de Tailwind respeta los dos.
- **Precios en centavos** (`integer`) y **tamaños con precio completo**
  (no "+$15 sobre el base"), para que el total sea una suma simple.
- **Agotado ≠ oculto:** `is_available = false` se ve marcado como
  agotado; `active = false` no aparece. Lo hacen cumplir las policies.
- **Fotos de ejemplo en `public/sample`** (no en Storage): `photo_path`
  que empieza con "/" se usa tal cual. Al subir la foto real desde
  `/admin` se reemplaza por la ruta de Storage. A las historias de
  clientes se les recortó el encabezado con el usuario (siguen siendo
  solo para el demo, P3).
- **Dirección provisional:** la del flyer (Guelaguetza 8C, Villas
  Paraíso) hasta confirmar P5.
- **Contacto legal:** el WhatsApp del negocio hasta tener correo (P1).
- **Supabase local en puertos 553xx** para poder tenerlo encendido junto
  al de Axel.
- **Portada provisional** en `/` mientras llega la landing (Fase 3):
  identidad, favoritos de la BD, horario y ubicación.

## 2026-10-06 — Alcance inicial

Respuestas del usuario a las preguntas de arranque:

- **Base técnica:** se reutiliza Axel Style (stack, `/admin`, Gmail,
  Calendar, PWA, SEO, docs). No se copia el bot de WhatsApp ni la agenda.
  Proyecto independiente; Vyxorian Studios es la empresa del desarrollador.
- **Marca:** MW es la extensión de **Mundo Waffle Huatulco**, que es la
  tienda principal.
- **Menú:** Waffles, Café y Frappés, más extras. Los extras se inventan
  por ahora y se marcan como ejemplo.
- **WhatsApp:** solo botón de contacto, sin bot.
- **`/admin`:** Franco García (dueño) y el desarrollador.
- **Horario:** jueves a domingo, 7:00 pm a 11:00 pm (confirmado).
- **Pedidos:** se pide desde el menú para mostrador, mesa o domicilio.
  Domicilio con mínimo de **$80 MXN**.
- **Pagos:** domicilio con **Stripe Checkout** (con Google Pay y Apple
  Pay). Mostrador y mesa con efectivo o transferencia, cobrados a mano.
  Qué métodos se ofrecen en cada tipo es configurable en `/admin`.
  Motivo: el riesgo de no cobrar un domicilio es alto; en el local se
  cobra en persona.
- **Google Calendar:** se usa para **pedidos programados** (el cliente
  elige a qué hora recoge).
- **Instagram:** al final del proyecto, aún no confirmado. Respuestas
  configurables en `/admin` (agregar, quitar y editar), con mensaje
  genérico cuando nada coincide.
- **3D:** piloto con affogato, frappé y café, de calidad media al
  inicio; se perfecciona con el tiempo.
- **Prioridad:** menú y landing, luego `/admin`, luego pedidos; al final
  Stripe e Instagram. Sin fecha límite, cuanto antes mejor.
- **Correo del negocio:** pendiente (P1).

## 2026-10-06 — Estudio de QR

Se adaptó el artefacto "Estudio de QR" del usuario para MW:
https://claude.ai/artifact/5ze7M1jtJog4Cdfih3PDRy

- Logo MW recoloreado a café espresso sin fondo (el original es blanco
  sobre negro y se perdería en un QR claro).
- Paletas: Espresso, Kraft, Rosa terraza, Tinta, Noche MW.
- **Campo "Número de mesa"**: agrega `?mesa=N` al enlace y cambia el
  título a "Mesa N". Sin número sirve para el mostrador o la publicidad.
- La URL por defecto (`https://mw-cafeyfrappes.vercel.app/menu`) es
  provisional hasta crear el proyecto de Vercel.
- Más adelante el estudio se porta a `/admin/qr`.
