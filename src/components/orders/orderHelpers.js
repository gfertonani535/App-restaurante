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
  open: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Lista',
  served: 'Servida',
  closed: 'Cerrada',
  cancelled: 'Cancelada',
};

export const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

const editableStatusOrder = ['open', 'preparing', 'ready', 'served'];

export function getProductsSummary(order) {
  return order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
}

export function getAdjacentStatus(currentStatus, direction) {
  const currentIndex = editableStatusOrder.indexOf(currentStatus);

  if (currentIndex === -1) {
    return null;
  }

  return editableStatusOrder[currentIndex + direction] ?? null;
}
