import { supabase } from '@/lib/supabase.js';
import { getValidatedImageType, validateImageFile } from '@/utils/imageValidation.js';

const CATEGORY_IMAGES_BUCKET = 'category-images';

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

  if (error.code === '23505' || message.includes('duplicate')) {
    return 'Ya existe una categoría con ese nombre.';
  }

  if (error.code === '42501' || message.includes('row-level security') || message.includes('permission')) {
    return 'No tenés permisos para realizar esta acción.';
  }

  if (message.includes('jwt') || message.includes('auth')) {
    return 'Tu sesión expiró. Volvé a iniciar sesión.';
  }

  return fallbackMessage;
}

function createUniqueId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function validateCategoryImage(file) {
  return validateImageFile(file);
}

export async function getCategories() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('categories')
    .select('id, name, image_path, display_order, is_active, created_at, updated_at')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar las categorías.'));
  }

  return data ?? [];
}

export async function createCategory(payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('categories')
    .insert({
      id: payload.id,
      name: payload.name,
      image_path: payload.image_path ?? null,
      display_order: payload.display_order,
      is_active: payload.is_active,
    })
    .select('id, name, image_path, display_order, is_active, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar la categoría.'));
  }

  return data;
}

export async function updateCategory(id, payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('id, name, image_path, display_order, is_active, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar la categoría.'));
  }

  return data;
}

export async function uploadCategoryImage(file, categoryId) {
  const client = ensureSupabaseClient();
  const imageType = getValidatedImageType(file);

  const filePath = `categories/${categoryId}/${createUniqueId()}.${imageType.extension}`;
  const { error } = await client.storage.from(CATEGORY_IMAGES_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo subir la imagen.'));
  }

  return filePath;
}

export async function deleteCategoryImage(imagePath) {
  if (!imagePath) {
    return;
  }

  const client = ensureSupabaseClient();
  const { error } = await client.storage.from(CATEGORY_IMAGES_BUCKET).remove([imagePath]);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo eliminar la imagen anterior.'));
  }
}

export function getCategoryImageUrl(imagePath) {
  if (!imagePath || !supabase) {
    return '';
  }

  const { data } = supabase.storage.from(CATEGORY_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}

export async function getCategoryProductStats() {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('products').select('category_id');

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron calcular los productos por categoría.'));
  }

  return (data ?? []).reduce(
    (stats, product) => {
      stats.totalProducts += 1;

      if (product.category_id) {
        stats.counts[product.category_id] = (stats.counts[product.category_id] ?? 0) + 1;
      }

      return stats;
    },
    { counts: {}, totalProducts: 0 },
  );
}

export function createCategoryId() {
  return createUniqueId();
}
