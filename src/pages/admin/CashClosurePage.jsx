import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import { CashClosingHistoryModal } from '@/components/backoffice/cash-closing/CashClosingHistoryModal.jsx';
import { CashClosingModal } from '@/components/backoffice/cash-closing/CashClosingModal.jsx';
import { CashSummaryCards } from '@/components/backoffice/cash-closing/CashSummaryCards.jsx';
import { LatestTransactionsTable } from '@/components/backoffice/cash-closing/LatestTransactionsTable.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { FeedbackMessage } from '@/components/common/FeedbackMessage.jsx';
import { IconButton } from '@/components/common/IconButton.jsx';
import { LoadingState } from '@/components/common/LoadingState.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import {
  closeCashRegister,
  getCashClosureOrders,
  getCashClosurePayments,
  getCashClosures,
  getPendingCashClosureSummary,
  getPendingClosurePayments,
} from '@/services/cashClosures.service.js';
import { exportRowsAsCsv, formatCurrency } from '@/lib/cashClosing.js';
import { formatDateTime, formatTime } from '@/utils/formatters.js';

const emptySummary = {
  ordersCount: 0,
  paymentsCount: 0,
  cashTotal: 0,
  cardTotal: 0,
  transferTotal: 0,
  otherTotal: 0,
  total: 0,
  blockingOrdersCount: 0,
  canClose: false,
};

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

const transactionColumns = [
  { key: 'paidAt', label: 'Hora' },
  { key: 'order', label: 'Mesa / Orden' },
  { key: 'method', label: 'Medio' },
  { key: 'amount', label: 'Monto', align: 'right' },
];

