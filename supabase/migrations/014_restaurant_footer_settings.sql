-- =====================================================
-- RESTAURANTOS - FOOTER PUBLICO, REDES Y HORARIOS
-- =====================================================

create extension if not exists pgcrypto;

-- Amplia el permiso de configuracion a admin y manager.
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
      and role in ('admin', 'manager')
  );
$$;

revoke all
on function public.can_manage_restaurant_settings()
from public;

grant execute
on function public.can_manage_restaurant_settings()
to authenticated;

-- El footer publico necesita leer datos basicos del restaurante sin sesion.
drop policy if exists "Public read restaurant settings"
on public.restaurant_settings;

create policy "Public read restaurant settings"
on public.restaurant_settings
for select
to anon, authenticated
using (true);

grant select (
  id,
  restaurant_name,
  short_description,
  address,
  created_at,
  updated_at
)
on public.restaurant_settings
to anon;

-- Redes sociales configurables del restaurante.
create table if not exists public.restaurant_social_links (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  label text not null,
  url text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_social_links_provider_not_blank check (length(trim(provider)) > 0),
  constraint restaurant_social_links_label_not_blank check (length(trim(label)) > 0),
  constraint restaurant_social_links_url_not_blank check (length(trim(url)) > 0),
  constraint restaurant_social_links_display_order_positive check (display_order >= 0)
);

create index if not exists restaurant_social_links_public_idx
on public.restaurant_social_links (is_active, display_order, created_at);

create index if not exists restaurant_social_links_provider_idx
on public.restaurant_social_links (lower(trim(provider)));

drop trigger if exists restaurant_social_links_set_updated_at
on public.restaurant_social_links;

create trigger restaurant_social_links_set_updated_at
before update on public.restaurant_social_links
for each row
execute function public.set_updated_at();

alter table public.restaurant_social_links
enable row level security;

drop policy if exists "Public read active restaurant social links"
on public.restaurant_social_links;

create policy "Public read active restaurant social links"
on public.restaurant_social_links
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Managers manage restaurant social links"
on public.restaurant_social_links;

create policy "Managers manage restaurant social links"
on public.restaurant_social_links
for all
to authenticated
using (public.can_manage_restaurant_settings())
with check (public.can_manage_restaurant_settings());

grant select
on public.restaurant_social_links
to anon, authenticated;

grant insert, update, delete
on public.restaurant_social_links
to authenticated;

-- Backfill no destructivo desde las columnas viejas si tienen datos.
with legacy_social_links(provider, label, url, display_order) as (
  select 'whatsapp', 'WhatsApp', trim(whatsapp), 1
  from public.restaurant_settings
  where nullif(trim(coalesce(whatsapp, '')), '') is not null
  union all
  select 'instagram', 'Instagram', trim(instagram), 2
  from public.restaurant_settings
  where nullif(trim(coalesce(instagram, '')), '') is not null
  union all
  select 'facebook', 'Facebook', trim(facebook), 3
  from public.restaurant_settings
  where nullif(trim(coalesce(facebook, '')), '') is not null
)
insert into public.restaurant_social_links (
  provider,
  label,
  url,
  display_order,
  is_active
)
select
  legacy.provider,
  legacy.label,
  legacy.url,
  legacy.display_order,
  true
from legacy_social_links legacy
where not exists (
  select 1
  from public.restaurant_social_links existing
  where lower(trim(existing.provider)) = lower(trim(legacy.provider))
);

-- Horarios estructurados. Permite horario cortado con mas de un slot por dia.
create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday int not null,
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  slot_number int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_hours_weekday_range check (weekday between 1 and 7),
  constraint business_hours_slot_number_positive check (slot_number >= 1),
  constraint business_hours_open_slots_have_times check (
    is_closed
    or (opens_at is not null and closes_at is not null)
  ),
  constraint business_hours_weekday_slot_unique unique (weekday, slot_number)
);

create index if not exists business_hours_public_idx
on public.business_hours (weekday, slot_number);

drop trigger if exists business_hours_set_updated_at
on public.business_hours;

create trigger business_hours_set_updated_at
before update on public.business_hours
for each row
execute function public.set_updated_at();

alter table public.business_hours
enable row level security;

drop policy if exists "Public read business hours"
on public.business_hours;

create policy "Public read business hours"
on public.business_hours
for select
to anon, authenticated
using (true);

drop policy if exists "Managers manage business hours"
on public.business_hours;

create policy "Managers manage business hours"
on public.business_hours
for all
to authenticated
using (public.can_manage_restaurant_settings())
with check (public.can_manage_restaurant_settings());

grant select
on public.business_hours
to anon, authenticated;

grant insert, update, delete
on public.business_hours
to authenticated;
