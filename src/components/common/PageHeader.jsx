import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  primaryAction,
  secondaryActions,
  className,
}) {
  const hasSearch = Boolean(searchPlaceholder);
  const hasActions = Boolean(primaryAction) || Boolean(secondaryActions);

  return (
    <section className={cn('flex flex-col gap-5 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight tracking-normal text-neutral-950 sm:text-[32px]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">{description}</p> : null}
      </div>

      {(hasSearch || hasActions) ? (
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[460px]">
          {hasSearch ? (
            <label className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
              <Input
                aria-label={searchPlaceholder}
                className="h-11 min-h-11 rounded-none border-neutral-200 bg-white pl-10 text-sm"
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                type="search"
                value={searchValue}
              />
            </label>
          ) : null}

          {hasActions ? (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {secondaryActions}
              {primaryAction}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
