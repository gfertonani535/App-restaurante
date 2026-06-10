import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { CategoryFilter } from '@/components/landing/CategoryFilter.jsx';
import { Hero } from '@/components/landing/Hero.jsx';
import { PublicMenuFooter } from '@/components/landing/PublicMenuFooter.jsx';
import { AppShell } from '@/components/layouts/AppShell.jsx';
import { CardProducts } from '@/components/products/CardProducts.jsx';

const SESSION_STORAGE_KEY = 'restaurantos_mock_session';

export function MenuPage() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(SESSION_STORAGE_KEY) === 'active');

  useEffect(() => {
    fetch('/data/categorias.json')
      .then((res) => res.json())
      .then(setCategorias)
      .catch(() => setCategorias([]));

    fetch('/data/productos.json')
      .then((res) => res.json())
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  function handleToggleSession() {
    setIsAuthenticated((currentValue) => {
      const nextValue = !currentValue;

      if (nextValue) {
        localStorage.setItem(SESSION_STORAGE_KEY, 'active');
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }

      return nextValue;
    });
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = Array.isArray(productos)
    ? productos.filter((product) => {
        if (!normalizedSearch) {
          return true;
        }

        return `${product.name} ${product.description}`.toLowerCase().includes(normalizedSearch);
      })
    : [];

  return (
    <AppShell showBottomNavigation={isAuthenticated}>
      <Hero />

      <label className="relative mb-6 block">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          aria-label="Buscar platos o bebidas"
          className="h-12 w-full rounded-md border border-border bg-card pl-12 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar platos o bebidas..."
          type="search"
          value={searchTerm}
        />
      </label>

      <CategoryFilter categories={categorias} activeCategoryId="all" />

      <section className="grid gap-4" aria-label="Menu items">
        {filteredProducts.map((product) => (
          <CardProducts key={product.id} product={product} />
        ))}
      </section>

      <PublicMenuFooter isAuthenticated={isAuthenticated} onToggleSession={handleToggleSession} />
    </AppShell>
  );
}
