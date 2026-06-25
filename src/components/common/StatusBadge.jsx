import { Badge } from '@/components/ui/badge.jsx';
import { cn } from '@/lib/utils';

export function StatusBadge({ className, dot = false, fallback, label, meta, variant = 'secondary' }) {
  const badgeLabel = meta?.label ?? label ?? fallback;
  const badgeVariant = meta?.variant ?? variant;

  return (
    <Badge className={cn(dot ? 'gap-2 text-sm normal-case tracking-normal' : undefined, className)} variant={badgeVariant}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {badgeLabel}
    </Badge>
  );
}
