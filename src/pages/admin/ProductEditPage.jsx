import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, Save, Trash2, Upload } from 'lucide-react';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { getCategories } from '@/services/categories.service.js';
import {
  createProduct,
  deleteProductImage,
  getProductById,
  getProductImageUrl,
  updateProduct,
  uploadProductImage,
  validateProductImage,
} from '@/services/products.service.js';
import { cn } from '@/lib/utils';

const emptyProductForm = {
  category_id: '',
  name: '',
  short_description: '',
  price: '',
  description: '',
  image_path: '',
  imageFile: null,
  imagePreviewUrl: '',
  removeImage: false,
  is_active: true,
  visible_in_menu: true,
  quick_access: false,
  track_stock: false,
  stock: '0',
};

function getInitialForm(product) {
  return {
    category_id: product.category_id ?? '',
    name: product.name ?? '',
    short_description: product.short_description ?? '',
    price: String(Number(product.price ?? 0).toFixed(2)),
    description: product.description ?? '',
    image_path: product.image_path ?? '',
    imageFile: null,
    imagePreviewUrl: '',
    removeImage: false,
    is_active: Boolean(product.is_active),
    visible_in_menu: Boolean(product.visible_in_menu),
    quick_access: Boolean(product.quick_access),
    track_stock: Boolean(product.track_stock),
    stock: String(product.stock ?? 0),
  };
}

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <p className="text-xs font-medium leading-5 text-red-700">{children}</p>;
}

function FormField({ children, className, error, label }) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label>{label}</Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}

function SwitchRow({ checked, description, disabled, label, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-950">{label}</p>
        {description ? <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p> : null}
      </div>
      <Switch checked={checked} disabled={disabled} onClick={() => onCheckedChange(!checked)} />
    </div>
  );
}

