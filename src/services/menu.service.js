import { supabase } from '@/lib/supabase.js';

const PUBLIC_PRODUCTS_SELECT = `
  id,
  category_id,
  name,
  short_description,
  description,
  price,
  image_path,
  category:categories (
    id,
    name,
    image_path,
    display_order
  )
`;

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  return supabase;
}

function normalizeCategory(category) {
  return {
    id: category.id,
    name: category.name,
    label: category.name,
    imagePath: category.image_path ?? '',
    displayOrder: Number(category.display_order ?? 0),
  };
}

function normalizeProduct(product, categoryById) {
  const relatedCategory = Array.isArray(product.category) ? product.category[0] ?? null : product.category ?? null;
  const category = categoryById.get(product.category_id) ??
    (relatedCategory
      ? normalizeCategory(relatedCategory)
      : null);

  return {
    id: product.id,
    categoryId: product.category_id,
    name: product.name,
    shortDescription: product.short_description ?? '',
    description: product.description ?? '',
    price: Number(product.price ?? 0),
    imagePath: product.image_path ?? '',
    category,
  };
}

export async function getPublicCategories() {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('categories')
    .select('id, name, image_path, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error('No pudimos cargar el menú.');
  }

  return (data ?? []).map(normalizeCategory);
}

export async function getPublicProducts(categories = []) {
  const client = ensureSupabaseClient();
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const publicCategoryIds = new Set(categoryById.keys());
  const { data, error } = await client
    .from('products')
    .select(PUBLIC_PRODUCTS_SELECT)
    .eq('is_active', true)
    .eq('visible_in_menu', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error('No pudimos cargar el menú.');
  }

  return (data ?? [])
    .filter((product) => publicCategoryIds.has(product.category_id))
    .map((product) => normalizeProduct(product, categoryById));
}

export async function getPublicCatalog() {
  const categories = await getPublicCategories();
  const products = await getPublicProducts(categories);
  const categoryIdsWithProducts = new Set(products.map((product) => product.categoryId));
  const visibleCategories = categories.filter((category) => categoryIdsWithProducts.has(category.id));

  return {
    categories: visibleCategories,
    products,
  };
}
