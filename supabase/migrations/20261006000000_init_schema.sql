-- Esquema inicial de MW Café & Frappés (Fase 1, CLAUDE.md secciones 4 y 7).
-- Menú (categorías, productos, tamaños, extras), ajustes del negocio,
-- secciones de la landing y lista blanca de /admin. Los pedidos llegan
-- en la Fase 5 con su propia migración.
--
-- Precios siempre en centavos (integer), nunca en float.

-- =========================================================================
-- business_settings: una sola fila (id = 1), editable en /admin/negocio
-- =========================================================================
create table business_settings (
  id smallint primary key default 1 check (id = 1),

  -- Identidad y contacto
  business_name text not null default 'MW Café & Frappés',
  tagline text not null default 'Universo de sabor',
  parent_store_name text not null default 'Mundo Waffle Huatulco',
  parent_store_instagram_url text default 'https://www.instagram.com/mundowafflehuatulco/',
  business_whatsapp text default '529581861260',
  business_email text,
  business_address text default 'Sector K, sobre la calle boulevard Guelaguetza, Huatulco, Oax.',
  business_lat double precision default 15.7692212,
  business_lng double precision default -96.1291265,
  maps_url text default 'https://maps.app.goo.gl/5nQoEUkUodharCc18',
  social_instagram_url text default 'https://www.instagram.com/mw_cafeyfrappes/',
  social_facebook_url text default 'https://www.facebook.com/profile.php?id=61579810748474',
  site_url text,
  logo_path text,
  seo_title text,
  seo_description text,
  time_format text not null default '12h' check (time_format in ('24h', '12h', 'words', 'words_upper')),

  -- Horario: [{ "day": 0-6 (0 = domingo), "start": "HH:MM", "end": "HH:MM" }]
  weekly_hours jsonb not null default '[
    {"day": 4, "start": "19:00", "end": "23:00"},
    {"day": 5, "start": "19:00", "end": "23:00"},
    {"day": 6, "start": "19:00", "end": "23:00"},
    {"day": 0, "start": "19:00", "end": "23:00"}
  ]'::jsonb,

  -- Pedidos (Fase 5). Domicilio apagado hasta tener Stripe (Fase 6).
  order_pickup_enabled boolean not null default true,
  order_table_enabled boolean not null default true,
  order_delivery_enabled boolean not null default false,
  scheduled_orders_enabled boolean not null default true,
  delivery_min_subtotal_cents integer not null default 8000 check (delivery_min_subtotal_cents >= 0),
  delivery_fee_cents integer not null default 4000 check (delivery_fee_cents >= 0),
  -- 'auto' = a todo pedido a domicilio se le cobra delivery_fee_cents;
  -- 'manual' = la tienda fija el envío de cada pedido al recibirlo.
  delivery_fee_mode text not null default 'auto' check (delivery_fee_mode in ('auto', 'manual')),

  -- Pedidos programados (CLAUDE.md 5.2): solo en días y horas de apertura.
  scheduled_min_lead_minutes integer not null default 120 check (scheduled_min_lead_minutes >= 0),
  scheduled_slot_minutes integer not null default 30 check (scheduled_slot_minutes in (10, 15, 20, 30, 45, 60)),
  scheduled_max_per_slot integer not null default 5 check (scheduled_max_per_slot >= 1),
  scheduled_max_days_ahead integer not null default 7 check (scheduled_max_days_ahead between 0 and 60),
  -- Qué métodos de pago se ofrecen en cada tipo de pedido (CLAUDE.md 5.3).
  payment_methods jsonb not null default '{
    "pickup": ["cash", "transfer"],
    "table": ["cash", "transfer"],
    "delivery": ["card"]
  }'::jsonb,
  transfer_bank text,
  transfer_clabe text,
  transfer_holder text,

  updated_at timestamptz not null default now()
);

comment on table business_settings is 'Datos del negocio, horario y reglas de pedidos. Una sola fila (id = 1), editable en /admin/negocio.';
comment on column business_settings.business_address is 'Dirección que se muestra en la landing y las páginas legales. Por decisión del usuario se usa la de Instagram; editable en /admin/negocio.';

insert into business_settings (id) values (1);

