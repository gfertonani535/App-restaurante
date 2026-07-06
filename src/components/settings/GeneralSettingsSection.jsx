import { Clock, Globe2, Store } from 'lucide-react';
import { BusinessHoursSection } from '@/components/settings/BusinessHoursSection.jsx';
import { RestaurantProfileSection } from '@/components/settings/RestaurantProfileSection.jsx';
import { SettingsSectionIntro } from '@/components/settings/SettingsSectionIntro.jsx';
import { SocialLinksSection } from '@/components/settings/SocialLinksSection.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { MetricCard } from '@/components/common/MetricCard.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { socialLinksActiveLimit } from '@/components/settings/settings.constants.js';

export function GeneralSettingsSection({
  businessHourErrors,
  businessHourForm,
  businessHours,
  canManageRestaurantSettings,
  errors,
  form,
  isBusinessHourEditing,
  isLoading,
  isSaving,
  isSocialLinkEditing,
  loadError,
  onBusinessHourCancel,
  onBusinessHourChange,
  onBusinessHourDelete,
  onBusinessHourEdit,
  onBusinessHourNew,
  onBusinessHourSave,
  onChange,
  onRetry,
  onSave,
  onSocialLinkCancel,
  onSocialLinkChange,
  onSocialLinkDelete,
  onSocialLinkEdit,
  onSocialLinkNew,
  onSocialLinkSave,
  onSocialLinkToggle,
  settings,
  socialLinkErrors,
  socialLinkForm,
  socialLinks,
  successMessage,
}) {
  const isSettingsReadOnly = !canManageRestaurantSettings || isSaving || isLoading || !settings?.id;
  const isCatalogReadOnly = !canManageRestaurantSettings || isSaving || isLoading;
  const activeSocialLinks = socialLinks.filter((link) => link.isActive).length;

  return (
    <div className="space-y-6">
      <SettingsSectionIntro
        title="General"
        description="Configurá la información principal del restaurante, redes sociales y horarios de atención."
      />

      {!canManageRestaurantSettings && !isLoading ? (
        <Alert title="No tenés permisos para modificar la configuración general.">
          Podés consultar estos datos, pero solo un administrador o encargado puede guardarlos.
        </Alert>
      ) : null}

      {loadError ? <ErrorState title="No se pudo cargar la configuración." message={loadError} onRetry={onRetry} /> : null}

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
        <MetricCard
          icon={Store}
          label="Restaurante"
          value={form.restaurantName || 'RestaurantOS'}
          helper={form.address || 'Sin dirección'}
        />
        <MetricCard
          icon={Globe2}
          label="Redes activas"
          value={String(activeSocialLinks)}
          helper={`Máximo ${socialLinksActiveLimit} en footer`}
        />
        <MetricCard icon={Clock} label="Horarios" value={String(businessHours.length)} helper="franjas configuradas" />
      </section>

      <RestaurantProfileSection
        errors={errors}
        form={form}
        isReadOnly={isSettingsReadOnly}
        isSaving={isSaving}
        onChange={onChange}
        onSave={onSave}
      />

      <SocialLinksSection
        errors={socialLinkErrors}
        form={socialLinkForm}
        isEditing={isSocialLinkEditing}
        isReadOnly={isCatalogReadOnly}
        isSaving={isSaving}
        links={socialLinks}
        onCancel={onSocialLinkCancel}
        onChange={onSocialLinkChange}
        onDelete={onSocialLinkDelete}
        onEdit={onSocialLinkEdit}
        onNew={onSocialLinkNew}
        onSave={onSocialLinkSave}
        onToggleActive={onSocialLinkToggle}
      />

      <BusinessHoursSection
        errors={businessHourErrors}
        form={businessHourForm}
        hours={businessHours}
        isEditing={isBusinessHourEditing}
        isReadOnly={isCatalogReadOnly}
        isSaving={isSaving}
        onCancel={onBusinessHourCancel}
        onChange={onBusinessHourChange}
        onDelete={onBusinessHourDelete}
        onEdit={onBusinessHourEdit}
        onNew={onBusinessHourNew}
        onSave={onBusinessHourSave}
      />
    </div>
  );
}
