import { useMemo, useState } from 'react';
import { Banknote, Building2, CreditCard, Minus, Plus, Trash2, Wallet, X } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton.jsx';
import { SearchField } from '@/components/common/SearchField.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'cash', label: 'Efectivo', icon: Banknote },
  { id: 'card', label: 'Tarjeta', icon: CreditCard },
  { id: 'transfer', label: 'Transferencia', icon: Building2 },
  { id: 'other', label: 'Otro', icon: Wallet },
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

export function OrderModal({ mode, order, products, categories, isSaving = false, onClose, onSave }) {
  const [activeCategoryId, setActiveCategoryId] = useState('quick-access');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableOrLocation, setTableOrLocation] = useState(() => (mode === 'edit' ? order?.tableOrLocation ?? '' : ''));
  const [customerOrWaiter, setCustomerOrWaiter] = useState(() => (mode === 'edit' ? order?.customerOrWaiter ?? '' : ''));
  const [notes, setNotes] = useState(() => (mode === 'edit' ? order?.notes ?? '' : ''));
  const orderStatus = mode === 'edit' ? order?.status ?? 'open' : 'open';
  const [items, setItems] = useState(() => (mode === 'edit' ? order?.items ?? [] : []));
  const [isPaymentMenuOpen, setIsPaymentMenuOpen] = useState(false);

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

  function handleSave(paymentAction, selectedPaymentMethod = null) {
    if (items.length === 0) {
      return;
    }

    onSave({
      id: order?.id,
      tableLabel: tableOrLocation,
      customerName: customerOrWaiter,
      notes,
      status: orderStatus,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes ?? '',
      })),
      paymentAction,
      paymentMethod: selectedPaymentMethod,
    });
  }

  function handleConfirmPaid(selectedPaymentMethod) {
    setIsPaymentMenuOpen(false);
    handleSave('paid', selectedPaymentMethod);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white sm:max-h-[86dvh]">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-200 px-5">
          <h2 className="text-lg font-bold leading-tight">{mode === 'edit' ? 'Editar orden' : 'Nueva orden'}</h2>
          <IconButton className="rounded-full" label="Cerrar modal" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.5fr_1fr] lg:overflow-hidden">
          <section className="grid xl:min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4 border-b border-neutral-200 p-4 lg:border-b-0 lg:border-r">
  <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-950">
        Productos
      </h3>

      <SearchField
        className="sm:max-w-sm"
        inputClassName="h-10 min-h-10 rounded-lg border-neutral-200 bg-white pl-9 pr-3 text-sm focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Buscar productos..."
        value={searchTerm}
      />
    </div>

    <div className="min-h-100 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <button
            aria-label={`Agregar ${product.name} a la orden`}
            className="flex min-h-24 cursor-pointer flex-col justify-between rounded-xl border border-neutral-200 bg-white p-3 text-left transition-all duration-150 hover:border-neutral-950 hover:bg-neutral-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
            disabled={isSaving}
            key={product.id}
            onClick={() => addProduct(product)}
            type="button"
          >
            <h4 className="text-sm leading-tight text-neutral-950">
              {product.name}
            </h4>

            <span className="mt-4 text-sm font-bold">{formatMoney(product.price)}</span>
          </button>
        ))}
      </div>
    </div>
  </div>

  <div className="min-h-[13.5rem]">
    <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-neutral-950">
      Categorías
    </h3>

    <div className="grid max-h-[12rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => (
        <button
          className={cn(
            'grid min-h-14 place-items-center rounded-xl border px-3 text-center text-sm font-semibold transition-colors sm:min-h-16',
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
            <div className="grid gap-4 border-b border-neutral-200 p-5 sm:grid-cols-2 xl:grid-cols-[37px_minmax(0,1fr)_minmax(0,1fr)]">
              <label className="grid gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Mesa</span>
                <Input
                  className="h-10 xl:w-12 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                  disabled={isSaving}
                  onChange={(event) => setTableOrLocation(event.target.value)}
                  placeholder="N°"
                  value={tableOrLocation}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Cliente</span>
                <Input
                  className="h-10 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                  disabled={isSaving}
                  onChange={(event) => setCustomerOrWaiter(event.target.value)}
                  placeholder="Nombre del cliente"
                  value={customerOrWaiter}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">Notas</span>
                <Input
                  className="h-10 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                  disabled={isSaving}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Notas generales"
                  value={notes}
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em]">Resumen de productos</h3>
                <Button
                  className="min-h-8 px-2 text-neutral-500 hover:text-neutral-950"
                  disabled={isSaving}
                  onClick={() => setItems([])}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Vaciar
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-neutral-200 text-center text-sm text-neutral-400">
                  Selecciona productos desde la grilla.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-100">
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
                        <div className="flex items-center overflow-hidden rounded-full border border-neutral-200">
                          <IconButton
                            className="size-8 rounded-full hover:bg-neutral-100"
                            disabled={isSaving}
                            label={`Restar ${item.name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="size-4" aria-hidden="true" />
                          </IconButton>
                          <span className="grid h-8 min-w-9 place-items-center text-sm font-bold">{item.quantity}</span>
                          <IconButton
                            className="size-8 rounded-full hover:bg-neutral-100"
                            disabled={isSaving}
                            label={`Sumar ${item.name}`}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="size-4" aria-hidden="true" />
                          </IconButton>
                        </div>
                        <Button
                          className="min-h-8 px-2 text-neutral-400 hover:text-red-700"
                          disabled={isSaving}
                          onClick={() => removeItem(item.productId)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          Quitar
                        </Button>
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
            </div>
          </section>
        </div>

        <footer className="flex flex-col justify-end gap-3 border-t border-neutral-200 p-4 sm:flex-row sm:p-5">
          <Button
            disabled={isSaving}
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            disabled={items.length === 0 || isSaving}
            onClick={() => handleSave('unpaid')}
            type="button"
            variant="secondary"
          >
            Ordenar sin pagar
          </Button>
          <div className="relative">
            <Button
              aria-expanded={isPaymentMenuOpen}
              className="w-full sm:w-auto"
              disabled={items.length === 0 || total <= 0 || isSaving}
              onClick={() => setIsPaymentMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              {isSaving ? 'Guardando...' : 'Confirmar pago'}
            </Button>

            {isPaymentMenuOpen ? (
              <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-10 grid w-60 origin-bottom-right gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm motion-safe:animate-[payment-popover-in_140ms_ease-out]">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;

                  return (
                    <Button
                      className="justify-start rounded-lg border-transparent px-3 text-left hover:border-neutral-950"
                      disabled={isSaving}
                      key={method.id}
                      onClick={() => handleConfirmPaid(method.id)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {method.label}
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
