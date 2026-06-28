import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { formatCurrency, formatTime } from '@/utils/formatters.js';
import { getProductsSummary } from '@/components/orders/orderHelpers.js';
import { OrderActions, OrderStatusControl, PaymentBadge } from '@/components/orders/orderPresentation.jsx';

const tableSortColumns = [
  { id: 'orderNumber', label: 'Orden' },
  { id: 'tableCustomer', label: 'Mesa/Cliente' },
  { id: 'products', label: 'Productos' },
  { id: 'total', label: 'Total' },
  { id: 'status', label: 'Estado' },
  { id: 'paymentStatus', label: 'Pago' },
  { id: 'createdAt', label: 'Hora' },
];

const ordersTableClassName =
  'min-w-[1080px] [&_td:not(:last-child)]:border-r [&_td:not(:last-child)]:border-neutral-200 [&_th:not(:last-child)]:border-r [&_th:not(:last-child)]:border-neutral-200';
const ordersTableHeadClassName = 'px-4 py-4 text-center text-sm font-bold text-neutral-950';
const ordersTableCellClassName = 'px-4 py-4';

function SortableTableHeader({ label, onSort, sortDirection, sortKey, value }) {
  const isActive = sortKey === value;

  return (
    <TableHead
      aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={ordersTableHeadClassName}
    >
      <button
        aria-label={`Ordenar por ${label}`}
        className="inline-flex items-center gap-1 text-center transition-colors hover:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSort(value)}
        type="button"
      >
        {label}
        {isActive ? <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span> : null}
      </button>
    </TableHead>
  );
}

export function OrdersTable({
  isStatusControlDisabled,
  onChangeStatus,
  onCharge,
  onEdit,
  onPrint,
  onSort,
  onView,
  orders,
  sortDirection,
  sortKey,
  updatingStatusOrderId,
}) {
  return (
    <section className="hidden overflow-x-auto lg:block">
      <Table className={ordersTableClassName}>
        <TableHeader className="border-b-2 border-neutral-950">
          <TableRow className="hover:bg-transparent">
            {tableSortColumns.map((column) => (
              <SortableTableHeader
                key={column.id}
                label={column.label}
                onSort={onSort}
                sortDirection={sortDirection}
                sortKey={sortKey}
                value={column.id}
              />
            ))}
            <TableHead className={ordersTableHeadClassName}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow className="transition-colors last:border-b-0 hover:bg-neutral-50" key={order.id}>
              <TableCell className={ordersTableCellClassName}>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-neutral-950">{order.orderNumber}</span>
                </div>
              </TableCell>
              <TableCell className={ordersTableCellClassName}>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-neutral-950">{order.customerOrWaiter}</span>
                  <span className="text-sm text-neutral-400">{order.waiterLabel}</span>
                </div>
              </TableCell>
              <TableCell className={ordersTableCellClassName}>
                <div className="max-w-[220px] truncate text-sm text-neutral-600">{getProductsSummary(order)}</div>
              </TableCell>
              <TableCell className={ordersTableCellClassName}>
                <span className="text-base font-bold text-neutral-950">{formatCurrency(order.total)}</span>
              </TableCell>
              <TableCell className={ordersTableCellClassName}>
                <OrderStatusControl
                  isDisabled={isStatusControlDisabled && updatingStatusOrderId !== order.id}
                  isUpdating={updatingStatusOrderId === order.id}
                  onChangeStatus={onChangeStatus}
                  order={order}
                />
              </TableCell>
              <TableCell className={ordersTableCellClassName}>
                <PaymentBadge paymentStatus={order.paymentStatus} />
              </TableCell>
              <TableCell className={`${ordersTableCellClassName} text-sm text-neutral-500`}>
                {formatTime(order.createdAt)}
              </TableCell>
              <TableCell className={ordersTableCellClassName}>
                <div className="flex items-center justify-end gap-2">
                  <OrderActions
                    order={order}
                    onCharge={onCharge}
                    onEdit={onEdit}
                    onPrint={onPrint}
                    onView={onView}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
