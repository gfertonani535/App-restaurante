import { useEffect, useMemo, useState } from 'react';
import { Banknote, CreditCard, Landmark, SendToBack, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, getCashClosingStatus } from '@/lib/cashClosing.js';

const statusCopy = {
  BALANCED: {
    label: 'Caja correcta',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  CASH_SHORTAGE: {
    label: 'Faltante',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  CASH_SURPLUS: {
    label: 'Sobrante',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
};

export function CashClosingModal({ summary, onClose, onSave }) {
  const [cashCountedInput, setCashCountedInput] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const cashCounted = cashCountedInput === '' ? null : Number(cashCountedInput);
  const difference = useMemo(() => {
    if (cashCounted === null || Number.isNaN(cashCounted)) {
      return 0;
    }

    return Number((cashCounted - summary.cashTotal).toFixed(2));
  }, [cashCounted, summary.cashTotal]);
  const status = getCashClosingStatus(difference);
  const statusConfig = statusCopy[status];
  const hasDifference = difference !== 0;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSubmit() {
    if (cashCountedInput === '') {
      setError('Ingres\u00e1 el total en caja para poder cerrar.');
      return;
    }

    if (Number.isNaN(cashCounted) || cashCounted < 0) {
      setError('El total en caja debe ser un valor positivo.');
      return;
    }

    onSave({
      cashCounted,
      difference,
      status,
      notes,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden border border-neutral-300 bg-white">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-300 bg-background px-5 sm:min-h-20 sm:px-6">
          <h2 className="text-xl font-semibold text-neutral-950 sm:text-2xl">{'Resumen de Liquidaci\u00f3n'}</h2>
          <button
            className="grid size-11 place-items-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 gap-6 overflow-y-auto p-5 sm:gap-7 sm:p-6">
          <section className="border border-neutral-300 bg-surface-low p-4">
            <div className="flex items-center justify-between border-b border-dotted border-neutral-300 pb-3">
              <span className="text-base text-neutral-600">Total Recaudado</span>
              <strong className="text-xl font-semibold text-neutral-950">{formatCurrency(summary.totalRevenue)}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-dotted border-neutral-300 py-3">
              <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <Banknote className="size-4" aria-hidden="true" />
                Efectivo
              </span>
              <span className="text-base text-neutral-950">{formatCurrency(summary.cashTotal)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-dotted border-neutral-300 py-3">
              <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <SendToBack className="size-4" aria-hidden="true" />
                Transferencias
              </span>
              <span className="text-base text-neutral-950">{formatCurrency(summary.transferTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <CreditCard className="size-4" aria-hidden="true" />
                Tarjetas
              </span>
              <span className="text-base text-neutral-950">{formatCurrency(summary.cardTotal)}</span>
            </div>
            {summary.mercadoPagoTotal > 0 ? (
              <div className="flex items-center justify-between border-t border-dotted border-neutral-300 pt-3">
                <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
                  <Landmark className="size-4" aria-hidden="true" />
                  Mercado Pago
                </span>
                <span className="text-base text-neutral-950">{formatCurrency(summary.mercadoPagoTotal)}</span>
              </div>
            ) : null}
          </section>

          <label className="grid gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-950">{'Total en caja (efectivo f\u00edsico)'}</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-neutral-500">$</span>
              <input
                className="h-12 w-full border border-neutral-300 bg-white pl-10 pr-4 text-xl font-semibold outline-none transition-colors focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                min="0"
                onChange={(event) => {
                  setCashCountedInput(event.target.value);
                  setError('');
                }}
                placeholder="Ingresar monto..."
                type="number"
                value={cashCountedInput}
              />
            </div>
            <span className="text-sm leading-6 text-neutral-500">Anote el monto total de efectivo remanente en la caja registradora.</span>
          </label>

          {cashCountedInput !== '' && !Number.isNaN(cashCounted) ? (
            <section className="grid gap-3 border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-neutral-500">Efectivo esperado</span>
                <strong>{formatCurrency(summary.cashTotal)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-neutral-500">{'Efectivo f\u00edsico ingresado'}</span>
                <strong>{formatCurrency(cashCounted)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-3 text-sm">
                <span className="text-neutral-500">Diferencia</span>
                <strong className={cn(difference < 0 && 'text-red-700', difference > 0 && 'text-amber-700')}>
                  {formatCurrency(difference)}
                </strong>
              </div>
              <span className={cn('inline-flex w-max border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]', statusConfig.className)}>
                {statusConfig.label}
              </span>
            </section>
          ) : null}

          {hasDifference ? (
            <label className="grid gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-950">Observaciones</span>
              <textarea
                className="min-h-24 resize-none border border-neutral-300 bg-white p-3 text-sm outline-none transition-colors focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Motivo de la diferencia..."
                value={notes}
              />
            </label>
          ) : null}

          {error ? <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
        </div>

        <footer className="flex flex-col justify-end gap-3 border-t border-neutral-300 bg-background p-5 sm:flex-row sm:p-6">
          <button
            className="min-h-11 border border-neutral-300 bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] text-neutral-950 transition-colors hover:border-neutral-950"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="min-h-11 bg-neutral-950 px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-neutral-800"
            onClick={handleSubmit}
            type="button"
          >
            Guardar y Descargar PDF
          </button>
        </footer>
      </div>
    </div>
  );
}
