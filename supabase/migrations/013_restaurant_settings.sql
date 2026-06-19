-- =====================================================
-- RESTAURANTOS - CONFIGURACION GENERAL DEL RESTAURANTE
-- =====================================================

create extension if not exists pgcrypto;

create table if not exists public.restaurant_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_name text not null default 'RestaurantOS',
  short_description text,
  whatsapp text,
  instagram text,
  facebook text,
  address text,
  opening_hours text,
  footer_text text,
  currency text not null default 'ARS',
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.restaurant_settings (
  restaurant_name,
  short_description,
  currency
)
select
  'RestaurantOS',
  'Sistema POS para restaurante',
  'ARS'
where not exists (
  select 1
  from public.restaurant_settings
);

drop trigger if exists restaurant_settings_set_updated_at
on public.restaurant_settings;

create trigger restaurant_settings_set_updated_at
before update on public.restaurant_settings
for each row
execute function public.set_updated_at();

create or replace function public.can_manage_restaurant_settings()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all
on function public.can_manage_restaurant_settings()
from public;

grant execute
on function public.can_manage_restaurant_settings()
to authenticated;

alter table public.restaurant_settings
enable row level security;

drop policy if exists "Authenticated read restaurant settings"
on public.restaurant_settings;

create policy "Authenticated read restaurant settings"
on public.restaurant_settings
for select
to authenticated
using (true);

drop policy if exists "Admins update restaurant settings"
on public.restaurant_settings;

create policy "Admins update restaurant settings"
on public.restaurant_settings
for update
to authenticated
using (
  public.can_manage_restaurant_settings()
)
with check (
  public.can_manage_restaurant_settings()
);

grant select, update
on public.restaurant_settings
to authenticated;
