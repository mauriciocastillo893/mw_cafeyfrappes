-- Seed de MW Café & Frappés (Fase 1).
--
-- ⚠️ MENÚ DE EJEMPLO: nombres, precios, tamaños y extras son inventados
-- (P2 de CLAUDE.md) y van marcados con is_sample = true. Las fotos son
-- provisionales (public/sample, ver docs/diseno.md); varias salen de
-- historias de clientes y no deben quedarse en producción (P3).
--
-- Idempotente: se puede correr más de una vez (on conflict).

-- -------------------------------------------------------------------------
-- Categorías
-- -------------------------------------------------------------------------
insert into categories (slug, name, description, sort_order) values
  ('waffles', 'Waffles', 'Recién hechos, con fruta, chocolate y lo que se te antoje.', 1),
  ('cafe', 'Café', 'Café de grano molido al momento, frío o caliente.', 2),
  ('frappes', 'Frappés', 'Licuados con hielo, crema batida y toppings.', 3),
  ('crepas', 'Crepas', 'Dulces, con fruta, chocolate y helado.', 4),
  ('sodas-italianas', 'Sodas italianas', 'Refrescantes, de colores y con perlas explosivas.', 5)
on conflict (slug) do nothing;

-- -------------------------------------------------------------------------
-- Grupos de extras
-- -------------------------------------------------------------------------
insert into extra_groups (name, min_select, max_select, sort_order) values
  ('Toppings de waffle', 0, 5, 1),
  ('Extras de café', 0, 3, 2),
  ('Extras de frappé', 0, 4, 3),
  ('Toppings de crepa', 0, 5, 4),
  ('Extras de soda', 0, 2, 5)
on conflict (name) do nothing;

insert into extras (group_id, name, price_cents, sort_order)
select g.id, e.name, e.price_cents, e.sort_order
from extra_groups g
join (values
  ('Toppings de waffle', 'Fresa', 1500, 1),
  ('Toppings de waffle', 'Plátano', 1000, 2),
  ('Toppings de waffle', 'Manzana', 1000, 3),
  ('Toppings de waffle', 'Nutella', 2000, 4),
  ('Toppings de waffle', 'Lechera', 1000, 5),
  ('Toppings de waffle', 'Chispas de chocolate', 1000, 6),
  ('Toppings de waffle', 'Galleta Oreo', 1200, 7),
  ('Toppings de waffle', 'Bola de helado de vainilla', 2000, 8),
  ('Extras de café', 'Shot extra de espresso', 1500, 1),
  ('Extras de café', 'Leche deslactosada', 1000, 2),
  ('Extras de café', 'Leche de almendra', 1000, 3),
  ('Extras de café', 'Jarabe de vainilla', 1000, 4),
  ('Extras de café', 'Jarabe de caramelo', 1000, 5),
  ('Extras de café', 'Jarabe de avellana', 1000, 6),
  ('Extras de café', 'Crema batida', 1000, 7),
  ('Extras de frappé', 'Crema batida', 1000, 1),
  ('Extras de frappé', 'Chispas de chocolate', 1000, 2),
  ('Extras de frappé', 'Galleta Oreo', 1200, 3),
  ('Extras de frappé', 'Cajeta', 1000, 4),
  ('Extras de frappé', 'Perlas explosivas', 1500, 5),
  ('Toppings de crepa', 'Fresa', 1500, 1),
  ('Toppings de crepa', 'Plátano', 1000, 2),
  ('Toppings de crepa', 'Nutella', 2000, 3),
  ('Toppings de crepa', 'Lechera', 1000, 4),
  ('Toppings de crepa', 'Bola de helado de vainilla', 2000, 5),
  ('Extras de soda', 'Perlas explosivas', 1500, 1),
  ('Extras de soda', 'Gomitas', 1000, 2)
) as e(group_name, name, price_cents, sort_order) on e.group_name = g.name
on conflict (group_id, name) do nothing;

