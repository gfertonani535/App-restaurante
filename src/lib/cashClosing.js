export const paymentMethodLabels = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  MERCADO_PAGO: 'Mercado Pago',
};

const mockPaidOrders = [
  { id: 'order-paid-001', paymentMethod: 'CASH', total: 4210 },
  { id: 'order-paid-002', paymentMethod: 'TRANSFER', total: 3100 },
  { id: 'order-paid-003', paymentMethod: 'CARD', total: 5140 },
  { id: 'order-paid-004', paymentMethod: 'MERCADO_PAGO', total: 0 },
];

export const latestCashTransactions = [
  {
    id: 'trx-001',
    time: '22:45',
    tableOrLocation: 'Mesa 12',
    paymentMethod: 'CARD',
    paymentLabel: 'Tarjeta Visa',
    total: 145,
    orderId: 'order-001',
  },
  {
    id: 'trx-002',
    time: '22:32',
    tableOrLocation: 'Mesa 04',
    paymentMethod: 'CASH',
    paymentLabel: 'Efectivo',
    total: 82.5,
    orderId: 'order-002',
  },
  {
    id: 'trx-003',
    time: '22:15',
    tableOrLocation: 'Mesa 21',
    paymentMethod: 'TRANSFER',
    paymentLabel: 'Transferencia',
    total: 210,
    orderId: 'order-003',
  },
  {
    id: 'trx-004',
    time: '21:58',
    tableOrLocation: 'Barra 02',
    paymentMethod: 'CASH',
    paymentLabel: 'Efectivo',
    total: 45,
    orderId: 'order-004',
  },
  {
    id: 'trx-005',
    time: '21:40',
    tableOrLocation: 'Mesa 15',
    paymentMethod: 'CARD',
    paymentLabel: 'Tarjeta Master',
    total: 320.4,
    orderId: 'order-005',
  },
  {
    id: 'trx-006',
    time: '21:22',
    tableOrLocation: 'Mesa 08',
    paymentMethod: 'CARD',
    paymentLabel: 'Tarjeta Visa',
    total: 112,
    orderId: 'order-006',
  },
];

export const initialCashClosingRecords = [
  {
    id: 'closing-001',
    date: '2024-05-24',
    closedAt: '2024-05-24T23:10:00',
    totalRevenue: 12450,
    cashExpected: 4210,
    cashCounted: 4210,
    transferTotal: 3100,
    cardTotal: 5140,
    mercadoPagoTotal: 0,
    difference: 0,
    status: 'BALANCED',
    notes: '',
    closedBy: 'Admin',
  },
  {
    id: 'closing-002',
    date: '2024-05-23',
    closedAt: '2024-05-23T23:04:00',
    totalRevenue: 3890.5,
    cashExpected: 1280,
    cashCounted: 1280,
    transferTotal: 980,
    cardTotal: 1630.5,
    mercadoPagoTotal: 0,
    difference: 0,
    status: 'BALANCED',
    notes: '',
    closedBy: 'Admin',
  },
  {
    id: 'closing-003',
    date: '2024-05-22',
    closedAt: '2024-05-22T23:18:00',
    totalRevenue: 4100,
    cashExpected: 1620,
    cashCounted: 1480,
    transferTotal: 900,
    cardTotal: 1580,
    mercadoPagoTotal: 0,
    difference: -140,
    status: 'CASH_SHORTAGE',
    notes: 'Diferencia detectada al cierre del turno noche.',
    closedBy: 'Admin',
  },
  {
    id: 'closing-004',
    date: '2024-05-21',
    closedAt: '2024-05-21T22:58:00',
    totalRevenue: 5210.75,
    cashExpected: 2140.75,
    cashCounted: 2180.75,
    transferTotal: 1200,
    cardTotal: 1870,
    mercadoPagoTotal: 0,
    difference: 40,
    status: 'CASH_SURPLUS',
    notes: 'Propinas mezcladas con caja principal.',
    closedBy: 'Admin',
  },
  {
    id: 'closing-005',
    date: '2024-05-20',
    closedAt: '2024-05-20T23:00:00',
    totalRevenue: 4800.2,
    cashExpected: 1530.2,
    cashCounted: 1530.2,
    transferTotal: 1090,
    cardTotal: 2180,
    mercadoPagoTotal: 0,
    difference: 0,
    status: 'BALANCED',
    notes: '',
    closedBy: 'Admin',
  },
  {
    id: 'closing-006',
    date: '2024-05-19',
    closedAt: '2024-05-19T22:48:00',
    totalRevenue: 3950,
    cashExpected: 1600,
    cashCounted: 1600,
    transferTotal: 750,
    cardTotal: 1600,
    mercadoPagoTotal: 0,
    difference: 0,
    status: 'PENDING_REVIEW',
    notes: 'Pendiente de validacion fiscal.',
    closedBy: 'Admin',
  },
];

