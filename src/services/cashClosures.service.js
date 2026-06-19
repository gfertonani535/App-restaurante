import { supabase } from '@/lib/supabase.js';

const CLOSURE_SELECT = `
  id,
  closure_number,
  closed_at,
  closed_by,
  orders_count,
  payments_count,
  cash_total,
  card_total,
  transfer_total,
  other_total,
  total,
  notes,
  created_at,
  updated_at,
  closer:profiles!cash_closures_closed_by_fkey (
    id,
    full_name,
    role
  )
`;

const PENDING_PAYMENT_SELECT = `
  id,
  order_id,
  amount,
  method,
  status,
  reference,
  notes,
  paid_at,
  order:orders (
    id,
    order_number,
    table_label,
    customer_name,
    status,
    cash_closure_id
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

  if (message.includes('no autorizado para cerrar')) {
    return 'No tenés permisos para cerrar la caja.';
  }

  if (message.includes('no autorizado')) {
    return 'No tenés permisos para realizar esta acción.';
  }

  if (message.includes('pendientes de cobro')) {
    return 'Completá o cancelá las órdenes pendientes antes de cerrar.';
  }

  if (message.includes('no hay pagos pendientes')) {
    return 'No hay pagos disponibles para cerrar.';
  }

  if (error.code === '42501' || message.includes('row-level security') || message.includes('permission')) {
    return 'No tenés permisos para realizar esta acción.';
  }

  if (message.includes('jwt') || message.includes('auth')) {
    return 'Tu sesión expiró. Volvé a iniciar sesión.';
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

function normalizeClosure(row) {
  if (!row) {
    return null;
  }

  const closer = normalizeProfile(row.closer);

  return {
    id: row.id,
    closureNumber: row.closure_number,
    closedAt: row.closed_at,
    closedBy: closer?.fullName || 'Sin asignar',
    closer,
    ordersCount: Number(row.orders_count ?? 0),
    paymentsCount: Number(row.payments_count ?? 0),
    cashTotal: toNumber(row.cash_total),
    cardTotal: toNumber(row.card_total),
    transferTotal: toNumber(row.transfer_total),
    otherTotal: toNumber(row.other_total),
    total: toNumber(row.total),
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizePendingSummary(row) {
  return {
    ordersCount: Number(row?.orders_count ?? 0),
    paymentsCount: Number(row?.payments_count ?? 0),
    cashTotal: toNumber(row?.cash_total),
    cardTotal: toNumber(row?.card_total),
    transferTotal: toNumber(row?.transfer_total),
    otherTotal: toNumber(row?.other_total),
    total: toNumber(row?.total),
    blockingOrdersCount: Number(row?.blocking_orders_count ?? 0),
    canClose: Boolean(row?.can_close),
  };
}

function normalizePayment(row) {
  const order = Array.isArray(row.order) ? row.order[0] : row.order;

  return {
    id: row.id,
    orderId: row.order_id,
    amount: toNumber(row.amount),
    method: row.method,
    status: row.status,
    reference: row.reference ?? '',
    notes: row.notes ?? '',
    paidAt: row.paid_at,
    order: order
      ? {
          id: order.id,
          orderNumber: order.order_number,
          tableLabel: order.table_label ?? '',
          customerName: order.customer_name ?? '',
          status: order.status,
          cashClosureId: order.cash_closure_id,
        }
      : null,
  };
}

function normalizeClosureResult(row, notes = '') {
  return {
    id: row.cash_closure_id,
    closureNumber: row.closure_number,
    closedAt: row.closed_at,
    ordersCount: Number(row.orders_count ?? 0),
    paymentsCount: Number(row.payments_count ?? 0),
    cashTotal: toNumber(row.cash_total),
    cardTotal: toNumber(row.card_total),
    transferTotal: toNumber(row.transfer_total),
    otherTotal: toNumber(row.other_total),
    total: toNumber(row.total),
    notes,
  };
}

export async function getPendingCashClosureSummary() {
  const client = ensureSupabaseClient();
  const { data, error } = await client.rpc('get_pending_cash_closure_summary');

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar el resumen de caja.'));
  }

  const row = Array.isArray(data) ? data[0] : data;
  return normalizePendingSummary(row);
}

export async function getPendingClosurePayments() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('payments')
    .select(PENDING_PAYMENT_SELECT)
    .eq('status', 'completed')
    .is('cash_closure_id', null)
    .order('paid_at', { ascending: false });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar las transacciones.'));
  }

  return (data ?? [])
    .map(normalizePayment)
    .filter((payment) => payment.order && !payment.order.cashClosureId && payment.order.status !== 'cancelled');
}

export async function closeCashRegister(notes = '') {
  const client = ensureSupabaseClient();
  const normalizedNotes = notes.trim();
  const { data, error } = await client.rpc('close_cash_register', {
    p_notes: normalizedNotes || null,
  });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cerrar la caja.'));
  }

  const row = Array.isArray(data) ? data[0] : data;
  return normalizeClosureResult(row, normalizedNotes);
}

export async function getCashClosures() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('cash_closures')
    .select(CLOSURE_SELECT)
    .order('closed_at', { ascending: false });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar el registro historico.'));
  }

  return (data ?? []).map(normalizeClosure);
}

export async function getCashClosureById(closureId) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('cash_closures')
    .select(CLOSURE_SELECT)
    .eq('id', closureId)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar el cierre.'));
  }

  return normalizeClosure(data);
}

export async function getCashClosureOrders(closureId) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .select('id, order_number, table_label, customer_name, status, payment_status, total, created_at, closed_at')
    .eq('cash_closure_id', closureId)
    .order('order_number', { ascending: true });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar las órdenes del cierre.'));
  }

  return (data ?? []).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    tableLabel: order.table_label ?? '',
    customerName: order.customer_name ?? '',
    status: order.status,
    paymentStatus: order.payment_status,
    total: toNumber(order.total),
    createdAt: order.created_at,
    closedAt: order.closed_at,
  }));
}

export async function getCashClosurePayments(closureId) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('payments')
    .select('id, order_id, amount, method, status, reference, paid_at')
    .eq('cash_closure_id', closureId)
    .eq('status', 'completed')
    .order('paid_at', { ascending: true });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar los pagos del cierre.'));
  }

  return (data ?? []).map((payment) => ({
    id: payment.id,
    orderId: payment.order_id,
    amount: toNumber(payment.amount),
    method: payment.method,
    status: payment.status,
    reference: payment.reference ?? '',
    paidAt: payment.paid_at,
  }));
}
