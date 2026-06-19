import { supabase } from '@/lib/supabase.js';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const PRODUCT_SELECT = `
  id,
  category_id,
  name,
  sku,
  short_description,
  description,
  price,
  image_path,
  is_active,
  visible_in_menu,
  quick_access,
  track_stock,
  stock,
  created_at,
  updated_at,
  category:categories (
    id,
    name,
    image_path,
    display_order,
    is_active
  )
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

  if (error.code === '23505' || message.includes('duplicate')) {
    return 'Ya existe un producto con esos datos.';
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

function getFileExtension(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'jpg';
  }

  if (extension === 'png') {
    return 'png';
  }

  if (extension === 'webp') {
    return 'webp';
  }

  return '';
}

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  return {
    ...product,
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    category: Array.isArray(product.category) ? product.category[0] ?? null : product.category ?? null,
  };
}

export function validateProductImage(file) {
  if (!file) {
    return '';
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Usá una imagen JPG, JPEG, PNG o WebP.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'La imagen no puede superar los 2 MB.';
  }

  if (!getFileExtension(file)) {
    return 'El formato de imagen no es válido.';
  }

  return '';
}

export async function getProducts() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudieron cargar los productos.'));
  }

  return (data ?? []).map(normalizeProduct);
}

export async function getProductById(productId) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo cargar el producto.'));
  }

  return normalizeProduct(data);
}

export async function createProduct(payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('products')
    .insert(payload)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo crear el producto.'));
  }

  return normalizeProduct(data);
}

export async function updateProduct(productId, payload) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('products')
    .update(payload)
    .eq('id', productId)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo guardar el producto.'));
  }

  return normalizeProduct(data);
}

export async function updateProductPrice(productId, price) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('products')
    .update({ price })
    .eq('id', productId)
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo actualizar el precio.'));
  }

  return normalizeProduct(data);
}

export async function uploadProductImage(file, productId) {
  const client = ensureSupabaseClient();
  const validationError = validateProductImage(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const extension = getFileExtension(file);
  const filePath = `products/${productId}/${createUniqueId()}.${extension}`;
  const { error } = await client.storage.from(PRODUCT_IMAGES_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo subir la imagen.'));
  }

  return filePath;
}

export async function deleteProductImage(imagePath) {
  if (!imagePath) {
    return;
  }

  const client = ensureSupabaseClient();
  const { error } = await client.storage.from(PRODUCT_IMAGES_BUCKET).remove([imagePath]);

  if (error) {
    throw new Error(translateSupabaseError(error, 'No se pudo eliminar la imagen anterior.'));
  }
}

export function getProductImageUrl(imagePath) {
  if (!imagePath || !supabase) {
    return '';
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}
