import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { OrderModal } from '@/components/backoffice/OrderModal.jsx';
import { OrderDetailsDialog } from '@/components/orders/OrderDetailsDialog.jsx';
import { OrderMobileList } from '@/components/orders/OrderMobileList.jsx';
import { OrdersTable } from '@/components/orders/OrdersTable.jsx';
import { PaymentDialog } from '@/components/orders/PaymentDialog.jsx';
import { getProductsSummary } from '@/components/orders/orderHelpers.js';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { EmptyState } from '@/components/common/EmptyState.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { FeedbackMessage } from '@/components/common/FeedbackMessage.jsx';
import { Pagination } from '@/components/common/Pagination.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchField } from '@/components/common/SearchField.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { getCategories } from '@/services/categories.service.js';
import { getProducts } from '@/services/products.service.js';
import {
  calculateOrderRemainingTotal,
  createOrder,
  getOrderById,
  getOrders,
  registerPayment,
  updateOrder,
  updateOrderStatus,
} from '@/services/orders.service.js';
import { formatCurrency } from '@/utils/formatters.js';

const filterDefinitions = [
  { id: 'all', label: 'Todas' },
  { id: 'open', label: 'Pendientes' },
  { id: 'preparing', label: 'Preparando' },
  { id: 'ready', label: 'Listas' },
  { id: 'paid', label: 'Pagadas' },
];

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
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
          <OrdersTable
            isStatusControlDisabled={Boolean(updatingStatusOrderId)}
            onChangeStatus={handleChangeOrderStatus}
            onCharge={setPaymentOrder}
            onEdit={handleEditOrder}
            onPrint={handlePrintOrder}
            onSort={handleSort}
            onView={setDetailOrder}
            orders={paginatedOrders}
            sortDirection={sortDirection}
            sortKey={sortKey}
            updatingStatusOrderId={updatingStatusOrderId}
          />

          <OrderMobileList
            onChangeStatus={handleChangeOrderStatus}
            onCharge={setPaymentOrder}
            onEdit={handleEditOrder}
            onPrint={handlePrintOrder}
            onView={setDetailOrder}
            orders={paginatedOrders}
            updatingStatusOrderId={updatingStatusOrderId}
          />
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
