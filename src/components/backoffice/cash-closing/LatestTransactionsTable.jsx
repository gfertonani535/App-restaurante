import { Download } from 'lucide-react';
import { formatCurrency } from '@/lib/cashClosing.js';

export function LatestTransactionsTable({ transactions, onExport, onOpenHistory }) {
  return (
    <section className="border border-neutral-300 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-300 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-xl font-semibold text-neutral-950 sm:text-2xl">{'\u00daltimas Transacciones'}</h2>
        <button
          className="inline-flex min-h-10 items-center gap-2 px-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-neutral-950"
          onClick={onExport}
          type="button"
        >
          <Download className="size-4" aria-hidden="true" />
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="border-b border-neutral-300 bg-neutral-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Hora</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Mesa</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Medio de pago</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Monto total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {transactions.map((transaction) => (
              <tr className="transition-colors hover:bg-neutral-50" key={transaction.id}>
                <td className="px-6 py-5 text-sm text-neutral-950">{transaction.time}</td>
                <td className="px-6 py-5 text-sm text-neutral-950">{transaction.tableOrLocation}</td>
                <td className="px-6 py-5">
                  <span className="bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-tight text-neutral-600">
                    {transaction.paymentLabel}
                  </span>
                </td>
                <td className="px-6 py-5 text-right text-xl font-semibold leading-none text-neutral-950">
                  {formatCurrency(transaction.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex justify-center border-t border-neutral-200 px-4 py-4">
        <button
          className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-950"
          onClick={onOpenHistory}
          type="button"
        >
          Ver todas las transacciones
        </button>
      </footer>
    </section>
  );
}
