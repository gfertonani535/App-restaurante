import { X } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton.jsx';
import { formatCurrency, formatTime } from '@/utils/formatters.js';
import { orderStatusMeta, paymentMeta, paymentMethodLabels } from '@/components/orders/orderHelpers.js';

export function OrderDetailsDialog({ order, onClose }) {
  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden border border-neutral-300 bg-white">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-200 px-5">
          <div>
            <h2 className="text-lg font-bold">Detalle {order.orderNumber}</h2>
            <p className="text-sm text-neutral-500">{formatTime(order.createdAt)}</p>
          </div>
          <IconButton className="rounded-none" label="Cerrar detalle" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </header>

        <div className="grid gap-5 overflow-y-auto p-5">
          <section className="grid gap-3 text-sm sm:grid-cols-2">
            <p><strong>Cliente:</strong> {order.customerOrWaiter}</p>
            <p><strong>Responsable:</strong> {order.responsibleName}</p>
            <p><strong>Estado:</strong> {orderStatusMeta[order.status] ?? order.status}</p>
            <p><strong>Pago:</strong> {paymentMeta[order.paymentStatus]?.label ?? order.paymentStatus}</p>
            <p><strong>Notas:</strong> {order.notes || 'Sin notas'}</p>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em]">Items</h3>
            <div className="divide-y divide-neutral-100 border border-neutral-200">
              {order.items.map((item) => (
                <div className="grid gap-2 p-3 sm:grid-cols-[1fr_auto]" key={item.id ?? `${item.productId}-${item.name}`}>
                  <div>
                    <p className="font-bold">{item.quantity}x {item.name}</p>
                    <p className="text-sm text-neutral-500">{item.notes || 'Sin notas de item'}</p>
                  </div>
                  <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em]">Pagos</h3>
            {order.payments.length === 0 ? (
              <p className="border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">No hay pagos registrados.</p>
            ) : (
              <div className="divide-y divide-neutral-100 border border-neutral-200">
                {order.payments.map((payment) => (
                  <div className="grid gap-2 p-3 sm:grid-cols-[1fr_auto]" key={payment.id}>
                    <div>
                      <p className="font-bold">{paymentMethodLabels[payment.method] ?? payment.method}</p>
                      <p className="text-sm text-neutral-500">{payment.reference || payment.notes || 'Sin referencia'}</p>
                    </div>
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="ml-auto grid w-full max-w-sm gap-2 border border-neutral-200 p-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(order.subtotal)}</strong></div>
            <div className="flex justify-between"><span>Descuento</span><strong>{formatCurrency(order.discount)}</strong></div>
            <div className="flex justify-between text-lg"><span>Total</span><strong>{formatCurrency(order.total)}</strong></div>
          </section>
        </div>
      </div>
    </div>
  );
}
