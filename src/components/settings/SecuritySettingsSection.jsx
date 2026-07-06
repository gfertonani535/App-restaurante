import { KeyRound, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';
import { RoleBadge } from '@/components/settings/RoleBadge.jsx';
import { SettingsSectionIntro } from '@/components/settings/SettingsSectionIntro.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { FormField } from '@/components/common/FormField.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { roleByValue } from '@/components/settings/settings.constants.js';

export function SecuritySettingsSection({
  currentProfile,
  isLoading,
  loadError,
  onLogout,
  onPasswordChange,
  onPasswordSave,
  passwordErrors,
  passwordForm,
  passwordSuccess,
  passwordSaveError,
  isPasswordSaving,
}) {
  const currentRole = roleByValue[currentProfile?.role] ?? roleByValue.staff;

  return (
    <div className="space-y-6">
      <SettingsSectionIntro title="Seguridad" description="Revisá tu sesión, permisos y opciones de seguridad." />

      {loadError ? <ErrorState title="No se pudo cargar la información de seguridad." message={loadError} /> : null}

      {isLoading ? <Alert title="Cargando usuarios...">Estamos obteniendo tu perfil actual.</Alert> : null}

      {passwordSuccess ? (
        <Alert variant="success" title="Listo">
          {passwordSuccess}
        </Alert>
      ) : null}

      {passwordSaveError ? (
        <Alert variant="destructive" title="No se pudo cambiar la contraseña">
          {passwordSaveError}
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-none border-neutral-200 bg-white">
          <CardHeader className="px-5 sm:px-6">
            <div>
              <CardTitle>Cuenta actual</CardTitle>
              <CardDescription>Datos del perfil autenticado.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 text-sm sm:p-6">
            <div className="grid gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">Nombre</span>
              <span className="font-semibold text-neutral-950">{currentProfile?.fullName || 'Sin nombre'}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">Email</span>
              <span className="font-semibold text-neutral-950">{currentProfile?.email || 'No disponible'}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">Rol</span>
              <RoleBadge role={currentProfile?.role} />
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">Permisos</span>
              <span className="text-neutral-600">{currentRole.permissions}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-neutral-200 bg-white">
          <CardHeader className="px-5 sm:px-6">
            <div>
              <CardTitle>Permisos del rol</CardTitle>
              <CardDescription>Alcance actual dentro del backoffice.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex items-start gap-4 p-5 sm:p-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-950">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-semibold text-neutral-950">{currentRole.label}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{currentRole.permissions}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-none border-neutral-200 bg-white">
          <CardHeader className="px-5 sm:px-6">
            <div>
              <CardTitle>Cambiar contraseña</CardTitle>
              <CardDescription>Actualizá la contraseña de tu propia cuenta.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <FormField error={passwordErrors.password} htmlFor="new-password" label="Nueva contraseña">
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isPasswordSaving}
                  id="new-password"
                  onChange={(event) => onPasswordChange('password', event.target.value)}
                  type="password"
                  value={passwordForm.password}
                />
              </FormField>
              <FormField error={passwordErrors.confirmPassword} htmlFor="confirm-password" label="Confirmar nueva contraseña">
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isPasswordSaving}
                  id="confirm-password"
                  onChange={(event) => onPasswordChange('confirmPassword', event.target.value)}
                  type="password"
                  value={passwordForm.confirmPassword}
                />
              </FormField>
            </div>
            <div className="flex justify-end border-t border-neutral-200 pt-5">
              <Button disabled={isPasswordSaving} onClick={onPasswordSave} type="button">
                <KeyRound className="size-4" aria-hidden="true" />
                {isPasswordSaving ? 'Actualizando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-neutral-200 bg-white">
          <CardHeader className="px-5 sm:px-6">
            <div>
              <CardTitle>Sesión</CardTitle>
              <CardDescription>Acciones disponibles para esta sesión.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:p-6">
            <div className="flex items-start gap-3 text-sm text-neutral-600">
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-neutral-500" aria-hidden="true" />
              <p>La sesión está protegida por Supabase Auth. Cerrá sesión al terminar de usar una terminal compartida.</p>
            </div>
            <Button onClick={onLogout} type="button" variant="secondary">
              <LogOut className="size-4" aria-hidden="true" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