-- -------------------------------------------------------------------------
-- Productos
-- -------------------------------------------------------------------------
insert into products (category_id, slug, name, description, base_price_cents, photo_path, tags, show_on_landing, sort_order, is_sample)
select c.id, p.slug, p.name, p.description, p.price, p.photo, p.tags::text[], p.landing, p.sort_order, true
from categories c
join (values
  -- Waffles
  ('waffles', 'waffle-clasico', 'Waffle clásico', 'Dorado por fuera, suave por dentro, con mantequilla y miel de maple.', 6000, null, '{caliente}', false, 1),
  ('waffles', 'waffle-con-frutas', 'Waffle con frutas', 'Fresa, plátano y manzana con chocolate y lechera.', 8500, '/sample/waffle-frutas.jpg', '{favorito}', true, 2),
  ('waffles', 'waffle-burbuja', 'Waffle burbuja', 'Bubble waffle con fruta fresca, chocolate y crema.', 9000, '/sample/waffle-burbuja.jpg', '{favorito}', true, 3),
  ('waffles', 'waffle-en-cono', 'Waffle en cono', 'Bubble waffle enrollado con helado, fruta y chocolate.', 9500, '/sample/waffle-cono.jpg', '{nuevo}', false, 4),
  -- Café
  ('cafe', 'espresso', 'Espresso', 'Shot doble de café recién molido.', 3500, '/sample/cafe-grano.jpg', '{caliente}', false, 1),
  ('cafe', 'americano', 'Americano', 'Espresso con agua caliente.', 4000, null, '{caliente}', false, 2),
  ('cafe', 'capuchino', 'Capuchino', 'Espresso con leche vaporizada y mucha espuma.', 5500, '/sample/capuchino.jpg', '{caliente,favorito}', true, 3),
  ('cafe', 'latte', 'Latte', 'Espresso con leche vaporizada, suave y cremoso.', 5500, null, '{caliente}', false, 4),
  ('cafe', 'affogato', 'Affogato', 'Shot de espresso caliente sobre una bola de helado de vainilla.', 7000, null, '{nuevo}', true, 5),
  ('cafe', 'cafe-de-olla', 'Café de olla', 'Con canela y piloncillo, como en casa.', 4000, null, '{caliente}', false, 6),
  -- Frappés
  ('frappes', 'frappe-moka', 'Frappé moka', 'Café, chocolate y leche con hielo, con crema batida.', 7000, '/sample/frappe-moka.jpg', '{frio,favorito}', true, 1),
  ('frappes', 'frappe-chocolate', 'Frappé de chocolate', 'Chocolate intenso con chispas y crema batida.', 7000, '/sample/frappe-chocolate.jpg', '{frio}', false, 2),
  ('frappes', 'frappe-oreo', 'Frappé de Oreo', 'Galleta Oreo, vainilla y crema batida.', 7500, null, '{frio}', false, 3),
  ('frappes', 'frappe-cajeta', 'Frappé de cajeta', 'Café con cajeta y crema batida.', 7500, null, '{frio}', false, 4),
  ('frappes', 'frappe-soda-moras', 'Frappé de soda de moras', 'Soda de moras escarchada, azul y burbujeante.', 6500, '/sample/frappe-soda-moras.jpg', '{frio,nuevo}', false, 5),
  -- Crepas
  ('crepas', 'crepa-con-frutas', 'Crepa con frutas', 'Fresa, plátano y manzana con chocolate y crema.', 8000, '/sample/crepa-frutas.jpg', '{favorito}', true, 1),
  ('crepas', 'crepa-nutella', 'Crepa de Nutella', 'Rellena de Nutella con plátano.', 7500, null, '{}', false, 2),
  ('crepas', 'crepa-con-helado', 'Crepa con helado', 'Con bola de helado de vainilla, fresa y chocolate.', 9000, '/sample/crepa-helado.jpg', '{nuevo}', false, 3),
  -- Sodas italianas
  ('sodas-italianas', 'soda-manzana-verde', 'Soda de manzana verde', 'Soda italiana de manzana verde con perlas explosivas.', 5500, '/sample/soda-verde.jpg', '{frio,favorito}', false, 1),
  ('sodas-italianas', 'soda-frutos-rojos', 'Soda de frutos rojos', 'Soda italiana de frutos rojos, bien fría.', 5500, '/sample/soda-frutos-rojos.jpg', '{frio}', false, 2),
  ('sodas-italianas', 'soda-blue', 'Soda blue', 'Soda italiana azul de mora con hielo.', 5500, null, '{frio}', false, 3)
) as p(category_slug, slug, name, description, price, photo, tags, landing, sort_order) on p.category_slug = c.slug
on conflict (slug) do nothing;

-- Tamaños (precio completo de cada tamaño)
insert into product_sizes (product_id, name, price_cents, sort_order)
select pr.id, s.name, s.price_cents, s.sort_order
from products pr
join (values
  ('americano', '12 oz', 4000, 1), ('americano', '16 oz', 4800, 2),
  ('capuchino', '12 oz', 5500, 1), ('capuchino', '16 oz', 6500, 2),
  ('latte', '12 oz', 5500, 1), ('latte', '16 oz', 6500, 2),
  ('frappe-moka', '16 oz', 7000, 1), ('frappe-moka', '20 oz', 8500, 2),
  ('frappe-chocolate', '16 oz', 7000, 1), ('frappe-chocolate', '20 oz', 8500, 2),
  ('frappe-oreo', '16 oz', 7500, 1), ('frappe-oreo', '20 oz', 9000, 2),
  ('frappe-cajeta', '16 oz', 7500, 1), ('frappe-cajeta', '20 oz', 9000, 2)
) as s(product_slug, name, price_cents, sort_order) on s.product_slug = pr.slug
on conflict (product_id, name) do nothing;

-- Qué extras ofrece cada producto: por categoría
insert into product_extra_groups (product_id, group_id)
select pr.id, g.id
from products pr
join categories c on c.id = pr.category_id
join extra_groups g on g.name = case c.slug
  when 'waffles' then 'Toppings de waffle'
  when 'cafe' then 'Extras de café'
  when 'frappes' then 'Extras de frappé'
  when 'crepas' then 'Toppings de crepa'
  when 'sodas-italianas' then 'Extras de soda'
end
where pr.slug <> 'espresso'
on conflict do nothing;
