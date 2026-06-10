import { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Printer } from 'lucide-react';
import { OrderModal } from '@/components/backoffice/OrderModal.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils';

const filters = ['Todas (24)', 'Pendientes (8)', 'En preparaci\u00f3n (12)', 'Listas (4)', 'Pagadas (150)'];

const orderCategories = [
  { id: 'quick-access', name: 'Acceso R\u00e1pido', sortOrder: 0 },
  { id: 'hamburguesas', name: 'Hamburguesas', sortOrder: 1 },
  { id: 'papas-snacks', name: 'Papas y Snacks', sortOrder: 2 },
  { id: 'bebidas', name: 'Bebidas', sortOrder: 3 },
  { id: 'postres', name: 'Postres', sortOrder: 4 },
  { id: 'extras', name: 'Extras', sortOrder: 5 },
  { id: 'promociones', name: 'Promociones', sortOrder: 6 },
];

const orderProducts = [
  {
    id: 'burger-master',
    name: 'Burger Master',
    shortDescription: 'Pan brioche, doble carne, cheddar, lechuga, tomate y salsa especial.',
    categoryId: 'hamburguesas',
    price: 12,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'cheese-burger',
    name: 'Cheese Burger',
    shortDescription: 'Medallon grillado con doble cheddar, pickles y salsa de la casa.',
    categoryId: 'hamburguesas',
    price: 11,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'papas-fritas',
    name: 'Papas Fritas',
    shortDescription: 'Papas baston crocantes con sal marina.',
    categoryId: 'papas-snacks',
    price: 4.5,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'papas-trufadas',
    name: 'Papas Trufadas',
    shortDescription: 'Papas crocantes con aceite de trufa y parmesano.',
    categoryId: 'papas-snacks',
    price: 6,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'nuggets-6u',
    name: 'Nuggets (6u)',
    shortDescription: 'Bocados de pollo apanados con dip a eleccion.',
    categoryId: 'papas-snacks',
    price: 6,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'aros-cebolla',
    name: 'Aros de Cebolla',
    shortDescription: 'Aros de cebolla rebozados con salsa barbecue.',
    categoryId: 'papas-snacks',
    price: 4,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'coca-cola-500',
    name: 'Coca Cola 500ml',
    shortDescription: 'Gaseosa Coca Cola 500ml.',
    categoryId: 'bebidas',
    price: 3.5,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'coca-cola-zero',
    name: 'Coca Cola Zero 500ml',
    shortDescription: 'Gaseosa Coca Cola Zero 500ml.',
    categoryId: 'bebidas',
    price: 3.5,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'sprite-500',
    name: 'Sprite 500ml',
    shortDescription: 'Gaseosa lima limon 500ml.',
    categoryId: 'bebidas',
    price: 3.5,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'agua-mineral',
    name: 'Agua Mineral 500ml',
    shortDescription: 'Agua mineral sin gas 500ml.',
    categoryId: 'bebidas',
    price: 2,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'vino-house',
    name: 'Vino Tinto House',
    shortDescription: 'Copa de vino tinto de la casa.',
    categoryId: 'bebidas',
    price: 7.5,
    isQuickAccess: false,
    isActive: true,
  },
  {
    id: 'limonada-500',
    name: 'Limonada 500ml',
    shortDescription: 'Limonada fresca con menta y jengibre.',
    categoryId: 'bebidas',
    price: 3,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'te-helado-500',
    name: 'Te Helado 500ml',
    shortDescription: 'Te frio artesanal con limon.',
    categoryId: 'bebidas',
    price: 3,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'brownie',
    name: 'Brownie',
    shortDescription: 'Brownie humedo con nueces y cacao amargo.',
    categoryId: 'postres',
    price: 3.8,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'cheesecake',
    name: 'Cheesecake',
    shortDescription: 'Cheesecake cremoso con coulis de frutos rojos.',
    categoryId: 'postres',
    price: 4.2,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'flan-casero',
    name: 'Flan Casero',
    shortDescription: 'Flan casero con dulce de leche.',
    categoryId: 'postres',
    price: 3.5,
    isQuickAccess: true,
    isActive: true,
  },
  {
    id: 'menu-ejecutivo',
    name: 'Menu Ejecutivo',
    shortDescription: 'Principal del dia con bebida y postre chico.',
    categoryId: 'promociones',
    price: 28,
    isQuickAccess: false,
    isActive: true,
  },
  {
    id: 'pizza-pepperoni',
    name: 'Pizza Pepperoni',
    shortDescription: 'Pizza individual con pepperoni, mozzarella y salsa de tomate.',
    categoryId: 'extras',
    price: 14,
    isQuickAccess: false,
    isActive: true,
  },
  {
    id: 'calzone-veggie',
    name: 'Calzone Veggie',
    shortDescription: 'Calzone relleno de vegetales grillados y queso.',
    categoryId: 'extras',
    price: 16.9,
    isQuickAccess: false,
    isActive: true,
  },
];

