-- =====================================================
-- RESTAURANTOS - RLS DE CIERRES DE CAJA
-- =====================================================

create or replace function public.can_manage_cash_closures()
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
      and role in (
        'admin',
        'manager',
        'cashier'
      )
  );
$$;


revoke all
on function public.can_manage_cash_closures()
from public;

grant execute
on function public.can_manage_cash_closures()
to authenticated;


-- =====================================================
-- ACTIVAR RLS
-- =====================================================

alter table public.cash_closures
enable row level security;


-- =====================================================
-- SOLO LECTURA DIRECTA
-- Los cierres se crean exclusivamente mediante RPC.
-- =====================================================

drop policy if exists "Cash staff read closures"
on public.cash_closures;

create policy "Cash staff read closures"
on public.cash_closures
for select
to authenticated
using (
  public.can_manage_cash_closures()
);


-- Impedir modificaciones directas desde la API.
revoke insert, update, delete
on public.cash_closures
from anon, authenticated;

grant select
on public.cash_closures
to authenticated;