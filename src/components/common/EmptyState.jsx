import { Card, CardContent } from '@/components/ui/card.jsx';
import { cn } from '@/lib/utils';

export function EmptyState({ title, description, className }) {
  return (
    <Card className={cn('rounded-none border-neutral-200 bg-white', className)}>
      <CardContent className="p-6 text-sm text-neutral-500">
        <p>{title}</p>
        {description ? <p className="mt-1 text-xs text-neutral-400">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