const productById = new Map(orderProducts.map((product) => [product.id, product]));

const paymentMeta = {
  UNPAID: {
    label: 'No Pagado',
    tone: 'danger',
  },
  PAID: {
    label: 'Pagado',
    tone: 'success',
  },
  PARTIAL: {
    label: 'Parcial',
    tone: 'warning',
  },
};

const paymentToneClasses = {
  danger: 'border-red-200 bg-red-100 text-red-700',
  success: 'border-green-200 bg-green-100 text-green-700',
  warning: 'border-yellow-200 bg-yellow-100 text-yellow-700',
};

function createOrderItem(productId, quantity = 1) {
  const product = productById.get(productId);

  return {
    productId: product.id,
    name: product.name,
    shortDescription: product.shortDescription,
    quantity,
    unitPrice: product.price,
    subtotal: product.price * quantity,
  };
}

const initialOrders = [
  {
    id: 'order-4829',
    orderNumber: '#4829',
    type: 'TAKEAWAY',
    tableOrLocation: 'M-12',
    customerOrWaiter: 'Carlos Ruiz',
    waiterLabel: 'Mozo: Sofia L.',
    items: [createOrderItem('burger-master', 2), createOrderItem('coca-cola-500'), createOrderItem('papas-trufadas')],
    paymentStatus: 'UNPAID',
    paymentMethod: 'UNDEFINED',
    orderStatus: 'PENDING',
    createdAt: '12:45 PM',
  },
  {
    id: 'order-4828',
    orderNumber: '#4828',
    type: 'SALON',
    tableOrLocation: 'M-04',
    customerOrWaiter: 'Ana Belen',
    waiterLabel: 'Mozo: Pedro G.',
    items: [createOrderItem('papas-fritas'), createOrderItem('agua-mineral')],
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    orderStatus: 'DELIVERED',
    createdAt: '12:38 PM',
  },
  {
    id: 'order-4827',
    orderNumber: '#4827',
    type: 'SALON',
    tableOrLocation: 'M-15',
    customerOrWaiter: 'Grupo Rossi',
    waiterLabel: 'Mozo: Sofia L.',
    items: [createOrderItem('menu-ejecutivo', 4), createOrderItem('vino-house', 2)],
    paymentStatus: 'PARTIAL',
    paymentMethod: 'CASH',
    orderStatus: 'READY',
    createdAt: '12:30 PM',
  },
  {
    id: 'order-4826',
    orderNumber: '#4826',
    type: 'DELIVERY',
    tableOrLocation: '-',
    customerOrWaiter: 'Roberto M.',
    waiterLabel: 'Uber Eats',
    items: [createOrderItem('pizza-pepperoni', 3), createOrderItem('calzone-veggie')],
    paymentStatus: 'UNPAID',
    paymentMethod: 'UNDEFINED',
    orderStatus: 'PENDING',
    createdAt: '12:22 PM',
  },
];

function IconButton({ label, onClick, children }) {
  return (
    <button
      aria-label={label}
      className="grid size-10 place-items-center transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PaymentBadge({ payment }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em]',
        paymentToneClasses[payment.tone],
      )}
    >
      {payment.label}
    </span>
  );
}

function OrderActions({ order, onEdit }) {
  const canCharge = order.paymentStatus !== 'PAID';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton label="Ver detalle">
        <Eye className="size-5" aria-hidden="true" />
      </IconButton>
      <IconButton label="Editar" onClick={() => onEdit(order)}>
        <Pencil className="size-5" aria-hidden="true" />
      </IconButton>
      {canCharge ? (
        <button
          className="min-h-10 bg-neutral-950 px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-neutral-800"
          type="button"
        >
          Cobrar
        </button>
      ) : (
        <button
          className="min-h-10 cursor-not-allowed border border-neutral-200 px-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-400"
          disabled
          type="button"
        >
          Pagado
        </button>
      )}
      <IconButton label="Imprimir">
        <Printer className="size-5" aria-hidden="true" />
      </IconButton>
    </div>
  );
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function getOrderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.subtotal, 0);
}

function getProductsSummary(order) {
  return order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
}

