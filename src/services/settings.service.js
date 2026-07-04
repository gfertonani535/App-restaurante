import { supabase } from '@/lib/supabase.js';

// Servicio centralizado: separa configuracion basica, redes sociales y horarios en Supabase.

const RESTAURANT_SETTINGS_SELECT = `
  id,
  restaurant_name,
  short_description,
  address,
  created_at,
  updated_at
`;

const SOCIAL_LINK_SELECT = `
  id,
  provider,
  label,
  url,
  display_order,
  is_active,
  created_at,
  updated_at
`;

const BUSINESS_HOURS_SELECT = `
  id,
  weekday,
  opens_at,
  closes_at,
  is_closed,
  slot_number,
  created_at,
  updated_at
`;

const PUBLIC_SOCIAL_LINKS_LIMIT = 4;

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  return supabase;
}

function translateSupabaseError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  const message = String(error.message ?? '').toLowerCase();

  if (error.code === '42501' || message.includes('row-level security') || message.includes('permission')) {
    return 'No tenés permisos para realizar esta acción.';
  }

  if (message.includes('jwt') || message.includes('auth')) {
    return 'Tu sesión expiró. Volvé a iniciar sesión.';
  }

  return fallbackMessage;
}

function normalizeSettings(settings) {
  if (!settings) {
    return null;
  }

  return {
    id: settings.id,
    restaurantName: settings.restaurant_name ?? '',
    shortDescription: settings.short_description ?? '',
    address: settings.address ?? '',
    createdAt: settings.created_at,
    updatedAt: settings.updated_at,
    // Compatibilidad temporal hasta migrar la UI de Configuracion.
    whatsapp: '',
    instagram: '',
    facebook: '',
    openingHours: '',
    footerText: '',
    currency: 'ARS',
    updatedBy: null,
  };
}

function toSettingsPayload(payload) {
  return {
    restaurant_name: payload.restaurantName,
    short_description: payload.shortDescription || null,
    address: payload.address || null,
  };
}

function normalizeSocialLink(link) {
  if (!link) {
    return null;
  }

  return {
    id: link.id,
    provider: link.provider ?? '',
    label: link.label ?? '',
    url: link.url ?? '',
    displayOrder: Number(link.display_order ?? 0),
    isActive: Boolean(link.is_active),
    createdAt: link.created_at,
    updatedAt: link.updated_at,
  };
}

function toSocialLinkPayload(payload) {
  const nextPayload = {};

  if ('provider' in payload) {
    nextPayload.provider = payload.provider;
  }

  if ('label' in payload) {
    nextPayload.label = payload.label;
  }

  if ('url' in payload) {
    nextPayload.url = payload.url;
  }

  if ('displayOrder' in payload) {
    nextPayload.display_order = Number(payload.displayOrder ?? 0);
  }

  if ('isActive' in payload) {
    nextPayload.is_active = payload.isActive;
  }

  return nextPayload;
}

function normalizeBusinessHour(slot) {
  if (!slot) {
    return null;
  }

  return {
    id: slot.id,
    weekday: Number(slot.weekday),
    opensAt: slot.opens_at,
    closesAt: slot.closes_at,
    isClosed: Boolean(slot.is_closed),
    slotNumber: Number(slot.slot_number ?? 1),
    createdAt: slot.created_at,
    updatedAt: slot.updated_at,
  };
}

function toBusinessHourPayload(payload) {
  const nextPayload = {};

  if ('weekday' in payload) {
    nextPayload.weekday = Number(payload.weekday);
  }

  if ('opensAt' in payload) {
    nextPayload.opens_at = payload.opensAt;
  }

  if ('closesAt' in payload) {
    nextPayload.closes_at = payload.closesAt;
  }

  if ('isClosed' in payload) {
    const isClosed = Boolean(payload.isClosed);
    nextPayload.is_closed = isClosed;

    if (isClosed) {
      nextPayload.opens_at = null;
      nextPayload.closes_at = null;
    }
  }

  if ('slotNumber' in payload) {
    nextPayload.slot_number = Number(payload.slotNumber ?? 1);
  }

  return nextPayload;
}

