import { supabase } from '@/lib/supabase.js';

// Servicio centralizado: mantiene las consultas de ?rdenes a Supabase fuera de los componentes.

const OPERATIVE_ORDER_STATUSES = ['open', 'preparing', 'ready', 'served'];

const ORDER_SELECT = `
  id,
  order_number,
  table_label,
  customer_name,
  status,
  payment_status,
  notes,
  subtotal,
  discount,
  total,
  created_by,
  assigned_to,
  cash_closure_id,
  paid_at,
  closed_at,
  created_at,
  updated_at,
  items:order_items (
    id,
    order_id,
    product_id,
    product_name,
    unit_price,
    quantity,
    notes,
    line_total,
    created_at,
    updated_at
  ),
  payments (
    id,
    order_id,
    amount,
    method,
    status,
    reference,
    notes,
    paid_at,
    created_at,
    updated_at
  ),
  creator:profiles!orders_created_by_fkey (
    id,
    full_name,
    role
  ),
  assigned:profiles!orders_assigned_to_fkey (
    id,
    full_name,
    role
  )
`;

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  return supabase;
}

function translateSupabaseError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  const message = String(error.message ?? '').toLowerCase();

  if (error.code === '42501' || message.includes('row-level security') || message.includes('permission')) {
    return 'No tenés permisos para realizar esta acción.';
  }

  if (message.includes('jwt') || message.includes('auth')) {
    return 'Tu sesión expiró. Volvé a iniciar sesión.';
  }

  if (message.includes('orden debe tener al menos un producto')) {
    return 'La orden debe tener al menos un producto.';
  }

  if (message.includes('orden ya esta') || message.includes('completamente pagada')) {
    return 'La orden ya está completamente pagada.';
  }

  if (message.includes('importe supera')) {
    return 'El importe supera el saldo pendiente.';
  }

  if (message.includes('importe debe ser mayor')) {
    return 'El importe debe ser mayor a cero.';
  }

  if (message.includes('cerrada') || message.includes('cancelada')) {
    return 'No se puede editar una orden cerrada o cancelada.';
  }

  return fallbackMessage;
}

function toNumber(value) {
  const parsedValue = Number(value ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function normalizeProfile(profile) {
  const normalizedProfile = Array.isArray(profile) ? profile[0] : profile;

  if (!normalizedProfile) {
    return null;
  }

  return {
    id: normalizedProfile.id,
    fullName: normalizedProfile.full_name ?? '',
    role: normalizedProfile.role ?? '',
  };
}

function normalizeItem(item) {
  return {
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id,
    name: item.product_name,
    shortDescription: item.notes ?? '',
    notes: item.notes ?? '',
    quantity: Number(item.quantity ?? 0),
    unitPrice: toNumber(item.unit_price),
    subtotal: toNumber(item.line_total),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function normalizePayment(payment) {
  return {
    id: payment.id,
    orderId: payment.order_id,
    amount: toNumber(payment.amount),
    method: payment.method,
    status: payment.status,
    reference: payment.reference ?? '',
    notes: payment.notes ?? '',
    paidAt: payment.paid_at,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at,
  };
}

function getOrderType(tableLabel) {
  const normalizedValue = String(tableLabel ?? '').trim().toLowerCase();

  if (!normalizedValue || normalizedValue === '-') {
    return 'DELIVERY';
  }

  return normalizedValue.includes('take') ? 'TAKEAWAY' : 'SALON';
}

export function normalizeOrder(order) {
  if (!order) {
    return null;
  }

  const items = (order.items ?? []).map(normalizeItem);
  const payments = (order.payments ?? []).map(normalizePayment);
  const creator = normalizeProfile(order.creator);
  const assigned = normalizeProfile(order.assigned);
  const responsibleName = assigned?.fullName || creator?.fullName || 'Sin asignar';

  return {
    id: order.id,
    orderNumberValue: Number(order.order_number ?? 0),
    orderNumber: `#${order.order_number}`,
    type: getOrderType(order.table_label),
    tableOrLocation: order.table_label || '-',
    customerOrWaiter: order.customer_name || 'Cliente sin nombre',
    waiterLabel: `Mesa: ${order.table_label || '-'}`,
    responsibleName,
    status: order.status,
    paymentStatus: order.payment_status,
    notes: order.notes ?? '',
    subtotal: toNumber(order.subtotal),
    discount: toNumber(order.discount),
    total: toNumber(order.total),
    createdBy: order.created_by,
    assignedTo: order.assigned_to,
    cashClosureId: order.cash_closure_id,
    creator,
    assigned,
    paidAt: order.paid_at,
    closedAt: order.closed_at,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items,
    payments,
  };
}

export async function getOrders() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .select(ORDER_SELECT)
    .in('status', ['open', 'preparing', 'ready', 'served'])
    .order('created_at', { ascending: false })
    .limit(250);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar las órdenes.'));
  }

  return (data ?? []).map(normalizeOrder);
}

export async function getOrderById(orderId) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar la orden.'));
  }

  return normalizeOrder(data);
}

export async function createOrder(payload) {
  const client = ensureSupabaseClient();
  // RPC: crea la orden y sus ?tems como una ?nica operaci?n consistente.
  const { data, error } = await client.rpc('create_order_with_items', {
    p_table_label: payload.tableLabel || null,
    p_customer_name: payload.customerName || null,
    p_notes: payload.notes || null,
    p_items: payload.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      notes: item.notes || null,
    })),
  });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo crear la orden.'));
  }

  return data;
}

export async function updateOrder(orderId, payload) {
  const client = ensureSupabaseClient();
  // RPC: actualiza orden e ?tems sin enviar precios manipulables desde React.
  const { error } = await client.rpc('update_order_with_items', {
    p_order_id: orderId,
    p_table_label: payload.tableLabel || null,
    p_customer_name: payload.customerName || null,
    p_notes: payload.notes || null,
    p_status: payload.status,
    p_items: payload.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      notes: item.notes || null,
    })),
  });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar la orden.'));
  }
}

export async function updateOrderStatus(orderId, status) {
  if (!OPERATIVE_ORDER_STATUSES.includes(status)) {
    throw new Error('Solo se puede cambiar a estados operativos.');
  }

  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .in('status', OPERATIVE_ORDER_STATUSES)
    .select(ORDER_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo actualizar el estado de la orden.'));
  }

  if (!data) {
    throw new Error('No se puede cambiar el estado de una orden cerrada o cancelada.');
  }

  return normalizeOrder(data);
}

export async function cancelOrder(orderId) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .in('status', OPERATIVE_ORDER_STATUSES)
    .select(ORDER_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cancelar la orden.'));
  }

  if (!data) {
    throw new Error('No se puede cancelar una orden cerrada o ya cancelada.');
  }

  return normalizeOrder(data);
}

export async function registerPayment(payload) {
  const client = ensureSupabaseClient();
  // RPC: registra el pago y deja que Supabase actualice payment_status.
  const { data, error } = await client.rpc('register_order_payment', {
    p_order_id: payload.orderId,
    p_amount: Number(payload.amount),
    p_method: payload.method,
    p_reference: payload.reference || null,
    p_notes: payload.notes || null,
  });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo registrar el pago.'));
  }

  return data;
}

export async function getOrderPayments(orderId) {
  const order = await getOrderById(orderId);
  return order?.payments ?? [];
}

export function calculateOrderPaidTotal(order) {
  return (order?.payments ?? [])
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function calculateOrderRemainingTotal(order) {
  return Math.max((order?.total ?? 0) - calculateOrderPaidTotal(order), 0);
}
