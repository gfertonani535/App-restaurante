import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Filter, X } from 'lucide-react';
import { CashClosingHistoryTable } from '@/components/backoffice/cash-closing/CashClosingHistoryTable.jsx';
import { IconButton } from '@/components/common/IconButton.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { formatCurrency } from '@/lib/cashClosing.js';

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-neutral-200 py-2 last:border-b-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <strong className="text-sm text-neutral-950">{value}</strong>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function CashClosingHistoryModal({
  isLoadingDetails = false,
  records,
  selectedDetails,
  selectedRecord,
  onClose,
  onExport,
  onPrintRecord,
  onSelectRecord,
}) {
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
    const normalizedSearch = normalizeText(searchTerm.trim());

    if (!normalizedSearch) {
      return records;
    }

    return records.filter((record) =>
      normalizeText(`#${record.closureNumber} ${record.closedAt} ${record.closedBy}`).includes(normalizedSearch),
    );
  }, [records, searchTerm]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3 backdrop-blur-[8px] sm:p-6" role="dialog" aria-modal="true">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden border border-neutral-300 bg-white sm:max-h-[88dvh]">
        <header className="flex min-h-16 items-center justify-between border-b border-neutral-300 px-5 sm:min-h-24 sm:px-8">
          <h2 className="text-2xl font-semibold text-neutral-950 sm:text-3xl">Registro Histórico</h2>
          <IconButton className="size-11 rounded-none" label="Cerrar modal" onClick={onClose}>
            <X className="size-6" aria-hidden="true" />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <label className="relative w-full max-w-sm">
              <Input
                className="h-14 rounded-none border-neutral-300 bg-white pl-5 pr-12 text-base"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por fecha..."
                type="search"
                value={searchTerm}
              />
              <CalendarDays className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            </label>

            <Button
              type="button"
              variant="secondary"
            >
              <Filter className="size-4" aria-hidden="true" />
              Filtros
            </Button>
          </div>

          <CashClosingHistoryTable
            onPrintRecord={onPrintRecord}
            onSelectRecord={onSelectRecord}
            records={filteredRecords}
            selectedRecordId={selectedRecord?.id ?? null}
          />

          {selectedRecord ? (
            <section className="mt-6 border border-neutral-300 bg-surface-low p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-neutral-950">Detalle del cierre #{selectedRecord.closureNumber}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{formatDateTime(selectedRecord.closedAt)}</p>
                </div>
                <Button
                  onClick={() => onPrintRecord(selectedRecord)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Imprimir cierre
                </Button>
              </div>

              <div className="grid gap-x-10 gap-y-1 md:grid-cols-2">
                <DetailRow label="Responsable" value={selectedRecord.closedBy} />
                <DetailRow label="Órdenes" value={selectedRecord.ordersCount} />
                <DetailRow label="Pagos" value={selectedRecord.paymentsCount} />
                <DetailRow label="Efectivo" value={formatCurrency(selectedRecord.cashTotal)} />
                <DetailRow label="Tarjetas" value={formatCurrency(selectedRecord.cardTotal)} />
                <DetailRow label="Transferencias" value={formatCurrency(selectedRecord.transferTotal)} />
                <DetailRow label="Otros" value={formatCurrency(selectedRecord.otherTotal)} />
                <DetailRow label="Total" value={formatCurrency(selectedRecord.total)} />
              </div>

              {selectedRecord.notes ? (
                <div className="mt-5 border-t border-neutral-300 pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Notas</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{selectedRecord.notes}</p>
                </div>
              ) : null}

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Órdenes incluidas</h4>
                  {isLoadingDetails ? (
                    <p className="border border-neutral-200 bg-white p-4 text-sm text-neutral-500">Cargando detalle...</p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto border border-neutral-200 bg-white">
                      {(selectedDetails?.orders ?? []).map((order) => (
                        <div className="flex items-center justify-between border-b border-neutral-100 p-3 text-sm last:border-b-0" key={order.id}>
                          <span>#{order.orderNumber} · {order.tableLabel || order.customerName || 'Sin mesa'}</span>
                          <strong>{formatCurrency(order.total)}</strong>
                        </div>
                      ))}
                      {(selectedDetails?.orders ?? []).length === 0 ? (
                        <p className="p-4 text-sm text-neutral-500">Sin órdenes asociadas.</p>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Pagos incluidos</h4>
                  {isLoadingDetails ? (
                    <p className="border border-neutral-200 bg-white p-4 text-sm text-neutral-500">Cargando detalle...</p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto border border-neutral-200 bg-white">
                      {(selectedDetails?.payments ?? []).map((payment) => (
                        <div className="flex items-center justify-between border-b border-neutral-100 p-3 text-sm last:border-b-0" key={payment.id}>
                          <span>{paymentMethodLabels[payment.method] ?? payment.method}</span>
                          <strong>{formatCurrency(payment.amount)}</strong>
                        </div>
                      ))}
                      {(selectedDetails?.payments ?? []).length === 0 ? (
                        <p className="p-4 text-sm text-neutral-500">Sin pagos asociados.</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <footer className="flex justify-end border-t border-neutral-300 bg-white px-5 py-5 sm:px-8 sm:py-6">
          <Button
            className="w-full sm:w-auto"
            onClick={onExport}
            type="button"
          >
            <Download className="size-4" aria-hidden="true" />
            Exportar Reporte
          </Button>
        </footer>
      </div>
    </div>
  );
}
