import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DialogPreview({ className, title, children, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) {
  return (
    <div className={cn('rounded-md border bg-muted p-4', className)} aria-label={`Vista previa de modal: ${title}`}>
      <div className="mx-auto max-w-[360px] rounded-md border bg-card p-4" role="dialog" aria-modal="false">
        <h3 className="m-0 text-lg font-bold leading-tight">{title}</h3>
        <div className="mt-2 text-sm text-copy">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm">
            {cancelLabel}
          </Button>
          <Button size="sm">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
