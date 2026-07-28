import { OPERATIVE_ORDER_STATUSES, ORDER_STATUS } from '@/constants/orderStatuses.js';

export const paymentMeta = {
  unpaid: {
    label: 'No pagado',
    tone: 'danger',
  },
  paid: {
    label: 'Pagado',
    tone: 'success',
  },
  partial: {
    label: 'Parcial',
    tone: 'warning',
  },
};

export const orderStatusMeta = {
  [ORDER_STATUS.OPEN]: 'Pendiente',
  [ORDER_STATUS.PREPARING]: 'Preparando',
  [ORDER_STATUS.READY]: 'Lista',
  [ORDER_STATUS.SERVED]: 'Servida',
  [ORDER_STATUS.CLOSED]: 'Cerrada',
  [ORDER_STATUS.CANCELLED]: 'Cancelada',
};

export const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

export function getProductsSummary(order) {
  return order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
}

export function getAdjacentStatus(currentStatus, direction) {
  const currentIndex = OPERATIVE_ORDER_STATUSES.indexOf(currentStatus);

  if (currentIndex === -1) {
    return null;
  }

  return OPERATIVE_ORDER_STATUSES[currentIndex + direction] ?? null;
}