function OrderMobileCard({ order, onEdit }) {
  const payment = paymentMeta[order.paymentStatus];

  return (
    <article className="border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold leading-none text-neutral-950">{order.orderNumber}</p>
          <p className="mt-2 text-[10px] font-medium uppercase text-neutral-400">{order.type}</p>
        </div>
        <PaymentBadge payment={payment} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Mesa</p>
          <p className="mt-1 font-semibold text-neutral-950">{order.tableOrLocation}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Hora</p>
          <p className="mt-1 font-semibold text-neutral-950">{order.createdAt}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Cliente / Mozo</p>
          <p className="mt-1 font-semibold text-neutral-950">{order.customerOrWaiter}</p>
          <p className="text-neutral-400">{order.waiterLabel}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Productos</p>
          <p className="mt-1 line-clamp-2 text-neutral-600">{getProductsSummary(order)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Total</p>
          <p className="mt-1 text-xl font-bold leading-none text-neutral-950">{formatMoney(getOrderTotal(order))}</p>
        </div>
        <OrderActions order={order} onEdit={onEdit} />
      </div>
    </article>
  );
}

function getNextOrderNumber(orders) {
  const orderNumbers = orders.map((order) => Number(order.orderNumber.replace(/\D/g, ''))).filter(Boolean);
  const lastNumber = orderNumbers.length > 0 ? Math.max(...orderNumbers) : 4829;

  return `#${lastNumber + 1}`;
}

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

function getOrderType(tableOrLocation) {
  const normalizedValue = tableOrLocation.trim().toLowerCase();

  if (!normalizedValue || normalizedValue === '-') {
    return 'DELIVERY';
  }

  return normalizedValue.includes('take') ? 'TAKEAWAY' : 'SALON';
}

function mergeSavedOrder(savedOrder, previousOrder, nextOrderNumber) {
  return {
    id: savedOrder.id ?? `order-${Date.now()}`,
    orderNumber: savedOrder.orderNumber ?? nextOrderNumber,
    type: previousOrder?.type ?? getOrderType(savedOrder.tableOrLocation),
    tableOrLocation: savedOrder.tableOrLocation || '-',
    customerOrWaiter: savedOrder.customerOrWaiter || 'Cliente sin nombre',
    waiterLabel: previousOrder?.waiterLabel ?? 'Mozo: Sin asignar',
    items: savedOrder.items,
    paymentStatus: savedOrder.paymentStatus,
    paymentMethod: savedOrder.paymentMethod,
    orderStatus: savedOrder.orderStatus,
    createdAt: previousOrder?.createdAt ?? getCurrentTimeLabel(),
  };
}

export function OrdersBackoffice() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter((order) =>
      `${order.orderNumber} ${order.tableOrLocation} ${order.customerOrWaiter} ${order.waiterLabel} ${getProductsSummary(order)}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [orders, searchTerm]);

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
    setModalMode('edit');
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  }, []);

  const handleSaveOrder = useCallback(
    (savedOrder) => {
      setOrders((currentOrders) => {
        if (modalMode === 'edit') {
          return currentOrders.map((currentOrder) =>
            currentOrder.id === savedOrder.id
              ? mergeSavedOrder(savedOrder, currentOrder, currentOrder.orderNumber)
              : currentOrder,
          );
        }

        return [mergeSavedOrder(savedOrder, null, getNextOrderNumber(currentOrders)), ...currentOrders];
      });
      handleCloseOrderModal();
    },
    [handleCloseOrderModal, modalMode],
  );

  return (
    <AdminPageContainer>
      <PageHeader
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        primaryAction={
          <Button onClick={handleNewOrder} size="sm" type="button">
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            Nueva orden
          </Button>
        }
        searchPlaceholder="Buscar por mesa, orden o cliente..."
        searchValue={searchTerm}
        title={'\u00d3rdenes Activas'}
      />

      <section className="flex flex-col justify-between gap-6 border-b border-neutral-100 pb-2 md:flex-row md:items-end">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {filters.map((filter, index) => (
            <button
              className={cn(
                'whitespace-nowrap px-5 py-3 text-base transition-colors',
                index === 0
                  ? 'border-b-2 border-primary font-bold text-primary'
                  : 'font-medium text-neutral-400 hover:text-neutral-950',
              )}
              key={filter}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500 sm:text-base">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-500" aria-hidden="true" />
            {'Cr\u00edticas (3)'}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-yellow-400" aria-hidden="true" />
            Demoradas (5)
          </span>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-4 border border-neutral-200 bg-neutral-50 px-4 py-4 lg:flex-row lg:items-center lg:px-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">Ordenar por:</span>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <button className="flex items-center gap-1 text-base font-semibold text-primary" type="button">
              Orden #
              <span className="text-xs">{'\u25b2'}</span>
            </button>
            <button className="text-base text-neutral-500 transition-colors hover:text-primary" type="button">
              Precio
            </button>
            <button className="text-base text-neutral-500 transition-colors hover:text-primary" type="button">
              Mesa
            </button>
            <button className="text-base text-neutral-500 transition-colors hover:text-primary" type="button">
              Estado
            </button>
            <button className="text-base text-neutral-500 transition-colors hover:text-primary" type="button">
              Hora
            </button>
          </div>
        </div>
        <div className="hidden text-base text-neutral-400 lg:block">Mostrando {visibleOrders.length} resultados</div>
      </section>

      <section className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="border-b-2 border-neutral-950">
            <tr>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Orden</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Mesa</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Cliente/Mozo</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Productos</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Total</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Pago</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Hora</th>
              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-neutral-950">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleOrders.map((order) => {
              const payment = paymentMeta[order.paymentStatus];
              const canCharge = order.paymentStatus !== 'PAID';

              return (
                <tr className="transition-colors hover:bg-neutral-50" key={order.id}>
                  <td className="px-4 py-6">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-neutral-950">{order.orderNumber}</span>
                      <span className="text-[10px] font-medium uppercase text-neutral-400">{order.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    {order.tableOrLocation === '-' ? (
                      <span className="text-base text-neutral-400">-</span>
                    ) : (
                      <span className="border border-neutral-200 bg-neutral-100 px-2 py-1 text-sm font-bold">
                        {order.tableOrLocation}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-neutral-950">{order.customerOrWaiter}</span>
                      <span className="text-sm text-neutral-400">{order.waiterLabel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="max-w-[220px] truncate text-sm text-neutral-600">{getProductsSummary(order)}</div>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-base font-bold text-neutral-950">{formatMoney(getOrderTotal(order))}</span>
                  </td>
                  <td className="px-4 py-6">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em]',
                        paymentToneClasses[payment.tone],
                      )}
                    >
                      {payment.label}
                    </span>
                  </td>
                  <td className="px-4 py-6 text-sm text-neutral-500">{order.createdAt}</td>
                  <td className="px-4 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton label="Ver detalle">
                        <Eye className="size-5" aria-hidden="true" />
                      </IconButton>
                      <IconButton label="Editar" onClick={() => handleEditOrder(order)}>
                        <Pencil className="size-5" aria-hidden="true" />
                      </IconButton>
                      {canCharge ? (
                        <button
                          className="bg-neutral-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-neutral-800"
                          type="button"
                        >
                          Cobrar
                        </button>
                      ) : (
                        <button
                          className="cursor-not-allowed border border-neutral-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-neutral-400"
                          disabled
                          type="button"
                        >
                          Pagado
                        </button>
                      )}
                      <IconButton label="Imprimir">
                        <Printer className="size-5" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 lg:hidden" aria-label="Listado de \u00f3rdenes">
        {visibleOrders.map((order) => (
          <OrderMobileCard key={order.id} order={order} onEdit={handleEditOrder} />
        ))}
      </section>

      <footer className="flex flex-col gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button className="grid size-12 place-items-center border border-neutral-200 text-neutral-400" disabled type="button">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button className="grid size-12 place-items-center bg-neutral-950 font-bold text-white" type="button">
            1
          </button>
          <button className="grid size-12 place-items-center border border-neutral-200 transition-colors hover:bg-neutral-50" type="button">
            2
          </button>
          <button className="grid size-12 place-items-center border border-neutral-200 transition-colors hover:bg-neutral-50" type="button">
            3
          </button>
          <button className="grid size-12 place-items-center border border-neutral-200 transition-colors hover:bg-neutral-50" type="button">
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
        <select className="h-10 border border-neutral-200 bg-white px-3 text-base outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950">
          <option>{'10 por p\u00e1gina'}</option>
          <option>{'25 por p\u00e1gina'}</option>
          <option>{'50 por p\u00e1gina'}</option>
        </select>
      </footer>

      {isOrderModalOpen ? (
        <OrderModal
          categories={orderCategories}
          key={`${modalMode}-${selectedOrder?.id ?? 'new'}`}
          mode={modalMode}
          onClose={handleCloseOrderModal}
          onSave={handleSaveOrder}
          order={selectedOrder}
          products={orderProducts}
        />
      ) : null}
    </AdminPageContainer>
  );
}
