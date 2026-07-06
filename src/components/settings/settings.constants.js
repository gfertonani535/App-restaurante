export const settingsTabs = [
  { id: 'general', label: 'General' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'seguridad', label: 'Seguridad' },
];

// Roles internos -> etiquetas visibles; la base conserva admin/manager/cashier/waiter/staff.
export const roles = [
  { value: 'admin', label: 'Administrador', permissions: 'Acceso completo al sistema.' },
  { value: 'manager', label: 'Encargado', permissions: 'Productos, categorías, órdenes, caja y dashboard.' },
  { value: 'cashier', label: 'Cajero', permissions: 'Órdenes y caja.' },
  { value: 'waiter', label: 'Mozo', permissions: 'Órdenes.' },
  { value: 'staff', label: 'Personal', permissions: 'Acceso limitado.' },
];

export const roleByValue = Object.fromEntries(roles.map((role) => [role.value, role]));

export const socialLinksActiveLimit = 4;

export const emptySocialLinkForm = {
  provider: '',
  label: '',
  url: '',
  displayOrder: '1',
  isActive: true,
};

export const socialProviderLabels = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  other: 'Otro',
  tiktok: 'TikTok',
  web: 'Sitio web',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
};
