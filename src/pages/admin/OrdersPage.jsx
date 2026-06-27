import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Filter, Pencil, Plus, Printer, X } from 'lucide-react';
import { OrderModal } from '@/components/backoffice/OrderModal.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { EmptyState } from '@/components/common/EmptyState.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { FeedbackMessage } from '@/components/common/FeedbackMessage.jsx';
import { IconButton } from '@/components/common/IconButton.jsx';
import { Pagination } from '@/components/common/Pagination.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchField } from '@/components/common/SearchField.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { getCategories } from '@/services/categories.service.js';
import { getProducts } from '@/services/products.service.js';
import {
  calculateOrderPaidTotal,
  calculateOrderRemainingTotal,
  createOrder,
  getOrderById,
  getOrders,
  registerPayment,
  updateOrder,
  updateOrderStatus,
} from '@/services/orders.service.js';
import { formatCurrency, formatTime } from '@/utils/formatters.js';

const filterDefinitions = [
  { id: 'all', label: 'Todas' },
  { id: 'open', label: 'Pendientes' },
  { id: 'preparing', label: 'Preparando' },
  { id: 'ready', label: 'Listas' },
  { id: 'paid', label: 'Pagadas' },
];

const paymentMeta = {
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

const orderStatusMeta = {
  open: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Lista',
  served: 'Servida',
  closed: 'Cerrada',
  cancelled: 'Cancelada',
};

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

const paymentToneVariants = {
  danger: 'destructive',
  success: 'success',
  warning: 'warning',
};

const tableSortColumns = [
  { id: 'orderNumber', label: 'Orden' },
  { id: 'tableCustomer', label: 'Mesa/Cliente' },
  { id: 'products', label: 'Productos' },
  { id: 'total', label: 'Total' },
  { id: 'status', label: 'Estado' },
  { id: 'paymentStatus', label: 'Pago' },
  { id: 'createdAt', label: 'Hora' },
];

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function getProductsSummary(order) {
  return order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
}

function mapProductForOrder(product) {
  return {
    id: product.id,
    name: product.name,
    shortDescription: product.short_description || product.description || '',
    categoryId: product.category_id,
    price: Number(product.price ?? 0),
    isQuickAccess: Boolean(product.quick_access),
    isActive: Boolean(product.is_active),
  };
}

function getOrderSearchHaystack(order) {
  return normalizeText(
    [
      order.orderNumber,
      order.tableOrLocation,
      order.customerOrWaiter,
      order.waiterLabel,
      order.responsibleName,
      getProductsSummary(order),
    ].join(' '),
  );
}

function getOrderSortValue(order, sortKey) {
  if (sortKey === 'orderNumber') {
    return order.orderNumberValue;
  }

  if (sortKey === 'tableCustomer') {
    return `${order.tableOrLocation} ${order.customerOrWaiter}`;
  }

  if (sortKey === 'products') {
    return getProductsSummary(order);
  }

  if (sortKey === 'total') {
    return order.total;
  }

  if (sortKey === 'status') {
    return order.status;
  }

  if (sortKey === 'paymentStatus') {
    return order.paymentStatus;
  }

  if (sortKey === 'createdAt') {
    return new Date(order.createdAt).getTime();
  }

  return '';
}

function sortOrders(orders, sortKey, sortDirection) {
  const direction = sortDirection === 'asc' ? 1 : -1;

  return [...orders].sort((firstOrder, secondOrder) => {
    const firstValue = getOrderSortValue(firstOrder, sortKey);
    const secondValue = getOrderSortValue(secondOrder, sortKey);

    if (typeof firstValue === 'number' && typeof secondValue === 'number') {
      return (firstValue - secondValue) * direction;
    }

    return String(firstValue).localeCompare(String(secondValue), 'es') * direction;
  });
}

function SortableTableHeader({ label, onSort, sortDirection, sortKey, value }) {
  const isActive = sortKey === value;

  return (
    <th
      aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
      className="px-4 py-4 text-sm text-center font-bold  text-neutral-950"
    >
      <button
        className="inline-flex items-center gap-1 text-center transition-colors hover:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSort(value)}
        type="button"
      >
        {label}
        {isActive ? <span className="text-[10px]">{sortDirection === 'asc' ? '▲' : '▼'}</span> : null}
      </button>
    </th>
  );
}

function applyFilter(orders, filterId) {
  if (filterId === 'open') {
    return orders.filter((order) => order.status === 'open');
  }

  if (filterId === 'preparing') {
    return orders.filter((order) => order.status === 'preparing');
  }

  if (filterId === 'ready') {
    return orders.filter((order) => order.status === 'ready');
  }

  if (filterId === 'paid') {
    return orders.filter((order) => order.paymentStatus === 'paid');
  }

  return orders;
}

function PaymentBadge({ paymentStatus }) {
  const payment = paymentMeta[paymentStatus] ?? paymentMeta.unpaid;

  return (
    <StatusBadge
      className="shrink-0 px-2 py-1.5 text-[9px] tracking-[0.14em] sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.18em]"
      label={payment.label}
      variant={paymentToneVariants[payment.tone]}
    />
  );
}

const editableStatusOrder = ['open', 'preparing', 'ready', 'served'];

function getAdjacentStatus(currentStatus, direction) {
  const currentIndex = editableStatusOrder.indexOf(currentStatus);

  if (currentIndex === -1) {
    return null;
  }

  return editableStatusOrder[currentIndex + direction] ?? null;
}

function OrderStatusControl({ isDisabled = false, isUpdating = false, onChangeStatus, order }) {
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

function OrderActions({ order, onCharge, onEdit, onPrint, onView }) {
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
          {/* <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Mesa</p> */}
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

function OrderDetailsDialog({ order, onClose }) {
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
            {/* <p><strong>Mesa:</strong> {order.tableOrLocation}</p> */}
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

function PaymentDialog({ isSaving, onClose, onSubmit, order }) {
  const remaining = calculateOrderRemainingTotal(order);
  const paidTotal = calculateOrderPaidTotal(order);
  const [method, setMethod] = useState('cash');
  const [amount, setAmount] = useState(() => String(Math.round(remaining)));
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!order) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('El importe debe ser mayor a cero.');
      return;
    }

    if (numericAmount > remaining) {
      setError('El importe no puede superar el saldo pendiente.');
      return;
    }

    onSubmit({
      amount: numericAmount,
      method,
      notes,
      orderId: order.id,
      reference,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <form className="w-full max-w-lg border border-neutral-300 bg-white" onSubmit={handleSubmit}>
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-200 px-5">
          <div>
            <h2 className="text-lg font-bold">Cobrar {order.orderNumber}</h2>
            <p className="text-sm text-neutral-500">Saldo pendiente: {formatCurrency(remaining)}</p>
          </div>
          <IconButton className="rounded-none" label="Cerrar pago" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </header>

        <div className="grid gap-4 p-5">
          <div className="grid grid-cols-2 gap-3 border border-neutral-200 p-4 text-sm">
            <p>Total</p>
            <p className="text-right font-bold">{formatCurrency(order.total)}</p>
            <p>Pagado</p>
            <p className="text-right font-bold">{formatCurrency(paidTotal)}</p>
            <p>Pendiente</p>
            <p className="text-right font-bold">{formatCurrency(remaining)}</p>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.08em]">Método de pago</span>
            <select
              className="h-11 border border-neutral-200 bg-white px-3 outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              disabled={isSaving}
              onChange={(event) => setMethod(event.target.value)}
              value={method}
            >
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.08em]">Importe</span>
            <Input
              className="h-11 rounded-none border-neutral-200 bg-white px-3"
              disabled={isSaving}
              min="0"
              onChange={(event) => setAmount(event.target.value)}
              step="1"
              type="number"
              value={amount}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.08em]">Referencia</span>
            <Input
              className="h-11 rounded-none border-neutral-200 bg-white px-3"
              disabled={isSaving}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Opcional"
              value={reference}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.08em]">Notas</span>
            <Input
              className="h-11 rounded-none border-neutral-200 bg-white px-3"
              disabled={isSaving}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Opcional"
              value={notes}
            />
          </label>

          {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>

        <footer className="flex justify-end gap-3 border-t border-neutral-200 p-5">
          <Button
            disabled={isSaving}
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            disabled={isSaving || remaining <= 0}
            type="submit"
          >
            {isSaving ? 'Registrando...' : 'Registrar pago'}
          </Button>
        </footer>
      </form>
    </div>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'quick-access', name: 'Acceso rápido', sortOrder: 0 }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortKey, setSortKey] = useState('orderNumber');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [ordersData, productsData, categoriesData] = await Promise.all([getOrders(), getProducts(), getCategories()]);
      const activeCategories = categoriesData
        .filter((category) => category.is_active)
        .sort((firstCategory, secondCategory) => firstCategory.display_order - secondCategory.display_order)
        .map((category) => ({
          id: category.id,
          name: category.name,
          sortOrder: category.display_order,
        }));

      setOrders(ordersData);
      setProducts(productsData.filter((product) => product.is_active).map(mapProductForOrder));
      setCategories([{ id: 'quick-access', name: 'Acceso rápido', sortOrder: 0 }, ...activeCategories]);
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar las órdenes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const activeOrders = useMemo(() => orders.filter((order) => order.status !== 'cancelled'), [orders]);

  const filterCounts = useMemo(
    () => ({
      all: activeOrders.length,
      open: activeOrders.filter((order) => order.status === 'open').length,
      preparing: activeOrders.filter((order) => order.status === 'preparing').length,
      ready: activeOrders.filter((order) => order.status === 'ready').length,
      paid: activeOrders.filter((order) => order.paymentStatus === 'paid').length,
    }),
    [activeOrders],
  );

  const visibleOrders = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm.trim());
    const filteredByTab = applyFilter(activeOrders, activeFilter);
    const filteredBySearch = normalizedSearch
      ? filteredByTab.filter((order) => getOrderSearchHaystack(order).includes(normalizedSearch))
      : filteredByTab;

    return sortOrders(filteredBySearch, sortKey, sortDirection);
  }, [activeFilter, activeOrders, searchTerm, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = visibleOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasSearchOrFilter = searchTerm.trim() || activeFilter !== 'all';

  function handleSort(nextSortKey) {
    setPage(1);

    if (sortKey === nextSortKey) {
      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === 'createdAt' ? 'desc' : 'asc');
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setPage(1);
  }

  function handleFilterChange(filterId) {
    setActiveFilter(filterId);
    setPage(1);
  }

  function handlePageSizeChange(event) {
    setPageSize(Number(event.target.value));
    setPage(1);
  }

  const handleCloseOrderModal = useCallback(() => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleNewOrder = useCallback(() => {
    setModalMode('create');
    setSelectedOrder(null);
    setIsOrderModalOpen(true);
  }, []);

  const handleEditOrder = useCallback((order) => {
    if (order.paymentStatus === 'paid') {
      setError('Las órdenes pagadas no se pueden editar.');
      return;
    }

    setModalMode('edit');
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  }, []);

  const handleSaveOrder = useCallback(
    async (savedOrder) => {
      setIsSaving(true);
      setError('');
      setFeedback('');

      try {
        let orderId = savedOrder.id;

        if (modalMode === 'edit') {
          await updateOrder(orderId, savedOrder);
        } else {
          orderId = await createOrder(savedOrder);
        }

        if (savedOrder.paymentAction === 'paid') {
          try {
            const freshOrder = await getOrderById(orderId);
            const remaining = calculateOrderRemainingTotal(freshOrder);

            if (remaining > 0) {
              await registerPayment({
                amount: remaining,
                method: savedOrder.paymentMethod,
                orderId,
              });
            }
          } catch {
            await loadData();
            handleCloseOrderModal();
            setError(
              modalMode === 'edit'
                ? 'La orden fue guardada, pero no se pudo registrar el pago. Podés cobrarla desde el listado.'
                : 'La orden fue creada, pero no se pudo registrar el pago. Podés cobrarla desde el listado.',
            );
            return;
          }
        }

        await loadData();
        handleCloseOrderModal();
      } catch (saveError) {
        setError(saveError.message || 'No se pudo guardar la orden.');
      } finally {
        setIsSaving(false);
      }
    },
    [handleCloseOrderModal, loadData, modalMode],
  );

  async function handleRegisterPayment(paymentData) {
    setIsSaving(true);
    setError('');
    setFeedback('');

    try {
      await registerPayment(paymentData);
      await loadData();
      setPaymentOrder(null);
      setFeedback('Pago registrado correctamente.');
    } catch (paymentError) {
      setError(paymentError.message || 'No se pudo registrar el pago.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeOrderStatus(order, nextStatus) {
    if (!nextStatus || order.status === nextStatus || updatingStatusOrderId) {
      return;
    }

    setUpdatingStatusOrderId(order.id);
    setError('');
    setFeedback('');

    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) => (currentOrder.id === updatedOrder.id ? updatedOrder : currentOrder)),
      );
    } catch (statusError) {
      setError(statusError.message || 'No se pudo actualizar el estado de la orden.');
      await loadData();
    } finally {
      setUpdatingStatusOrderId(null);
    }
  }

  function handlePrintOrder(order) {
    const printWindow = window.open('', '_blank', 'width=420,height=640');

    if (!printWindow) {
      setError('No se pudo abrir la vista de impresión.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin: 0 0 12px; }
            table { border-collapse: collapse; width: 100%; margin-top: 16px; }
            td, th { border-bottom: 1px solid #ddd; padding: 8px 0; text-align: left; }
            .total { font-size: 18px; font-weight: 700; text-align: right; margin-top: 16px; }
          </style>
        </head>
        <body>
          <h1>${order.orderNumber}</h1>
          //<p>Mesa: ${order.tableOrLocation}</p>//
          <p>Mesa/Cliente: ${order.customerOrWaiter}</p>
          <table>
            <thead><tr><th>Producto</th><th>Cant.</th><th>Total</th></tr></thead>
            <tbody>
              ${order.items.map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${formatCurrency(item.subtotal)}</td></tr>`).join('')}
            </tbody>
          </table>
          <p class="total">Total: ${formatCurrency(order.total)}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <AdminPageContainer className="min-h-220">
      <PageHeader
        title="Órdenes Activas"
        description="Listado de órdenes activas. Cree, edite y cobre órdenes"
        secondaryActions={
          <>
            <SearchField
              className="w-full sm:w-[320px]"
              inputClassName="rounded-md"
              onChange={handleSearchChange}
              placeholder="Buscar por mesa, orden o cliente..."
              value={searchTerm}
            />
            <Select disabled={isLoading} onValueChange={handleFilterChange} value={activeFilter}>
              <SelectTrigger
                aria-label="Filtrar órdenes por estado"
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-xs font-bold uppercase tracking-[0.05em] text-primary shadow-none outline-none sm:w-[190px]"
              >
                <div className="flex items-center gap-2">
                  <Filter className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <SelectValue placeholder="Todas" />
                </div>
              </SelectTrigger>
              <SelectContent align="start">
                {filterDefinitions.map((filter) => (
                  <SelectItem className="text-xs font-bold uppercase" key={filter.id} value={filter.id}>
                    {filter.label} ({filterCounts[filter.id] ?? 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        primaryAction={
          <Button className="w-full sm:w-auto" onClick={handleNewOrder} size="sm" type="button">
            <Plus className="size-4 " strokeWidth={2} aria-hidden="true" />
            Nueva orden
          </Button>
        }
      />

      <FeedbackMessage variant="success">{feedback}</FeedbackMessage>
      {error ? <ErrorState title={error} onRetry={loadData} /> : null}

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-20 animate-pulse border border-neutral-100 bg-neutral-50" key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && visibleOrders.length === 0 ? (
        <EmptyState
          className="grid min-h-56 place-items-center border-dashed text-center"
          title={hasSearchOrFilter ? 'No encontramos órdenes con esos criterios.' : 'Todavía no hay órdenes.'}
          description="Los datos se cargan directamente desde Supabase."
        />
      ) : null}

      {!isLoading && visibleOrders.length > 0 ? (
        <>
          <section className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1080px] border-collapse text-center [&_td:not(:last-child)]:border-r [&_td:not(:last-child)]:border-neutral-200 [&_th:not(:last-child)]:border-r [&_th:not(:last-child)]:border-neutral-200">
              <thead className="border-b-2 border-neutral-950">
                <tr>
                  {tableSortColumns.map((column) => (
                    <SortableTableHeader
                      key={column.id}
                      label={column.label}
                      onSort={handleSort}
                      sortDirection={sortDirection}
                      sortKey={sortKey}
                      value={column.id}
                    />
                  ))}
                  <th className="px-4 py-4 text-center text-sm font-bold text-neutral-950">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr className="transition-colors last:border-b-0 hover:bg-neutral-50" key={order.id}>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-neutral-950">{order.orderNumber}</span>
                      </div>
                    </td>
                    {/* <td className="px-4 py-4">
                      {order.tableOrLocation === '-' ? (
                        <span className="text-base text-neutral-400">—</span>
                      ) : (
                        <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-sm font-bold">
                          {order.tableOrLocation}
                        </span>
                      )}
                    </td> */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-neutral-950">{order.customerOrWaiter}</span>
                        <span className="text-sm text-neutral-400">{order.waiterLabel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-[220px] truncate text-sm text-neutral-600">{getProductsSummary(order)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-bold text-neutral-950">{formatCurrency(order.total)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <OrderStatusControl
                        isDisabled={Boolean(updatingStatusOrderId) && updatingStatusOrderId !== order.id}
                        isUpdating={updatingStatusOrderId === order.id}
                        onChangeStatus={handleChangeOrderStatus}
                        order={order}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <PaymentBadge paymentStatus={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-500">{formatTime(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <OrderActions
                          order={order}
                          onCharge={setPaymentOrder}
                          onEdit={handleEditOrder}
                          onPrint={handlePrintOrder}
                          onView={setDetailOrder}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="grid gap-4 lg:hidden" aria-label="Listado de órdenes">
            {paginatedOrders.map((order) => (
              <OrderMobileCard
                key={order.id}
                isStatusControlDisabled={Boolean(updatingStatusOrderId) && updatingStatusOrderId !== order.id}
                isUpdatingStatus={updatingStatusOrderId === order.id}
                onChangeStatus={handleChangeOrderStatus}
                order={order}
                onCharge={setPaymentOrder}
                onEdit={handleEditOrder}
                onPrint={handlePrintOrder}
                onView={setDetailOrder}
              />
            ))}
          </section>
        </>
      ) : null}

      <footer className="flex flex-col gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Pagination currentPage={currentPage} onPageChange={setPage} totalPages={totalPages} />
        <select
          className="h-10 border border-neutral-200 bg-white px-3 text-base outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
          onChange={handlePageSizeChange}
          value={pageSize}
        >
          <option value={10}>10 por página</option>
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
        </select>
      </footer>

      {isOrderModalOpen ? (
        <OrderModal
          categories={categories}
          isSaving={isSaving}
          key={`${modalMode}-${selectedOrder?.id ?? 'new'}`}
          mode={modalMode}
          onClose={handleCloseOrderModal}
          onSave={handleSaveOrder}
          order={selectedOrder}
          products={products}
        />
      ) : null}

      {detailOrder ? <OrderDetailsDialog order={detailOrder} onClose={() => setDetailOrder(null)} /> : null}

      {paymentOrder ? (
        <PaymentDialog
          isSaving={isSaving}
          onClose={() => setPaymentOrder(null)}
          onSubmit={handleRegisterPayment}
          order={paymentOrder}
        />
      ) : null}
    </AdminPageContainer>
  );
}
