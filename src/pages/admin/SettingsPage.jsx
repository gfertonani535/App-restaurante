import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe2,
  Info,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UserRoundCog,
  UsersRound,
  X,
} from 'lucide-react';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { cn } from '@/lib/utils';
import {
  createDefaultRestaurantSettings,
  getRestaurantSettings,
  updateRestaurantSettings,
} from '@/services/settings.service.js';
import {
  getUsers,
  updateCurrentUserPassword,
  updateUserProfile,
} from '@/services/users.service.js';

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'seguridad', label: 'Seguridad' },
];

const roles = [
  { value: 'admin', label: 'Administrador', permissions: 'Acceso completo al sistema.' },
  { value: 'manager', label: 'Encargado', permissions: 'Productos, categorías, órdenes, caja y dashboard.' },
  { value: 'cashier', label: 'Cajero', permissions: 'Órdenes y caja.' },
  { value: 'waiter', label: 'Mozo', permissions: 'Órdenes.' },
  { value: 'staff', label: 'Personal', permissions: 'Acceso limitado.' },
];

const roleByValue = Object.fromEntries(roles.map((role) => [role.value, role]));

const emptySettingsForm = createDefaultRestaurantSettings();

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardContent className="flex min-h-[112px] items-center gap-5 p-6">
        <span className="grid size-14 place-items-center rounded-full bg-neutral-100 text-neutral-950">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold leading-none text-neutral-950">{value}</p>
          {helper ? <p className="mt-2 text-xs font-semibold text-neutral-400">{helper}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-8 border-b border-neutral-200" role="tablist" aria-label="Secciones de configuración">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            aria-selected={isActive}
            className={cn(
              'min-h-11 border-b-2 px-1 text-sm font-semibold transition-colors',
              isActive
                ? 'border-neutral-950 text-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-neutral-950',
            )}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function RoleBadge({ role }) {
  const meta = roleByValue[role] ?? roleByValue.staff;

  return <Badge variant="secondary">{meta.label}</Badge>;
}

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <p className="text-xs font-medium text-red-700">{children}</p>;
}