export function ProductEditPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(productId);
  const imageInputRef = useRef(null);
  const previewUrlRef = useRef('');
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyProductForm);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const revokeImagePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadFormData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const [nextCategories, currentProduct] = await Promise.all([
          getCategories(),
          isEditMode ? getProductById(productId) : Promise.resolve(null),
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(nextCategories);
        setProduct(currentProduct);
        setForm(isEditMode && currentProduct ? getInitialForm(currentProduct) : emptyProductForm);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCategories([]);
        setProduct(null);
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el producto.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFormData();

    return () => {
      isMounted = false;
      revokeImagePreview();
    };
  }, [isEditMode, productId, revokeImagePreview]);

  const imageSrc = form.imagePreviewUrl || (!form.removeImage ? getProductImageUrl(form.image_path) : '');
  const pageTitle = isEditMode ? 'Editar producto' : 'Nuevo producto';
  const pageDescription = isEditMode
    ? 'Gestioná la información visible en la carta digital.'
    : 'Cargá la información visible en la carta digital.';
  const submitLabel = isEditMode ? 'Guardar cambios' : 'Crear producto';

  const categoryOptions = useMemo(() => {
    return categories
      .filter((category) => category.is_active || category.id === form.category_id)
      .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }, [categories, form.category_id]);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
    setSaveError('');
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateProductImage(file);

    if (validationError) {
      setErrors((currentErrors) => ({ ...currentErrors, image: validationError }));
      event.target.value = '';
      return;
    }

    revokeImagePreview();
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setForm((currentForm) => ({
      ...currentForm,
      imageFile: file,
      imagePreviewUrl: previewUrl,
      removeImage: false,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, image: '' }));
    setSaveError('');
    event.target.value = '';
  }

  function handleRemoveImage() {
    revokeImagePreview();
    setForm((currentForm) => ({
      ...currentForm,
      imageFile: null,
      imagePreviewUrl: '',
      image_path: '',
      removeImage: true,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, image: '' }));
    setSaveError('');
  }

  function validateForm() {
    const nextErrors = {};
    const normalizedPrice = Number(form.price);
    const normalizedStock = Number(form.stock);
    const imageError = form.imageFile ? validateProductImage(form.imageFile) : '';

    if (!form.name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.';
    }

    if (!form.category_id) {
      nextErrors.category_id = 'Seleccioná una categoría.';
    }

    if (form.price.trim() === '') {
      nextErrors.price = 'El precio es obligatorio.';
    } else if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      nextErrors.price = 'El precio debe ser mayor o igual a 0.';
    }

    if (form.track_stock && (form.stock.trim() === '' || Number.isNaN(normalizedStock) || !Number.isInteger(normalizedStock) || normalizedStock < 0)) {
      nextErrors.stock = 'El stock actual debe ser un entero mayor o igual a 0.';
    }

    if (imageError) {
      nextErrors.image = imageError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function getPayload() {
    return {
      category_id: form.category_id,
      name: form.name.trim(),
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      price: Number(form.price),
      is_active: form.is_active,
      visible_in_menu: form.visible_in_menu,
      quick_access: form.quick_access,
      track_stock: form.track_stock,
      stock: form.track_stock ? Number(form.stock) : 0,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSaving || !validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      if (isEditMode) {
        let uploadedImagePath = '';
        const oldImagePath = product?.image_path ?? '';
        const nextImagePath = form.imageFile
          ? await uploadProductImage(form.imageFile, productId).then((imagePath) => {
              uploadedImagePath = imagePath;
              return imagePath;
            })
          : form.removeImage
            ? null
            : oldImagePath || null;

        try {
          await updateProduct(productId, {
            ...getPayload(),
            image_path: nextImagePath,
          });
        } catch (error) {
          if (uploadedImagePath) {
            await deleteProductImage(uploadedImagePath).catch(() => {});
          }

          throw error;
        }

        if ((uploadedImagePath || form.removeImage) && oldImagePath) {
          await deleteProductImage(oldImagePath).catch(() => {});
        }
      } else {
        const createdProduct = await createProduct({
          ...getPayload(),
          image_path: null,
        });

        if (form.imageFile) {
          let uploadedImagePath = '';

          try {
            uploadedImagePath = await uploadProductImage(form.imageFile, createdProduct.id);
            await updateProduct(createdProduct.id, { image_path: uploadedImagePath });
          } catch (error) {
            if (uploadedImagePath) {
              await deleteProductImage(uploadedImagePath).catch(() => {});
            }

            throw error;
          }
        }
      }

      navigate('/admin/productos');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPageContainer>
        <p className="text-sm text-neutral-500">Cargando producto...</p>
      </AdminPageContainer>
    );
  }

  if (loadError) {
    return (
      <AdminPageContainer>
        <Alert variant="destructive" title="No se pudo cargar el producto">
          {loadError}
        </Alert>
        <Button className="w-fit" onClick={() => navigate('/admin/productos')} type="button" variant="secondary">
          Volver a Productos
        </Button>
      </AdminPageContainer>
    );
  }

  if (isEditMode && !product) {
    return (
      <AdminPageContainer>
        <div className="max-w-xl border border-neutral-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-neutral-950">Producto no encontrado</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">No pudimos encontrar el producto solicitado.</p>
          <Button className="mt-5" onClick={() => navigate('/admin/productos')} type="button" variant="secondary">
            Volver a Productos
          </Button>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <AdminPageContainer className="pb-24">
        <header className="grid gap-2">
          <NavLink
            className="inline-flex w-max items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
            to="/admin/productos"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver a Productos
          </NavLink>
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-neutral-950 sm:text-[28px]">{pageTitle}</h1>
            <p className="mt-1 text-sm leading-5 text-neutral-500 sm:text-base">{pageDescription}</p>
          </div>
        </header>

        {saveError ? (
          <Alert variant="destructive" title="No se pudo guardar el producto">
            {saveError}
          </Alert>
        ) : null}

        <div className="grid gap-6 items-start xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-6">
            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-11 border-neutral-200 px-4 py-3">
                <CardTitle>Información principal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-4">
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
                  <FormField error={errors.name} label="Nombre del producto">
                    <Input
                      className="rounded-none border-neutral-200 bg-white"
                      disabled={isSaving}
                      onChange={(event) => updateField('name', event.target.value)}
                      value={form.name}
                    />
                  </FormField>

                  <FormField error={errors.category_id} label="Categoría">
                    <select
                      className="flex min-h-11 w-full rounded-none border border-neutral-200 bg-white px-4 text-base text-foreground outline-none transition-colors hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:bg-neutral-50"
                      disabled={isSaving}
                      onChange={(event) => updateField('category_id', event.target.value)}
                      value={form.category_id}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                          {!category.is_active ? ' (inactiva)' : ''}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
                  <FormField error={errors.short_description} label="Descripción breve">
                    <Textarea
                      className="h-11 min-h-11 py-2 resize-none rounded-none border-neutral-200 bg-white"
                      disabled={isSaving}
                      maxLength={100}
                      onChange={(event) => updateField('short_description', event.target.value)}
                      value={form.short_description}
                    />
                  </FormField>

                  <FormField error={errors.price} label="Precio">
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-3.5 left-4 flex text-sm font-bold leading-none text-neutral-500">
                        <DollarSign aria-hidden="true" size={16} strokeWidth={2.2} />
                      </span>
                      <Input
                        className="h-11 min-h-11 rounded-none border-neutral-200 bg-white pl-8"
                        disabled={isSaving}
                        min="0"
                        onChange={(event) => updateField('price', event.target.value)}
                        step="0.01"
                        type="number"
                        value={form.price}
                      />
                    </div>
                  </FormField>
                </div>

                <FormField label="Descripción completa">
                  <Textarea
                    className="min-h-20 resize-none rounded-none border-neutral-200 bg-white"
                    disabled={isSaving}
                    maxLength={500}
                    onChange={(event) => updateField('description', event.target.value)}
                    value={form.description}
                  />  
                </FormField>
              </CardContent>
            </Card>

            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-11 border-neutral-200 px-4 py-3">
                <CardTitle>Inventario simple</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <Label className="min-w-36">Controlar stock</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.track_stock} disabled={isSaving} onClick={() => updateField('track_stock', !form.track_stock)} />
                    <span className="text-sm text-neutral-500">{form.track_stock ? 'Activado' : 'Desactivado'}</span>
                  </div>
                </div>

                <FormField className="sm:grid-cols-[140px_minmax(0,1fr)] sm:items-start" error={errors.stock} label="Stock actual">
                  <div className="grid gap-2">
                    <Input
                      className="rounded-none border-neutral-200 bg-white disabled:bg-neutral-50"
                      disabled={!form.track_stock || isSaving}
                      min="0"
                      onChange={(event) => updateField('stock', event.target.value)}
                      type="number"
                      value={form.stock}
                    />
                    <p className="text-sm leading-5 text-neutral-500">
                      Usá este campo solo si querés controlar unidades disponibles.
                    </p>
                  </div>
                </FormField>
              </CardContent>
            </Card>
          </div>

          <aside className="grid h-max gap-4">
            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-11 border-neutral-200 px-4 py-3">
                <CardTitle>Imagen del producto</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 sm:p-6">
                {/* <div className="aspect-[4/3] overflow-hidden border border-neutral-200 bg-neutral-100"> */}
                <div className="h-44 overflow-hidden border border-neutral-200 bg-neutral-100 sm:h-48 xl:h-52">
                  {imageSrc ? (
                    <img className="size-full object-cover" src={imageSrc} alt={form.name || 'Imagen del producto'} />
                  ) : (
                    <div className="grid size-full place-items-center text-sm text-neutral-400">Sin imagen</div>
                  )}
                </div>

                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isSaving}
                  onChange={handleImageChange}
                  ref={imageInputRef}
                  type="file"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="h-9 w-full px-3 text-xs"
                    disabled={isSaving}
                    onClick={() => imageInputRef.current?.click()}
                    type="button"
                  >
                    <Upload className="size-4" aria-hidden="true" />
                    Cambiar
                  </Button>

                  <Button
                    className="h-9 w-full px-3 text-xs"
                    disabled={isSaving || !imageSrc}
                    onClick={handleRemoveImage}
                    type="button"
                    variant="secondary"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Quitar
                  </Button>
                </div>
                <FieldError>{errors.image}</FieldError>

                <p className="text-xs leading-5 text-neutral-500">
                  Formatos recomendados: JPG, PNG o WebP.
                  <br />
                  Tamaño recomendado: 800x800px. Máx. 2MB.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-none border-neutral-200 bg-white">
              <CardHeader className="min-h-11 border-neutral-200 px-4 py-3">
                <CardTitle>Configuración del producto</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <SwitchRow
                  checked={form.is_active}
                  disabled={isSaving}
                  label="Producto activo"
                  onCheckedChange={(value) => updateField('is_active', value)}
                />
                <Separator />
                <SwitchRow
                  checked={form.visible_in_menu}
                  disabled={isSaving}
                  label="Visible en carta digital"
                  onCheckedChange={(value) => updateField('visible_in_menu', value)}
                />
                <Separator />
                <SwitchRow
                  checked={form.quick_access}
                  disabled={isSaving}
                  label="Acceso rápido"
                  onCheckedChange={(value) => updateField('quick_access', value)}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </AdminPageContainer>

      <div className="sticky bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isSaving} onClick={() => navigate('/admin/productos')} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isSaving} type="submit">
            <Save className="size-4" aria-hidden="true" />
            {isSaving ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
