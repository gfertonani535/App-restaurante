import { SearchField } from '@/components/common/SearchField.jsx';
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
            <SearchField onChange={onSearchChange} placeholder={searchPlaceholder} value={searchValue} />
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
