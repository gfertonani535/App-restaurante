import { FormField } from '@/components/common/FormField.jsx';
import { FormSection } from '@/components/common/FormSection.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { SwitchField } from '@/components/common/SwitchField.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';

const weekdayOptions = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miercoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sabado' },
  { value: 7, label: 'Domingo' },
];

const weekdayLabels = Object.fromEntries(weekdayOptions.map((weekday) => [weekday.value, weekday.label]));

export function BusinessHoursSection({
  errors,
  form,
  hours,
  isEditing,
  isReadOnly,
  isSaving,
  onCancel,
  onChange,
  onDelete,
  onEdit,
  onNew,
  onSave,
}) {
  return (
    <FormSection
      title="Horarios de atencion"
      description="Carga una o mas franjas por dia para soportar horarios cortados."
      contentClassName="gap-6 p-5 sm:p-6"
    >
      <div className="flex justify-end">
        <Button disabled={isReadOnly} onClick={onNew} size="sm" type="button" variant="secondary">
          Nueva franja
        </Button>
      </div>

      <div className="overflow-x-auto border border-neutral-200">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              <TableHead>Dia</TableHead>
              <TableHead>Franja</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hours.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-neutral-500" colSpan={6}>
                  Todavia no hay horarios cargados.
                </TableCell>
              </TableRow>
            ) : null}

            {hours.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell className="font-semibold text-neutral-950">{weekdayLabels[slot.weekday]}</TableCell>
                <TableCell>{slot.slotNumber}</TableCell>
                <TableCell>{slot.isClosed ? '-' : slot.opensAt}</TableCell>
                <TableCell>{slot.isClosed ? '-' : slot.closesAt}</TableCell>
                <TableCell>
                  <StatusBadge label={slot.isClosed ? 'Cerrado' : 'Abierto'} variant={slot.isClosed ? 'muted' : 'success'} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button disabled={isReadOnly} onClick={() => onEdit(slot)} size="sm" type="button" variant="secondary">
                      Editar
                    </Button>
                    <Button disabled={isReadOnly} onClick={() => onDelete(slot)} size="sm" type="button" variant="secondary">
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
            {isEditing ? 'Editar franja horaria' : 'Nueva franja horaria'}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">Para horario cortado, crea mas de una franja para el mismo dia.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_120px_1fr_1fr]">
          <FormField error={errors.weekday} label="Dia">
            <Select
              disabled={isReadOnly || isSaving}
              onValueChange={(value) => onChange('weekday', value)}
              value={String(form.weekday)}
            >
              <SelectTrigger className="h-11 rounded-none border-neutral-200 bg-white">
                <SelectValue placeholder="Seleccionar dia" />
              </SelectTrigger>
              <SelectContent>
                {weekdayOptions.map((weekday) => (
                  <SelectItem key={weekday.value} value={String(weekday.value)}>
                    {weekday.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField error={errors.slotNumber} htmlFor="slot-number" label="Franja">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isReadOnly || isSaving}
              id="slot-number"
              min="1"
              onChange={(event) => onChange('slotNumber', event.target.value)}
              type="number"
              value={form.slotNumber}
            />
          </FormField>
          <FormField error={errors.opensAt} htmlFor="opens-at" label="Apertura">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isReadOnly || isSaving || form.isClosed}
              id="opens-at"
              onChange={(event) => onChange('opensAt', event.target.value)}
              type="time"
              value={form.opensAt}
            />
          </FormField>
          <FormField error={errors.closesAt} htmlFor="closes-at" label="Cierre">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isReadOnly || isSaving || form.isClosed}
              id="closes-at"
              onChange={(event) => onChange('closesAt', event.target.value)}
              type="time"
              value={form.closesAt}
            />
          </FormField>
        </div>
        <SwitchField
          checked={form.isClosed}
          disabled={isReadOnly || isSaving}
          label="Dia cerrado"
          description="Si esta activo, esta franja se guarda como dia cerrado sin horario."
          onCheckedChange={(value) => onChange('isClosed', value)}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isReadOnly || isSaving} onClick={onSave} type="button">
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar franja' : 'Crear franja'}
          </Button>
        </div>
      </div>
    </FormSection>
  );
}
