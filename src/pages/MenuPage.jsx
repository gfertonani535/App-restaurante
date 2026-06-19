import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CategoryFilter } from '@/components/landing/CategoryFilter.jsx';
import { Hero } from '@/components/landing/Hero.jsx';
import { PublicMenuFooter } from '@/components/landing/PublicMenuFooter.jsx';
import { AppShell } from '@/components/layouts/AppShell.jsx';
import { CardProducts } from '@/components/products/CardProducts.jsx';
import { ProductDetailDrawer } from '@/components/products/ProductDetailDrawer.jsx';
import { Alert } from '@/components/ui/alert.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { getPublicCatalog } from '@/services/menu.service.js';

function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function ProductSkeleton() {
  return (
    <div className="h-32 animate-pulse overflow-hidden rounded-md border border-border bg-card">
      <div className="flex h-full">
        <div className="h-full basis-24 shrink-0 p-2">
          <div className="h-full w-full rounded-md bg-neutral-200" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3">
          <div className="h-5 w-3/4 rounded bg-neutral-200" />
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-2/3 rounded bg-neutral-100" />
          <div className="mt-auto h-5 w-20 self-end rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export function MenuPage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const closeProductDetailTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      setIsLoading(true);
      setLoadError('');

      try {
        const catalog = await getPublicCatalog();

        if (!isMounted) {
          return;
        }

        setCategorias(catalog.categories);
        setProductos(catalog.products);
        setActiveCategoryId('all');
      } catch {
        if (!isMounted) {
          return;
        }

        setCategorias([]);
        setProductos([]);
        setLoadError('No pudimos cargar el menú.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeProductDetailTimerRef.current) {
        window.clearTimeout(closeProductDetailTimerRef.current);
      }
    };
  }, []);

  async function handleToggleSession() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    await signOut();
  }

  function handleRetryLoad() {
    window.location.reload();
  }

  function handleOpenProductDetail(product) {
    if (closeProductDetailTimerRef.current) {
      window.clearTimeout(closeProductDetailTimerRef.current);
      closeProductDetailTimerRef.current = null;
    }

    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  }

  function handleCloseProductDetail() {
    setIsProductDetailOpen(false);

    if (closeProductDetailTimerRef.current) {
      window.clearTimeout(closeProductDetailTimerRef.current);
    }

    closeProductDetailTimerRef.current = window.setTimeout(() => {
      setSelectedProduct(null);
      closeProductDetailTimerRef.current = null;
    }, 220);
  }

  const normalizedSearch = normalizeText(searchTerm);
  const isAuthenticated = Boolean(session);
  const publicCategories = useMemo(
    () => [{ id: 'all', label: 'Todos' }, ...categorias.map((category) => ({ id: category.id, label: category.name }))],
    [categorias],
  );
  const filteredProducts = useMemo(() => {
    return productos.filter((product) => {
      const matchesCategory = activeCategoryId === 'all' || product.categoryId === activeCategoryId;
      const searchableText = normalizeText(
        `${product.name ?? ''} ${product.shortDescription ?? ''} ${product.description ?? ''} ${product.category?.name ?? ''}`,
      );
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategoryId, normalizedSearch, productos]);

  const isCatalogEmpty = !isLoading && !loadError && productos.length === 0;
  const isSearchEmpty = !isLoading && !loadError && productos.length > 0 && filteredProducts.length === 0;

  return (
    <AppShell showBottomNavigation={isAuthenticated}>
      <Hero />

      <label className="relative mb-6 block">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          aria-label="Buscar platos o bebidas"
          className="h-12 w-full rounded-md border border-border bg-card pl-12 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
          disabled={isLoading}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar platos o bebidas..."
          type="search"
          value={searchTerm}
        />
      </label>

      <CategoryFilter categories={publicCategories} activeCategoryId={activeCategoryId} onSelectCategory={setActiveCategoryId} />

      {isLoading ? (
        <section className="grid gap-4" aria-label="Cargando menú">
          {Array.from({ length: 4 }, (_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </section>
      ) : null}

      {loadError ? (
        <Alert variant="destructive" title="No pudimos cargar el menú.">
          <div className="grid gap-3">
            <p>Intentá nuevamente.</p>
            <Button className="w-fit" onClick={handleRetryLoad} size="sm" type="button">
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      {isCatalogEmpty ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
          No hay productos disponibles en este momento.
        </div>
      ) : null}

      {isSearchEmpty ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm leading-6 text-muted-foreground">
          No encontramos productos para tu búsqueda.
        </div>
      ) : null}

      {!isLoading && !loadError && filteredProducts.length > 0 ? (
        <section className="grid gap-4" aria-label="Productos del menú">
          {filteredProducts.map((product) => (
            <CardProducts key={product.id} onSelect={handleOpenProductDetail} product={product} />
          ))}
        </section>
      ) : null}

      <PublicMenuFooter isAuthenticated={isAuthenticated} onToggleSession={handleToggleSession} />

      <ProductDetailDrawer isOpen={isProductDetailOpen} onClose={handleCloseProductDetail} product={selectedProduct} />
    </AppShell>
  );
}
