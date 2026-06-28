import { ChevronLeft, ChevronRight, Eye, Pencil, Printer } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { getAdjacentStatus, orderStatusMeta, paymentMeta } from '@/components/orders/orderHelpers.js';

const paymentToneVariants = {
  danger: 'destructive',
  success: 'success',
  warning: 'warning',
};

export function PaymentBadge({ paymentStatus }) {
  const payment = paymentMeta[paymentStatus] ?? paymentMeta.unpaid;

  return (
    <StatusBadge
      className="shrink-0 px-2 py-1.5 text-[9px] tracking-[0.14em] sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]"
      label={payment.label}
      variant={paymentToneVariants[payment.tone]}
    />
  );
}

export function OrderStatusControl({ isDisabled = false, isUpdating = false, onChangeStatus, order }) {
  const previousStatus = getAdjacentStatus(order.status, -1);
  const nextStatus = getAdjacentStatus(order.status, 1);
  const label = orderStatusMeta[order.status] ?? order.status;
  const controlsDisabled = isDisabled || isUpdating;

  return (
    <div className="inline-flex min-h-10 items-center overflow-hidden rounded-full border border-neutral-200 bg-white text-xs font-bold uppercase tracking-[0.08em] text-neutral-950 transition-colors">
      <IconButton
        aria-label={`Volver estado de ${order.orderNumber}`}
        className="size-9 rounded-none hover:bg-neutral-100"
        disabled={!previousStatus || controlsDisabled}
        onClick={() => previousStatus && onChangeStatus(order, previousStatus)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </IconButton>
      <span className="min-w-28 border-x border-neutral-200 px-3 py-2 y-10 text-center leading-tight">
        {isUpdating ? '' : label}
      </span>
      <IconButton
        aria-label={`Avanzar estado de ${order.orderNumber}`}
        className="size-9 rounded-none hover:bg-neutral-100"
        disabled={!nextStatus || controlsDisabled}
        onClick={() => nextStatus && onChangeStatus(order, nextStatus)}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </IconButton>
    </div>
  );
}

export function OrderActions({ order, onCharge, onEdit, onPrint, onView }) {
  const canCharge = order.paymentStatus !== 'paid' && !['closed', 'cancelled'].includes(order.status);
  const canEdit = order.paymentStatus !== 'paid' && !['closed', 'cancelled'].includes(order.status);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <IconButton label={`Ver detalle de ${order.orderNumber}`} onClick={() => onView(order)}>
        <Eye className="size-5" aria-hidden="true" />
      </IconButton>
      <IconButton
        disabled={!canEdit}
        label={`Editar ${order.orderNumber}`}
        onClick={() => onEdit(order)}
        title={canEdit ? undefined : 'Las órdenes pagadas no se pueden editar'}
      >
        <Pencil className="size-5" aria-hidden="true" />
      </IconButton>
      {canCharge ? (
        <Button
          className="rounded-lg px-4"
          onClick={() => onCharge(order)}
          size="sm"
          type="button"
        >
          Cobrar
        </Button>
      ) : (
        <Button
          className="min-h-10 rounded-lg px-4 text-neutral-400"
          disabled
          size="sm"
          type="button"
          variant="secondary"
        >
          Pagado
        </Button>
      )}
      <IconButton label={`Imprimir ${order.orderNumber}`} onClick={() => onPrint(order)}>
        <Printer className="size-5" aria-hidden="true" />
      </IconButton>
    </div>
  );
}
