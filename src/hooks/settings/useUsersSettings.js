import { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck, UserRoundCog, UsersRound } from 'lucide-react';
import { roleByValue } from '@/components/settings/settings.constants.js';
import { normalizeText } from '@/components/settings/settings.helpers.js';
import { getUsers, updateUserProfile } from '@/services/users.service.js';

export function useUsersSettings({ currentProfile, profileLoading, refreshProfile, role }) {
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

  const canManageUsers = role === 'admin';
  const adminCount = users.filter((user) => user.role === 'admin').length;

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

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
    if (!canManageUsers) {
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
    if (!selectedUser || isSaving || !canManageUsers || !validateForm()) {
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

  return {
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
    onChange: updateFormField,
    onCloseEditModal: handleCloseEditModal,
    onOpenEditModal: handleOpenEditModal,
    onRetry: loadUsers,
    onSaveUser: handleSaveUser,
    profileLoading,
    role,
    searchTerm,
    selectedUser,
    setSearchTerm,
    successMessage,
  };
}