function EditUserModal({
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
          <button
            aria-label="Cerrar modal de edición"
            className="grid size-9 place-items-center text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="grid gap-5 p-6">
          {isOnlyAdminSelfDemotion ? (
            <Alert variant="destructive" title="Debe existir al menos un administrador en el sistema.">
              No podés quitarte el rol administrador si sos el único admin.
            </Alert>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="user-full-name">Nombre visible</Label>
            <Input
              className="rounded-none border-neutral-200 bg-white"
              disabled={isSaving}
              id="user-full-name"
              onChange={(event) => onChange('fullName', event.target.value)}
              value={form.fullName}
            />
            <FieldError>{errors.fullName}</FieldError>
          </div>

          <div className="grid gap-2">
            <Label>Rol</Label>
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
            <FieldError>{errors.role}</FieldError>
          </div>
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

function GeneralSettingsSection({
  errors,
  form,
  isAdmin,
  isLoading,
  isSaving,
  loadError,
  onChange,
  onRetry,
  onSave,
  settings,
  successMessage,
}) {
  const isReadOnly = !isAdmin || isSaving || isLoading || !settings?.id;
  const contactSummary = form.whatsapp || form.instagram || form.facebook || 'Sin contacto cargado';
  const publicMenuSummary = form.footerText || form.shortDescription || 'Sin texto público cargado';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-950">General</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Configurá la información principal del restaurante y del menú público.
        </p>
      </div>

      {!isAdmin && !isLoading ? (
        <Alert title="No tenés permisos para modificar la configuración general.">
          Podés consultar estos datos, pero solo un administrador puede guardarlos.
        </Alert>
      ) : null}

      {loadError ? (
        <Alert variant="destructive" title="No se pudo cargar la configuración.">
          <div className="grid gap-3">
            <p>{loadError}</p>
            <Button className="w-fit" onClick={onRetry} size="sm" type="button">
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      {isLoading ? <Alert title="Cargando configuración...">Estamos obteniendo los datos generales.</Alert> : null}

      {!isLoading && !loadError && !settings?.id ? (
        <Alert title="Todavía no hay configuración registrada.">
          Ejecutá la migración inicial para crear la fila de configuración del restaurante.
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert variant="success" title="Listo">
          {successMessage}
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Resumen de configuración general">
        <MetricCard icon={Store} label="Restaurante" value={form.restaurantName || 'RestaurantOS'} helper={form.currency || 'ARS'} />
        <MetricCard icon={Mail} label="Contacto" value={contactSummary} helper={form.address || 'Sin dirección'} />
        <MetricCard icon={Globe2} label="Menú público" value={form.currency || 'ARS'} helper={publicMenuSummary} />
      </section>

      <Card className="rounded-none border-neutral-200 bg-white">
        <CardHeader className="px-5 sm:px-6">
          <div>
            <CardTitle>Datos generales</CardTitle>
            <CardDescription>Información pública y configuración regional del restaurante.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 p-5 sm:p-6">
          <section className="grid gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-neutral-950">Restaurante</h3>
              <p className="mt-1 text-sm text-neutral-500">Nombre y descripción principal.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="restaurant-name">Nombre del restaurante</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="restaurant-name"
                  onChange={(event) => onChange('restaurantName', event.target.value)}
                  value={form.restaurantName}
                />
                <FieldError>{errors.restaurantName}</FieldError>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="short-description">Descripción corta</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="short-description"
                  onChange={(event) => onChange('shortDescription', event.target.value)}
                  value={form.shortDescription}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-neutral-950">Contacto y redes</h3>
              <p className="mt-1 text-sm text-neutral-500">Datos que pueden mostrarse en el menú público.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="whatsapp"
                  onChange={(event) => onChange('whatsapp', event.target.value)}
                  value={form.whatsapp}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="instagram"
                  onChange={(event) => onChange('instagram', event.target.value)}
                  value={form.instagram}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="facebook"
                  onChange={(event) => onChange('facebook', event.target.value)}
                  value={form.facebook}
                />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="address"
                  onChange={(event) => onChange('address', event.target.value)}
                  value={form.address}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="opening-hours">Horario de atención</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="opening-hours"
                  onChange={(event) => onChange('openingHours', event.target.value)}
                  value={form.openingHours}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-neutral-950">Configuración regional</h3>
              <p className="mt-1 text-sm text-neutral-500">Texto del footer y moneda del sistema.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="grid gap-2">
                <Label htmlFor="footer-text">Texto del footer</Label>
                <Textarea
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="footer-text"
                  onChange={(event) => onChange('footerText', event.target.value)}
                  value={form.footerText}
                />
              </div>
              <div className="grid h-fit gap-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isReadOnly}
                  id="currency"
                  onChange={(event) => onChange('currency', event.target.value.toUpperCase())}
                  value={form.currency}
                />
                <FieldError>{errors.currency}</FieldError>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
            <Button disabled={isReadOnly} onClick={onSave} type="button">
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSettingsSection({
  adminCount,
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
  searchTerm,
  selectedUser,
  setSearchTerm,
  successMessage,
}) {
  // Usuarios usa AuthContext como estado global de sesión/rol
  // y users.service.js para centralizar las operaciones de datos con Supabase.
  const { profile: currentProfile, profileLoading, role } = useAuth();
  const isAdmin = role === 'admin';

  return (
    <div className="space-y-6">
      {!isAdmin && !isLoading && !profileLoading && !loadError ? (
        <Alert title="No tenés permisos para administrar usuarios.">
          Podés consultar la información, pero la edición de perfiles y roles está reservada para administradores.
        </Alert>
      ) : null}

      {loadError ? (
        <Alert variant="destructive" title="No se pudieron cargar los usuarios.">
          <div className="grid gap-3">
            <p>{loadError}</p>
            <Button className="w-fit" onClick={onRetry} size="sm" type="button">
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

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
        <CardHeader className="flex-col pt-2 pb-2 items-start gap-4 border-neutral-200 px-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
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
            <label className="relative block max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
              <Input
                aria-label="Buscar usuarios..."
                className="rounded-none border-neutral-200 bg-white pl-10 text-sm"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar usuarios..."
                type="search"
                value={searchTerm}
              />
            </label>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell className="py-10 text-center text-neutral-500" colSpan={6}>
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoading && filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell className="py-10 text-center text-neutral-500" colSpan={6}>
                      Todavía no hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoading
                  ? filteredUsers.map((user) => {
                      const role = roleByValue[user.role] ?? roleByValue.staff;

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-bold text-neutral-950">{user.fullName || 'Sin nombre'}</TableCell>
                          <TableCell>{user.email || 'No disponible'}</TableCell>
                          <TableCell>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell className="max-w-[360px] text-sm text-neutral-600">{role.permissions}</TableCell>
                          <TableCell>
                            <Badge className="gap-2" variant="success">
                              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                              Activo
                            </Badge>
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

function SecuritySettingsSection({
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
      <div>
        <h2 className="text-2xl font-semibold text-neutral-950">Seguridad</h2>
        <p className="mt-1 text-sm text-neutral-500">Revisá tu sesión, permisos y opciones de seguridad.</p>
      </div>

      {loadError ? (
        <Alert variant="destructive" title="No se pudo cargar la información de seguridad.">
          {loadError}
        </Alert>
      ) : null}

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
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isPasswordSaving}
                  id="new-password"
                  onChange={(event) => onPasswordChange('password', event.target.value)}
                  type="password"
                  value={passwordForm.password}
                />
                <FieldError>{passwordErrors.password}</FieldError>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <Input
                  className="rounded-none border-neutral-200 bg-white"
                  disabled={isPasswordSaving}
                  id="confirm-password"
                  onChange={(event) => onPasswordChange('confirmPassword', event.target.value)}
                  type="password"
                  value={passwordForm.confirmPassword}
                />
                <FieldError>{passwordErrors.confirmPassword}</FieldError>
              </div>
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

export function SettingsPage() {
  const navigate = useNavigate();
  const {
    profile: currentProfile,
    profileError,
    profileLoading,
    refreshProfile,
    role,
    signOut,
  } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');

  const [users, setUsers] = useState([]);
  const [hasEmailColumn, setHasEmailColumn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', role: 'staff' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [settings, setSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [settingsErrors, setSettingsErrors] = useState({});
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsLoadError, setSettingsLoadError] = useState('');
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSaveError, setPasswordSaveError] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const usersResult = await getUsers();
      setUsers(usersResult.users);
      setHasEmailColumn(usersResult.hasEmailColumn);
    } catch (error) {
      setUsers([]);
      setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    setSettingsLoadError('');

    try {
      const nextSettings = await getRestaurantSettings();
      setSettings(nextSettings);
      setSettingsForm(nextSettings ?? createDefaultRestaurantSettings());
    } catch (error) {
      setSettings(null);
      setSettingsForm(createDefaultRestaurantSettings());
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo cargar la configuración.');
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers();
      loadSettings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSettings, loadUsers]);

  const isAdmin = role === 'admin';
  const adminCount = users.filter((user) => user.role === 'admin').length;
  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      const roleLabel = roleByValue[user.role]?.label ?? user.role;
      return normalizeText(`${user.fullName} ${user.email} ${roleLabel}`).includes(normalizedSearch);
    });
  }, [searchTerm, users]);

  const metrics = [
    { label: 'Total usuarios', value: users.length, icon: UsersRound },
    { label: 'Administradores', value: adminCount, icon: ShieldCheck },
    { label: 'Equipo operativo', value: users.filter((user) => user.role !== 'admin').length, icon: UserRoundCog },
  ];

  function handleOpenEditModal(user) {
    if (!isAdmin) {
      return;
    }

    setSelectedUser(user);
    setForm({
      fullName: user.fullName,
      role: user.role,
    });
    setErrors({});
    setFormError('');
    setSuccessMessage('');
  }

  function handleCloseEditModal() {
    if (isSaving) {
      return;
    }

    setSelectedUser(null);
    setErrors({});
    setFormError('');
  }

  function updateFormField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setFormError('');
    setSuccessMessage('');
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'El nombre visible es obligatorio.';
    }

    if (!roleByValue[form.role]) {
      nextErrors.role = 'Seleccioná un rol válido.';
    }

    if (
      selectedUser?.id === currentProfile?.id &&
      currentProfile?.role === 'admin' &&
      form.role !== 'admin' &&
      adminCount <= 1
    ) {
      nextErrors.role = 'Debe existir al menos un administrador en el sistema.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSaveUser() {
    if (!selectedUser || isSaving || !isAdmin || !validateForm()) {
      return;
    }

    setIsSaving(true);
    setFormError('');
    setSuccessMessage('');

    try {
      await updateUserProfile(selectedUser.id, {
        fullName: form.fullName.trim(),
        role: form.role,
      });
      setSelectedUser(null);
      setSuccessMessage('Usuario actualizado correctamente.');
      await Promise.all([loadUsers(), refreshProfile()]);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el usuario.');
    } finally {
      setIsSaving(false);
    }
  }

  function updateSettingsField(field, value) {
    setSettingsForm((currentForm) => ({ ...currentForm, [field]: value }));
    setSettingsErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setSettingsSuccess('');
  }

  function validateSettings() {
    const nextErrors = {};

    if (!settingsForm.restaurantName.trim()) {
      nextErrors.restaurantName = 'El nombre del restaurante es obligatorio.';
    }

    if (!settingsForm.currency.trim()) {
      nextErrors.currency = 'La moneda es obligatoria.';
    }

    setSettingsErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSaveSettings() {
    if (!isAdmin || isSettingsSaving || !validateSettings()) {
      return;
    }

    setIsSettingsSaving(true);
    setSettingsSuccess('');
    setSettingsLoadError('');

    try {
      const updatedSettings = await updateRestaurantSettings(settings?.id, {
        restaurantName: settingsForm.restaurantName.trim(),
        shortDescription: settingsForm.shortDescription.trim(),
        whatsapp: settingsForm.whatsapp.trim(),
        instagram: settingsForm.instagram.trim(),
        facebook: settingsForm.facebook.trim(),
        address: settingsForm.address.trim(),
        openingHours: settingsForm.openingHours.trim(),
        footerText: settingsForm.footerText.trim(),
        currency: settingsForm.currency.trim().toUpperCase(),
      });
      setSettings(updatedSettings);
      setSettingsForm(updatedSettings);
      setSettingsSuccess('Configuración guardada correctamente.');
    } catch (error) {
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo guardar la configuración.');
    } finally {
      setIsSettingsSaving(false);
    }
  }

  function updatePasswordField(field, value) {
    setPasswordForm((currentForm) => ({ ...currentForm, [field]: value }));
    setPasswordErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setPasswordSuccess('');
    setPasswordSaveError('');
  }

  function validatePassword() {
    const nextErrors = {};

    if (!passwordForm.password) {
      nextErrors.password = 'La contraseña es obligatoria.';
    } else if (passwordForm.password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Confirmá la nueva contraseña.';
    } else if (passwordForm.password !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSavePassword() {
    if (isPasswordSaving || !validatePassword()) {
      return;
    }

    setIsPasswordSaving(true);
    setPasswordSaveError('');
    setPasswordSuccess('');

    try {
      await updateCurrentUserPassword(passwordForm.password);
      setPasswordForm({ password: '', confirmPassword: '' });
      setPasswordSuccess('Contraseña actualizada correctamente.');
    } catch (error) {
      setPasswordSaveError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setIsPasswordSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <AdminPageContainer>
      <PageHeader title="Configuración" description="Gestioná los datos generales y el equipo del sistema." />

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'general' ? (
        <GeneralSettingsSection
          errors={settingsErrors}
          form={settingsForm}
          isAdmin={isAdmin}
          isLoading={isSettingsLoading}
          isSaving={isSettingsSaving}
          loadError={settingsLoadError}
          onChange={updateSettingsField}
          onRetry={loadSettings}
          onSave={handleSaveSettings}
          settings={settings}
          successMessage={settingsSuccess}
        />
      ) : null}

      {activeTab === 'usuarios' ? (
        <UsersSettingsSection
          adminCount={adminCount}
          errors={errors}
          filteredUsers={filteredUsers}
          form={form}
          formError={formError}
          hasEmailColumn={hasEmailColumn}
          isLoading={isLoading}
          isSaving={isSaving}
          loadError={loadError}
          metrics={metrics}
          onChange={updateFormField}
          onCloseEditModal={handleCloseEditModal}
          onOpenEditModal={handleOpenEditModal}
          onRetry={loadUsers}
          onSaveUser={handleSaveUser}
          searchTerm={searchTerm}
          selectedUser={selectedUser}
          setSearchTerm={setSearchTerm}
          successMessage={successMessage}
        />
      ) : null}

      {activeTab === 'seguridad' ? (
        <SecuritySettingsSection
          currentProfile={currentProfile}
          isLoading={isLoading || profileLoading}
          loadError={profileError || loadError}
          onLogout={handleLogout}
          onPasswordChange={updatePasswordField}
          onPasswordSave={handleSavePassword}
          passwordErrors={passwordErrors}
          passwordForm={passwordForm}
          passwordSaveError={passwordSaveError}
          passwordSuccess={passwordSuccess}
          isPasswordSaving={isPasswordSaving}
        />
      ) : null}
    </AdminPageContainer>
  );
}
