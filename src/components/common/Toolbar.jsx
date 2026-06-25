import { cn } from '@/lib/utils';

export function Toolbar({ actions, children, className }) {
  return (
    <section className={cn('flex flex-col gap-3 md:flex-row md:items-center md:justify-between', className)}>
      {children ? <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">{children}</div> : null}
      {actions ? <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">{actions}</div> : null}
    </section>
  );
}
