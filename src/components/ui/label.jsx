import { cn } from '@/lib/utils';

export function Label({ className, ...props }) {
  return <label className={cn('text-xs font-bold uppercase tracking-[0.04em] text-neutral-950', className)} {...props} />;
}
