-- =====================================================
-- RESTAURANTOS - FUNCIONES RPC PARA ÓRDENES
-- =====================================================

-- -----------------------------------------------------
-- CREAR ORDEN CON TODOS SUS ÍTEMS
--
-- p_items esperado:
-- [
--   {
--     "product_id": "uuid",
--     "quantity": 2,
--     "notes": "Sin cebolla"
--   }
-- ]
-- -----------------------------------------------------

create or replace function public.create_order_with_items(
  p_table_label text default null,
  p_customer_name text default null,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_product_name text;
  v_unit_price numeric(12, 2);
  v_quantity integer;
  v_item_notes text;
begin
  if not public.can_access_orders() then
    raise exception 'No autorizado para crear órdenes';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0
  then
    raise exception 'La orden debe tener al menos un producto';
  end if;

  insert into public.orders (
    table_label,
    customer_name,
    notes,
    created_by
  )
  values (
    nullif(trim(p_table_label), ''),
    nullif(trim(p_customer_name), ''),
    nullif(trim(p_notes), ''),
    auth.uid()
  )
  returning id into v_order_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
    exception
      when others then
        raise exception 'Producto inválido en la orden';
    end;

    v_quantity := coalesce(
      (v_item ->> 'quantity')::integer,
      1
    );

    v_item_notes := nullif(
      trim(v_item ->> 'notes'),
      ''
    );

    if v_quantity <= 0 then
      raise exception 'La cantidad debe ser mayor a cero';
    end if;

    select
      name,
      price
    into
      v_product_name,
      v_unit_price
    from public.products
    where id = v_product_id
      and is_active = true;

    if not found then
      raise exception 'El producto % no existe o está inactivo', v_product_id;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      notes
    )
    values (
      v_order_id,
      v_product_id,
      v_product_name,
      v_unit_price,
      v_quantity,
      v_item_notes
    );
  end loop;

  return v_order_id;
end;
$$;


-- -----------------------------------------------------
-- ACTUALIZAR ORDEN E ÍTEMS
-- Reemplaza los ítems de una orden que todavía
-- no está cerrada ni cancelada.
-- -----------------------------------------------------

create or replace function public.update_order_with_items(
  p_order_id uuid,
  p_table_label text,
  p_customer_name text,
  p_notes text,
  p_status text,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product_id uuid;
  v_product_name text;
  v_unit_price numeric(12, 2);
  v_quantity integer;
  v_item_notes text;
  v_current_status text;
begin
  if not public.can_access_orders() then
    raise exception 'No autorizado para editar órdenes';
  end if;

  select status
  into v_current_status
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'La orden no existe';
  end if;

  if v_current_status in ('closed', 'cancelled') then
    raise exception 'No se puede editar una orden cerrada o cancelada';
  end if;

  if p_status not in (
    'open',
    'preparing',
    'ready',
    'served'
  ) then
    raise exception 'Estado de orden inválido';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0
  then
    raise exception 'La orden debe tener al menos un producto';
  end if;

  update public.orders
  set
    table_label = nullif(trim(p_table_label), ''),
    customer_name = nullif(trim(p_customer_name), ''),
    notes = nullif(trim(p_notes), ''),
    status = p_status
  where id = p_order_id;

  delete from public.order_items
  where order_id = p_order_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
    exception
      when others then
        raise exception 'Producto inválido en la orden';
    end;

    v_quantity := coalesce(
      (v_item ->> 'quantity')::integer,
      1
    );

    v_item_notes := nullif(
      trim(v_item ->> 'notes'),
      ''
    );

    if v_quantity <= 0 then
      raise exception 'La cantidad debe ser mayor a cero';
    end if;

    select
      name,
      price
    into
      v_product_name,
      v_unit_price
    from public.products
    where id = v_product_id
      and is_active = true;

    if not found then
      raise exception 'El producto % no existe o está inactivo', v_product_id;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      notes
    )
    values (
      p_order_id,
      v_product_id,
      v_product_name,
      v_unit_price,
      v_quantity,
      v_item_notes
    );
  end loop;
end;
$$;


-- -----------------------------------------------------
-- REGISTRAR PAGO
-- El trigger existente actualiza payment_status.
-- -----------------------------------------------------

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
begin
  if not public.can_manage_payments() then
    raise exception 'No autorizado para registrar pagos';
  end if;

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
    status
  into
    v_total,
    v_order_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'La orden no existe';
  end if;

  if v_order_status = 'cancelled' then
    raise exception 'No se puede cobrar una orden cancelada';
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
    nullif(trim(p_reference), ''),
    nullif(trim(p_notes), ''),
    auth.uid()
  )
  returning id into v_payment_id;

  return v_payment_id;
end;
$$;


-- -----------------------------------------------------
-- PERMISOS DE EJECUCIÓN
-- -----------------------------------------------------

revoke all
on function public.create_order_with_items(
  text,
  text,
  text,
  jsonb
)
from public;

revoke all
on function public.update_order_with_items(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
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
on function public.create_order_with_items(
  text,
  text,
  text,
  jsonb
)
to authenticated;

grant execute
on function public.update_order_with_items(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
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