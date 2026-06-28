import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  Tag,
} from 'lucide-react';
import { CategoriesTable } from '@/components/categories/CategoriesTable.jsx';
import { CategoryFormPanel } from '@/components/categories/CategoryFormPanel.jsx';
import { CategoryMobileList } from '@/components/categories/CategoryMobileList.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { MetricCard } from '@/components/common/MetricCard.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  createCategory,
  createCategoryId,
  deleteCategoryImage,
  getCategories,
  getCategoryProductStats,
  updateCategory,
  uploadCategoryImage,
  validateCategoryImage,
} from '@/services/categories.service.js';

const emptyForm = {
  name: '',
  displayOrder: '1',
  isActive: true,
  imageFile: null,
  imagePreviewUrl: '',
  imagePath: '',
};

function getEmptyForm(categories = []) {
  return {
    ...emptyForm,
    displayOrder: getNextOrder(categories),
  };
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getNextOrder(categories) {
  const maxOrder = categories.reduce((max, category) => Math.max(max, Number(category.display_order) || 0), 0);
  return String(maxOrder + 1);
}

function getProductCount(categoryId, productCounts) {
  return productCounts[categoryId] ?? 0;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [productStats, setProductStats] = useState({ counts: {}, totalProducts: 0 });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const previewUrlRef = useRef('');

  const revokeImagePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  }, []);

  const loadCategories = useCallback(
    async ({ resetCurrentForm = false, showLoading = false } = {}) => {
      await Promise.resolve();

      if (showLoading) {
        setIsLoading(true);
      }

      setLoadError('');

      try {
        const [nextCategories, nextProductStats] = await Promise.all([getCategories(), getCategoryProductStats()]);

        setCategories(nextCategories);
        setProductStats(nextProductStats);

        if (resetCurrentForm) {
          revokeImagePreview();
          setSelectedCategoryId(null);
          setForm(getEmptyForm(nextCategories));
        }

        return nextCategories;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudieron cargar las categorías.';

        if (showLoading) {
          setLoadError(message);
        }

        throw error;
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [revokeImagePreview],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCategories({ resetCurrentForm: true, showLoading: true }).catch(() => {});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCategories]);

  useEffect(() => {
    return () => revokeImagePreview();
  }, [revokeImagePreview]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );
  const isEditMode = Boolean(selectedCategory);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const nextCategories = normalizedSearch
      ? categories.filter((category) => normalizeText(category.name).includes(normalizedSearch))
      : categories;

    return [...nextCategories].sort((a, b) =>
      sortDirection === 'asc'
        ? a.display_order - b.display_order || a.name.localeCompare(b.name)
        : b.display_order - a.display_order || a.name.localeCompare(b.name),
    );
  }, [categories, searchTerm, sortDirection]);

  const activeCount = categories.filter((category) => category.is_active).length;
  const emptyCategoriesMessage = categories.length === 0 ? 'Todavía no hay categorías.' : 'No hay categorías para mostrar.';
  const mostUsedCategory = useMemo(() => {
    const categoriesWithProducts = categories.filter((category) => getProductCount(category.id, productStats.counts) > 0);

    if (categoriesWithProducts.length === 0) {
      return null;
    }

    return [...categoriesWithProducts].sort(
      (a, b) => getProductCount(b.id, productStats.counts) - getProductCount(a.id, productStats.counts),
    )[0];
  }, [categories, productStats.counts]);

  function resetForm(nextCategories = categories) {
    revokeImagePreview();
    setSelectedCategoryId(null);
    setForm(getEmptyForm(nextCategories));
    setErrors({});
    setFormError('');
  }

  function handleNewCategory() {
    resetForm();
    setSuccessMessage('');
    setIsMobileFormOpen(true);
  }

  function handleEditCategory(category) {
    revokeImagePreview();
    setSelectedCategoryId(category.id);
    setForm({
      name: category.name ?? '',
      displayOrder: String(category.display_order ?? ''),
      isActive: Boolean(category.is_active),
      imageFile: null,
      imagePreviewUrl: '',
      imagePath: category.image_path ?? '',
    });
    setErrors({});
    setFormError('');
    setSuccessMessage('');
    setIsMobileFormOpen(true);
  }

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setFormError('');
    setSuccessMessage('');
  }

  function handleImageChange(file, error) {
    if (error) {
      setErrors((currentErrors) => ({ ...currentErrors, image: error }));
      return;
    }

    if (!file) {
      return;
    }

    revokeImagePreview();
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setForm((currentForm) => ({
      ...currentForm,
      imageFile: file,
      imagePreviewUrl: previewUrl,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, image: '' }));
    setFormError('');
    setSuccessMessage('');
  }

  function validateForm() {
    const nextErrors = {};
    const normalizedName = normalizeText(form.name);
    const orderValue = Number(form.displayOrder);
    const duplicateName = categories.some(
      (category) => category.id !== selectedCategoryId && normalizeText(category.name) === normalizedName,
    );
    const imageError = form.imageFile ? validateCategoryImage(form.imageFile) : '';

    if (!normalizedName) {
      nextErrors.name = 'El nombre es obligatorio.';
    } else if (duplicateName) {
      nextErrors.name = 'Ya existe una categoría con ese nombre.';
    }

    if (String(form.displayOrder).trim() === '') {
      nextErrors.displayOrder = 'El orden es obligatorio.';
    } else if (!Number.isInteger(orderValue) || orderValue < 1) {
      nextErrors.displayOrder = 'Ingresá un número entero mayor o igual a 1.';
    }

    if (imageError) {
      nextErrors.image = imageError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function shiftCategoriesFromOrder(targetOrder, excludedCategoryId) {
    const hasCategoryAtTargetOrder = categories.some(
      (category) => category.id !== excludedCategoryId && Number(category.display_order) === targetOrder,
    );

    if (!hasCategoryAtTargetOrder) {
      return;
    }

    const categoriesToShift = categories
      .filter((category) => category.id !== excludedCategoryId && Number(category.display_order) >= targetOrder)
      .sort((firstCategory, secondCategory) => Number(secondCategory.display_order) - Number(firstCategory.display_order));

    for (const category of categoriesToShift) {
      await updateCategory(category.id, {
        display_order: Number(category.display_order) + 1,
      });
    }
  }

  async function handleSubmit() {
    if (isSaving || !validateForm()) {
      return;
    }

    setIsSaving(true);
    setFormError('');
    setSuccessMessage('');

    const basePayload = {
      name: form.name.trim(),
      display_order: Number(form.displayOrder),
      is_active: form.isActive,
    };
    const targetOrder = Number(form.displayOrder);

    try {
      if (isEditMode) {
        let uploadedImagePath = '';
        const nextImagePath = form.imageFile
          ? await uploadCategoryImage(form.imageFile, selectedCategory.id).then((imagePath) => {
              uploadedImagePath = imagePath;
              return imagePath;
            })
          : selectedCategory.image_path;

        try {
          await shiftCategoriesFromOrder(targetOrder, selectedCategory.id);
          await updateCategory(selectedCategory.id, {
            ...basePayload,
            image_path: nextImagePath || null,
          });
        } catch (error) {
          if (uploadedImagePath) {
            await deleteCategoryImage(uploadedImagePath).catch(() => {});
          }

          throw error;
        }

        if (uploadedImagePath && selectedCategory.image_path) {
          await deleteCategoryImage(selectedCategory.image_path).catch(() => {});
        }

        setSuccessMessage('Categoría actualizada correctamente.');
      } else {
        const newCategoryId = createCategoryId();
        let uploadedImagePath = '';

        if (form.imageFile) {
          uploadedImagePath = await uploadCategoryImage(form.imageFile, newCategoryId);
        }

        try {
          await shiftCategoriesFromOrder(targetOrder, newCategoryId);
          await createCategory({
            id: newCategoryId,
            ...basePayload,
            image_path: uploadedImagePath || null,
          });
        } catch (error) {
          if (uploadedImagePath) {
            await deleteCategoryImage(uploadedImagePath).catch(() => {});
          }

          throw error;
        }

        setSuccessMessage('Categoría creada correctamente.');
      }

      const refreshedCategories = await loadCategories();
      resetForm(refreshedCategories);
      setIsMobileFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar la categoría.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    resetForm();
    setIsMobileFormOpen(false);
  }

  return (
    <AdminPageContainer>
      <PageHeader
        title="Catálogo de Categorías"
        description="Organizá las secciones visibles en la carta digital."
        searchValue={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
        secondaryActions={
          <>
          <Button
            className="h-10"
            disabled={isLoading}
            onClick={() => setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'))}
            size="sm"
            type="button"
            variant="secondary"
          >
            {sortDirection === 'asc' ? <ChevronUp className="size-4 h-9" aria-hidden="true" /> : <ChevronDown className="size-4 h-9" aria-hidden="true" />}
            Ordenar
          </Button>
          </>
        }
        primaryAction={
          <Button className="w-full sm:w-auto" disabled={isLoading} onClick={handleNewCategory} size="sm" type="button">
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            Añadir categoría
          </Button>
        }
      />

      {loadError ? (
        <ErrorState
          title="No se pudieron cargar las categorías"
          message={loadError}
          onRetry={() => loadCategories({ resetCurrentForm: true, showLoading: true }).catch(() => {})}
        />
      ) : null}

      {formError ? (
        <Alert variant="destructive" title="No se pudo guardar">
          {formError}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert variant="success" title="Listo">
          {successMessage}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <CategoriesTable
            categories={filteredCategories}
            emptyMessage={emptyCategoriesMessage}
            getProductCount={getProductCount}
            isLoading={isLoading}
            isSaving={isSaving}
            loadError={loadError}
            onEditCategory={handleEditCategory}
            productCounts={productStats.counts}
          />

          <CategoryMobileList
            categories={filteredCategories}
            emptyMessage={emptyCategoriesMessage}
            getProductCount={getProductCount}
            isLoading={isLoading}
            loadError={loadError}
            onEditCategory={handleEditCategory}
            productCounts={productStats.counts}
          />
        </div>

        <aside className="hidden xl:block">
          <CategoryFormPanel
            errors={errors}
            form={form}
            isEditMode={isEditMode}
            isSaving={isSaving}
            onCancel={handleCancel}
            onChange={updateField}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
          />
        </aside>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard helper={`${activeCount} activas`} icon={Tag} label="Total categorías" layout="split" value={String(categories.length)} />
        <MetricCard helper="productos" icon={Package} label="Productos" layout="split" value={String(productStats.totalProducts)} />
        <MetricCard
          helper={`${mostUsedCategory ? getProductCount(mostUsedCategory.id, productStats.counts) : 0} productos`}
          icon={BarChart3}
          label="Categoría más usada"
          layout="split"
          value={mostUsedCategory?.name ?? 'Sin datos'}
        />
      </section>

      {isMobileFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 px-0 backdrop-blur-sm xl:hidden" role="presentation">
          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white">
            <CategoryFormPanel
              errors={errors}
              form={form}
              isEditMode={isEditMode}
              isSaving={isSaving}
              onCancel={handleCancel}
              onChange={updateField}
              onImageChange={handleImageChange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      ) : null}
    </AdminPageContainer>
  );
}
