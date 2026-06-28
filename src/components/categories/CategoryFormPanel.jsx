import { useRef } from 'react';
import { X } from 'lucide-react';
import { FieldError } from '@/components/common/FieldError.jsx';
import { FormField } from '@/components/common/FormField.jsx';
import { IconButton } from '@/components/common/IconButton.jsx';
import { SwitchField } from '@/components/common/SwitchField.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { getCategoryImageUrl, validateCategoryImage } from '@/services/categories.service.js';
import { CategoryThumbnail } from '@/components/categories/categoryPresentation.jsx';

function CategoryImageInput({ disabled, error, form, onSelectFile }) {
  const inputRef = useRef(null);
  const imageSrc = form.imagePreviewUrl || getCategoryImageUrl(form.imagePath);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateCategoryImage(file);

    if (validationError) {
      onSelectFile(null, validationError);
      event.target.value = '';
      return;
    }

    onSelectFile(file, '');
    event.target.value = '';
  }

  return (
    <div className="grid gap-2">
      <Label>Foto de la categoría</Label>
      <button
        className="flex min-h-24 w-full items-center gap-4 border border-dashed border-neutral-300 bg-white p-4 text-left transition-colors hover:border-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <CategoryThumbnail imagePath={form.imagePath} name={form.name} previewUrl={form.imagePreviewUrl} size="lg" />
        <span>
          <span className="block text-sm font-bold text-neutral-950">{imageSrc ? 'Cambiar foto' : 'Agregar foto'}</span>
          <span className="mt-1 block text-xs leading-5 text-neutral-500">JPG, PNG o WebP. Máx. 2 MB</span>
        </span>
      </button>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}

export function CategoryFormPanel({
  errors,
  form,
  isEditMode,
  isSaving,
  onCancel,
  onChange,
  onImageChange,
  onSubmit,
}) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white shadow-none lg:shadow-[0_16px_50px_rgba(15,15,15,0.06)]">
      <CardHeader className="flex-row items-center justify-between border-neutral-200 px-5 sm:px-6">
        <CardTitle>{isEditMode ? 'Editar categoría' : 'Añadir categoría'}</CardTitle>
        <IconButton
          className="size-9 rounded-none hover:bg-neutral-50"
          disabled={isSaving}
          label="Cerrar formulario de categoría"
          onClick={onCancel}
        >
          <X className="size-5" aria-hidden="true" />
        </IconButton>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <CategoryImageInput disabled={isSaving} error={errors.image} form={form} onSelectFile={onImageChange} />

        <FormField error={errors.name} htmlFor="category-name" label="Nombre de la categoría">
          <Input
            className="rounded-none border-neutral-200 bg-white"
            disabled={isSaving}
            id="category-name"
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Ej: Pizzas"
            value={form.name}
          />
        </FormField>

        <FormField error={errors.displayOrder} htmlFor="category-order" label="Orden de aparición">
          <Input
            className="rounded-none border-neutral-200 bg-white"
            disabled={isSaving}
            id="category-order"
            min="1"
            onChange={(event) => onChange('displayOrder', event.target.value)}
            step="1"
            type="number"
            value={form.displayOrder}
          />
        </FormField>

        <SwitchField
          checked={form.isActive}
          disabled={isSaving}
          label="Categoría activa"
          onCheckedChange={(value) => onChange('isActive', value)}
        />

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
