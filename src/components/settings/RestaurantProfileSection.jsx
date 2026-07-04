import { FormField } from '@/components/common/FormField.jsx';
import { FormSection } from '@/components/common/FormSection.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';

export function RestaurantProfileSection({ errors, form, isReadOnly, isSaving, onChange, onSave }) {
  return (
    <FormSection
      title="Datos del restaurante"
      description="Informacion basica visible para el cliente."
      contentClassName="gap-5 p-5 sm:p-6"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField error={errors.restaurantName} htmlFor="restaurant-name" label="Nombre del restaurante">
          <Input
            className="rounded-none border-neutral-200 bg-white"
            disabled={isReadOnly}
            id="restaurant-name"
            onChange={(event) => onChange('restaurantName', event.target.value)}
            value={form.restaurantName}
          />
        </FormField>
        <FormField htmlFor="short-description" label="Descripcion corta">
          <Input
            className="rounded-none border-neutral-200 bg-white"
            disabled={isReadOnly}
            id="short-description"
            onChange={(event) => onChange('shortDescription', event.target.value)}
            value={form.shortDescription}
          />
        </FormField>
      </div>
      <FormField htmlFor="restaurant-address" label="Direccion">
        <Input
          className="rounded-none border-neutral-200 bg-white"
          disabled={isReadOnly}
          id="restaurant-address"
          onChange={(event) => onChange('address', event.target.value)}
          value={form.address}
        />
      </FormField>
      <div className="flex justify-end border-t border-neutral-200 pt-5">
        <Button disabled={isReadOnly} onClick={onSave} type="button">
          {isSaving ? 'Guardando...' : 'Guardar datos'}
        </Button>
      </div>
    </FormSection>
  );
}
