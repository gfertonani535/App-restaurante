```sql
-- =====================================================
-- RESTAURANTOS - AUTH Y ROW LEVEL SECURITY
-- =====================================================

-- =====================================================
-- CREAR PROFILE AUTOMÁTICAMENTE
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      ''
    ),
    'staff'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =====================================================
-- VALIDAR PERMISOS DE CATÁLOGO
-- =====================================================

create or replace function public.can_manage_catalog()
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
on function public.can_manage_catalog()
from public;

grant execute
on function public.can_manage_catalog()
to authenticated;

-- =====================================================
-- ACTIVAR RLS
-- =====================================================

alter table public.profiles
enable row level security;

alter table public.categories
enable row level security;

alter table public.products
enable row level security;

-- =====================================================
-- POLICIES: PROFILES
-- =====================================================

drop policy if exists "Profiles read own"
on public.profiles;

create policy "Profiles read own"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);

drop policy if exists "Admins manage profiles"
on public.profiles;

create policy "Admins manage profiles"
on public.profiles
for all
to authenticated
using (
  public.can_manage_catalog()
)
with check (
  public.can_manage_catalog()
);

-- =====================================================
-- POLICIES: CATEGORIES
-- =====================================================

drop policy if exists "Public read active categories"
on public.categories;

create policy "Public read active categories"
on public.categories
for select
to anon, authenticated
using (
  is_active = true
);

drop policy if exists "Admins manage categories"
on public.categories;

create policy "Admins manage categories"
on public.categories
for all
to authenticated
using (
  public.can_manage_catalog()
)
with check (
  public.can_manage_catalog()
);

-- =====================================================
-- POLICIES: PRODUCTS
-- =====================================================

drop policy if exists "Public read visible products"
on public.products;

create policy "Public read visible products"
on public.products
for select
to anon, authenticated
using (
  is_active = true
  and visible_in_menu = true
);

drop policy if exists "Admins manage products"
on public.products;

create policy "Admins manage products"
on public.products
for all
to authenticated
using (
  public.can_manage_catalog()
)
with check (
  public.can_manage_catalog()
);
```
