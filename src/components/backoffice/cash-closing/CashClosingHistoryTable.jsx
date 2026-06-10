import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { closingStatusMeta, formatCurrency, formatDateLabel } from '@/lib/cashClosing.js';

export function CashClosingHistoryTable({ records, selectedRecordId, onSelectRecord }) {
  return (
    <div className="overflow-x-auto border border-neutral-300">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead className="border-b border-neutral-300 bg-surface-low">
          <tr>
            <th className="w-1/3 px-6 py-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Fecha</th>
            <th className="w-1/4 px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">
              Total recaudado
            </th>
            <th className="w-1/4 px-6 py-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Estado</th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-300">
          {records.map((record) => {
            const status = closingStatusMeta[record.status];
            const isSelected = selectedRecordId === record.id;

            return (
              <tr className={cn('transition-colors hover:bg-neutral-50', isSelected && 'bg-neutral-50')} key={record.id}>
                <td className="px-6 py-5 text-sm text-neutral-950">{formatDateLabel(record.date)}</td>
                <td className={cn('px-6 py-5 text-right text-xl font-semibold leading-none', record.difference < 0 && 'text-red-700')}>
                  {formatCurrency(record.totalRevenue)}
                </td>
                <td className="px-6 py-5">
                  <span className={cn('inline-flex border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]', status.badgeClassName)}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button
                    className={cn(
                      'mx-auto inline-flex min-h-10 items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors',
                      status.actionClassName,
                    )}
                    onClick={() => onSelectRecord(isSelected ? null : record)}
                    type="button"
                  >
                    <Eye className="size-5" aria-hidden="true" />
                    {status.actionLabel}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
