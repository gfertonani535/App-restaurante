import { useState } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { calculateOrderPaidTotal, calculateOrderRemainingTotal } from '@/services/orders.service.js';
import { formatCurrency } from '@/utils/formatters.js';
import { paymentMethodLabels } from '@/components/orders/orderHelpers.js';

export function PaymentDialog({ isSaving, onClose, onSubmit, order }) {
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
            <Select
              disabled={isSaving}
              onValueChange={setMethod}
              value={method}
            >
              <SelectTrigger className="h-11 rounded-none border-neutral-200 bg-white px-3 shadow-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
