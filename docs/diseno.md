# Diseño — MW Café & Frappés

> Propuesta 2026-10-06, **pendiente de aprobación**. Sale del logo
> (blanco y negro, "MW" con remates), del flyer (papel kraft, granos y
> café espresso) y del local (paredes rosa palo, madera clara, mesas
> plegables).

## Paleta

| Token | Hex | Uso | De dónde sale |
|---|---|---|---|
| `--brand-espresso` | `#3A2318` | Texto principal, botones, QR | Café del flyer |
| `--brand-moka` | `#6B4A35` | Texto secundario, bordes fuertes | Frappé moka |
| `--brand-caramelo` | `#B5762F` | Acento: precios, "agregar", estados activos | Cajeta / caramelo |
| `--brand-kraft` | `#EFE0C6` | Fondos de sección | Papel kraft del flyer |
| `--brand-crema` | `#FFFAF2` | Fondo general, tarjetas | Crema batida |
| `--brand-rosa` | `#E9B9B4` | Detalles y etiquetas ("nuevo", "favorito") | Paredes del local |
| `--brand-noche` | `#1A120D` | Fondo del modo oscuro (abren de noche) | Logo negro |

Modo oscuro: fondo `--brand-noche`, texto crema `#F1E4D2`, acento
caramelo claro `#D9A066`. Como abren de 7 a 11 pm, el modo oscuro se
usará mucho: diseñarlo con el mismo cuidado.

Colores semánticos (aparte del acento): listo `#3D7A4A`, aviso
`#A3521A`, error `#A33A2E`.

## Tipografía

- **Títulos:** Playfair Display (eco del "MW" con remates del logo).
- **Texto e interfaz:** Figtree.
- **Precios y números:** Figtree con `tabular-nums`.
- **Detalle de marca opcional:** una cursiva caligráfica tipo la del
  flyer ("juntos", "café") solo en el hero, p. ej. *Caveat* o *Pacifico*
  (por elegir con el usuario).

## Logo

- Original: `../Logo/LogoInstagram.jpg` (blanco sobre negro, 1024 px).
- Versión café espresso sin fondo (generada para el QR): se copia a
  `public/brand/` en la Fase 1. Hacer también la versión crema para el
  modo oscuro.

## Fotos de ejemplo → producto (seed provisional)

| Archivo | Uso de ejemplo |
|---|---|
| `Servicios/Recomendacion1.png` | Crepa con frutas |
| `Publicaciones/Recomendacion10.png` | Crepa con helado |
| `Publicaciones/Recomendacion3.png` | Waffle burbuja con frutas |
| `Publicaciones/Recomendacion15.png` | Waffle clásico con fresa y plátano |
| `Publicaciones/Recomendacion11.png` | Waffle en cono |
| `Publicaciones/Recomendacion2.png` | Frappé de chocolate |
| `Publicaciones/Recomendacion5.png` | Frappé moka y frappé de galleta |
| `Publicaciones/Recomendacion14.png` | Frappé de soda de moras (azul) |
| `Publicaciones/Recomendacion9.png` | Soda de manzana verde con perlas |
| `Publicaciones/Recomendacion7.png` | Soda de frutos rojos |
| `Publicaciones/Capuccino.jpg` | Capuchino / latte |
| `Publicaciones/Cafe.jpg` | Café de grano (sección "Nuestro café") |
| `Publicaciones/Barra.jpg`, `LugarDelNegocio.png`, `Personal.jpg` | Landing: el local y el equipo |
| `Publicaciones/Clientes.jpg`, `Clientes2.jpg` | Landing: ambiente |
| `Publicaciones/PublicidadUnoYLugar.jpg` | Referencia de estilo (flyer) |

Las `Recomendacion*.png` son historias de clientes con su usuario
encima (recortado): se publican por ahora (ver `CLAUDE.md` 10.2).

## Extras de ejemplo (inventados, P2)

- **Waffles:** fresa $15, plátano $10, manzana $10, Nutella $20,
  lechera $10, chispas de chocolate $10, galleta Oreo $12, bola de
  helado de vainilla $20.
- **Café:** shot extra de espresso $15, leche deslactosada o de
  almendra $10, jarabe (vainilla, caramelo, avellana) $10, crema batida $10.
- **Frappés:** crema batida $10, chispas $10, Oreo $12, cajeta $10,
  perlas explosivas $15 (el tamaño grande es un tamaño, no un extra).
- **Crepas:** fresa $15, plátano $10, Nutella $20, lechera $10, bola de
  helado $20.
- **Sodas italianas:** perlas explosivas $15, gomitas $10.
