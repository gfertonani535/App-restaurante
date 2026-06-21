import { supabase } from '@/lib/supabase.js';

// Servicio centralizado: configuración general del restaurante persistida en Supabase.

const RESTAURANT_SETTINGS_SELECT = `
  id,
  restaurant_name,
  short_description,
  whatsapp,
  instagram,
  facebook,
  address,
  opening_hours,
  footer_text,
  currency,
  updated_by,
  created_at,
  updated_at
`;

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
    whatsapp: settings.whatsapp ?? '',
    instagram: settings.instagram ?? '',
    facebook: settings.facebook ?? '',
    address: settings.address ?? '',
    openingHours: settings.opening_hours ?? '',
    footerText: settings.footer_text ?? '',
    currency: settings.currency ?? 'ARS',
    updatedBy: settings.updated_by,
    createdAt: settings.created_at,
    updatedAt: settings.updated_at,
  };
}

function toSettingsPayload(payload) {
  return {
    restaurant_name: payload.restaurantName,
    short_description: payload.shortDescription || null,
    whatsapp: payload.whatsapp || null,
    instagram: payload.instagram || null,
    facebook: payload.facebook || null,
    address: payload.address || null,
    opening_hours: payload.openingHours || null,
    footer_text: payload.footerText || null,
    currency: payload.currency,
  };
}

export function createDefaultRestaurantSettings() {
  return {
    id: null,
    restaurantName: 'RestaurantOS',
    shortDescription: 'Sistema POS para restaurante',
    whatsapp: '',
    instagram: '',
    facebook: '',
    address: '',
    openingHours: '',
    footerText: '',
    currency: 'ARS',
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
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
  const { data: authData } = await client.auth.getUser();
  const userId = authData?.user?.id ?? null;

  if (!settingsId) {
    throw new Error('Todavía no hay configuración registrada.');
  }

  const { data, error } = await client
    .from('restaurant_settings')
    .update({
      ...toSettingsPayload(payload),
      updated_by: userId,
    })
    .eq('id', settingsId)
    .select(RESTAURANT_SETTINGS_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar la configuración.'));
  }

  return normalizeSettings(data);
}
