import { Card, CardContent } from '@/components/ui/card.jsx';
import { cn } from '@/lib/utils';

export function LoadingState({ message = 'Cargando...', className }) {
  return (
    <Card className={cn('rounded-none border-neutral-200 bg-white', className)}>
      <CardContent className="p-6 text-sm text-neutral-500">{message}</CardContent>
    </Card>
  );
}
