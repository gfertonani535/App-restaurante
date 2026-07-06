import { X } from 'lucide-react';
import { FormField } from '@/components/common/FormField.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { roles } from '@/components/settings/settings.constants.js';

export function EditUserModal({
  adminCount,
  currentProfile,
  errors,
  form,
  isSaving,
  onChange,
  onClose,
  onSave,
  selectedUser,
}) {
  if (!selectedUser) {
    return null;
  }

  const isOnlyAdminSelfDemotion =
    selectedUser.id === currentProfile?.id &&
    currentProfile?.role === 'admin' &&
    form.role !== 'admin' &&
    adminCount <= 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" role="presentation">
      <section
        aria-labelledby="edit-user-title"
        aria-modal="true"
        className="w-full max-w-[520px] border border-neutral-200 bg-white shadow-[0_24px_80px_rgba(15,15,15,0.18)]"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950" id="edit-user-title">
              Editar usuario
            </h2>
            <p className="mt-1 text-sm text-neutral-500">Modificá el nombre visible y el rol del usuario.</p>
          </div>
          <Button
            aria-label="Cerrar modal de edición"
            className="rounded-none text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950"
            disabled={isSaving}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="grid gap-5 p-6">
          {isOnlyAdminSelfDemotion ? (
            <Alert variant="destructive" title="Debe existir al menos un administrador en el sistema.">
              No podés quitarte el rol administrador si sos el único admin.
            </Alert>
          ) : null}

          <FormField error={errors.fullName} htmlFor="user-full-name" label="Nombre visible">
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isSaving}
              id="user-full-name"
              onChange={(event) => onChange('fullName', event.target.value)}
              value={form.fullName}
            />
          </FormField>

          <FormField error={errors.role} label="Rol">
            <Select disabled={isSaving} onValueChange={(value) => onChange('role', value)} value={form.role}>
              <SelectTrigger className="h-11 rounded-none border-neutral-200 bg-white">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <footer className="grid gap-3 border-t border-neutral-200 p-6 sm:grid-cols-2">
          <Button disabled={isSaving} onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isSaving || isOnlyAdminSelfDemotion} onClick={onSave} type="button">
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </footer>
      </section>
    </div>
  );
}
