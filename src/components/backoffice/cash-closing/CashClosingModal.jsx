import { useEffect, useState } from 'react';
import { Banknote, CreditCard, SendToBack, Wallet, X } from 'lucide-react';
import { formatCurrency } from '@/lib/cashClosing.js';

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-dotted border-neutral-300 py-3 last:border-b-0">
      <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
      <span className="text-base font-semibold text-neutral-950">{formatCurrency(value)}</span>
    </div>
  );
}

export function CashClosingModal({ isSaving = false, summary, onClose, onConfirm }) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden border border-neutral-300 bg-white">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-300 bg-background px-5 sm:min-h-20 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950 sm:text-2xl">Confirmar cierre de caja</h2>
            <p className="mt-1 text-sm text-neutral-500">Se cerrarán las órdenes pagadas incluidas en este cierre.</p>
          </div>
          <button
            className="grid size-11 place-items-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSaving}
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 gap-6 overflow-y-auto p-5 sm:p-6">
          <section className="border border-neutral-300 bg-surface-low p-4">
            <div className="flex items-center justify-between border-b border-dotted border-neutral-300 pb-3">
              <span className="text-base text-neutral-600">Total recaudado</span>
              <strong className="text-xl font-semibold text-neutral-950">{formatCurrency(summary.total)}</strong>
            </div>
            <SummaryRow icon={Banknote} label="Efectivo" value={summary.cashTotal} />
            <SummaryRow icon={CreditCard} label="Tarjetas" value={summary.cardTotal} />
            <SummaryRow icon={SendToBack} label="Transferencias" value={summary.transferTotal} />
            <SummaryRow icon={Wallet} label="Otros" value={summary.otherTotal} />
          </section>

          <section className="grid gap-2 border border-neutral-200 bg-neutral-50 p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Órdenes incluidas</span>
              <strong>{summary.ordersCount}</strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Pagos incluidos</span>
              <strong>{summary.paymentsCount}</strong>
            </div>
            <p className="border-t border-neutral-200 pt-3 text-neutral-500">
              La información seguirá disponible en el registro histórico.
            </p>
          </section>

          <label className="grid gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-950">Nota opcional</span>
            <textarea
              className="min-h-24 resize-none border border-neutral-300 bg-white p-3 text-sm outline-none transition-colors focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              disabled={isSaving}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Observaciones del cierre..."
              value={notes}
            />
          </label>
        </div>

        <footer className="flex flex-col justify-end gap-3 border-t border-neutral-300 bg-background p-5 sm:flex-row sm:p-6">
          <button
            className="min-h-11 border border-neutral-300 bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] text-neutral-950 transition-colors hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="min-h-11 bg-neutral-950 px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSaving}
            onClick={() => onConfirm(notes)}
            type="button"
          >
            {isSaving ? 'Cerrando caja...' : 'Confirmar cierre'}
          </button>
        </footer>
      </div>
    </div>
  );
}
