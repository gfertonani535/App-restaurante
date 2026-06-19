-- =====================================================
-- RESTAURANTOS - RLS PARA ÓRDENES Y PAGOS
-- =====================================================

-- =====================================================
-- FUNCIONES DE ROLES
-- =====================================================

create or replace function public.can_access_orders()
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
        'waiter',
        'cashier'
      )
  );
$$;


create or replace function public.can_delete_orders()
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
        'manager'
      )
  );
$$;


create or replace function public.can_manage_payments()
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
on function public.can_access_orders()
from public;

revoke all
on function public.can_delete_orders()
from public;

revoke all
on function public.can_manage_payments()
from public;


grant execute
on function public.can_access_orders()
to authenticated;

grant execute
on function public.can_delete_orders()
to authenticated;

grant execute
on function public.can_manage_payments()
to authenticated;


-- =====================================================
-- ACTIVAR RLS
-- =====================================================

alter table public.orders
enable row level security;

alter table public.order_items
enable row level security;

alter table public.payments
enable row level security;


-- =====================================================
-- ORDERS
-- =====================================================

drop policy if exists "Operational staff read orders"
on public.orders;

create policy "Operational staff read orders"
on public.orders
for select
to authenticated
using (
  public.can_access_orders()
);


drop policy if exists "Operational staff create orders"
on public.orders;

create policy "Operational staff create orders"
on public.orders
for insert
to authenticated
with check (
  public.can_access_orders()
);


drop policy if exists "Operational staff update orders"
on public.orders;

create policy "Operational staff update orders"
on public.orders
for update
to authenticated
using (
  public.can_access_orders()
)
with check (
  public.can_access_orders()
);


drop policy if exists "Managers delete orders"
on public.orders;

create policy "Managers delete orders"
on public.orders
for delete
to authenticated
using (
  public.can_delete_orders()
);


-- =====================================================
-- ORDER ITEMS
-- =====================================================

drop policy if exists "Operational staff read order items"
on public.order_items;

create policy "Operational staff read order items"
on public.order_items
for select
to authenticated
using (
  public.can_access_orders()
);


drop policy if exists "Operational staff create order items"
on public.order_items;

create policy "Operational staff create order items"
on public.order_items
for insert
to authenticated
with check (
  public.can_access_orders()
);


drop policy if exists "Operational staff update order items"
on public.order_items;

create policy "Operational staff update order items"
on public.order_items
for update
to authenticated
using (
  public.can_access_orders()
)
with check (
  public.can_access_orders()
);


drop policy if exists "Operational staff delete order items"
on public.order_items;

create policy "Operational staff delete order items"
on public.order_items
for delete
to authenticated
using (
  public.can_access_orders()
);


-- =====================================================
-- PAYMENTS
-- =====================================================

drop policy if exists "Operational staff read payments"
on public.payments;

create policy "Operational staff read payments"
on public.payments
for select
to authenticated
using (
  public.can_access_orders()
);


drop policy if exists "Cashiers create payments"
on public.payments;

create policy "Cashiers create payments"
on public.payments
for insert
to authenticated
with check (
  public.can_manage_payments()
);


drop policy if exists "Cashiers update payments"
on public.payments;

create policy "Cashiers update payments"
on public.payments
for update
to authenticated
using (
  public.can_manage_payments()
)
with check (
  public.can_manage_payments()
);


drop policy if exists "Cashiers delete payments"
on public.payments;

create policy "Cashiers delete payments"
on public.payments
for delete
to authenticated
using (
  public.can_manage_payments()
);


-- =====================================================
-- PERMITIR QUE EL PERSONAL VEA PERFILES OPERATIVOS
-- Necesario para mostrar nombres de mozos/cajeros.
-- =====================================================

drop policy if exists "Operational staff read profiles"
on public.profiles;

create policy "Operational staff read profiles"
on public.profiles
for select
to authenticated
using (
  public.can_access_orders()
);