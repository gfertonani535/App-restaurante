import { Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/cashClosing.js';

const columns = [
  { key: 'closure', label: 'Cierre' },
  { key: 'closedAt', label: 'Fecha y hora' },
  { key: 'closedBy', label: 'Responsable' },
  { key: 'ordersCount', label: 'Órdenes',},
  { key: 'paymentsCount', label: 'Pagos',},
  { key: 'cashTotal', label: 'Efectivo',},
  { key: 'cardTotal', label: 'Tarjeta',},
  { key: 'transferTotal', label: 'Transfe rencia',},
  { key: 'otherTotal', label: 'Otros',},
  { key: 'total', label: 'Total',},
  { key: 'actions', label: 'Acciones',},
];

const headerCellClass = 'px-4 py-4 text-center text-xs min-w-4 max-w-24 font-bold uppercase tracking-[0.08em] text-neutral-500';
const bodyCellClass = 'px-4 py-5 text-center text-sm';
const actionButtonClass = 'text-neutral-500 hover:text-neutral-950';

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}


function HistoryTableHead() {
  return (
    <TableHeader className="border-b border-neutral-300 bg-surface-low">
      <TableRow className="hover:bg-transparent">
        {columns.map((column) => (
          <TableHead className={cn(headerCellClass)} key={column.key}>
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

function MoneyCell({ children, isTotal = false }) {
  return (
    <TableCell className={cn(bodyCellClass, isTotal && 'text-l font-semibold leading-none text-neutral-950')}>
      {formatCurrency(children)}
    </TableCell>
  );
}

function ActionButton({ children, label, onClick }) {
  return (
    <Button aria-label={label} className={actionButtonClass} onClick={onClick} size="sm" type="button" variant="ghost">
      {children}
    </Button>
  );
}

export function CashClosingHistoryTable({ records, selectedRecordId, onPrintRecord, onSelectRecord }) {
  return (
    <div className="overflow-x-auto border border-neutral-300">
      <Table className="min-w-[1080px]">
        <HistoryTableHead />
        <TableBody className="divide-y divide-neutral-300">
          {records.map((record) => {
            const isSelected = selectedRecordId === record.id;

            return (
              <TableRow className={cn('transition-colors hover:bg-neutral-50', isSelected && 'bg-neutral-50')} key={record.id}>
                <TableCell className={cn(bodyCellClass, 'font-bold text-neutral-950')}>#{record.closureNumber}</TableCell>
                <TableCell className={cn(bodyCellClass, 'text-neutral-950')}>{formatDateTime(record.closedAt)}</TableCell>
                <TableCell className={cn(bodyCellClass, 'text-neutral-600')}>{record.closedBy}</TableCell>
                <TableCell className={cn(bodyCellClass, 'font-semibold')}>{record.ordersCount}</TableCell>
                <TableCell className={cn(bodyCellClass, 'font-semibold')}>{record.paymentsCount}</TableCell>
                <MoneyCell>{record.cashTotal}</MoneyCell>
                <MoneyCell>{record.cardTotal}</MoneyCell>
                <MoneyCell>{record.transferTotal}</MoneyCell>
                <MoneyCell>{record.otherTotal}</MoneyCell>
                <MoneyCell isTotal>{record.total}</MoneyCell>
                <TableCell className={bodyCellClass}>
                  <div className="flex justify-center gap-3">
                    <ActionButton label="Ver detalle del cierre" onClick={() => onSelectRecord(isSelected ? null : record)}>
                      <Eye className="size-4" aria-hidden="true" />
                    </ActionButton>
                    <ActionButton label="Imprimir cierre" onClick={() => onPrintRecord(record)}>
                      <Printer className="size-4" aria-hidden="true" />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
