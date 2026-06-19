-- =====================================================
-- RESTAURANTOS - SEED INICIAL DE CATEGORIAS
-- =====================================================

with seed_categories(name, display_order, is_active) as (
  values
    ('Pizzas', 1, true),
    ('Hamburguesas', 2, true),
    ('Lomos', 3, true),
    ('Pastas', 4, true),
    ('Empanadas', 5, true),
    ('Postres', 6, true),
    ('Bebidas', 7, true)
)
insert into public.categories (
  name,
  display_order,
  is_active
)
select
  seed.name,
  seed.display_order,
  seed.is_active
from seed_categories seed
where not exists (
  select 1
  from public.categories existing
  where lower(trim(existing.name)) =
        lower(trim(seed.name))
);
