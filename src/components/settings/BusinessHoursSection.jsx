import { FormField } from '@/components/common/FormField.jsx';
import { FormSection } from '@/components/common/FormSection.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { SwitchField } from '@/components/common/SwitchField.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { cn } from '@/lib/utils';
import {
  formatBusinessHourGroup,
  getBusinessHourGroupDayLabel,
  groupBusinessHoursBySchedule,
  weekdayOptions,
} from '@/utils/businessHours.js';

const quickSelections = [
  { label: 'Todos los días', weekdays: ['1', '2', '3', '4', '5', '6', '7'] },
  { label: 'Lunes a viernes', weekdays: ['1', '2', '3', '4', '5'] },
  { label: 'Martes a jueves', weekdays: ['2', '3', '4'] },
  { label: 'Viernes a domingo', weekdays: ['5', '6', '7'] },
  { label: 'Limpiar selección', weekdays: [] },
];

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
  const groupedHours = groupBusinessHoursBySchedule(hours);
  const selectedWeekdays = form.selectedWeekdays ?? [];

  return (
    <FormSection
      title="Horarios de atención"
      description="Seleccioná varios días y aplicá una o más franjas de atención."
      contentClassName="gap-6 p-5 sm:p-6"
    >
      <div className="flex justify-end">
        <Button disabled={isReadOnly} onClick={onNew} size="sm" type="button" variant="secondary">
          Agregar horario
        </Button>
      </div>

      <div className="overflow-x-auto border border-neutral-200">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              <TableHead>Días</TableHead>
              <TableHead>Horarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedHours.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-neutral-500" colSpan={4}>
                  Todavía no hay horarios cargados.
                </TableCell>
              </TableRow>
            ) : null}

            {groupedHours.map((group) => (
              <TableRow key={`${group.key}-${group.weekdays.join('-')}`}>
                <TableCell className="font-semibold text-neutral-950">{getBusinessHourGroupDayLabel(group)}</TableCell>
                <TableCell>{formatBusinessHourGroup(group)}</TableCell>
                <TableCell>
                  <StatusBadge label={group.isClosed ? 'Cerrado' : 'Abierto'} variant={group.isClosed ? 'muted' : 'success'} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button disabled={isReadOnly} onClick={() => onEdit(group)} size="sm" type="button" variant="secondary">
                      Editar
                    </Button>
                    <Button disabled={isReadOnly} onClick={() => onDelete(group)} size="sm" type="button" variant="secondary">
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-5 border-t border-neutral-200 pt-5">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-neutral-950">
            {isEditing ? 'Editar horario' : 'Agregar horario'}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Al guardar, se reemplazan los horarios anteriores de los días seleccionados.
          </p>
        </div>

        <FormField error={errors.selectedWeekdays} label="Días">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              {weekdayOptions.map((weekday) => {
                const value = String(weekday.value);
                const isSelected = selectedWeekdays.includes(value);

                return (
                  <Button
                    className={cn('min-w-14 rounded-none', isSelected && 'bg-neutral-950 text-white hover:bg-neutral-900')}
                    disabled={isReadOnly || isSaving}
                    key={weekday.value}
                    onClick={() => onChange('toggleWeekday', value)}
                    size="sm"
                    type="button"
                    variant={isSelected ? 'default' : 'secondary'}
                  >
                    {weekday.shortLabel}
                  </Button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSelections.map((selection) => (
                <Button
                  disabled={isReadOnly || isSaving}
                  key={selection.label}
                  onClick={() => onChange('selectedWeekdays', selection.weekdays)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {selection.label}
                </Button>
              ))}
            </div>
          </div>
        </FormField>

        <SwitchField
          checked={form.isClosed}
          disabled={isReadOnly || isSaving}
          label="Marcar como cerrado"
          description="Si está activo, se guardan los días seleccionados como cerrados y no se cargan franjas."
          onCheckedChange={(value) => onChange('isClosed', value)}
        />

        {!form.isClosed ? (
          <div className="grid gap-4">
            {(form.slots ?? []).map((slot, index) => (
              <div className="grid gap-4 border border-neutral-200 p-4 md:grid-cols-[1fr_1fr_auto]" key={index}>
                <FormField error={errors[`slot-${index}-opensAt`]} htmlFor={`opens-at-${index}`} label={`Apertura ${index + 1}`}>
                  <Input
                    className="rounded-none border-neutral-200 bg-white"
                    disabled={isReadOnly || isSaving}
                    id={`opens-at-${index}`}
                    onChange={(event) => onChange('slot', { index, field: 'opensAt', value: event.target.value })}
                    type="time"
                    value={slot.opensAt}
                  />
                </FormField>
                <FormField error={errors[`slot-${index}-closesAt`]} htmlFor={`closes-at-${index}`} label={`Cierre ${index + 1}`}>
                  <Input
                    className="rounded-none border-neutral-200 bg-white"
                    disabled={isReadOnly || isSaving}
                    id={`closes-at-${index}`}
                    onChange={(event) => onChange('slot', { index, field: 'closesAt', value: event.target.value })}
                    type="time"
                    value={slot.closesAt}
                  />
                </FormField>
                <div className="flex items-end">
                  <Button
                    disabled={isReadOnly || isSaving || (form.slots ?? []).length <= 1}
                    onClick={() => onChange('removeSlot', index)}
                    type="button"
                    variant="secondary"
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}

            {errors.slots ? <p className="text-sm font-semibold text-red-600">{errors.slots}</p> : null}

            <div>
              <Button disabled={isReadOnly || isSaving} onClick={() => onChange('addSlot')} type="button" variant="secondary">
                Agregar otra franja
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isReadOnly || isSaving} onClick={onSave} type="button">
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar horario' : 'Agregar horario'}
          </Button>
        </div>
      </div>
    </FormSection>
  );
}
