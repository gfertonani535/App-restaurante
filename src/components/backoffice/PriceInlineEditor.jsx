import { Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';

export function PriceInlineEditor({
  productId,
  value,
  isEditing,
  draftValue,
  error,
  disabled = false,
  onStartEdit,
  onDraftChange,
  onCancel,
  onSave,
}) {
  if (!isEditing) {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg font-semibold leading-none tracking-normal text-neutral-950">{value}</span>
        <Button
          aria-label={`Editar precio ${value}`}
          className="size-9 p-0"
          disabled={disabled}
          onClick={onStartEdit}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pencil className="size-4" strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="grid max-w-0 gap-2">
      <div className="flex items-center gap-2">
        <Input
          aria-label="Nuevo precio"
          className="h-10 min-h-10 w-24 px-3 text-lg font-semibold"
          disabled={disabled}
          min="0"
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSave(productId);
            }

            if (event.key === 'Escape') {
              onCancel();
            }
          }}
          step="500"
          type="number"
          value={draftValue}
        />
        <Button
          aria-label="Guardar precio"
          className="size-9 p-0"
          disabled={disabled}
          onClick={() => onSave(productId)}
          size="icon"
          type="button"
        >
          <Check className="size-4" strokeWidth={2} aria-hidden="true" />
        </Button>
        <Button
          aria-label="Cancelar edicion de precio"
          className="size-9 p-0"
          disabled={disabled}
          onClick={onCancel}
          size="icon"
          type="button"
          variant="secondary"
        >
          <X className="size-4" strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
      {error ? <p className="text-xs font-medium leading-4 text-red-700">{error}</p> : null}
    </div>
  );
}
