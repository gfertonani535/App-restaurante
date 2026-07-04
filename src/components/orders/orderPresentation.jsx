import { ChevronLeft, ChevronRight, Eye, Pencil, Printer, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { getAdjacentStatus, orderStatusMeta, paymentMeta } from '@/components/orders/orderHelpers.js';
import { cn } from '@/lib/utils';

const paymentToneVariants = {
  danger: 'destructive',
  success: 'success',
  warning: 'warning',
};

export function PaymentBadge({ className, paymentStatus }) {
  const payment = paymentMeta[paymentStatus] ?? paymentMeta.unpaid;

  return (
    <StatusBadge
      className={cn(
        'h-9 shrink-0 border px-2 py-1.5 text-[9px] tracking-[0.14em] sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]',
        className,
      )}
      label={payment.label}
      variant={paymentToneVariants[payment.tone]}
    />
  );
}

export function PaymentAction({ onCharge, order }) {
  const canCharge = order.paymentStatus !== 'paid' && !['closed', 'cancelled'].includes(order.status);

  if (!canCharge) {
    return <PaymentBadge paymentStatus={order.paymentStatus} />;
  }

  return (
    <Button
      aria-label="Cobrar pedido"
      className="group relative h-9 min-h-9 w-[112px] overflow-hidden rounded-md border-0 bg-transparent p-0 text-neutral-950 hover:bg-transparent focus-visible:ring-offset-0"
      onClick={() => onCharge(order)}
      type="button"
      variant="ghost"
    >
      <span className="absolute inset-0 hidden items-center justify-center transition-opacity duration-150 sm:flex sm:opacity-100 sm:group-hover:opacity-0 sm:group-focus-visible:opacity-0">
        <PaymentBadge className="w-full justify-center" paymentStatus={order.paymentStatus} />
      </span>
      <span className="absolute inset-0 flex items-center justify-center rounded-md bg-neutral-950 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
        Cobrar
      </span>
    </Button>
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

export function OrderActions({ order, onDelete, onEdit, onPrint, onView }) {
  const canEdit = order.paymentStatus !== 'paid' && !['closed', 'cancelled'].includes(order.status);
  const canDelete =
    order.paymentStatus === 'unpaid' && !order.cashClosureId && !['closed', 'cancelled'].includes(order.status);

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
      <Button
        aria-label="Eliminar pedido"
        className="grid size-10 min-h-10 place-items-center rounded-md px-0 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
        disabled={!canDelete}
        onClick={() => onDelete(order)}
        size="icon"
        title={canDelete ? `Eliminar ${order.orderNumber}` : 'Solo se pueden eliminar pedidos sin pagos'}
        type="button"
        variant="ghost"
      >
        <Trash2 className="size-5" aria-hidden="true" />
      </Button>
      <IconButton label={`Imprimir ${order.orderNumber}`} onClick={() => onPrint(order)}>
        <Printer className="size-5" aria-hidden="true" />
      </IconButton>
    </div>
  );
}
