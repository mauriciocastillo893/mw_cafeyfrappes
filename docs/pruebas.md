# Pruebas

> Creado 2026-10-06 (Fase 1).

## Automáticas

```bash
pnpm test         # vitest
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

| Archivo | Cubre |
|---|---|
| `lib/money.test.ts` | Formato de precios, captura de montos, "desde $X" con tamaños |
| `lib/weekly-hours.test.ts` | Leer horario, "Jueves a domingo", abierto/cerrado en hora de México, cierre después de medianoche |
| `lib/menu.test.ts` | Búsqueda sin acentos, filtro frío/caliente, `?mesa=N` válido, "Abrimos hoy / mañana / el jueves" |
| `lib/item-price.test.ts` | Precio de un producto con tamaño y extras, agotado, extras ajenos o repetidos, mínimo y máximo por grupo |
| `lib/time-format.test.ts` | Formatos de hora (heredado de Axel) |
| `lib/phone.test.ts` | Normalizar teléfonos mexicanos (heredado de Axel) |

## RLS (manual, contra Supabase local)

Con `pnpm exec supabase start` y la anon key:

```bash
ANON=<anon key>
q(){ curl -s "http://127.0.0.1:55321/rest/v1/$1" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"; echo; }
q "products?select=slug,is_available"      # todos los activos, agotados incluidos
q "admin_users?select=*"                    # [] (anon no ve la lista blanca)
```

Verificado 2026-10-06: un producto con `active = false` desaparece; una
categoría inactiva oculta sus productos; un agotado sigue apareciendo
con `is_available = false`.

## Cron

```bash
curl -i localhost:3000/api/cron/daily                                  # 401
curl -i -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/daily   # 200 {"ok":true}
```

## Menú (`/menu`, manual)

Verificado 2026-10-07 contra Supabase de producción, en celular (375 px)
y escritorio, claro y oscuro:

- `/menu?mesa=4` → "Mesa 4" arriba; `sessionStorage["mw-mesa"] = "4"`.
- Cerrado (miércoles) → "Abrimos mañana a las 7:00 p. m."
- Buscar "nutella" → solo "Crepa de Nutella". Filtro Frío → frappés y sodas.
- Frappé moka: 20 oz ($85) + Galleta Oreo ($12) → total $97.
- "Atrás" cierra el detalle y deja `?mesa=4`; Esc en un link compartido
  (`?producto=crepa-nutella`) lo cierra y quita el parámetro.
- Al hacer scroll a Frappés, el chip "Frappés" se marca.
- Sin errores en consola.

Pendiente de ver en vivo: un producto agotado (marcarlo en `/admin`
cuando exista, Fase 4).
