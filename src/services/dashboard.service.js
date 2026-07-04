import { supabase } from '@/lib/supabase.js';

// Servicio centralizado: el dashboard solo consume lecturas reales agregadas desde Supabase.

const ACTIVE_ORDER_STATUSES = ['open', 'preparing', 'ready', 'served'];

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
    return 'No tenés permisos para ver el dashboard.';
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

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
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

function normalizeRecentOrder(order) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    tableLabel: order.table_label || '-',
    customerName: order.customer_name || 'Cliente',
    status: order.status,
    paymentStatus: order.payment_status,
    total: toNumber(order.total),
    createdAt: order.created_at,
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
    ordersCount: Number(row.orders_count ?? 0),
    paymentsCount: Number(row.payments_count ?? 0),
    total: toNumber(row.total),
  };
}

function buildPaymentSummary(payments) {
  const summary = {
    total: 0,
    count: payments.length,
    paidOrderCount: 0,
    byMethod: {
      cash: 0,
      card: 0,
      transfer: 0,
      other: 0,
    },
  };
  const paidOrderIds = new Set();

  payments.forEach((payment) => {
    const amount = toNumber(payment.amount);
    const method = payment.method && summary.byMethod[payment.method] !== undefined ? payment.method : 'other';

    summary.total += amount;
    summary.byMethod[method] += amount;

    if (payment.order_id) {
      paidOrderIds.add(payment.order_id);
    }
  });

  summary.paidOrderCount = paidOrderIds.size;
  return summary;
}

function buildActiveOrdersSummary(orders) {
  const byStatus = {
    open: 0,
    preparing: 0,
    ready: 0,
    served: 0,
  };
  let paidPendingClosure = 0;

  orders.forEach((order) => {
    if (byStatus[order.status] !== undefined) {
      byStatus[order.status] += 1;
    }

    if (order.payment_status === 'paid') {
      paidPendingClosure += 1;
    }
  });

  return {
    total: orders.length,
    byStatus,
    paidPendingClosure,
  };
}

export async function getTodayPaymentsSummary() {
  const client = ensureSupabaseClient();
  const { startIso, endIso } = getTodayRange();
  const { data, error } = await client
    .from('payments')
    .select('amount, method, paid_at, order_id')
    .eq('status', 'completed')
    .gte('paid_at', startIso)
    .lte('paid_at', endIso);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar los pagos del dia.'));
  }

  return buildPaymentSummary(data ?? []);
}

export async function getActiveOrdersSummary() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .select('id, status, payment_status, total')
    .in('status', ACTIVE_ORDER_STATUSES);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar las órdenes activas.'));
  }

  return buildActiveOrdersSummary(data ?? []);
}

export async function getRecentOrders() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .select('id, order_number, table_label, customer_name, status, payment_status, total, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar las últimas órdenes.'));
  }

  return (data ?? []).map(normalizeRecentOrder);
}

export async function getLastCashClosure() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('cash_closures')
    .select(
      `
        id,
        closure_number,
        closed_at,
        orders_count,
        payments_count,
        total,
        closed_by,
        closer:profiles!cash_closures_closed_by_fkey (
          id,
          full_name,
          role
        )
      `,
    )
    .order('closed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar el ultimo cierre.'));
  }

  return normalizeClosure(data);
}

export async function getDashboardSummary() {
  const [paymentsSummary, activeOrdersSummary, recentOrders, lastCashClosure] = await Promise.all([
    getTodayPaymentsSummary(),
    getActiveOrdersSummary(),
    getRecentOrders(),
    getLastCashClosure(),
  ]);

  return {
    paymentsSummary,
    activeOrdersSummary,
    recentOrders,
    lastCashClosure,
    averageTicket:
      paymentsSummary.paidOrderCount > 0 ? paymentsSummary.total / paymentsSummary.paidOrderCount : 0,
  };
}
