import { Eye, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/cashClosing.js';

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function CashClosingHistoryTable({ records, selectedRecordId, onPrintRecord, onSelectRecord }) {
  return (
    <div className="overflow-x-auto border border-neutral-300">
      <table className="w-full min-w-[1080px] border-collapse text-left">
        <thead className="border-b border-neutral-300 bg-surface-low">
          <tr>
            <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Cierre</th>
            <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Fecha y hora</th>
            <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Responsable</th>
            <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Órdenes</th>
            <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Pagos</th>
            <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Efectivo</th>
            <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Tarjeta</th>
            <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Transferencia</th>
            <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Otros</th>
            <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Total</th>
            <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-300">
          {records.map((record) => {
            const isSelected = selectedRecordId === record.id;

            return (
              <tr className={cn('transition-colors hover:bg-neutral-50', isSelected && 'bg-neutral-50')} key={record.id}>
                <td className="px-4 py-5 text-sm font-bold text-neutral-950">#{record.closureNumber}</td>
                <td className="px-4 py-5 text-sm text-neutral-950">{formatDateTime(record.closedAt)}</td>
                <td className="px-4 py-5 text-sm text-neutral-600">{record.closedBy}</td>
                <td className="px-4 py-5 text-right text-sm font-semibold">{record.ordersCount}</td>
                <td className="px-4 py-5 text-right text-sm font-semibold">{record.paymentsCount}</td>
                <td className="px-4 py-5 text-right text-sm">{formatCurrency(record.cashTotal)}</td>
                <td className="px-4 py-5 text-right text-sm">{formatCurrency(record.cardTotal)}</td>
                <td className="px-4 py-5 text-right text-sm">{formatCurrency(record.transferTotal)}</td>
                <td className="px-4 py-5 text-right text-sm">{formatCurrency(record.otherTotal)}</td>
                <td className="px-4 py-5 text-right text-xl font-semibold leading-none text-neutral-950">{formatCurrency(record.total)}</td>
                <td className="px-4 py-5">
                  <div className="flex justify-center gap-3">
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-950"
                      onClick={() => onSelectRecord(isSelected ? null : record)}
                      type="button"
                    >
                      <Eye className="size-5" aria-hidden="true" />
                      Ver
                    </button>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500 transition-colors hover:text-neutral-950"
                      onClick={() => onPrintRecord(record)}
                      type="button"
                    >
                      <Printer className="size-5" aria-hidden="true" />
                      Imprimir
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
