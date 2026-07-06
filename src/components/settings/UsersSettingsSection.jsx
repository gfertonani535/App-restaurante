import { Info, PlusCircle, RefreshCw } from 'lucide-react';
import { EditUserModal } from '@/components/settings/EditUserModal.jsx';
import { RoleBadge } from '@/components/settings/RoleBadge.jsx';
import { SettingsSectionIntro } from '@/components/settings/SettingsSectionIntro.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { MetricCard } from '@/components/common/MetricCard.jsx';
import { SearchField } from '@/components/common/SearchField.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { TableStateRow } from '@/components/common/TableStateRow.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { cn } from '@/lib/utils';
import { roleByValue } from '@/components/settings/settings.constants.js';

export function UsersSettingsSection({
  adminCount,
  currentProfile,
  errors,
  filteredUsers,
  form,
  formError,
  hasEmailColumn,
  isLoading,
  isSaving,
  loadError,
  metrics,
  onChange,
  onCloseEditModal,
  onOpenEditModal,
  onRetry,
  onSaveUser,
  profileLoading,
  role,
  searchTerm,
  selectedUser,
  setSearchTerm,
  successMessage,
}) {
  // Usuarios consume AuthContext desde SettingsPage para decidir permisos sin prop drilling global.
  const isAdmin = role === 'admin';

  return (
    <div className="space-y-6">
      <SettingsSectionIntro title="Usuarios" description="Administrá los perfiles y roles del equipo." />

      {!isAdmin && !isLoading && !profileLoading && !loadError ? (
        <Alert title="No tenés permisos para administrar usuarios.">
          Podés consultar la información, pero la edición de perfiles y roles está reservada para administradores.
        </Alert>
      ) : null}

      {loadError ? <ErrorState title="No se pudieron cargar los usuarios." message={loadError} onRetry={onRetry} /> : null}

      {successMessage ? (
        <Alert variant="success" title="Listo">
          {successMessage}
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="destructive" title="No se pudo guardar">
          {formError}
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Resumen de usuarios">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Card className="overflow-hidden rounded-none border-neutral-200 bg-white">
        <CardHeader className="flex-col items-start gap-4 border-neutral-200 px-5 pt-2 pb-2 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <CardTitle>Usuarios</CardTitle>
            <p className="mt-1 text-sm text-neutral-500">Administrá los perfiles y roles del equipo.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button disabled={isLoading} onClick={onRetry} type="button" variant="secondary">
              <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} aria-hidden="true" />
              Actualizar
            </Button>
            <Button disabled type="button" variant="secondary">
              <PlusCircle className="size-4" aria-hidden="true" />
              Nuevo usuario
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-b border-neutral-200 p-3 sm:p-2">
            <SearchField
              className="max-w-sm"
              inputClassName="rounded-none border-neutral-200 bg-white pl-10 text-sm"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar usuarios..."
              value={searchTerm}
            />
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableStateRow colSpan={6}>Cargando usuarios...</TableStateRow> : null}

                {!isLoading && filteredUsers.length === 0 ? (
                  <TableStateRow colSpan={6}>Todavía no hay usuarios registrados.</TableStateRow>
                ) : null}

                {!isLoading
                  ? filteredUsers.map((user) => {
                      const roleMeta = roleByValue[user.role] ?? roleByValue.staff;

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-bold text-neutral-950">{user.fullName || 'Sin nombre'}</TableCell>
                          <TableCell>{user.email || 'No disponible'}</TableCell>
                          <TableCell>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell className="max-w-[360px] text-sm text-neutral-600">{roleMeta.permissions}</TableCell>
                          <TableCell>
                            <StatusBadge dot label="Activo" variant="success" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              disabled={!isAdmin}
                              onClick={() => onOpenEditModal(user)}
                              size="sm"
                              type="button"
                              variant="secondary"
                            >
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
              </TableBody>
            </Table>
          </div>

          <footer className="border-t border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-500 sm:px-6">
            Mostrando {filteredUsers.length === 0 ? 0 : 1} a {filteredUsers.length} de {filteredUsers.length} usuarios
          </footer>
        </CardContent>
      </Card>

      <Card className="max-w-md rounded-none border-neutral-200 bg-white">
        <CardContent className="flex items-start gap-3 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-neutral-500" aria-hidden="true" />
          <p className="text-sm leading-6 text-neutral-600">
            La creación de usuarios se realiza desde Supabase Auth por seguridad. Desde esta pantalla solo se administran
            perfiles y roles existentes.
          </p>
        </CardContent>
      </Card>

      {!hasEmailColumn && !isLoading ? (
        <p className="text-xs text-neutral-400">
          Nota técnica: la tabla profiles no expone una columna email; por eso se muestra No disponible.
        </p>
      ) : null}

      <EditUserModal
        adminCount={adminCount}
        currentProfile={currentProfile}
        errors={errors}
        form={form}
        isSaving={isSaving}
        onChange={onChange}
        onClose={onCloseEditModal}
        onSave={onSaveUser}
        selectedUser={selectedUser}
      />
    </div>
  );
}
