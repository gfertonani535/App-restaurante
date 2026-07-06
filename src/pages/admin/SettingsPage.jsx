import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneralSettingsSection } from '@/components/settings/GeneralSettingsSection.jsx';
import { SecuritySettingsSection } from '@/components/settings/SecuritySettingsSection.jsx';
import { SettingsTabs } from '@/components/settings/SettingsTabs.jsx';
import { UsersSettingsSection } from '@/components/settings/UsersSettingsSection.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useRestaurantSettings } from '@/hooks/settings/useRestaurantSettings.js';
import { useSecuritySettings } from '@/hooks/settings/useSecuritySettings.js';
import { useUsersSettings } from '@/hooks/settings/useUsersSettings.js';

const defaultActiveTab = 'usuarios';

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
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const canManageRestaurantSettings = role === 'admin' || role === 'manager';
  const generalSettings = useRestaurantSettings({ canManageRestaurantSettings });
  const usersSettings = useUsersSettings({
    currentProfile,
    profileLoading,
    refreshProfile,
    role,
  });
  const securitySettings = useSecuritySettings();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  return (
    <AdminPageContainer>
      <PageHeader title="Configuración" description="Gestioná los datos generales y el equipo del sistema." />

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'general' ? <GeneralSettingsSection {...generalSettings} /> : null}

      {activeTab === 'usuarios' ? <UsersSettingsSection {...usersSettings} /> : null}

      {activeTab === 'seguridad' ? (
        <SecuritySettingsSection
          currentProfile={currentProfile}
          isLoading={usersSettings.isLoading || profileLoading}
          loadError={profileError || usersSettings.loadError}
          onLogout={handleLogout}
          {...securitySettings}
        />
      ) : null}
    </AdminPageContainer>
  );
}
