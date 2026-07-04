import { FormField } from '@/components/common/FormField.jsx';
import { FormSection } from '@/components/common/FormSection.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { SwitchField } from '@/components/common/SwitchField.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';

const activeLimit = 4;

export function SocialLinksSection({
  errors,
  form,
  isEditing,
  isReadOnly,
  isSaving,
  links,
  onCancel,
  onChange,
  onDelete,
  onEdit,
  onNew,
  onSave,
  onToggleActive,
}) {
  const activeLinksCount = links.filter((link) => link.isActive).length;

  return (
    <FormSection
      title="Redes sociales"
      description="El footer publico mostrara como maximo 4 redes activas, ordenadas por orden de aparicion."
      contentClassName="gap-6 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          Redes activas: {activeLinksCount}/{activeLimit}
        </p>
        <Button disabled={isReadOnly} onClick={onNew} size="sm" type="button" variant="secondary">
          Nueva red
        </Button>
      </div>

      <div className="overflow-x-auto border border-neutral-200">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              <TableHead>Proveedor</TableHead>
              <TableHead>Etiqueta</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-neutral-500" colSpan={6}>
                  Todavia no hay redes sociales cargadas.
                </TableCell>
              </TableRow>
            ) : null}

            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-semibold text-neutral-950">{link.provider}</TableCell>
                <TableCell>{link.label}</TableCell>
                <TableCell className="max-w-[260px] truncate text-neutral-500">{link.url}</TableCell>
                <TableCell>{link.displayOrder}</TableCell>
                <TableCell>
                  <StatusBadge label={link.isActive ? 'Activa' : 'Inactiva'} variant={link.isActive ? 'success' : 'muted'} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button disabled={isReadOnly} onClick={() => onEdit(link)} size="sm" type="button" variant="secondary">
                      Editar
                    </Button>
                    <Button disabled={isReadOnly} onClick={() => onToggleActive(link)} size="sm" type="button" variant="secondary">
                      {link.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button disabled={isReadOnly} onClick={() => onDelete(link)} size="sm" type="button" variant="secondary">
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 border-t border-neutral-200 pt-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-neutral-950">
            {isEditing ? 'Editar red social' : 'Nueva red social'}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">Usa cualquier proveedor: instagram, facebook, whatsapp, tiktok, web u otro.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_2fr_120px]">
          <FormField error={errors.provider} htmlFor="social-provider" label="Proveedor">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isReadOnly || isSaving}
              id="social-provider"
              onChange={(event) => onChange('provider', event.target.value)}
              placeholder="instagram"
              value={form.provider}
            />
          </FormField>
          <FormField error={errors.label} htmlFor="social-label" label="Etiqueta">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isReadOnly || isSaving}
              id="social-label"
              onChange={(event) => onChange('label', event.target.value)}
              placeholder="Instagram"
              value={form.label}
            />
          </FormField>
          <FormField error={errors.url} htmlFor="social-url" label="URL">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isReadOnly || isSaving}
              id="social-url"
              onChange={(event) => onChange('url', event.target.value)}
              placeholder="https://..."
              value={form.url}
            />
          </FormField>
          <FormField error={errors.displayOrder} htmlFor="social-order" label="Orden">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isReadOnly || isSaving}
              id="social-order"
              min="0"
              onChange={(event) => onChange('displayOrder', event.target.value)}
              type="number"
              value={form.displayOrder}
            />
          </FormField>
        </div>
        <SwitchField
          checked={form.isActive}
          disabled={isReadOnly || isSaving}
          label="Red activa"
          description="Solo las redes activas se mostraran luego en el footer publico."
          onCheckedChange={(value) => onChange('isActive', value)}
        />
        {errors.isActive ? <p className="text-sm font-semibold text-red-600">{errors.isActive}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isReadOnly || isSaving} onClick={onSave} type="button">
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar red' : 'Crear red'}
          </Button>
        </div>
      </div>
    </FormSection>
  );
}
