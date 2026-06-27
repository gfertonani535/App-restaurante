import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { formatCurrency } from '@/lib/cashClosing.js';
import { formatTime } from '@/utils/formatters.js';
import { cn } from '@/lib/utils';

const columns = [
  { key: 'paidAt', label: 'Hora' },
  { key: 'location', label: 'Mesa' },
  { key: 'method', label: 'Medio de pago' },
  { key: 'amount', label: 'Monto total', align: 'right' },
];

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

const headCellClass = 'px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-neutral-500';
const bodyCellClass = 'px-6 py-5 text-left text-sm text-neutral-950';

function getPaymentLocation(payment) {
  if (payment.order?.tableLabel) {
    return payment.order.tableLabel;
  }

  if (payment.order?.orderNumber) {
    return `Orden #${payment.order.orderNumber}`;
  }

  return 'Sin orden';
}

function PaymentMethodTag({ transaction }) {
  return (
    <span className="bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-tight text-neutral-600">
      {paymentMethodLabels[transaction.method] ?? transaction.method}
      {transaction.reference ? ` · ${transaction.reference}` : ''}
    </span>
  );
}

export function LatestTransactionsTable({ transactions, onExport, onOpenTransactions }) {
  const latestTransactions = transactions.slice(0, 6);

  return (
    <section className="border border-neutral-300 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-300 bg-white px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-xl font-semibold text-neutral-950 sm:text-2xl">Últimas transacciones</h2>
        <Button className="text-neutral-500 hover:text-neutral-950" onClick={onExport} size="sm" type="button" variant="ghost">
          <Download className="size-4" aria-hidden="true" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader className="border-b border-neutral-300 bg-neutral-50">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead className={cn(headCellClass, column.align === 'right' && 'text-right')} key={column.key}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-neutral-100">
            {latestTransactions.map((transaction) => (
              <TableRow className="transition-colors hover:bg-neutral-50" key={transaction.id}>
                <TableCell className={bodyCellClass}>{formatTime(transaction.paidAt)}</TableCell>
                <TableCell className={bodyCellClass}>{getPaymentLocation(transaction)}</TableCell>
                <TableCell className="px-6 py-5">
                  <PaymentMethodTag transaction={transaction} />
                </TableCell>
                <TableCell className="px-6 py-5 text-right text-xl font-semibold leading-none text-neutral-950">
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {transactions.length === 0 ? (
        <div className="border-t border-neutral-200 px-6 py-8 text-center text-sm text-neutral-500">
          No hay pagos pendientes para incluir en un cierre.
        </div>
      ) : null}

      <footer className="flex justify-center border-t border-neutral-200 px-4 py-4">
        <Button
          className="text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
          disabled={transactions.length === 0}
          onClick={onOpenTransactions}
          type="button"
          variant="ghost"
        >
          Ver todas las transacciones
        </Button>
      </footer>
    </section>
  );
}
