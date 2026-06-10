import { useMemo, useState } from 'react';
import { Banknote, Building2, CreditCard, Minus, Plus, Search, Trash2, Wallet, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'CASH', label: 'Efectivo', icon: Banknote },
  { id: 'CARD', label: 'Tarjeta', icon: CreditCard },
  { id: 'TRANSFER', label: 'Transferencia', icon: Building2 },
  { id: 'MERCADO_PAGO', label: 'Mercado Pago', icon: Wallet },
];

function createOrderItem(product, quantity = 1) {
  return {
    productId: product.id,
    name: product.name,
    shortDescription: product.shortDescription,
    quantity,
    unitPrice: product.price,
    subtotal: product.price * quantity,
  };
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

export function OrderModal({ mode, order, products, categories, onClose, onSave }) {
  const [activeCategoryId, setActiveCategoryId] = useState('quick-access');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableOrLocation, setTableOrLocation] = useState(() => (mode === 'edit' ? order?.tableOrLocation ?? '' : ''));
  const [customerOrWaiter, setCustomerOrWaiter] = useState(() => (mode === 'edit' ? order?.customerOrWaiter ?? '' : ''));
  const [items, setItems] = useState(() => (mode === 'edit' ? order?.items ?? [] : []));
  const [paymentMethod, setPaymentMethod] = useState(() =>
    mode === 'edit' && order?.paymentMethod !== 'UNDEFINED' ? order?.paymentMethod ?? 'CASH' : 'CASH',
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategoryId === 'quick-access' ? product.isQuickAccess : product.categoryId === activeCategoryId;
      const matchesSearch = normalizedSearch ? product.name.toLowerCase().includes(normalizedSearch) : true;

      return product.isActive && matchesCategory && matchesSearch;
    });
  }, [activeCategoryId, products, searchTerm]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);

  function addProduct(product) {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.id);

      if (!existingItem) {
        return [...currentItems, createOrderItem(product)];
      }

      return currentItems.map((item) => {
        if (item.productId !== product.id) {
          return item;
        }

        const quantity = item.quantity + 1;
        return {
          ...item,
          quantity,
          subtotal: quantity * item.unitPrice,
        };
      });
    });
  }

  function updateQuantity(productId, nextQuantity) {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.productId !== productId) {
            return item;
          }

          const quantity = Math.max(0, nextQuantity);
          return {
            ...item,
            quantity,
            subtotal: quantity * item.unitPrice,
          };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId) {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  }

  function handleSave(paymentStatus) {
    if (items.length === 0) {
      return;
    }

    onSave({
      id: order?.id,
      orderNumber: order?.orderNumber,
      tableOrLocation,
      customerOrWaiter,
      items,
      paymentMethod: paymentStatus === 'PAID' ? paymentMethod : 'UNDEFINED',
      paymentStatus,
      orderStatus: paymentStatus === 'PAID' ? 'DELIVERED' : 'PENDING',
      total,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden border border-neutral-300 bg-white sm:max-h-[86dvh]">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-200 px-5">
          <h2 className="text-lg font-bold leading-tight">{mode === 'edit' ? 'Editar orden' : 'Nueva orden'}</h2>
          <button
            className="grid size-10 place-items-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.5fr_1fr] lg:overflow-hidden">
          <section className="grid gap-8 border-b border-neutral-200 p-4 sm:p-5 lg:min-h-0 lg:grid-rows-[1fr_auto] lg:border-b-0 lg:border-r">
            <div className="min-h-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-950">Productos</h3>
              </div>
              <div className="mb-5 flex gap-3">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                  <input
                    className="h-10 w-full border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar productos..."
                    type="search"
                    value={searchTerm}
                  />
                </label>
                <select className="hidden h-10 border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-950 sm:block">
                  <option>Mas vendidos</option>
                  <option>Precio</option>
                </select>
              </div>

              <div className="max-h-[280px] min-h-[220px] overflow-y-auto pr-1 lg:max-h-[360px]">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <article className="flex min-h-28 flex-col justify-between border border-neutral-200 p-3" key={product.id}>
                      <h4 className="text-sm font-bold leading-tight text-neutral-950">{product.name}</h4>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold">{formatMoney(product.price)}</span>
                        <button
                          className="grid size-7 place-items-center rounded-full border border-neutral-200 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
                          onClick={() => addProduct(product)}
                          type="button"
                          aria-label={`Agregar ${product.name}`}
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-950">{'Categor\u00edas'}</h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-7">
                {categories.map((category) => (
                  <button
                    className={cn(
                      'grid min-h-16 place-items-center border px-2 text-center text-[11px] font-semibold transition-colors',
                      activeCategoryId === category.id
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-950',
                    )}
                    key={category.id}
                    onClick={() => setActiveCategoryId(category.id)}
                    type="button"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-col">
            <div className="grid gap-4 border-b border-neutral-200 p-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Mesa / Identificador</span>
                <input
                  className="h-10 border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                  onChange={(event) => setTableOrLocation(event.target.value)}
                  placeholder="Ej: M-12 o Takeaway"
                  value={tableOrLocation}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Mozo / Cliente</span>
                <input
                  className="h-10 border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                  onChange={(event) => setCustomerOrWaiter(event.target.value)}
                  placeholder="Nombre del responsable"
                  value={customerOrWaiter}
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em]">Resumen de productos</h3>
                <button
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-950"
                  onClick={() => setItems([])}
                  type="button"
                >
                  Vaciar
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="grid min-h-40 place-items-center border border-dashed border-neutral-200 text-center text-sm text-neutral-400">
                  Selecciona productos desde la grilla.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 border border-neutral-100">
                  {items.map((item) => (
                    <article className="grid gap-3 p-4" key={item.productId}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold leading-tight">
                            {item.quantity}x {item.name}
                          </h4>
                          <p className="mt-1 text-xs leading-5 text-neutral-500">{item.shortDescription}</p>
                        </div>
                        <span className="text-sm font-bold">{formatMoney(item.subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-200">
                          <button
                            className="grid size-8 place-items-center hover:bg-neutral-100"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            type="button"
                            aria-label={`Restar ${item.name}`}
                          >
                            <Minus className="size-4" aria-hidden="true" />
                          </button>
                          <span className="grid h-8 min-w-9 place-items-center text-sm font-bold">{item.quantity}</span>
                          <button
                            className="grid size-8 place-items-center hover:bg-neutral-100"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            type="button"
                            aria-label={`Sumar ${item.name}`}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400 hover:text-red-700"
                          onClick={() => removeItem(item.productId)}
                          type="button"
                        >
                          Quitar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-200 p-4 sm:p-5">
              <div className="mb-5 text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em]">Total a pagar</p>
                <p className="mt-1 text-4xl font-bold leading-none">{formatMoney(total)}</p>
              </div>

              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.08em]">{'M\u00e9todo de pago'}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;

                    return (
                      <button
                        className={cn(
                          'inline-flex min-h-12 items-center justify-center gap-2 border px-4 text-xs font-bold uppercase tracking-[0.06em] transition-colors',
                          isSelected
                            ? 'border-neutral-950 bg-neutral-950 text-white'
                            : 'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-950',
                        )}
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        type="button"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-col justify-end gap-3 border-t border-neutral-200 p-4 sm:flex-row sm:p-5">
          <button
            className="min-h-11 border border-neutral-200 bg-white px-5 text-xs font-bold uppercase tracking-[0.06em] hover:border-neutral-950"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="min-h-11 border border-neutral-200 bg-white px-5 text-xs font-bold uppercase tracking-[0.06em] hover:border-neutral-950 disabled:opacity-40"
            disabled={items.length === 0}
            onClick={() => handleSave('UNPAID')}
            type="button"
          >
            Ordenar sin pagar
          </button>
          <button
            className="min-h-11 bg-neutral-950 px-5 text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-neutral-800 disabled:opacity-40"
            disabled={items.length === 0}
            onClick={() => handleSave('PAID')}
            type="button"
          >
            Confirmar pago
          </button>
        </footer>
      </div>
    </div>
  );
}
