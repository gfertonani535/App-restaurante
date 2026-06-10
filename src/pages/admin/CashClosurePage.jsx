import { useCallback, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { CashClosingHistoryModal } from '@/components/backoffice/cash-closing/CashClosingHistoryModal.jsx';
import { CashClosingModal } from '@/components/backoffice/cash-closing/CashClosingModal.jsx';
import { CashSummaryCards } from '@/components/backoffice/cash-closing/CashSummaryCards.jsx';
import { LatestTransactionsTable } from '@/components/backoffice/cash-closing/LatestTransactionsTable.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  calculateCashClosingSummary,
  createCashClosingRecord,
  downloadCashClosingPdf,
  exportRowsAsCsv,
  formatCurrency,
  initialCashClosingRecords,
  latestCashTransactions,
} from '@/lib/cashClosing.js';

export function CashClosurePage() {
  const summary = useMemo(() => calculateCashClosingSummary(), []);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClosingRecord, setSelectedClosingRecord] = useState(null);
  const [closingRecords, setClosingRecords] = useState(initialCashClosingRecords);

  const handleOpenClosingModal = useCallback(() => {
    setIsClosingModalOpen(true);
  }, []);

  const handleCloseClosingModal = useCallback(() => {
    setIsClosingModalOpen(false);
  }, []);

  const handleOpenHistoryModal = useCallback(() => {
    setSelectedClosingRecord(null);
    setIsHistoryModalOpen(true);
  }, []);

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false);
    setSelectedClosingRecord(null);
  }, []);

  const handleSaveCashClosing = useCallback(
    (data) => {
      const record = createCashClosingRecord(summary, data);

      setClosingRecords((currentRecords) => [record, ...currentRecords]);
      downloadCashClosingPdf(record);
      handleCloseClosingModal();
    },
    [handleCloseClosingModal, summary],
  );

  const handleExportTransactions = useCallback(() => {
    exportRowsAsCsv('ultimas-transacciones.csv', [
      ['Hora', 'Mesa / ubicacion', 'Medio de pago', 'Monto total'],
      ...latestCashTransactions.map((transaction) => [
        transaction.time,
        transaction.tableOrLocation,
        transaction.paymentLabel,
        formatCurrency(transaction.total),
      ]),
    ]);
  }, []);

  const handleExportHistory = useCallback(() => {
    exportRowsAsCsv('registro-historico-cierres.csv', [
      ['Fecha', 'Total recaudado', 'Efectivo esperado', 'Efectivo fisico', 'Diferencia', 'Estado', 'Usuario'],
      ...closingRecords.map((record) => [
        record.date,
        formatCurrency(record.totalRevenue),
        formatCurrency(record.cashExpected),
        formatCurrency(record.cashCounted),
        formatCurrency(record.difference),
        record.status,
        record.closedBy,
      ]),
    ]);
  }, [closingRecords]);

  return (
    <AdminPageContainer>
      <PageHeader
        description="Resumen financiero correspondiente a la jornada de hoy."
        primaryAction={
          <Button onClick={handleOpenClosingModal} size="sm" type="button">
            Cerrar caja
          </Button>
        }
        secondaryActions={
          <Button onClick={handleOpenHistoryModal} size="sm" type="button" variant="secondary">
            {'Ver registro hist\u00f3rico'}
          </Button>
        }
        title="Cierre de Caja"
      />

      <CashSummaryCards summary={summary} />

      <LatestTransactionsTable
        onExport={handleExportTransactions}
        onOpenHistory={handleOpenHistoryModal}
        transactions={latestCashTransactions}
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-neutral-950 p-6 text-white sm:p-8 lg:col-span-2">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">{'An\u00e1lisis mensual'}</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-[32px]">Punto de equilibrio alcanzado</h2>
            <p className="mt-5 text-base leading-7 text-neutral-300">
              Resumen consolidado del rendimiento operativo y financiero durante el ultimo mes de actividad.
            </p>
          </div>
          <div className="relative z-10 mt-8">
            <button
              className="border border-white/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:bg-white hover:text-neutral-950"
              onClick={handleOpenHistoryModal}
              type="button"
            >
              {'Ver Registro Hist\u00f3rico'}
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 size-72 border-[34px] border-white/5" aria-hidden="true" />
          <div className="absolute right-36 top-10 size-14 rotate-45 border-4 border-white/5" aria-hidden="true" />
        </article>

        <article className="flex min-h-64 flex-col items-center justify-center border border-neutral-300 bg-white p-6 text-center sm:p-8">
          <div className="grid size-16 place-items-center bg-neutral-50">
            <Printer className="size-8 text-neutral-300" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-neutral-950">Comprobante Z</h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-500">Generar informe fiscal de cierre para impresora termica.</p>
          <button
            className="mt-8 w-full min-h-11 border border-neutral-300 bg-white px-5 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-neutral-950 hover:bg-neutral-50"
            type="button"
          >
            Imprimir Cierre
          </button>
        </article>
      </section>

      {isClosingModalOpen ? (
        <CashClosingModal onClose={handleCloseClosingModal} onSave={handleSaveCashClosing} summary={summary} />
      ) : null}

      {isHistoryModalOpen ? (
        <CashClosingHistoryModal
          onClose={handleCloseHistoryModal}
          onExport={handleExportHistory}
          onSelectRecord={setSelectedClosingRecord}
          records={closingRecords}
          selectedRecord={selectedClosingRecord}
        />
      ) : null}
    </AdminPageContainer>
  );
}
