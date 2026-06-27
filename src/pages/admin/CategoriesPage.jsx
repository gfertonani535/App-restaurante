import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ImageIcon,
  Package,
  Plus,
  Tag,
  X,
} from 'lucide-react';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { EmptyState } from '@/components/common/EmptyState.jsx';
import { ErrorState } from '@/components/common/ErrorState.jsx';
import { FieldError } from '@/components/common/FieldError.jsx';
import { FormField } from '@/components/common/FormField.jsx';
import { IconButton } from '@/components/common/IconButton.jsx';
import { LoadingState } from '@/components/common/LoadingState.jsx';
import { MetricCard } from '@/components/common/MetricCard.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { StatusBadge } from '@/components/common/StatusBadge.jsx';
import { SwitchField } from '@/components/common/SwitchField.jsx';
import { TableStateRow } from '@/components/common/TableStateRow.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import {
  createCategory,
  createCategoryId,
  deleteCategoryImage,
  getCategories,
  getCategoryImageUrl,
  getCategoryProductStats,
  updateCategory,
  uploadCategoryImage,
  validateCategoryImage,
} from '@/services/categories.service.js';
import { cn } from '@/lib/utils';

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

function CategoryStatus({ isActive }) {
  return <StatusBadge dot label={isActive ? 'Activa' : 'Inactiva'} variant={isActive ? 'success' : 'muted'} />;
}

function CategoryThumbnail({ imagePath, name, previewUrl = '', size = 'sm' }) {
  const imageSrc = previewUrl || getCategoryImageUrl(imagePath);

  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden border border-neutral-200 bg-neutral-100 text-neutral-400',
        size === 'lg' ? 'size-24' : 'size-12',
      )}
    >
      {imageSrc ? (
        <img className="size-full object-cover" src={imageSrc} alt={`Foto de ${name || 'categoría'}`} />
      ) : (
        <ImageIcon className={cn(size === 'lg' ? 'size-9' : 'size-5')} strokeWidth={1.8} aria-hidden="true" />
      )}
    </div>
  );
}

function CategoryImageInput({ disabled, error, form, onSelectFile }) {
  const inputRef = useRef(null);
  const imageSrc = form.imagePreviewUrl || getCategoryImageUrl(form.imagePath);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateCategoryImage(file);

    if (validationError) {
      onSelectFile(null, validationError);
      event.target.value = '';
      return;
    }

    onSelectFile(file, '');
    event.target.value = '';
  }

  return (
    <div className="grid gap-2">
      <Label>Foto de la categoría</Label>
      <button
        className="flex min-h-24 w-full items-center gap-4 border border-dashed border-neutral-300 bg-white p-4 text-left transition-colors hover:border-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <CategoryThumbnail imagePath={form.imagePath} name={form.name} previewUrl={form.imagePreviewUrl} size="lg" />
        <span>
          <span className="block text-sm font-bold text-neutral-950">{imageSrc ? 'Cambiar foto' : 'Agregar foto'}</span>
          <span className="mt-1 block text-xs leading-5 text-neutral-500">JPG, PNG o WebP. Máx. 2 MB</span>
        </span>
      </button>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}

