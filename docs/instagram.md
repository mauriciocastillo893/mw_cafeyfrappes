# Instagram — respuestas automáticas (Fase 7, no confirmado)

> Creado 2026-10-06. Se ejecuta al final del proyecto si el cliente lo
> confirma.

## Qué hace

- **Mensajes directos (DMs):** si el mensaje coincide con una regla
  (palabras clave), responde con el texto de esa regla. Si no coincide
  con nada, responde un **mensaje genérico**.
- **Comentarios en reels y publicaciones:** si el comentario lleva una
  palabra clave (p. ej. "MENÚ"), manda un **DM privado** a quien comentó
  (uno por comentario) y, opcionalmente, una respuesta pública corta.
- Todo editable en `/admin/instagram`: agregar, quitar y editar reglas,
  activar o pausar cada una, y editar el mensaje genérico.

## Reglas de arranque (editables)

| Regla | Palabras clave | Respuesta |
|---|---|---|
| Menú | menú, menu, carta, precios, qué venden | Link a `/menu` |
| Horario | horario, abren, cierran, hoy abren | Jueves a domingo, 7 pm a 11 pm |
| Ubicación | dónde están, ubicación, dirección, cómo llego | Dirección + link de Google Maps |
| Pedidos | pedido, ordenar, para llevar | Link a `/menu` y cómo pedir |
| Domicilio | domicilio, envío, a domicilio, delivery | Mínimo $80, pago en línea, link |
| Pagos | pago, tarjeta, transferencia, efectivo | Métodos por tipo de pedido |
| Contacto | whatsapp, teléfono, número | `wa.me/529581861260` |
| Mundo Waffle | waffles, mundo waffle | Relación con la tienda principal |
| Facturación | factura | Por confirmar con Franco |
| Eventos / grupos | evento, cumpleaños, grupo, reservar | Por confirmar con Franco |
| Genérico | (cualquier otro) | "¡Gracias por escribirnos! Te respondemos en breve. Mientras, mira el menú: …" |

## Reglas de la API que hay que respetar

- Solo se responde a quien escribió primero; **ventana de 24 horas**
  desde su último mensaje.
- Respuesta privada a un comentario: **una por comentario**, dentro de
  los 7 días siguientes.
- No se responde a mensajes propios (eco) ni dos veces al mismo mensaje
  (guardar el id del mensaje ya respondido).
- Límite de envíos por hora de Meta: guardar conteo como en Axel.

## Lo que necesitamos del cliente

1. Cuenta de Instagram **profesional** (Empresa o Creador). Si es
   personal, se cambia en la app: Configuración → Tipo de cuenta y
   herramientas → Cambiar a cuenta profesional (gratis, no pierde nada).
2. Que la cuenta esté vinculada a la **página de Facebook** del negocio
   (recomendado, aunque el login de Instagram no lo exige).
3. Acceso de **administrador** al desarrollador en Meta Business Suite
   (o compartir sesión con Franco para conectar la app).
4. **Correo del negocio** (P1) para la cuenta de desarrollador de Meta
   y la app.
5. Que en la app de Instagram esté activado: Configuración → Mensajes →
   Herramientas conectadas → **"Permitir acceso a los mensajes"**.
6. Las respuestas que quiere para cada regla (o aprobar las de arriba)
   y qué palabra clave usará en sus reels.
7. Las páginas legales publicadas (`/privacidad`, `/terminos`,
   `/eliminar-datos`): Meta las pide para la app.

## Pasos a ejecutar

1. Crear app en **developers.facebook.com** (tipo "Business") con el
   correo del negocio.
2. Agregar el producto **Instagram → "API setup with Instagram login"**.
3. Agregar a Franco (y al desarrollador) como **roles** de la app
   (Instagram tester o administrador). Con roles, el acceso estándar
   basta para su propia cuenta y **no hace falta App Review**.
4. Permisos: `instagram_business_basic`,
   `instagram_business_manage_messages`,
   `instagram_business_manage_comments`.
5. Conectar la cuenta de Instagram y generar un **token de larga
   duración** (60 días). Guardarlo en la BD y **renovarlo** desde el
   cron diario antes de que venza.
6. Webhook en `/api/instagram/webhook`: verificación con
   `IG_VERIFY_TOKEN` y firma `X-Hub-Signature-256` con `META_APP_SECRET`.
   Suscribirse a `messages` y `comments`.
7. Tablas: `ig_rules` (palabras clave, respuesta, activa, orden),
   `ig_settings` (mensaje genérico, respuesta pública a comentarios),
   `ig_events` (id procesado, tipo, regla usada, fecha) para no
   responder dos veces y para métricas.
8. `/admin/instagram`: CRUD de reglas, prueba de "qué respondería a
   este texto", registro de las últimas respuestas.
9. Pruebas con `curl` simulando el webhook; después, prueba real desde
   una cuenta de tester.
10. Poner la app en modo **Live**.

## Alternativa sin código

**ManyChat** (gratis hasta ~1,000 contactos) hace lo mismo, pero vive
fuera de `/admin`. El usuario prefiere la integración propia.