-- =========================================================================
-- Menú
-- =========================================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 40),
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table categories is 'Categorías del menú (Waffles, Café, Frappés…). Inactivas no se muestran.';

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 60),
  description text,
  -- Precio si el producto no tiene tamaños; con tamaños manda el de cada tamaño.
  base_price_cents integer not null default 0 check (base_price_cents >= 0),
  -- Ruta en el bucket menu-photos, o una ruta que empiece con "/" para
  -- las fotos de ejemplo que viven en public/sample (seed).
  photo_path text,
  model_glb_path text,
  model_usdz_path text,
  tags text[] not null default '{}' check (tags <@ array['frio', 'caliente', 'nuevo', 'favorito']::text[]),
  show_on_landing boolean not null default false,
  -- false = "agotado": se ve en el menú pero no se puede pedir.
  is_available boolean not null default true,
  -- false = oculto del menú.
  active boolean not null default true,
  sort_order integer not null default 0,
  -- true = dato inventado del seed, hay que reemplazarlo por el real (P2).
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on products (category_id, sort_order);

comment on table products is 'Productos del menú. Agotado = is_available false; oculto = active false.';

create table product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 20),
  price_cents integer not null check (price_cents >= 0),
  sort_order integer not null default 0,
  unique (product_id, name)
);

comment on table product_sizes is 'Tamaños con su precio completo (no un extra sobre el base), p. ej. 12 oz $55 / 16 oz $65.';

create table extra_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 40),
  min_select integer not null default 0 check (min_select >= 0),
  -- null = sin límite.
  max_select integer check (max_select is null or max_select >= 1),
  sort_order integer not null default 0,
  check (max_select is null or max_select >= min_select)
);

comment on table extra_groups is 'Grupos de extras reutilizables (toppings de waffle, extras de café…), con mínimo y máximo a elegir.';

create table extras (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references extra_groups(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  price_cents integer not null default 0 check (price_cents >= 0),
  is_available boolean not null default true,
  sort_order integer not null default 0,
  unique (group_id, name)
);

create table product_extra_groups (
  product_id uuid not null references products(id) on delete cascade,
  group_id uuid not null references extra_groups(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, group_id)
);

comment on table product_extra_groups is 'Qué grupos de extras ofrece cada producto.';

-- =========================================================================
-- Landing
-- =========================================================================
create table landing_sections (
  key text primary key check (key in ('hero', 'destacados', 'nosotros', 'horario', 'ubicacion', 'contacto')),
  heading text,
  subheading text,
  image_path text,
  updated_at timestamptz not null default now()
);

comment on table landing_sections is 'Textos e imagen opcional por sección de la landing, editables en /admin/landing. Si falta una fila o un campo, el código usa el valor por defecto.';

-- =========================================================================
-- admin_users
-- =========================================================================
create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table admin_users is 'Lista blanca de quién puede entrar a /admin (Supabase Auth). Sin registro público.';

-- =========================================================================
-- RLS: todo con RLS activo. /admin escribe con service_role (ignora RLS).
-- Las políticas de abajo son solo de lectura para anon/authenticated.
-- =========================================================================
alter table business_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_sizes enable row level security;
alter table extra_groups enable row level security;
alter table extras enable row level security;
alter table product_extra_groups enable row level security;
alter table landing_sections enable row level security;
alter table admin_users enable row level security;

create policy "business_settings_public_read" on business_settings
  for select to anon, authenticated using (true);

create policy "categories_public_read" on categories
  for select to anon, authenticated using (active = true);

-- Agotados sí se leen (se muestran como "agotado"); ocultos no.
create policy "products_public_read" on products
  for select to anon, authenticated
  using (active = true and exists (select 1 from categories c where c.id = category_id and c.active = true));

create policy "product_sizes_public_read" on product_sizes
  for select to anon, authenticated
  using (exists (select 1 from products p where p.id = product_id and p.active = true));

create policy "extra_groups_public_read" on extra_groups
  for select to anon, authenticated using (true);

create policy "extras_public_read" on extras
  for select to anon, authenticated using (true);

create policy "product_extra_groups_public_read" on product_extra_groups
  for select to anon, authenticated using (true);

create policy "landing_sections_public_read" on landing_sections
  for select to anon, authenticated using (true);

create policy "admin_users_self_read" on admin_users
  for select to authenticated using (user_id = auth.uid());

-- =========================================================================
-- Storage: buckets públicos de solo lectura; las subidas van por /admin
-- con service_role.
-- =========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('menu-photos', 'menu-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  -- Modelos 3D: meta ≤ 4 MB (docs/3d-ar.md); el límite duro es 10 MB.
  ('menu-models', 'menu-models', true, 10485760, array['model/gltf-binary', 'model/vnd.usdz+zip', 'application/octet-stream']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

create policy "menu_public_read" on storage.objects
  for select to public
  using (bucket_id in ('menu-photos', 'menu-models', 'site-assets'));