function CategoryFormPanel({
  errors,
  form,
  isEditMode,
  isSaving,
  onCancel,
  onChange,
  onImageChange,
  onSubmit,
}) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white shadow-none lg:shadow-[0_16px_50px_rgba(15,15,15,0.06)]">
      <CardHeader className="flex-row items-center justify-between border-neutral-200 px-5 sm:px-6">
        <CardTitle>{isEditMode ? 'Editar categoría' : 'Añadir categoría'}</CardTitle>
        <IconButton
          className="size-9 rounded-none hover:bg-neutral-50"
          disabled={isSaving}
          label="Cerrar formulario de categoría"
          onClick={onCancel}
        >
          <X className="size-5" aria-hidden="true" />
        </IconButton>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 sm:p-6">
        <CategoryImageInput disabled={isSaving} error={errors.image} form={form} onSelectFile={onImageChange} />

        <FormField error={errors.name} htmlFor="category-name" label="Nombre de la categoría">
          <Input
            className="rounded-none border-neutral-200 bg-white"
            disabled={isSaving}
            id="category-name"
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Ej: Pizzas"
            value={form.name}
          />
        </FormField>

        <FormField error={errors.displayOrder} htmlFor="category-order" label="Orden de aparición">
          <Input
            className="rounded-none border-neutral-200 bg-white"
            disabled={isSaving}
            id="category-order"
            min="1"
            onChange={(event) => onChange('displayOrder', event.target.value)}
            step="1"
            type="number"
            value={form.displayOrder}
          />
        </FormField>

        <SwitchField
          checked={form.isActive}
          disabled={isSaving}
          label="Categoría activa"
          onCheckedChange={(value) => onChange('isActive', value)}
        />

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button disabled={isSaving} onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isSaving} onClick={onSubmit} type="button">
            {isSaving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryMobileCard({ category, onEdit, productCount }) {
  return (
    <Card className="rounded-none border-neutral-200 bg-white">
      <CardContent className="grid gap-4 p-4">
        <div className="flex items-start gap-4">
          <CategoryThumbnail imagePath={category.image_path} name={category.name} />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-neutral-950">{category.name}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-500">
              <span>Productos: {productCount}</span>
              <span>Orden: {category.display_order}</span>
            </div>
          </div>
          <CategoryStatus isActive={category.is_active} />
        </div>
        <Button className="w-full" onClick={() => onEdit(category)} type="button" variant="secondary">
          Editar
        </Button>
      </CardContent>
    </Card>
  );
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

  const renderTableBody = () => {
    if (isLoading) {
      return <TableStateRow colSpan={6}>Cargando categorías...</TableStateRow>;
    }

    if (!loadError && filteredCategories.length === 0) {
      return <TableStateRow colSpan={6}>{emptyCategoriesMessage}</TableStateRow>;
    }

    return filteredCategories.map((category) => (
      <TableRow key={category.id}>
        <TableCell>
          <CategoryThumbnail imagePath={category.image_path} name={category.name} />
        </TableCell>
        <TableCell className="font-bold text-neutral-950">{category.name}</TableCell>
        <TableCell>{getProductCount(category.id, productStats.counts)}</TableCell>
        <TableCell>{category.display_order}</TableCell>
        <TableCell>
          <CategoryStatus isActive={category.is_active} />
        </TableCell>
        <TableCell className="sticky right-0 bg-white text-right shadow-[-16px_0_18px_-22px_rgba(15,15,15,0.8)]">
          <Button
            className="whitespace-nowrap"
            disabled={isSaving}
            onClick={() => handleEditCategory(category)}
            size="sm"
            type="button"
            variant="secondary"
          >
            Editar
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

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
          <Card className="hidden overflow-hidden rounded-none border-neutral-200 bg-white lg:block">
            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                    <TableHead>Foto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="sticky right-0 z-10 bg-neutral-50 text-right shadow-[-16px_0_18px_-22px_rgba(15,15,15,0.8)]">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTableBody()}</TableBody>
              </Table>
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <span className="text-sm text-neutral-500">
                Mostrando {filteredCategories.length === 0 ? 0 : 1} a {filteredCategories.length} de {filteredCategories.length} categorías
              </span>
              <div className="flex items-center gap-1">
                <Button className="size-10 min-h-10 p-0" disabled size="icon" type="button" variant="secondary">
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </Button>
                <Button className="size-10 min-h-10 p-0" disabled={isLoading} size="icon" type="button">
                  1
                </Button>
                <Button className="size-10 min-h-10 p-0" disabled size="icon" type="button" variant="secondary">
                  <ChevronRight className="size-5" aria-hidden="true" />
                </Button>
              </div>
            </footer>
          </Card>

          <section className="grid gap-4 lg:hidden" aria-label="Categorías">
            {isLoading ? <LoadingState message="Cargando categorías..." /> : null}
            {!isLoading && !loadError && filteredCategories.length === 0 ? (
              <EmptyState title={emptyCategoriesMessage} />
            ) : null}
            {!isLoading
              ? filteredCategories.map((category) => (
                  <CategoryMobileCard
                    category={category}
                    key={category.id}
                    onEdit={handleEditCategory}
                    productCount={getProductCount(category.id, productStats.counts)}
                  />
                ))
              : null}
          </section>
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
