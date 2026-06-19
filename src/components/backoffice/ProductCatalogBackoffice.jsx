import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, Plus, Search } from 'lucide-react';
import { PriceInlineEditor } from '@/components/backoffice/PriceInlineEditor.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { getCategories } from '@/services/categories.service.js';
import { getProductImageUrl, getProducts, updateProductPrice } from '@/services/products.service.js';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const statusVariants = {
  success: 'success',
  warning: 'warning',
  muted: 'muted',
};

const statusDotStyles = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  muted: 'bg-neutral-300',
};

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getProductSku(product) {
  return product.sku || '-';
}

function getCategoryLabel(product) {
  return product.category?.name || 'Sin categoría';
}

function getProductStatus(product) {
  if (!product.is_active) {
    return { label: 'Inactivo', tone: 'muted' };
  }

  return { label: 'Activo', tone: 'success' };
}

function ProductStatus({ tone, label }) {
  return (
    <Badge className="gap-2 text-sm normal-case tracking-normal" variant={statusVariants[tone]}>
      <span className={cn('size-1.5 rounded-full', statusDotStyles[tone])} aria-hidden="true" />
      {label}
    </Badge>
  );
}

function ProductImage({ product, size = 'sm' }) {
  const imageSrc = getProductImageUrl(product.image_path);

  return (
    <div className={cn('shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100', size === 'lg' ? 'size-16' : 'size-12')}>
      {imageSrc ? (
        <img className="size-full object-cover" src={imageSrc} alt={product.name} />
      ) : (
        <div className="grid size-full place-items-center text-[10px] font-bold uppercase tracking-[0.05em] text-neutral-400">
          Sin imagen
        </div>
      )}
    </div>
  );
}

