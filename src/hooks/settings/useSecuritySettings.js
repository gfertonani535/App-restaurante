import { useState } from 'react';
import { updateCurrentUserPassword } from '@/services/users.service.js';

export function useSecuritySettings() {
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSaveError, setPasswordSaveError] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

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

  return {
    isPasswordSaving,
    onPasswordChange: updatePasswordField,
    onPasswordSave: handleSavePassword,
    passwordErrors,
    passwordForm,
    passwordSaveError,
    passwordSuccess,
  };
}
