-- =====================================================
-- RESTAURANTOS - RPC DE CIERRE DE CAJA
-- =====================================================


-- =====================================================
-- RESUMEN PENDIENTE DE CIERRE
-- =====================================================

create or replace function public.get_pending_cash_closure_summary()
returns table (
  orders_count bigint,
  payments_count bigint,
  cash_total numeric,
  card_total numeric,
  transfer_total numeric,
  other_total numeric,
  total numeric,
  blocking_orders_count bigint,
  can_close boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_cash_closures() then
    raise exception 'No autorizado para consultar el cierre de caja';
  end if;

  return query
  with pending_payments as (
    select
      p.id,
      p.order_id,
      p.amount,
      p.method
    from public.payments p
    join public.orders o
      on o.id = p.order_id
    where p.status = 'completed'
      and p.cash_closure_id is null
      and o.cash_closure_id is null
      and o.status <> 'cancelled'
  ),
  totals as (
    select
      count(distinct order_id) as orders_count,
      count(*) as payments_count,

      coalesce(
        sum(amount) filter (where method = 'cash'),
        0
      ) as cash_total,

      coalesce(
        sum(amount) filter (where method = 'card'),
        0
      ) as card_total,

      coalesce(
        sum(amount) filter (where method = 'transfer'),
        0
      ) as transfer_total,

      coalesce(
        sum(amount) filter (where method = 'other'),
        0
      ) as other_total,

      coalesce(sum(amount), 0) as total
    from pending_payments
  ),
  blocking as (
    select count(*) as blocking_orders_count
    from public.orders o
    where o.cash_closure_id is null
      and o.status not in ('closed', 'cancelled')
      and o.payment_status <> 'paid'
  )
  select
    totals.orders_count,
    totals.payments_count,
    totals.cash_total,
    totals.card_total,
    totals.transfer_total,
    totals.other_total,
    totals.total,
    blocking.blocking_orders_count,

    (
      totals.payments_count > 0
      and blocking.blocking_orders_count = 0
    ) as can_close

  from totals
  cross join blocking;
end;
$$;


-- =====================================================
-- CERRAR CAJA
-- =====================================================

create or replace function public.close_cash_register(
  p_notes text default null
)
returns table (
  cash_closure_id uuid,
  closure_number bigint,
  closed_at timestamptz,
  orders_count integer,
  payments_count integer,
  cash_total numeric,
  card_total numeric,
  transfer_total numeric,
  other_total numeric,
  total numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_closure_id uuid;
  v_closure_number bigint;
  v_closed_at timestamptz;

  v_orders_count integer;
  v_payments_count integer;

  v_cash_total numeric(12, 2);
  v_card_total numeric(12, 2);
  v_transfer_total numeric(12, 2);
  v_other_total numeric(12, 2);

  v_blocking_orders integer;
begin
  if not public.can_manage_cash_closures() then
    raise exception 'No autorizado para cerrar la caja';
  end if;

  -- Evita que dos cierres o un pago y un cierre
  -- ocurran simultáneamente.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('restaurantos_cash_closure')
  );

  select count(*)
  into v_blocking_orders
  from public.orders o
  where o.cash_closure_id is null
    and o.status not in ('closed', 'cancelled')
    and o.payment_status <> 'paid';

  if v_blocking_orders > 0 then
    raise exception
      'Hay órdenes pendientes de cobro. Completá o cancelá esas órdenes antes de cerrar la caja';
  end if;

  -- Bloquear los pagos que formarán parte del cierre.
  perform 1
  from public.payments p
  join public.orders o
    on o.id = p.order_id
  where p.status = 'completed'
    and p.cash_closure_id is null
    and o.cash_closure_id is null
    and o.payment_status = 'paid'
    and o.status <> 'cancelled'
  for update of p, o;

  select
    count(distinct p.order_id)::integer,
    count(*)::integer,

    coalesce(
      sum(p.amount) filter (where p.method = 'cash'),
      0
    ),

    coalesce(
      sum(p.amount) filter (where p.method = 'card'),
      0
    ),

    coalesce(
      sum(p.amount) filter (where p.method = 'transfer'),
      0
    ),

    coalesce(
      sum(p.amount) filter (where p.method = 'other'),
      0
    )

  into
    v_orders_count,
    v_payments_count,
    v_cash_total,
    v_card_total,
    v_transfer_total,
    v_other_total

  from public.payments p
  join public.orders o
    on o.id = p.order_id
  where p.status = 'completed'
    and p.cash_closure_id is null
    and o.cash_closure_id is null
    and o.payment_status = 'paid'
    and o.status <> 'cancelled';

  if v_payments_count = 0 then
    raise exception 'No hay pagos pendientes para incluir en el cierre';
  end if;

  insert into public.cash_closures (
    closed_by,
    orders_count,
    payments_count,
    cash_total,
    card_total,
    transfer_total,
    other_total,
    notes
  )
  values (
    auth.uid(),
    v_orders_count,
    v_payments_count,
    v_cash_total,
    v_card_total,
    v_transfer_total,
    v_other_total,
    nullif(btrim(p_notes), '')
  )
  returning
    id,
    cash_closures.closure_number,
    cash_closures.closed_at
  into
    v_closure_id,
    v_closure_number,
    v_closed_at;

  -- Asignar pagos al cierre.
  update public.payments p
  set cash_closure_id = v_closure_id
  from public.orders o
  where o.id = p.order_id
    and p.status = 'completed'
    and p.cash_closure_id is null
    and o.cash_closure_id is null
    and o.payment_status = 'paid'
    and o.status <> 'cancelled';

  -- Cerrar únicamente órdenes que tengan pagos
  -- incluidos en este cierre.
  update public.orders o
  set
    cash_closure_id = v_closure_id,
    status = 'closed'
  where o.cash_closure_id is null
    and o.payment_status = 'paid'
    and o.status <> 'cancelled'
    and exists (
      select 1
      from public.payments p
      where p.order_id = o.id
        and p.cash_closure_id = v_closure_id
        and p.status = 'completed'
    );

  return query
  select
    c.id,
    c.closure_number,
    c.closed_at,
    c.orders_count,
    c.payments_count,
    c.cash_total,
    c.card_total,
    c.transfer_total,
    c.other_total,
    c.total
  from public.cash_closures c
  where c.id = v_closure_id;
end;
$$;


-- =====================================================
-- ACTUALIZAR RPC DE PAGOS
-- Agrega el mismo bloqueo usado por el cierre.
-- =====================================================

create or replace function public.register_order_payment(
  p_order_id uuid,
  p_amount numeric,
  p_method text,
  p_reference text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment_id uuid;
  v_total numeric(12, 2);
  v_paid numeric(12, 2);
  v_remaining numeric(12, 2);
  v_order_status text;
  v_cash_closure_id uuid;
begin
  if not public.can_manage_payments() then
    raise exception 'No autorizado para registrar pagos';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('restaurantos_cash_closure')
  );

  if p_amount is null or p_amount <= 0 then
    raise exception 'El importe debe ser mayor a cero';
  end if;

  if p_method not in (
    'cash',
    'card',
    'transfer',
    'other'
  ) then
    raise exception 'Método de pago inválido';
  end if;

  select
    total,
    status,
    cash_closure_id
  into
    v_total,
    v_order_status,
    v_cash_closure_id
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'La orden no existe';
  end if;

  if v_order_status in ('closed', 'cancelled')
    or v_cash_closure_id is not null
  then
    raise exception
      'No se puede cobrar una orden cerrada o cancelada';
  end if;

  select coalesce(sum(amount), 0)
  into v_paid
  from public.payments
  where order_id = p_order_id
    and status = 'completed';

  v_remaining := greatest(v_total - v_paid, 0);

  if v_remaining = 0 then
    raise exception 'La orden ya está completamente pagada';
  end if;

  if p_amount > v_remaining then
    raise exception 'El importe supera el saldo pendiente';
  end if;

  insert into public.payments (
    order_id,
    amount,
    method,
    reference,
    notes,
    received_by
  )
  values (
    p_order_id,
    p_amount,
    p_method,
    nullif(btrim(p_reference), ''),
    nullif(btrim(p_notes), ''),
    auth.uid()
  )
  returning id
  into v_payment_id;

  return v_payment_id;
end;
$$;


-- =====================================================
-- PERMISOS RPC
-- =====================================================

revoke all
on function public.get_pending_cash_closure_summary()
from public;

revoke all
on function public.close_cash_register(text)
from public;

revoke all
on function public.register_order_payment(
  uuid,
  numeric,
  text,
  text,
  text
)
from public;


grant execute
on function public.get_pending_cash_closure_summary()
to authenticated;

grant execute
on function public.close_cash_register(text)
to authenticated;

grant execute
on function public.register_order_payment(
  uuid,
  numeric,
  text,
  text,
  text
)
to authenticated;