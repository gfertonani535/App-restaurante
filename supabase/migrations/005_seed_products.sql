-- =====================================================
-- RESTAURANTOS - SEED INICIAL DE PRODUCTOS
-- Requiere que las categorias base ya existan.
-- Las imagenes quedan en null para cargarlas luego desde la UI.
-- =====================================================

with seed_products(
  category_name,
  name,
  short_description,
  description,
  price,
  is_active,
  visible_in_menu,
  quick_access,
  track_stock,
  stock
) as (
  values
    (
      'Pizzas',
      'Pizza Margherita',
      'Salsa de tomate natural, mozzarella de alta calidad, albahaca fresca y aceite de oliva virgen.',
      'Salsa de tomate natural, mozzarella de alta calidad, albahaca fresca y aceite de oliva virgen.',
      12.50,
      true,
      true,
      false,
      false,
      0
    ),
    (
      'Hamburguesas',
      'Hamburguesa Gourmet',
      'Medallon de carne premium, queso cheddar fundido, cebolla caramelizada y panceta crocante.',
      'Medallon de carne premium, queso cheddar fundido, cebolla caramelizada y panceta crocante.',
      10.00,
      true,
      true,
      false,
      false,
      0
    ),
    (
      'Lomos',
      'Lomo Completo',
      'Sandwich de lomo tierno, lechuga, tomate, jamon, queso y huevo frito en pan artesanal.',
      'Sandwich de lomo tierno, lechuga, tomate, jamon, queso y huevo frito en pan artesanal.',
      15.00,
      true,
      true,
      false,
      false,
      0
    ),
    (
      'Pastas',
      'Sorrentinos de Jamon y Queso',
      'Pasta rellena artesanal servida con salsa blanca cremosa o tuco tradicional.',
      'Pasta rellena artesanal servida con salsa blanca cremosa o tuco tradicional.',
      11.50,
      true,
      true,
      false,
      false,
      0
    ),
    (
      'Empanadas',
      'Docena de Empanadas',
      'Variedad de sabores: carne suave, jamon y queso, pollo y verdura. Horneadas al punto.',
      'Variedad de sabores: carne suave, jamon y queso, pollo y verdura. Horneadas al punto.',
      14.00,
      true,
      true,
      false,
      false,
      0
    ),
    (
      'Postres',
      'Flan Casero con Dulce de Leche',
      'Tradicional flan de huevos de campo, servido con dulce de leche artesanal y crema.',
      'Tradicional flan de huevos de campo, servido con dulce de leche artesanal y crema.',
      6.50,
      true,
      true,
      false,
      false,
      0
    )
)
insert into public.products (
  category_id,
  name,
  sku,
  short_description,
  description,
  price,
  image_path,
  is_active,
  visible_in_menu,
  quick_access,
  track_stock,
  stock
)
select
  category.id,
  seed.name,
  null,
  seed.short_description,
  seed.description,
  seed.price,
  null,
  seed.is_active,
  seed.visible_in_menu,
  seed.quick_access,
  seed.track_stock,
  seed.stock
from seed_products seed
join public.categories category
  on lower(trim(category.name)) = lower(trim(seed.category_name))
where not exists (
  select 1
  from public.products existing
  where lower(trim(existing.name)) =
        lower(trim(seed.name))
    and existing.category_id = category.id
);
