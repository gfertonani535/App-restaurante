import { supabase } from '@/lib/supabase.js';

const PROFILE_SELECT_WITH_EMAIL = 'id, full_name, email, role, created_at, updated_at';
const PROFILE_SELECT = 'id, full_name, role, created_at, updated_at';

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

function isMissingEmailColumnError(error) {
  const message = String(error?.message ?? '').toLowerCase();
  return error?.code === '42703' || message.includes('email') || message.includes('column');
}

function normalizeProfile(profile, hasEmailColumn) {
  return {
    id: profile.id,
    fullName: profile.full_name ?? '',
    email: hasEmailColumn ? profile.email ?? '' : '',
    role: profile.role ?? 'staff',
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

export async function getUsers() {
  const client = ensureSupabaseClient();
  const withEmailResponse = await client
    .from('profiles')
    .select(PROFILE_SELECT_WITH_EMAIL)
    .order('full_name', { ascending: true });

  if (!withEmailResponse.error) {
    return {
      hasEmailColumn: true,
      users: (withEmailResponse.data ?? []).map((profile) => normalizeProfile(profile, true)),
    };
  }

  if (!isMissingEmailColumnError(withEmailResponse.error)) {
    throw new Error(translateSupabaseError(withEmailResponse.error, 'No se pudieron cargar los usuarios.'));
  }

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_SELECT)
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar los usuarios.'));
  }

  return {
    hasEmailColumn: false,
    users: (data ?? []).map((profile) => normalizeProfile(profile, false)),
  };
}

export async function getCurrentProfile() {
  const client = ensureSupabaseClient();
  const { data: authData, error: authError } = await client.auth.getUser();

  if (authError) {
    throw new Error(translateSupabaseError(authError, 'No se pudo cargar tu perfil.'));
  }

  const userId = authData.user?.id;

  if (!userId) {
    return null;
  }

  const withEmailResponse = await client
    .from('profiles')
    .select(PROFILE_SELECT_WITH_EMAIL)
    .eq('id', userId)
    .maybeSingle();

  if (!withEmailResponse.error) {
    return withEmailResponse.data ? normalizeProfile(withEmailResponse.data, true) : null;
  }

  if (!isMissingEmailColumnError(withEmailResponse.error)) {
    throw new Error(translateSupabaseError(withEmailResponse.error, 'No se pudo cargar tu perfil.'));
  }

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar tu perfil.'));
  }

  return data ? normalizeProfile(data, false) : null;
}

export async function updateUserProfile(userId, payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('profiles')
    .update({
      full_name: payload.fullName,
      role: payload.role,
    })
    .eq('id', userId)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar el usuario.'));
  }

  return normalizeProfile(data, false);
}

export async function updateCurrentUserPassword(newPassword) {
  const client = ensureSupabaseClient();
  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cambiar la contraseña.'));
  }
}
