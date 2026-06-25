import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { cn } from '@/lib/utils';

export function FormSection({ children, className, contentClassName, description, title }) {
  return (
    <Card className={cn('rounded-none border-neutral-200 bg-white', className)}>
      {title || description ? (
        <CardHeader className="min-h-11 border-neutral-200 px-4 py-3">
          <div>
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn('grid gap-4 p-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
