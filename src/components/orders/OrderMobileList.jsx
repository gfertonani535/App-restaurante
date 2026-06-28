import { formatCurrency, formatTime } from '@/utils/formatters.js';
import { getProductsSummary } from '@/components/orders/orderHelpers.js';
import { OrderActions, OrderStatusControl, PaymentBadge } from '@/components/orders/orderPresentation.jsx';

function OrderMobileCard({ isStatusControlDisabled = false, isUpdatingStatus, onChangeStatus, order, onCharge, onEdit, onPrint, onView }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-none text-neutral-950">{order.orderNumber}</p>
        </div>
        <PaymentBadge paymentStatus={order.paymentStatus} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 text-sm">
        <div>
          <p className="mt-1 font-semibold text-neutral-950">{order.tableOrLocation}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Hora</p>
          <p className="mt-1 font-semibold text-neutral-950">{formatTime(order.createdAt)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Mesa / Cliente</p>
          <p className="mt-1 font-semibold text-neutral-950">{order.customerOrWaiter}</p>
          <p className="text-neutral-400">{order.waiterLabel}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Estado</p>
          <div className="mt-2">
            <OrderStatusControl
              isDisabled={isStatusControlDisabled}
              isUpdating={isUpdatingStatus}
              onChangeStatus={onChangeStatus}
              order={order}
            />
          </div>
        </div>
        <div className="col-span-2 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Productos</p>
          <p className="mt-1 block w-full max-w-full whitespace-normal break-words text-sm leading-5 text-neutral-600">
            {getProductsSummary(order)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Total</p>
          <p className="mt-1 text-xl font-bold leading-none text-neutral-950">{formatCurrency(order.total)}</p>
        </div>
        <OrderActions order={order} onCharge={onCharge} onEdit={onEdit} onPrint={onPrint} onView={onView} />
      </div>
    </article>
  );
}

export function OrderMobileList({
  onChangeStatus,
  onCharge,
  onEdit,
  onPrint,
  onView,
  orders,
  updatingStatusOrderId,
}) {
  return (
    <section className="grid gap-4 lg:hidden" aria-label="Listado de órdenes">
      {orders.map((order) => (
        <OrderMobileCard
          key={order.id}
          isStatusControlDisabled={Boolean(updatingStatusOrderId) && updatingStatusOrderId !== order.id}
          isUpdatingStatus={updatingStatusOrderId === order.id}
          onChangeStatus={onChangeStatus}
          order={order}
          onCharge={onCharge}
          onEdit={onEdit}
          onPrint={onPrint}
          onView={onView}
        />
      ))}
    </section>
  );
}
