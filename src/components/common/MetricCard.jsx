import { Card, CardContent } from '@/components/ui/card.jsx';
import { cn } from '@/lib/utils';

export function MetricCard({
  className,
  contentClassName,
  helper,
  icon: Icon,
  label,
  layout = 'default',
  title,
  value,
}) {
  const metricLabel = label ?? title;
  const isSplit = layout === 'split';

  return (
    <Card className={cn('rounded-none border-neutral-200 bg-white', className)}>
      <CardContent
        className={cn(
          'flex min-h-[112px] items-center gap-5 p-6',
          isSplit ? 'justify-between' : undefined,
          contentClassName,
        )}
      >
        {Icon && !isSplit ? (
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-950">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          {metricLabel ? (
            <p className={cn(isSplit ? 'mb-4 text-xs font-bold uppercase tracking-[0.08em] text-neutral-400' : 'text-sm font-medium text-neutral-500')}>
              {metricLabel}
            </p>
          ) : null}
          <p className={cn('font-semibold leading-none text-neutral-950', isSplit ? 'text-4xl' : 'mt-1 text-3xl')}>{value}</p>
          {helper ? <p className={cn(isSplit ? 'mt-3 text-sm font-medium text-neutral-500' : 'mt-2 text-xs font-semibold text-neutral-400')}>{helper}</p> : null}
        </div>
        {Icon && isSplit ? (
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-neutral-100 text-neutral-950">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
