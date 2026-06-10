import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Filter, X } from 'lucide-react';
import { CashClosingHistoryTable } from '@/components/backoffice/cash-closing/CashClosingHistoryTable.jsx';
import { closingStatusMeta, formatCurrency } from '@/lib/cashClosing.js';

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-neutral-200 py-2 last:border-b-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <strong className="text-sm text-neutral-950">{value}</strong>
    </div>
  );
}

export function CashClosingHistoryModal({ records, selectedRecord, onSelectRecord, onClose, onExport }) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return records;
    }

    return records.filter((record) => record.date.toLowerCase().includes(normalizedSearch));
  }, [records, searchTerm]);

  const selectedStatus = selectedRecord ? closingStatusMeta[selectedRecord.status] : null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden border border-neutral-300 bg-white sm:max-h-[88dvh]">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-300 px-5 sm:min-h-24 sm:px-8">
          <h2 className="text-2xl font-semibold text-neutral-950 sm:text-3xl">{'Registro Hist\u00f3rico'}</h2>
          <button
            className="grid size-11 place-items-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            type="button"
            aria-label="Cerrar modal"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <label className="relative w-full max-w-sm">
              <input
                className="h-14 w-full border border-neutral-300 bg-white pl-5 pr-12 text-base outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por fecha..."
                type="search"
                value={searchTerm}
              />
              <CalendarDays className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            </label>

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-neutral-300 bg-surface-low px-5 text-sm text-neutral-950 transition-colors hover:border-neutral-950"
              type="button"
            >
              <Filter className="size-4" aria-hidden="true" />
              Filtros
            </button>
          </div>

          <CashClosingHistoryTable
            onSelectRecord={onSelectRecord}
            records={filteredRecords}
            selectedRecordId={selectedRecord?.id ?? null}
          />

          {selectedRecord ? (
            <section className="mt-6 border border-neutral-300 bg-surface-low p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-950">Detalle del cierre</h3>
                  <p className="mt-1 text-sm text-neutral-500">{new Date(selectedRecord.closedAt).toLocaleString('es-AR')}</p>
                </div>
                <span className={`border px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${selectedStatus.badgeClassName}`}>
                  {selectedStatus.label}
                </span>
              </div>

              <div className="grid gap-x-10 gap-y-1 md:grid-cols-2">
                <DetailRow label="Total recaudado" value={formatCurrency(selectedRecord.totalRevenue)} />
                <DetailRow label="Efectivo esperado" value={formatCurrency(selectedRecord.cashExpected)} />
                <DetailRow label={'Efectivo f\u00edsico'} value={formatCurrency(selectedRecord.cashCounted)} />
                <DetailRow label="Diferencia" value={formatCurrency(selectedRecord.difference)} />
                <DetailRow label="Transferencias" value={formatCurrency(selectedRecord.transferTotal)} />
                <DetailRow label="Tarjetas" value={formatCurrency(selectedRecord.cardTotal)} />
                <DetailRow label="Mercado Pago" value={formatCurrency(selectedRecord.mercadoPagoTotal)} />
                <DetailRow label="Usuario" value={selectedRecord.closedBy} />
              </div>

              {selectedRecord.notes ? (
                <div className="mt-5 border-t border-neutral-300 pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Observaciones</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{selectedRecord.notes}</p>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <footer className="flex justify-end border-t border-neutral-300 bg-white px-5 py-5 sm:px-8 sm:py-6">
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-neutral-950 px-8 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800 sm:w-auto"
            onClick={onExport}
            type="button"
          >
            <Download className="size-4" aria-hidden="true" />
            Exportar Reporte
          </button>
        </footer>
      </div>
    </div>
  );
}