export function createDefaultRestaurantSettings() {
  return {
    id: null,
    restaurantName: 'RestaurantOS',
    shortDescription: 'Sistema POS para restaurante',
    address: '',
    createdAt: null,
    updatedAt: null,
    // Compatibilidad temporal hasta migrar la UI de Configuracion.
    whatsapp: '',
    instagram: '',
    facebook: '',
    openingHours: '',
    footerText: '',
    currency: 'ARS',
    updatedBy: null,
  };
}

export async function getRestaurantSettings() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('restaurant_settings')
    .select(RESTAURANT_SETTINGS_SELECT)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar la configuración.'));
  }

  return normalizeSettings(data);
}

export async function updateRestaurantSettings(settingsId, payload) {
  const client = ensureSupabaseClient();

  if (!settingsId) {
    throw new Error('Todavía no hay configuración registrada.');
  }

  const { data, error } = await client
    .from('restaurant_settings')
    .update(toSettingsPayload(payload))
    .eq('id', settingsId)
    .select(RESTAURANT_SETTINGS_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar la configuración.'));
  }

  return normalizeSettings(data);
}

export async function getSocialLinks({ activeOnly = false, limit } = {}) {
  const client = ensureSupabaseClient();
  let query = client
    .from('restaurant_social_links')
    .select(SOCIAL_LINK_SELECT)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  if (Number.isInteger(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar las redes sociales.'));
  }

  return (data ?? []).map(normalizeSocialLink);
}

export async function createSocialLink(payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('restaurant_social_links')
    .insert(toSocialLinkPayload(payload))
    .select(SOCIAL_LINK_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo crear la red social.'));
  }

  return normalizeSocialLink(data);
}

export async function updateSocialLink(linkId, payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('restaurant_social_links')
    .update(toSocialLinkPayload(payload))
    .eq('id', linkId)
    .select(SOCIAL_LINK_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar la red social.'));
  }

  return normalizeSocialLink(data);
}

export async function disableSocialLink(linkId) {
  return updateSocialLink(linkId, { isActive: false });
}

export async function deleteSocialLink(linkId) {
  const client = ensureSupabaseClient();
  const { error } = await client
    .from('restaurant_social_links')
    .delete()
    .eq('id', linkId);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo eliminar la red social.'));
  }
}

export async function reorderSocialLinks(orderedLinks) {
  await Promise.all(
    orderedLinks.map((link, index) =>
      updateSocialLink(link.id, {
        displayOrder: link.displayOrder ?? index + 1,
      }),
    ),
  );

  return getSocialLinks();
}

export async function getBusinessHours() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('business_hours')
    .select(BUSINESS_HOURS_SELECT)
    .order('weekday', { ascending: true })
    .order('slot_number', { ascending: true });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar los horarios.'));
  }

  return (data ?? []).map(normalizeBusinessHour);
}

export async function createBusinessHourSlot(payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('business_hours')
    .insert(toBusinessHourPayload(payload))
    .select(BUSINESS_HOURS_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo crear el horario.'));
  }

  return normalizeBusinessHour(data);
}

export async function updateBusinessHourSlot(slotId, payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('business_hours')
    .update(toBusinessHourPayload(payload))
    .eq('id', slotId)
    .select(BUSINESS_HOURS_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar el horario.'));
  }

  return normalizeBusinessHour(data);
}

export async function deleteBusinessHourSlot(slotId) {
  const client = ensureSupabaseClient();
  const { error } = await client
    .from('business_hours')
    .delete()
    .eq('id', slotId);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo eliminar el horario.'));
  }
}

export async function getPublicRestaurantFooterData() {
  const [settings, socialLinks, businessHours] = await Promise.all([
    getRestaurantSettings(),
    getSocialLinks({ activeOnly: true, limit: PUBLIC_SOCIAL_LINKS_LIMIT }),
    getBusinessHours(),
  ]);

  return {
    settings: settings ?? createDefaultRestaurantSettings(),
    socialLinks,
    businessHours,
  };
}
