import { Button } from '@/components/ui/button.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { cn } from '@/lib/utils';

export function ErrorState({ title, message, onRetry, retryLabel = 'Reintentar', className }) {
  return (
    <Alert className={cn(className)} variant="destructive" title={title}>
      <div className="grid gap-3">
        {message ? <p>{message}</p> : null}
        {onRetry ? (
          <Button className="w-fit" onClick={onRetry} size="sm" type="button">
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </Alert>
  );
}