export function ProductCatalogBackoffice() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPriceProductId, setEditingPriceProductId] = useState(null);
  const [savingPriceProductId, setSavingPriceProductId] = useState(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setLoadError('');

      try {
        const [nextProducts, nextCategories] = await Promise.all([getProducts(), getCategories()]);

        if (!isMounted) {
          return;
        }

        setProducts(nextProducts);
        setCategories(nextCategories);
        setCurrentPage(1);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setProducts([]);
        setCategories([]);
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los productos.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
      const searchableText = normalizeText(
        `${product.name} ${getCategoryLabel(product)} ${product.short_description ?? ''} ${product.description ?? ''} ${getProductSku(product)}`,
      );
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredProducts, totalPages]);

  const averagePrice = useMemo(() => {
    const total = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
    return products.length > 0 ? total / products.length : 0;
  }, [products]);

  const activeProducts = products.filter((product) => product.is_active).length;
  const visibleProducts = products.filter((product) => product.visible_in_menu).length;
  const firstVisibleItem = filteredProducts.length === 0 ? 0 : (Math.min(currentPage, totalPages) - 1) * PAGE_SIZE + 1;
  const lastVisibleItem = Math.min(Math.min(currentPage, totalPages) * PAGE_SIZE, filteredProducts.length);

  const stats = [
    { label: 'Total productos', value: String(products.length), meta: `Máximo ${PAGE_SIZE} por página`, tone: 'success' },
    { label: 'Precio promedio', value: formatPrice(averagePrice), meta: 'Calculado desde Supabase', tone: 'muted' },
    { label: 'Productos activos', value: String(activeProducts).padStart(2, '0'), meta: `${visibleProducts} visibles`, tone: 'warning' },
  ];
  const emptyProductsMessage = products.length === 0 ? 'Todavía no hay productos.' : 'No encontramos productos para tu búsqueda.';

  function handleStartEditPrice(product) {
    setEditingPriceProductId(product.id);
    setDraftPrice(Number(product.price || 0).toFixed(2));
    setPriceError('');
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }

  function handleCategoryFilterChange(value) {
    setCategoryFilter(value);
    setCurrentPage(1);
  }

  function handleCancelEditPrice() {
    setEditingPriceProductId(null);
    setDraftPrice('');
    setPriceError('');
  }

  async function handleSavePrice(productId) {
    if (savingPriceProductId) {
      return;
    }

    const normalizedDraft = draftPrice.trim();
    const nextPrice = Number(normalizedDraft);

    if (normalizedDraft === '') {
      setPriceError('El precio no puede estar vacío.');
      return;
    }

    if (Number.isNaN(nextPrice) || nextPrice < 0) {
      setPriceError('Ingresá un precio válido mayor o igual a 0.');
      return;
    }

    setSavingPriceProductId(productId);
    setPriceError('');

    try {
      const updatedProduct = await updateProductPrice(productId, nextPrice);

      setProducts((currentProducts) =>
        currentProducts.map((product) => (product.id === productId ? { ...product, ...updatedProduct } : product)),
      );
      handleCancelEditPrice();
    } catch (error) {
      setPriceError(error instanceof Error ? error.message : 'No se pudo actualizar el precio.');
    } finally {
      setSavingPriceProductId(null);
    }
  }

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell className="py-10 text-center text-neutral-500" colSpan={6}>
            Cargando productos...
          </TableCell>
        </TableRow>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <TableRow>
          <TableCell className="py-10 text-center text-neutral-500" colSpan={6}>
            {emptyProductsMessage}
          </TableCell>
        </TableRow>
      );
    }

    return paginatedProducts.map((product) => {
      const status = getProductStatus(product);

      return (
        <TableRow key={product.id}>
          <TableCell>
            <ProductImage product={product} />
          </TableCell>
          <TableCell>
            <div className="text-base font-bold text-neutral-950">{product.name}</div>
            <div className="text-xs font-medium text-neutral-400">SKU: {getProductSku(product)}</div>
          </TableCell>
          <TableCell>
            <Badge variant="secondary">{getCategoryLabel(product)}</Badge>
          </TableCell>
          <TableCell>
            <PriceInlineEditor
              disabled={savingPriceProductId === product.id}
              draftValue={draftPrice}
              error={editingPriceProductId === product.id ? priceError : ''}
              isEditing={editingPriceProductId === product.id}
              onCancel={handleCancelEditPrice}
              onDraftChange={(value) => {
                setDraftPrice(value);
                setPriceError('');
              }}
              onSave={handleSavePrice}
              onStartEdit={() => handleStartEditPrice(product)}
              productId={product.id}
              value={formatPrice(product.price)}
            />
          </TableCell>
          <TableCell>
            <ProductStatus label={status.label} tone={status.tone} />
          </TableCell>
          <TableCell className="text-right">
            <NavLink
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-bold uppercase leading-none tracking-[0.05em] text-primary transition-colors hover:border-primary"
              to={`/admin/productos/${product.id}/editar`}
            >
              Editar
            </NavLink>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <AdminPageContainer className="max-w-[1200px] space-y-6">
      <PageHeader
        description="Gestioná los productos visibles en el menú digital."
        title="Catálogo de Productos"
      />

      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <Input
              aria-label="Buscar productos..."
              className="h-11 min-h-11 rounded-none border-neutral-200 bg-white pl-10 text-sm"
              onChange={handleSearchChange}
              placeholder="Buscar productos..."
              type="search"
              value={searchTerm}
            />
          </label>



          <Select
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
            disabled={isLoading}
          >
            <SelectTrigger
              aria-label="Filtrar por categoría"
              className="h-11 w-full rounded-md border shadow-none  border-neutral-200 bg-white font-bold outline-none px-3 text-xs uppercase tracking-[0.05em] text-primary sm:w-[180px]"
            >
              <div className="flex items-center gap-2">
                <Filter className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <SelectValue placeholder="Todas" />
              </div>
            </SelectTrigger>

            <SelectContent align="start">
              <SelectItem value="all" className="text-xs font-bold uppercase">
                Todas
              </SelectItem>

              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="text-xs font-bold uppercase"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>





        </div>




        <NavLink
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-[0.05em] text-primary-foreground transition-colors hover:bg-[#1c1b1b] sm:w-auto"
          to="/admin/productos/nuevo"
        >
          <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
          Añadir producto
        </NavLink>
      </section>

      {loadError ? (
        <Alert variant="destructive" title="No se pudieron cargar los productos">
          <div className="grid gap-3">
            <p>{loadError}</p>
            <Button className="w-fit" onClick={() => setReloadKey((currentKey) => currentKey + 1)} size="sm" type="button">
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card className="hidden overflow-hidden rounded-none border-neutral-200 bg-white lg:block">
        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="border-neutral-200 bg-neutral-50 hover:bg-neutral-50">
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableBody()}</TableBody>
          </Table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
          <span className="text-sm text-neutral-500">
            Mostrando {firstVisibleItem} a {lastVisibleItem} de {filteredProducts.length} productos
          </span>
          <div className="flex items-center gap-1">
            <Button
              className="size-10 min-h-10 p-0"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              size="icon"
              type="button"
              variant="secondary"
            >
              <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
            </Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <Button
                className="size-10 min-h-10 p-0"
                disabled={isLoading}
                key={page}
                onClick={() => setCurrentPage(page)}
                size="icon"
                type="button"
                variant={currentPage === page ? 'default' : 'secondary'}
              >
                {page}
              </Button>
            ))}
            <Button
              className="size-10 min-h-10 p-0"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              size="icon"
              type="button"
              variant="secondary"
            >
              <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </footer>
      </Card>

      <section className="grid gap-4 lg:hidden" aria-label="Productos">
        {isLoading ? <Card className="rounded-none border-neutral-200 bg-white p-6 text-sm text-neutral-500">Cargando productos...</Card> : null}
        {!isLoading && filteredProducts.length === 0 ? (
          <Card className="rounded-none border-neutral-200 bg-white p-6 text-sm text-neutral-500">{emptyProductsMessage}</Card>
        ) : null}
        {!isLoading
          ? paginatedProducts.map((product) => {
              const status = getProductStatus(product);

              return (
                <Card className="rounded-none border-neutral-200 bg-white" key={product.id}>
                  <CardContent className="grid gap-4 p-4">
                    <div className="flex items-start gap-4">
                      <ProductImage product={product} size="lg" />
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold leading-tight text-neutral-950">{product.name}</h2>
                        <p className="mt-1 text-xs font-medium text-neutral-400">SKU: {getProductSku(product)}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{getCategoryLabel(product)}</Badge>
                          <ProductStatus label={status.label} tone={status.tone} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <PriceInlineEditor
                        disabled={savingPriceProductId === product.id}
                        draftValue={draftPrice}
                        error={editingPriceProductId === product.id ? priceError : ''}
                        isEditing={editingPriceProductId === product.id}
                        onCancel={handleCancelEditPrice}
                        onDraftChange={(value) => {
                          setDraftPrice(value);
                          setPriceError('');
                        }}
                        onSave={handleSavePrice}
                        onStartEdit={() => handleStartEditPrice(product)}
                        productId={product.id}
                        value={formatPrice(product.price)}
                      />
                      <NavLink
                        className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-bold uppercase leading-none tracking-[0.05em] text-primary transition-colors hover:border-primary sm:w-auto"
                        to={`/admin/productos/${product.id}/editar`}
                      >
                        Editar
                      </NavLink>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          : null}

        <footer className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 bg-white px-4 py-3">
          <span className="text-sm text-neutral-500">
            Mostrando {firstVisibleItem} a {lastVisibleItem} de {filteredProducts.length} productos
          </span>
          <div className="flex items-center gap-1">
            <Button
              className="size-10 min-h-10 p-0"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              size="icon"
              type="button"
              variant="secondary"
            >
              <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button className="size-10 min-h-10 p-0" disabled={isLoading} size="icon" type="button">
              {currentPage}
            </Button>
            <Button
              className="size-10 min-h-10 p-0"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              size="icon"
              type="button"
              variant="secondary"
            >
              <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </footer>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card className="rounded-none border-neutral-200 bg-white" key={stat.label}>
            <CardContent className="p-6">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.05em] text-neutral-400">{stat.label}</p>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-5xl font-semibold leading-none tracking-normal text-neutral-950">{stat.value}</span>
                <span
                  className={cn(
                    'text-sm font-bold',
                    stat.tone === 'success' && 'text-emerald-600',
                    stat.tone === 'warning' && 'text-amber-600',
                    stat.tone === 'muted' && 'text-neutral-400',
                  )}
                >
                  {stat.meta}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </AdminPageContainer>
  );
}