export const closingStatusMeta = {
  BALANCED: {
    label: 'Correcto',
    badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    actionLabel: 'Mostrar detalles',
    actionClassName: 'text-neutral-500 hover:text-neutral-950',
  },
  CASH_SHORTAGE: {
    label: 'Discrepancia',
    badgeClassName: 'border-red-200 bg-red-50 text-red-700',
    actionLabel: 'Revisar detalles',
    actionClassName: 'text-red-700 hover:text-red-800',
  },
  CASH_SURPLUS: {
    label: 'Discrepancia',
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700',
    actionLabel: 'Revisar detalles',
    actionClassName: 'text-amber-700 hover:text-amber-800',
  },
  PENDING_REVIEW: {
    label: 'Pendiente de revisi\u00f3n',
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700',
    actionLabel: 'Revisar detalles',
    actionClassName: 'text-amber-700 hover:text-amber-800',
  },
};

export function formatCurrency(value) {
  return `$${Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateLabel(dateValue) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T12:00:00`));
}

export function calculateCashClosingSummary(orders = mockPaidOrders) {
  const summary = orders.reduce(
    (accumulator, order) => {
      if (order.paymentMethod === 'CASH') {
        accumulator.cashTotal += order.total;
      }

      if (order.paymentMethod === 'TRANSFER') {
        accumulator.transferTotal += order.total;
      }

      if (order.paymentMethod === 'CARD') {
        accumulator.cardTotal += order.total;
      }

      if (order.paymentMethod === 'MERCADO_PAGO') {
        accumulator.mercadoPagoTotal += order.total;
      }

      accumulator.totalRevenue += order.total;
      return accumulator;
    },
    {
      date: '2024-05-24',
      totalRevenue: 0,
      cashTotal: 0,
      transferTotal: 0,
      cardTotal: 0,
      mercadoPagoTotal: 0,
      paidOrdersCount: orders.length,
      pendingOrdersCount: 6,
    },
  );

  return {
    ...summary,
    paidOrdersCount: 38,
  };
}

export function getPercentageOfTotal(value, total) {
  if (!total) {
    return '0.0% del total';
  }

  return `${((value / total) * 100).toFixed(1)}% del total`;
}

export function getCashClosingStatus(difference) {
  if (difference === 0) {
    return 'BALANCED';
  }

  return difference < 0 ? 'CASH_SHORTAGE' : 'CASH_SURPLUS';
}

export function createCashClosingRecord(summary, data) {
  return {
    id: `closing-${Date.now()}`,
    date: summary.date,
    closedAt: new Date().toISOString(),
    totalRevenue: summary.totalRevenue,
    cashExpected: summary.cashTotal,
    cashCounted: data.cashCounted,
    transferTotal: summary.transferTotal,
    cardTotal: summary.cardTotal,
    mercadoPagoTotal: summary.mercadoPagoTotal,
    difference: data.difference,
    status: data.status,
    notes: data.notes,
    closedBy: 'Admin',
  };
}

export function downloadCashClosingPdf(record) {
  return {
    fileName: `cierre-caja-${record.date}.pdf`,
    status: 'prepared',
  };
}

export function exportRowsAsCsv(fileName, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
