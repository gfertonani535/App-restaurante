```sql
-- =====================================================
-- RESTAURANTOS - ESQUEMA INICIAL DEL CATÁLOGO
-- Tablas: profiles, categories, products
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- PROFILES
-- =====================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff'
    check (
      role in (
        'admin',
        'manager',
        'waiter',
        'cashier',
        'staff'
      )
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- CATEGORIES
-- =====================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  image_path text,

  display_order integer not null default 1
    check (display_order >= 1),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists categories_name_unique
on public.categories (lower(trim(name)));

create index if not exists categories_display_order_idx
on public.categories(display_order);

-- =====================================================
-- PRODUCTS
-- =====================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),

  category_id uuid
    references public.categories(id)
    on update cascade
    on delete restrict,

  name text not null,

  sku text unique,

  short_description text,
  description text,

  price numeric(12, 2) not null default 0
    check (price >= 0),

  image_path text,

  is_active boolean not null default true,

  visible_in_menu boolean not null default true,

  quick_access boolean not null default false,

  track_stock boolean not null default false,

  stock integer not null default 0
    check (stock >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_id_idx
on public.products(category_id);

create index if not exists products_visible_menu_idx
on public.products(visible_in_menu, is_active);

-- =====================================================
-- UPDATED_AT AUTOMÁTICO
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at
on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at
on public.categories;

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at
on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();
```
