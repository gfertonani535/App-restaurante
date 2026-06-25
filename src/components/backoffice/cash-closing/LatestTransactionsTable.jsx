import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { formatCurrency } from '@/lib/cashClosing.js';

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

function formatTime(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getPaymentLocation(payment) {
  if (payment.order?.tableLabel) {
    return payment.order.tableLabel;
  }

  if (payment.order?.orderNumber) {
    return `Orden #${payment.order.orderNumber}`;
  }

  return 'Sin orden';
}

export function LatestTransactionsTable({ transactions, onExport, onOpenTransactions }) {
  const latestTransactions = transactions.slice(0, 6);

  return (
    <section className="border border-neutral-300 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-300 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-xl font-semibold text-neutral-950 sm:text-2xl">Últimas Transacciones</h2>
        <Button
          className="text-neutral-500 hover:text-neutral-950"
          onClick={onExport}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Download className="size-4" aria-hidden="true" />
          Exportar CSV
        </Button>
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
            {latestTransactions.map((transaction) => (
              <tr className="transition-colors hover:bg-neutral-50" key={transaction.id}>
                <td className="px-6 py-5 text-sm text-neutral-950">{formatTime(transaction.paidAt)}</td>
                <td className="px-6 py-5 text-sm text-neutral-950">{getPaymentLocation(transaction)}</td>
                <td className="px-6 py-5">
                  <span className="bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-tight text-neutral-600">
                    {paymentMethodLabels[transaction.method] ?? transaction.method}
                    {transaction.reference ? ` · ${transaction.reference}` : ''}
                  </span>
                </td>
                <td className="px-6 py-5 text-right text-xl font-semibold leading-none text-neutral-950">
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 ? (
        <div className="border-t border-neutral-200 px-6 py-8 text-center text-sm text-neutral-500">
          No hay pagos pendientes para incluir en un cierre.
        </div>
      ) : null}

      <footer className="flex justify-center border-t border-neutral-200 px-4 py-4">
        <Button
          className="text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
          onClick={onOpenTransactions}
          type="button"
          disabled={transactions.length === 0}
          variant="ghost"
        >
          Ver todas las transacciones
        </Button>
      </footer>
    </section>
  );
}
