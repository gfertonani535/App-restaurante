import { useCallback, useEffect, useState } from 'react';
import {
  emptySocialLinkForm,
  socialLinksActiveLimit,
  socialProviderLabels,
} from '@/components/settings/settings.constants.js';
import {
  createEmptyBusinessHourForm,
  getNextSocialOrder,
} from '@/components/settings/settings.helpers.js';
import {
  createBusinessHourSlot,
  createDefaultRestaurantSettings,
  createSocialLink,
  deleteBusinessHourSlot,
  deleteSocialLink,
  getBusinessHours,
  getRestaurantSettings,
  getSocialLinks,
  updateRestaurantSettings,
  updateSocialLink,
} from '@/services/settings.service.js';

export function useRestaurantSettings({ canManageRestaurantSettings }) {
  const [settings, setSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState(() => createDefaultRestaurantSettings());
  const [settingsErrors, setSettingsErrors] = useState({});
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsLoadError, setSettingsLoadError] = useState('');
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [selectedSocialLinkId, setSelectedSocialLinkId] = useState(null);
  const [socialLinkForm, setSocialLinkForm] = useState(emptySocialLinkForm);
  const [socialLinkErrors, setSocialLinkErrors] = useState({});
  const [businessHours, setBusinessHours] = useState([]);
  const [selectedBusinessHourId, setSelectedBusinessHourId] = useState(null);
  const [businessHourForm, setBusinessHourForm] = useState(createEmptyBusinessHourForm);
  const [businessHourErrors, setBusinessHourErrors] = useState({});

  const loadSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    setSettingsLoadError('');

    try {
      const [nextSettings, nextSocialLinks, nextBusinessHours] = await Promise.all([
        getRestaurantSettings(),
        getSocialLinks(),
        getBusinessHours(),
      ]);
      setSettings(nextSettings);
      setSettingsForm(nextSettings ?? createDefaultRestaurantSettings());
      setSocialLinks(nextSocialLinks);
      setSocialLinkForm({
        ...emptySocialLinkForm,
        displayOrder: getNextSocialOrder(nextSocialLinks),
      });
      setSelectedSocialLinkId(null);
      setSocialLinkErrors({});
      setBusinessHours(nextBusinessHours);
      setBusinessHourForm(createEmptyBusinessHourForm());
      setSelectedBusinessHourId(null);
      setBusinessHourErrors({});
    } catch (error) {
      setSettings(null);
      setSettingsForm(createDefaultRestaurantSettings());
      setSocialLinks([]);
      setSelectedSocialLinkId(null);
      setSocialLinkForm(emptySocialLinkForm);
      setSocialLinkErrors({});
      setBusinessHours([]);
      setSelectedBusinessHourId(null);
      setBusinessHourForm(createEmptyBusinessHourForm());
      setBusinessHourErrors({});
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo cargar la configuración.');
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadSettings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSettings]);

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

    setSettingsErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSaveSettings() {
    if (!canManageRestaurantSettings || isSettingsSaving || !validateSettings()) {
      return;
    }

    setIsSettingsSaving(true);
    setSettingsSuccess('');
    setSettingsLoadError('');

    try {
      const updatedSettings = await updateRestaurantSettings(settings?.id, {
        restaurantName: settingsForm.restaurantName.trim(),
        shortDescription: settingsForm.shortDescription.trim(),
        address: settingsForm.address.trim(),
      });
      setSettings(updatedSettings);
      setSettingsForm(updatedSettings);
      setSettingsSuccess('Datos del restaurante guardados correctamente.');
    } catch (error) {
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo guardar la configuración.');
    } finally {
      setIsSettingsSaving(false);
    }
  }

  function resetSocialLinkForm(nextLinks = socialLinks) {
    setSelectedSocialLinkId(null);
    setSocialLinkForm({
      ...emptySocialLinkForm,
      displayOrder: getNextSocialOrder(nextLinks),
    });
    setSocialLinkErrors({});
  }

  function updateSocialLinkField(field, value, optionLabel) {
    setSocialLinkForm((currentForm) => {
      if (field !== 'provider') {
        return { ...currentForm, [field]: value };
      }

      const previousLabel = socialProviderLabels[currentForm.provider];
      const shouldAutofillLabel = !currentForm.label.trim() || currentForm.label === previousLabel;

      return {
        ...currentForm,
        provider: value,
        label: shouldAutofillLabel ? optionLabel : currentForm.label,
      };
    });
    setSocialLinkErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setSettingsSuccess('');
  }

  function validateSocialLink() {
    const nextErrors = {};
    const displayOrder = Number(socialLinkForm.displayOrder);

    if (!socialProviderLabels[socialLinkForm.provider]) {
      nextErrors.provider = 'Seleccioná una red social.';
    }

    if (!socialLinkForm.label.trim()) {
      nextErrors.label = 'La etiqueta es obligatoria.';
    }

    if (!socialLinkForm.url.trim()) {
      nextErrors.url = 'La URL es obligatoria.';
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      nextErrors.displayOrder = 'El orden debe ser un entero mayor o igual a 0.';
    }

    const activeLinksCount = socialLinks.filter((link) => link.isActive && link.id !== selectedSocialLinkId).length;
    if (socialLinkForm.isActive && activeLinksCount >= socialLinksActiveLimit) {
      nextErrors.isActive = 'El footer puede tener como máximo 4 redes activas.';
    }

    setSocialLinkErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNewSocialLink() {
    if (isSettingsSaving) {
      return;
    }

    resetSocialLinkForm();
  }

  function handleEditSocialLink(link) {
    if (isSettingsSaving) {
      return;
    }

    setSelectedSocialLinkId(link.id);
    setSocialLinkForm({
      provider: link.provider,
      label: link.label,
      url: link.url,
      displayOrder: String(link.displayOrder),
      isActive: link.isActive,
    });
    setSocialLinkErrors({});
    setSettingsSuccess('');
  }

  async function handleSaveSocialLink() {
    if (!canManageRestaurantSettings || isSettingsSaving || !validateSocialLink()) {
      return;
    }

    setIsSettingsSaving(true);
    setSettingsSuccess('');
    setSettingsLoadError('');

    try {
      const payload = {
        provider: socialLinkForm.provider.trim().toLowerCase(),
        label: socialLinkForm.label.trim(),
        url: socialLinkForm.url.trim(),
        displayOrder: Number(socialLinkForm.displayOrder),
        isActive: socialLinkForm.isActive,
      };

      if (selectedSocialLinkId) {
        await updateSocialLink(selectedSocialLinkId, payload);
      } else {
        await createSocialLink(payload);
      }

      const nextLinks = await getSocialLinks();
      setSocialLinks(nextLinks);
      resetSocialLinkForm(nextLinks);
      setSettingsSuccess(selectedSocialLinkId ? 'Red social actualizada correctamente.' : 'Red social creada correctamente.');
    } catch (error) {
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo guardar la red social.');
    } finally {
      setIsSettingsSaving(false);
    }
  }

  async function handleToggleSocialLink(link) {
    if (!canManageRestaurantSettings || isSettingsSaving) {
      return;
    }

    if (!link.isActive) {
      const activeLinksCount = socialLinks.filter((item) => item.isActive && item.id !== link.id).length;
      if (activeLinksCount >= socialLinksActiveLimit) {
        setSocialLinkErrors({ isActive: 'El footer puede tener como máximo 4 redes activas.' });
        setSettingsSuccess('');
        return;
      }
    }

    setIsSettingsSaving(true);
    setSettingsSuccess('');
    setSocialLinkErrors({});

    try {
      await updateSocialLink(link.id, { isActive: !link.isActive });
      const nextLinks = await getSocialLinks();
      setSocialLinks(nextLinks);
      setSettingsSuccess(link.isActive ? 'Red social desactivada correctamente.' : 'Red social activada correctamente.');
    } catch (error) {
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo actualizar la red social.');
    } finally {
      setIsSettingsSaving(false);
    }
  }

  async function handleDeleteSocialLink(link) {
    if (!canManageRestaurantSettings || isSettingsSaving) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar la red social "${link.label}"?`);
    if (!confirmed) {
      return;
    }

    setIsSettingsSaving(true);
    setSettingsSuccess('');
    setSocialLinkErrors({});

    try {
      await deleteSocialLink(link.id);
      const nextLinks = await getSocialLinks();
      setSocialLinks(nextLinks);
      resetSocialLinkForm(nextLinks);
      setSettingsSuccess('Red social eliminada correctamente.');
    } catch (error) {
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo eliminar la red social.');
    } finally {
      setIsSettingsSaving(false);
    }
  }

  function resetBusinessHourForm() {
    setSelectedBusinessHourId(null);
    setBusinessHourForm(createEmptyBusinessHourForm());
    setBusinessHourErrors({});
  }

  function updateBusinessHourField(field, value) {
    setBusinessHourForm((currentForm) => {
      if (field === 'selectedWeekdays') {
        return { ...currentForm, selectedWeekdays: value.map(String) };
      }

      if (field === 'toggleWeekday') {
        const weekday = String(value);
        const currentWeekdays = currentForm.selectedWeekdays ?? [];
        const nextWeekdays = currentWeekdays.includes(weekday)
          ? currentWeekdays.filter((item) => item !== weekday)
          : [...currentWeekdays, weekday].sort((first, second) => Number(first) - Number(second));

        return { ...currentForm, selectedWeekdays: nextWeekdays };
      }

      if (field === 'slot') {
        const nextSlots = [...(currentForm.slots ?? [])];
        nextSlots[value.index] = {
          ...nextSlots[value.index],
          [value.field]: value.value,
        };

        return { ...currentForm, slots: nextSlots };
      }

      if (field === 'addSlot') {
        return {
          ...currentForm,
          slots: [...(currentForm.slots ?? []), { opensAt: '18:00', closesAt: '23:00' }],
        };
      }

      if (field === 'removeSlot') {
        const nextSlots = (currentForm.slots ?? []).filter((_, index) => index !== value);
        return {
          ...currentForm,
          slots: nextSlots.length > 0 ? nextSlots : [{ opensAt: '09:00', closesAt: '18:00' }],
        };
      }

      if (field === 'isClosed') {
        return { ...currentForm, isClosed: value };
      }

      return { ...currentForm, [field]: value };
    });
    setBusinessHourErrors({});
    setSettingsSuccess('');
  }

  function validateBusinessHour() {
    const nextErrors = {};
    const selectedWeekdays = businessHourForm.selectedWeekdays ?? [];

    if (selectedWeekdays.length === 0) {
      nextErrors.selectedWeekdays = 'Seleccioná al menos un día.';
    }

    if (!businessHourForm.isClosed) {
      const slots = businessHourForm.slots ?? [];

      if (slots.length === 0) {
        nextErrors.slots = 'Agregá al menos una franja horaria.';
      }

      slots.forEach((slot, index) => {
        if (!slot.opensAt) {
          nextErrors[`slot-${index}-opensAt`] = 'La apertura es obligatoria.';
        }

        if (!slot.closesAt) {
          nextErrors[`slot-${index}-closesAt`] = 'El cierre es obligatorio.';
        }
      });
    }

    setBusinessHourErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNewBusinessHour() {
    if (isSettingsSaving) {
      return;
    }

    resetBusinessHourForm();
  }

  function handleEditBusinessHour(group) {
    if (isSettingsSaving) {
      return;
    }

    setSelectedBusinessHourId(group.key);
    setBusinessHourForm({
      selectedWeekdays: group.weekdays.map(String),
      isClosed: group.isClosed,
      slots: group.isClosed
        ? [{ opensAt: '09:00', closesAt: '18:00' }]
        : group.slots.map((slot) => ({
            opensAt: String(slot.opensAt ?? '').slice(0, 5),
            closesAt: String(slot.closesAt ?? '').slice(0, 5),
          })),
    });
    setBusinessHourErrors({});
    setSettingsSuccess('');
  }

  async function replaceBusinessHoursForWeekdays(selectedWeekdays) {
    const weekdays = selectedWeekdays.map(Number);
    const slotsToDelete = businessHours.filter((slot) => weekdays.includes(Number(slot.weekday)));

    for (const slot of slotsToDelete) {
      await deleteBusinessHourSlot(slot.id);
    }

    for (const weekday of weekdays) {
      if (businessHourForm.isClosed) {
        await createBusinessHourSlot({
          weekday,
          opensAt: null,
          closesAt: null,
          isClosed: true,
          slotNumber: 1,
        });
        continue;
      }

      for (const [index, slot] of businessHourForm.slots.entries()) {
        await createBusinessHourSlot({
          weekday,
          opensAt: slot.opensAt,
          closesAt: slot.closesAt,
          isClosed: false,
          slotNumber: index + 1,
        });
      }
    }
  }

  async function handleSaveBusinessHour() {
    if (!canManageRestaurantSettings || isSettingsSaving || !validateBusinessHour()) {
      return;
    }

    setIsSettingsSaving(true);
    setSettingsSuccess('');
    setSettingsLoadError('');

    try {
      await replaceBusinessHoursForWeekdays(businessHourForm.selectedWeekdays ?? []);
      const nextHours = await getBusinessHours();
      setBusinessHours(nextHours);
      resetBusinessHourForm();
      setSettingsSuccess(selectedBusinessHourId ? 'Horario actualizado correctamente.' : 'Horario creado correctamente.');
    } catch (error) {
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo guardar el horario.');
    } finally {
      setIsSettingsSaving(false);
    }
  }

  async function handleDeleteBusinessHour(group) {
    if (!canManageRestaurantSettings || isSettingsSaving) {
      return;
    }

    const confirmed = window.confirm('¿Eliminar este horario?');
    if (!confirmed) {
      return;
    }

    setIsSettingsSaving(true);
    setSettingsSuccess('');
    setBusinessHourErrors({});

    try {
      const weekdays = group.weekdays.map(Number);
      const slotsToDelete = businessHours.filter((slot) => weekdays.includes(Number(slot.weekday)));

      for (const slot of slotsToDelete) {
        await deleteBusinessHourSlot(slot.id);
      }

      const nextHours = await getBusinessHours();
      setBusinessHours(nextHours);
      resetBusinessHourForm();
      setSettingsSuccess('Horario eliminado correctamente.');
    } catch (error) {
      setSettingsLoadError(error instanceof Error ? error.message : 'No se pudo eliminar el horario.');
    } finally {
      setIsSettingsSaving(false);
    }
  }

  return {
    businessHourErrors,
    businessHourForm,
    businessHours,
    errors: settingsErrors,
    form: settingsForm,
    canManageRestaurantSettings,
    isBusinessHourEditing: Boolean(selectedBusinessHourId),
    isLoading: isSettingsLoading,
    isSaving: isSettingsSaving,
    isSocialLinkEditing: Boolean(selectedSocialLinkId),
    loadError: settingsLoadError,
    onBusinessHourCancel: resetBusinessHourForm,
    onBusinessHourChange: updateBusinessHourField,
    onBusinessHourDelete: handleDeleteBusinessHour,
    onBusinessHourEdit: handleEditBusinessHour,
    onBusinessHourNew: handleNewBusinessHour,
    onBusinessHourSave: handleSaveBusinessHour,
    onChange: updateSettingsField,
    onRetry: loadSettings,
    onSave: handleSaveSettings,
    onSocialLinkCancel: resetSocialLinkForm,
    onSocialLinkChange: updateSocialLinkField,
    onSocialLinkDelete: handleDeleteSocialLink,
    onSocialLinkEdit: handleEditSocialLink,
    onSocialLinkNew: handleNewSocialLink,
    onSocialLinkSave: handleSaveSocialLink,
    onSocialLinkToggle: handleToggleSocialLink,
    settings,
    socialLinkErrors,
    socialLinkForm,
    socialLinks,
    successMessage: settingsSuccess,
  };
}
