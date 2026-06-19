import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  ClipboardList,
  CreditCard,
  History,
  ListOrdered,
  PackagePlus,
  Plus,
  Receipt,
  RefreshCw,
  Tags,
  Wallet,
} from 'lucide-react';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { getDashboardSummary } from '@/services/dashboard.service.js';
import { cn } from '@/lib/utils';

const orderStatusMeta = {
  open: { label: 'Pendiente', variant: 'warning' },
  preparing: { label: 'En preparación', variant: 'warning' },
  ready: { label: 'Lista', variant: 'success' },
  served: { label: 'Servida', variant: 'muted' },
  closed: { label: 'Cerrada', variant: 'muted' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
};

const paymentStatusMeta = {
  unpaid: { label: 'No pagado', variant: 'destructive' },
  partial: { label: 'Parcial', variant: 'warning' },
  paid: { label: 'Pagado', variant: 'success' },
};

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTime(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function StatusBadge({ meta, fallback }) {
  const badgeMeta = meta ?? { label: fallback, variant: 'muted' };

  return <Badge variant={badgeMeta.variant}>{badgeMeta.label}</Badge>;
}

function MetricCard({ helper, icon: Icon, title, value }) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardContent className="flex min-h-[128px] items-center gap-5 p-5 sm:p-6">
        <div className="grid size-14 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-950">
          <Icon className="size-6" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-neutral-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold leading-none text-neutral-950">{value}</p>
          <p className="mt-2 text-sm font-medium text-neutral-500">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OperatingStatusCard({ activeOrdersSummary }) {
  const items = [
    { label: 'Pendientes', value: activeOrdersSummary.byStatus.open, className: 'border-amber-200 bg-amber-50' },
    { label: 'En preparación', value: activeOrdersSummary.byStatus.preparing, className: 'border-amber-200 bg-amber-50' },
    { label: 'Listas', value: activeOrdersSummary.byStatus.ready, className: 'border-emerald-200 bg-emerald-50' },
    { label: 'Servidas', value: activeOrdersSummary.byStatus.served, className: 'border-neutral-200 bg-neutral-50' },
    { label: 'Pagadas sin cerrar', value: activeOrdersSummary.paidPendingClosure, className: 'border-neutral-950 bg-neutral-950 text-white' },
  ];

  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="border-neutral-200 px-5 sm:px-6">
        <CardTitle>Estado operativo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-5">
        {items.map((item) => (
          <div className={cn('border p-4', item.className)} key={item.label}>
            <p className="text-xs font-bold uppercase tracking-[0.08em] opacity-70">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold leading-none">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TodayPaymentsCard({ paymentsSummary }) {
  const methodEntries = Object.entries(paymentMethodLabels);

  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="border-neutral-200 px-5 sm:px-6">
        <CardTitle>Pagos del día</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 sm:p-6">
        <div className="border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Total general</p>
          <p className="mt-2 text-3xl font-semibold leading-none text-neutral-950">{formatCurrency(paymentsSummary.total)}</p>
        </div>

        <div className="grid gap-3">
          {methodEntries.map(([method, label]) => (
            <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0" key={method}>
              <span className="text-sm font-medium text-neutral-500">{label}</span>
              <span className="text-base font-semibold text-neutral-950">{formatCurrency(paymentsSummary.byMethod[method])}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionsCard({ onNavigate }) {
  const actions = [
    { label: 'Nueva orden', to: '/admin/pedidos', icon: Plus, primary: true },
    { label: 'Ver órdenes', to: '/admin/pedidos', icon: ListOrdered },
    { label: 'Cerrar caja', to: '/admin/cierre-de-caja', icon: Wallet },
    { label: 'Añadir producto', to: '/admin/productos/nuevo', icon: PackagePlus },
    { label: 'Gestionar categorías', to: '/admin/categorias', icon: Tags },
  ];

  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="border-neutral-200 px-5 sm:px-6">
        <CardTitle>Accesos rápidos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 sm:p-6">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              className="w-full"
              key={action.label}
              onClick={() => onNavigate(action.to)}
              type="button"
              variant={action.primary ? 'default' : 'secondary'}
            >
              <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RecentOrdersCard({ onNavigate, orders }) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="flex-row items-center justify-between gap-4 border-neutral-200 px-5 sm:px-6">
        <CardTitle>Últimas órdenes</CardTitle>
        <Button onClick={() => onNavigate('/admin/pedidos')} size="sm" type="button" variant="secondary">
          Ver órdenes
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">Todavía no hay órdenes registradas.</p>
        ) : null}

        {orders.length > 0 ? (
          <div className="hidden overflow-x-auto md:block">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                  <TableHead>Orden</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold text-neutral-950">#{order.orderNumber}</TableCell>
                    <TableCell>{order.tableLabel}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      <StatusBadge meta={orderStatusMeta[order.status]} fallback={order.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge meta={paymentStatusMeta[order.paymentStatus]} fallback={order.paymentStatus} />
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-950">{formatCurrency(order.total)}</TableCell>
                    <TableCell>{formatTime(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => onNavigate('/admin/pedidos')} size="sm" type="button" variant="secondary">
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {orders.length > 0 ? (
          <div className="grid gap-3 p-4 md:hidden">
            {orders.map((order) => (
              <article className="border border-neutral-200 bg-white p-4" key={order.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950">#{order.orderNumber}</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      {order.tableLabel} · {order.customerName}
                    </p>
                  </div>
                  <StatusBadge meta={paymentStatusMeta[order.paymentStatus]} fallback={order.paymentStatus} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.05em] text-neutral-400">Estado</span>
                    <span>{orderStatusMeta[order.status]?.label ?? order.status}</span>
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.05em] text-neutral-400">Total</span>
                    <span className="font-semibold text-neutral-950">{formatCurrency(order.total)}</span>
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.05em] text-neutral-400">Hora</span>
                    <span>{formatTime(order.createdAt)}</span>
                  </span>
                </div>
                <Button className="mt-4 w-full" onClick={() => onNavigate('/admin/pedidos')} type="button" variant="secondary">
                  Ver órdenes
                </Button>
              </article>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LastCashClosureCard({ closure, onNavigate }) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardHeader className="border-neutral-200 px-5 sm:px-6">
        <CardTitle>Último cierre</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 sm:p-6">
        {closure ? (
          <>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">Cierre</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-950">#{closure.closureNumber}</p>
              <p className="mt-1 text-sm text-neutral-500">{formatDateTime(closure.closedAt)}</p>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Responsable</span>
                <span className="font-semibold text-neutral-950">{closure.closedBy}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Órdenes</span>
                <span className="font-semibold text-neutral-950">{closure.ordersCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Pagos</span>
                <span className="font-semibold text-neutral-950">{closure.paymentsCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
                <span className="text-neutral-500">Total</span>
                <span className="font-semibold text-neutral-950">{formatCurrency(closure.total)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500">Todavía no hay cierres registrados.</p>
        )}

        <Button onClick={() => onNavigate('/admin/cierre-de-caja')} type="button" variant="secondary">
          <History className="size-4" strokeWidth={2} aria-hidden="true" />
          Ver cierre de caja
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const nextDashboard = await getDashboardSummary();
      setDashboard(nextDashboard);
    } catch (error) {
      setDashboard(null);
      setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        title: 'Ventas del día',
        value: formatCurrency(dashboard.paymentsSummary.total),
        helper: `${dashboard.paymentsSummary.count} pagos registrados`,
        icon: Banknote,
      },
      {
        title: 'Órdenes activas',
        value: String(dashboard.activeOrdersSummary.total),
        helper: `${dashboard.activeOrdersSummary.byStatus.preparing} en preparación`,
        icon: ClipboardList,
      },
      {
        title: 'Pagadas sin cerrar',
        value: String(dashboard.activeOrdersSummary.paidPendingClosure),
        helper: 'Listas para cierre de caja',
        icon: Receipt,
      },
      {
        title: 'Ticket promedio',
        value: formatCurrency(dashboard.averageTicket),
        helper: 'Basado en pagos del día',
        icon: CreditCard,
      },
    ];
  }, [dashboard]);

  const hasNoActivity =
    dashboard &&
    dashboard.paymentsSummary.count === 0 &&
    dashboard.activeOrdersSummary.total === 0 &&
    dashboard.recentOrders.length === 0;

  return (
    <AdminPageContainer>
      <PageHeader title="Dashboard" description="Resumen operativo del turno actual" />

      {isLoading ? (
        <Card className="rounded-none border-neutral-200 bg-white">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-neutral-500">
            <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
            Cargando dashboard...
          </CardContent>
        </Card>
      ) : null}

      {loadError ? (
        <Alert variant="destructive" title="No se pudo cargar el dashboard.">
          <div className="grid gap-3">
            <p>{loadError}</p>
            <Button className="w-fit" onClick={loadDashboard} size="sm" type="button">
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      {dashboard && !isLoading && !loadError ? (
        <>
          {hasNoActivity ? (
            <Alert title="Todavía no hay actividad registrada.">
              Cuando se registren órdenes o pagos, el resumen se actualizará con datos reales.
            </Alert>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas del turno">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <OperatingStatusCard activeOrdersSummary={dashboard.activeOrdersSummary} />
            <QuickActionsCard onNavigate={navigate} />
          </section>

          <RecentOrdersCard onNavigate={navigate} orders={dashboard.recentOrders} />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <TodayPaymentsCard paymentsSummary={dashboard.paymentsSummary} />
            <LastCashClosureCard closure={dashboard.lastCashClosure} onNavigate={navigate} />
          </section>
        </>
      ) : null}
    </AdminPageContainer>
  );
}