function printClosure(record) {
  if (!record) {
    return false;
  }

  const printWindow = window.open('', '_blank', 'width=520,height=720');

  if (!printWindow) {
    return false;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Cierre #${record.closureNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 22px; margin: 0 0 8px; }
          p { margin: 6px 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 18px; }
          td { border-bottom: 1px solid #ddd; padding: 9px 0; }
          td:last-child { text-align: right; font-weight: 700; }
          .total { font-size: 20px; font-weight: 800; }
        </style>
      </head>
      <body>
        <h1>Comprobante Z · Cierre #${record.closureNumber}</h1>
        <p>Fecha y hora: ${formatDateTime(record.closedAt)}</p>
        <p>Responsable: ${record.closedBy ?? 'Sin asignar'}</p>
        <p>Órdenes: ${record.ordersCount}</p>
        <p>Pagos: ${record.paymentsCount}</p>
        <table>
          <tr><td>Efectivo</td><td>${formatCurrency(record.cashTotal)}</td></tr>
          <tr><td>Tarjeta</td><td>${formatCurrency(record.cardTotal)}</td></tr>
          <tr><td>Transferencia</td><td>${formatCurrency(record.transferTotal)}</td></tr>
          <tr><td>Otros</td><td>${formatCurrency(record.otherTotal)}</td></tr>
          <tr class="total"><td>Total</td><td>${formatCurrency(record.total)}</td></tr>
        </table>
        ${record.notes ? `<p>Notas: ${record.notes}</p>` : ''}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
}

function TransactionsDialog({ transactions, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden border border-neutral-300 bg-white">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-300 px-5">
          <h2 className="text-xl font-semibold text-neutral-950">Transacciones pendientes</h2>
          <IconButton className="rounded-none" label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </header>
        <div className="overflow-y-auto p-5">
          <div className="overflow-x-auto border border-neutral-200">
            <Table className="min-w-[720px] text-left">
              <TableHeader className="bg-neutral-50">
                <TableRow className="hover:bg-transparent">
                  {transactionColumns.map((column) => (
                    <TableHead
                      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-neutral-500 ${column.align === 'right' ? 'text-right' : ''}`}
                      key={column.key}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-neutral-100">
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="px-4 py-4 text-left text-sm">{formatTime(transaction.paidAt)}</TableCell>
                    <TableCell className="px-4 py-4 text-left text-sm">
                      {transaction.order?.tableLabel || `Orden #${transaction.order?.orderNumber ?? '—'}`}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-left text-sm">{paymentMethodLabels[transaction.method] ?? transaction.method}</TableCell>
                    <TableCell className="px-4 py-4 text-right font-bold">{formatCurrency(transaction.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClosureResultDialog({ record, onClose, onPrint }) {
  if (!record) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg border border-neutral-300 bg-white">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-300 px-5">
          <h2 className="text-xl font-semibold text-neutral-950">Caja cerrada correctamente</h2>
          <IconButton className="rounded-none" label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </header>
        <div className="grid gap-3 p-5 text-sm">
          <div className="flex justify-between"><span>Cierre</span><strong>#{record.closureNumber}</strong></div>
          <div className="flex justify-between"><span>Fecha y hora</span><strong>{formatDateTime(record.closedAt)}</strong></div>
          <div className="flex justify-between"><span>Órdenes</span><strong>{record.ordersCount}</strong></div>
          <div className="flex justify-between"><span>Pagos</span><strong>{record.paymentsCount}</strong></div>
          <div className="flex justify-between"><span>Efectivo</span><strong>{formatCurrency(record.cashTotal)}</strong></div>
          <div className="flex justify-between"><span>Tarjeta</span><strong>{formatCurrency(record.cardTotal)}</strong></div>
          <div className="flex justify-between"><span>Transferencia</span><strong>{formatCurrency(record.transferTotal)}</strong></div>
          <div className="flex justify-between"><span>Otros</span><strong>{formatCurrency(record.otherTotal)}</strong></div>
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg"><span>Total</span><strong>{formatCurrency(record.total)}</strong></div>
          {record.notes ? <p className="border-t border-neutral-200 pt-3 text-neutral-600">Notas: {record.notes}</p> : null}
        </div>
        <footer className="flex justify-end gap-3 border-t border-neutral-300 p-5">
          <Button onClick={() => onPrint(record)} type="button" variant="secondary">
            Imprimir cierre
          </Button>
          <Button onClick={onClose} type="button">
            Cerrar
          </Button>
        </footer>
      </div>
    </div>
  );
}

export function CashClosurePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(emptySummary);
  const [transactions, setTransactions] = useState([]);
  const [closingRecords, setClosingRecords] = useState([]);
  const [selectedClosingRecord, setSelectedClosingRecord] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState({ orders: [], payments: [] });
  const [latestClosure, setLatestClosure] = useState(null);
  const [closureResult, setClosureResult] = useState(null);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransactionsDialogOpen, setIsTransactionsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const canClose = summary.canClose && summary.paymentsCount > 0 && summary.blockingOrdersCount === 0;

  const loadCashClosureData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [nextSummary, nextTransactions, nextRecords] = await Promise.all([
        getPendingCashClosureSummary(),
        getPendingClosurePayments(),
        getCashClosures(),
      ]);

      setSummary(nextSummary);
      setTransactions(nextTransactions);
      setClosingRecords(nextRecords);
      setLatestClosure(nextRecords[0] ?? null);
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar el resumen de caja.');
      setSummary(emptySummary);
      setTransactions([]);
      setClosingRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCashClosureData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCashClosureData]);

  const statusContent = useMemo(() => {
    if (summary.paymentsCount === 0) {
      return {
        eyebrow: 'Estado del cierre',
        title: 'Sin movimientos pendientes',
        description: 'No hay pagos disponibles para realizar un cierre.',
        stats: [
          ['Órdenes incluidas', summary.ordersCount],
          ['Pagos incluidos', summary.paymentsCount],
          ['Órdenes pendientes', summary.blockingOrdersCount],
        ],
      };
    }

    if (!summary.canClose) {
      return {
        eyebrow: 'Estado del cierre',
        title: 'Cierre bloqueado',
        description: 'Hay órdenes pendientes de cobro. Completá o cancelá esas órdenes antes de cerrar la caja.',
        stats: [
          ['Órdenes pendientes', summary.blockingOrdersCount],
          ['Órdenes incluidas', summary.ordersCount],
          ['Pagos incluidos', summary.paymentsCount],
        ],
      };
    }

    return {
      eyebrow: 'Estado del cierre',
      title: 'Todo listo para cerrar la caja',
      description: 'Las órdenes incluidas están completamente pagadas.',
      stats: [
        ['Órdenes incluidas', summary.ordersCount],
        ['Pagos incluidos', summary.paymentsCount],
        ['Órdenes pendientes', summary.blockingOrdersCount],
      ],
    };
  }, [summary]);

  const handleOpenHistoryModal = useCallback(() => {
    setSelectedClosingRecord(null);
    setSelectedDetails({ orders: [], payments: [] });
    setIsHistoryModalOpen(true);
  }, []);

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
    setSelectedClosingRecord(null);
    setSelectedDetails({ orders: [], payments: [] });
  }, []);

  const handleSelectRecord = useCallback(async (record) => {
    setSelectedClosingRecord(record);
    setSelectedDetails({ orders: [], payments: [] });

    if (!record) {
      return;
    }

    setIsLoadingDetails(true);

    try {
      const [orders, payments] = await Promise.all([
        getCashClosureOrders(record.id),
        getCashClosurePayments(record.id),
      ]);

      setSelectedDetails({ orders, payments });
    } catch (detailError) {
      setError(detailError.message || 'No se pudo cargar el detalle del cierre.');
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handleConfirmCloseCashRegister = useCallback(
    async (notes) => {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      try {
        const result = await closeCashRegister(notes);
        const printableRecord = {
          ...result,
          closedBy: result.closedBy ?? 'Usuario actual',
        };

        setClosureResult(printableRecord);
        setLatestClosure(printableRecord);
        setIsClosingModalOpen(false);
        setSuccessMessage('Caja cerrada correctamente.');
        await loadCashClosureData();
      } catch (closeError) {
        setError(closeError.message || 'No se pudo cerrar la caja.');
      } finally {
        setIsSaving(false);
      }
    },
    [loadCashClosureData],
  );

  const handleExportTransactions = useCallback(() => {
    exportRowsAsCsv('transacciones-pendientes-cierre.csv', [
      ['Hora', 'Mesa / orden', 'Medio de pago', 'Monto total'],
      ...transactions.map((transaction) => [
        formatTime(transaction.paidAt),
        transaction.order?.tableLabel || `Orden #${transaction.order?.orderNumber ?? ''}`,
        paymentMethodLabels[transaction.method] ?? transaction.method,
        formatCurrency(transaction.amount),
      ]),
    ]);
  }, [transactions]);

  const handleExportHistory = useCallback(() => {
    exportRowsAsCsv('registro-historico-cierres.csv', [
      ['Cierre', 'Fecha y hora', 'Responsable', 'Ordenes', 'Pagos', 'Efectivo', 'Tarjeta', 'Transferencia', 'Otros', 'Total'],
      ...closingRecords.map((record) => [
        `#${record.closureNumber}`,
        formatDateTime(record.closedAt),
        record.closedBy,
        record.ordersCount,
        record.paymentsCount,
        formatCurrency(record.cashTotal),
        formatCurrency(record.cardTotal),
        formatCurrency(record.transferTotal),
        formatCurrency(record.otherTotal),
        formatCurrency(record.total),
      ]),
    ]);
  }, [closingRecords]);

  function handlePrintClosure(record = latestClosure) {
    const printed = printClosure(record);

    if (!printed) {
      setError('No se pudo abrir la vista de impresión.');
    }
  }

  return (
    <AdminPageContainer>
      <PageHeader
        description="Resumen financiero correspondiente a la jornada de hoy."
        primaryAction={
          <Button disabled={!canClose || isLoading || isSaving} onClick={() => setIsClosingModalOpen(true)} size="sm" type="button">
            {isSaving ? 'Cerrando caja...' : 'Cerrar caja'}
          </Button>
        }
        secondaryActions={
          <Button className={"h-10"} onClick={handleOpenHistoryModal} size="sm" type="button" variant="secondary">
            Ver registro histórico
          </Button>
        }
        title="Cierre de Caja"
      />

      {isLoading ? <LoadingState message="Cargando resumen de caja..." /> : null}
      {error ? <ErrorState title={error} onRetry={loadCashClosureData} /> : null}
      <FeedbackMessage variant="success">{successMessage}</FeedbackMessage>

      <CashSummaryCards summary={summary} />

      <LatestTransactionsTable
        onExport={handleExportTransactions}
        onOpenTransactions={() => setIsTransactionsDialogOpen(true)}
        transactions={transactions}
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-neutral-950 p-6 text-white sm:p-8 lg:col-span-2">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">{statusContent.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-[32px]">{statusContent.title}</h2>
            <p className="mt-5 text-base leading-7 text-neutral-300">{statusContent.description}</p>
            <div className="mt-6 grid gap-2 text-sm text-neutral-300 sm:grid-cols-3">
              {statusContent.stats.map(([label, value]) => (
                <div className="border border-white/10 p-3" key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            {!summary.canClose && summary.blockingOrdersCount > 0 ? (
              <Button
                className="border-white/25 bg-transparent text-white hover:bg-white hover:text-neutral-950"
                onClick={() => navigate('/admin/pedidos')}
                type="button"
                variant="secondary"
              >
                Ver órdenes pendientes
              </Button>
            ) : null}
            <Button
              className="border-white/25 bg-transparent text-white hover:bg-white hover:text-neutral-950"
              onClick={handleOpenHistoryModal}
              type="button"
              variant="secondary"
            >
              Ver Registro Histórico
            </Button>
            <Button
              className="border-white/25 bg-transparent text-white hover:bg-white hover:text-neutral-950"
              disabled={!canClose || isSaving}
              onClick={() => setIsClosingModalOpen(true)}
              type="button"
              variant="secondary"
            >
              Cerrar caja
            </Button>
          </div>
          <div className="absolute -bottom-20 -right-20 size-72 border-[34px] border-white/5" aria-hidden="true" />
          <div className="absolute right-36 top-10 size-14 rotate-45 border-4 border-white/5" aria-hidden="true" />
        </article>

        <article className="flex min-h-64 flex-col items-center justify-center border border-neutral-300 bg-white p-6 text-center sm:p-8">
          <div className="grid size-16 place-items-center bg-neutral-50">
            <Printer className="size-8 text-neutral-300" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-neutral-950">Comprobante Z</h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-500">
            {latestClosure ? `Último cierre disponible: #${latestClosure.closureNumber}` : 'Todavía no hay un cierre para imprimir.'}
          </p>
          <Button
            className="mt-8 w-full"
            disabled={!latestClosure}
            onClick={() => handlePrintClosure(latestClosure)}
            type="button"
            variant="secondary"
          >
            Imprimir Cierre
          </Button>
        </article>
      </section>

      {isClosingModalOpen ? (
        <CashClosingModal
          isSaving={isSaving}
          onClose={() => setIsClosingModalOpen(false)}
          onConfirm={handleConfirmCloseCashRegister}
          summary={summary}
        />
      ) : null}

      {isHistoryModalOpen ? (
        <CashClosingHistoryModal
          isLoadingDetails={isLoadingDetails}
          onClose={handleCloseHistoryModal}
          onExport={handleExportHistory}
          onPrintRecord={handlePrintClosure}
          onSelectRecord={handleSelectRecord}
          records={closingRecords}
          selectedDetails={selectedDetails}
          selectedRecord={selectedClosingRecord}
        />
      ) : null}

      {isTransactionsDialogOpen ? (
        <TransactionsDialog onClose={() => setIsTransactionsDialogOpen(false)} transactions={transactions} />
      ) : null}

      {closureResult ? (
        <ClosureResultDialog
          onClose={() => setClosureResult(null)}
          onPrint={handlePrintClosure}
          record={closureResult}
        />
      ) : null}
    </AdminPageContainer>
  );
}
