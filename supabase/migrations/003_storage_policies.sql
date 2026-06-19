```sql
-- =====================================================
-- RESTAURANTOS - STORAGE POLICIES
--
-- Buckets esperados:
-- category-images
-- product-images
-- =====================================================

-- =====================================================
-- CATEGORY IMAGES
-- =====================================================

drop policy if exists "Catalog managers read category images"
on storage.objects;

create policy "Catalog managers read category images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'category-images'
  and public.can_manage_catalog()
);

drop policy if exists "Catalog managers upload category images"
on storage.objects;

create policy "Catalog managers upload category images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'category-images'
  and public.can_manage_catalog()
);

drop policy if exists "Catalog managers update category images"
on storage.objects;

create policy "Catalog managers update category images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'category-images'
  and public.can_manage_catalog()
)
with check (
  bucket_id = 'category-images'
  and public.can_manage_catalog()
);

drop policy if exists "Catalog managers delete category images"
on storage.objects;

create policy "Catalog managers delete category images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'category-images'
  and public.can_manage_catalog()
);

-- =====================================================
-- PRODUCT IMAGES
-- =====================================================

drop policy if exists "Catalog managers read product images"
on storage.objects;

create policy "Catalog managers read product images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'product-images'
  and public.can_manage_catalog()
);

drop policy if exists "Catalog managers upload product images"
on storage.objects;

create policy "Catalog managers upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.can_manage_catalog()
);

drop policy if exists "Catalog managers update product images"
on storage.objects;

create policy "Catalog managers update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.can_manage_catalog()
)
with check (
  bucket_id = 'product-images'
  and public.can_manage_catalog()
);

drop policy if exists "Catalog managers delete product images"
on storage.objects;

create policy "Catalog managers delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.can_manage_catalog()
);
```
