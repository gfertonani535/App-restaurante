import { Banknote, CreditCard, Landmark, SendToBack, WalletCards } from 'lucide-react';
import { formatCurrency, getPercentageOfTotal } from '@/lib/cashClosing.js';

const summaryCards = [
  {
    key: 'totalRevenue',
    label: 'Total recaudado',
    icon: WalletCards,
    helper: '+12% vs ayer',
    helperClassName: 'text-emerald-600',
  },
  {
    key: 'cashTotal',
    label: 'Efectivo',
    icon: Banknote,
  },
  {
    key: 'transferTotal',
    label: 'Transferencias',
    icon: SendToBack,
  },
  {
    key: 'cardTotal',
    label: 'Tarjetas',
    icon: CreditCard,
  },
  {
    key: 'mercadoPagoTotal',
    label: 'Mercado Pago',
    icon: Landmark,
  },
];

export function CashSummaryCards({ summary }) {
  const visibleCards = summaryCards.filter((card) => card.key !== 'mercadoPagoTotal' || summary.mercadoPagoTotal > 0);

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {visibleCards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];
        const helper = card.helper ?? getPercentageOfTotal(value, summary.totalRevenue);

        return (
          <article className="border border-neutral-300 bg-white p-5 transition-colors hover:border-neutral-950 sm:p-6 lg:p-8" key={card.key}>
            <div className="mb-5 flex items-start justify-between gap-4 lg:mb-7">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">{card.label}</h3>
              <Icon className="size-6 text-neutral-950" aria-hidden="true" />
            </div>
            <p className="text-2xl font-semibold leading-[1.05] text-neutral-950 xl:text-4xl">{formatCurrency(value)}</p>
            <p className={`mt-5 text-xs font-bold uppercase tracking-[0.12em] ${card.helperClassName ?? 'text-neutral-500'}`}>{helper}</p>
          </article>
        );
      })}
    </section>
  );
}
