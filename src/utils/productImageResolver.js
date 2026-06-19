import { supabase } from '@/lib/supabase.js';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const CATEGORY_IMAGES_BUCKET = 'category-images';

export const DEFAULT_PRODUCT_IMAGE = '';

export function getProductImageUrl(imagePath) {
  if (!imagePath || !supabase) {
    return '';
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}

export function getCategoryImageUrl(imagePath) {
  if (!imagePath || !supabase) {
    return '';
  }

  const { data } = supabase.storage.from(CATEGORY_IMAGES_BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}

export function resolveProductImage(product) {
  if (product?.imagePath) {
    return getProductImageUrl(product.imagePath);
  }

  if (product?.category?.imagePath) {
    return getCategoryImageUrl(product.category.imagePath);
  }

  return DEFAULT_PRODUCT_IMAGE;
}
