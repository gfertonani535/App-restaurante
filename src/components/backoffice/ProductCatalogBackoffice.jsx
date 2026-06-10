import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, Filter, Plus } from 'lucide-react';
import { PriceInlineEditor } from '@/components/backoffice/PriceInlineEditor.jsx';
import { AdminPageContainer } from '@/components/common/AdminPageContainer.jsx';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const productImages = import.meta.glob('../../assets/productos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const productCategories = {
  'pizza-margherita': 'Pizzas',
  'hamburguesa-gourmet': 'Hamburguesas',
  'lomo-completo': 'Lomos',
  sorrentinos: 'Pastas',
  empanadas: 'Empanadas',
  'flan-casero': 'Postres',
};

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

function getProductImage(imageName) {
  return productImages[`../../assets/productos/${imageName}`] ?? '';
}

function parsePrice(price) {
  if (typeof price === 'number') {
    return price;
  }

  return Number(String(price).replace('$', '').trim()) || 0;
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function getProductSku(productId) {
  return productId.replaceAll('-', '').slice(0, 3).toUpperCase() + '-' + productId.length.toString().padStart(3, '0');
}

function normalizeMenuProduct(product) {
  return {
    ...product,
    category: productCategories[product.id] ?? 'General',
    imageSrc: getProductImage(product.image),
    price: parsePrice(product.price),
    sku: getProductSku(product.id),
    status: 'Activo',
    statusTone: 'success',
  };
}

function persistProductPrice(productId, price) {
  return { productId, price, status: 'mock-saved' };
}

function ProductStatus({ tone, label }) {
  return (
    <Badge className="gap-2 text-sm normal-case tracking-normal" variant={statusVariants[tone]}>
      <span className={cn('size-1.5 rounded-full', statusDotStyles[tone])} aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function ProductCatalogBackoffice() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPriceProductId, setEditingPriceProductId] = useState(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    fetch('/data/productos.json')
      .then((response) => response.json())
      .then((menuProducts) => {
        setProducts(Array.isArray(menuProducts) ? menuProducts.map(normalizeMenuProduct) : []);
        setCurrentPage(1);
      })
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) =>
      `${product.name} ${product.category} ${product.description ?? ''} ${product.sku}`.toLowerCase().includes(normalizedSearch),
    );
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredProducts]);

  const averagePrice = useMemo(() => {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    return products.length > 0 ? total / products.length : 0;
  }, [products]);

  const firstVisibleItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastVisibleItem = Math.min(currentPage * PAGE_SIZE, filteredProducts.length);

  const stats = [
    { label: 'Total productos', value: String(products.length), meta: `M\u00e1ximo ${PAGE_SIZE} por p\u00e1gina`, tone: 'success' },
    { label: 'Precio promedio', value: formatPrice(averagePrice), meta: 'Calculado desde el men\u00fa', tone: 'muted' },
    { label: 'Productos activos', value: String(products.length).padStart(2, '0'), meta: 'Visibles en carta', tone: 'warning' },
  ];

  function handleStartEditPrice(product) {
    setEditingPriceProductId(product.id);
    setDraftPrice(product.price.toFixed(2));
    setPriceError('');
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }

  function handleCancelEditPrice() {
    setEditingPriceProductId(null);
    setDraftPrice('');
    setPriceError('');
  }

  function handleSavePrice(productId) {
    const normalizedDraft = draftPrice.trim();
    const nextPrice = Number(normalizedDraft);

    if (normalizedDraft === '') {
      setPriceError('El precio no puede estar vac\u00edo.');
      return;
    }

    if (Number.isNaN(nextPrice) || nextPrice < 0) {
      setPriceError('Ingres\u00e1 un precio v\u00e1lido mayor o igual a 0.');
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === productId ? { ...product, price: nextPrice } : product)),
    );
    persistProductPrice(productId, nextPrice);
    handleCancelEditPrice();
  }

  return (
    <AdminPageContainer>
      <PageHeader
        description={'Gestion\u00e1 los productos visibles en el men\u00fa digital.'}
        onSearchChange={handleSearchChange}
        primaryAction={
          <NavLink
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-[0.05em] text-primary-foreground transition-colors hover:bg-[#1c1b1b]"
            to="/admin/productos/nuevo"
          >
            <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
            {'A\u00f1adir producto'}
          </NavLink>
        }
        searchPlaceholder="Buscar productos..."
        searchValue={searchTerm}
        secondaryActions={
          <>
          <Button size="sm" type="button" variant="secondary">
            <Filter className="size-4" strokeWidth={2} aria-hidden="true" />
            Filtrar
          </Button>
          <Button size="sm" type="button" variant="secondary">
            <Download className="size-4" strokeWidth={2} aria-hidden="true" />
            Exportar
          </Button>
          </>
        }
        title={'Cat\u00e1logo de Productos'}
      />

      <Card className="hidden overflow-hidden rounded-none border-neutral-200 bg-white lg:block">
        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="border-neutral-200 bg-neutral-50 hover:bg-neutral-50">
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>{'Categor\u00eda'}</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="size-12 overflow-hidden border border-neutral-200 bg-neutral-100">
                      <img className="size-full object-cover" src={product.imageSrc} alt={product.imageAlt} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-base font-bold text-neutral-950">{product.name}</div>
                    <div className="text-xs font-medium text-neutral-400">SKU: {product.sku}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <PriceInlineEditor
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
                    <ProductStatus label={product.status} tone={product.statusTone} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" type="button" variant="secondary">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
          <span className="text-sm text-neutral-500">
            Mostrando {firstVisibleItem} a {lastVisibleItem} de {filteredProducts.length} productos
          </span>
          <div className="flex items-center gap-1">
            <Button
              className="size-10 min-h-10 p-0"
              disabled={currentPage === 1}
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
              disabled={currentPage === totalPages}
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
        {paginatedProducts.map((product) => (
          <Card className="rounded-none border-neutral-200 bg-white" key={product.id}>
            <CardContent className="grid gap-4 p-4">
              <div className="flex items-start gap-4">
                <div className="size-16 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img className="size-full object-cover" src={product.imageSrc} alt={product.imageAlt} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold leading-tight text-neutral-950">{product.name}</h2>
                  <p className="mt-1 text-xs font-medium text-neutral-400">SKU: {product.sku}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    <ProductStatus label={product.status} tone={product.statusTone} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <PriceInlineEditor
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
                <Button className="w-full sm:w-auto" size="sm" type="button" variant="secondary">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <footer className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 bg-white px-4 py-3">
          <span className="text-sm text-neutral-500">
            Mostrando {firstVisibleItem} a {lastVisibleItem} de {filteredProducts.length} productos
          </span>
          <div className="flex items-center gap-1">
            <Button
              className="size-10 min-h-10 p-0"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              size="icon"
              type="button"
              variant="secondary"
            >
              <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button className="size-10 min-h-10 p-0" size="icon" type="button">
              {currentPage}
            </Button>
            <Button
              className="size-10 min-h-10 p-0"
              disabled={currentPage === totalPages}
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
