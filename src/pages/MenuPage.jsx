import categorias from '@data/categorias.json';
import productos from '@data/productos.json';
import { ComponentShowcase } from '@/components/landing/ComponentShowcase.jsx';
import { CategoryFilter } from '@/components/landing/CategoryFilter.jsx';
import { Hero } from '@/components/landing/Hero.jsx';
import { AppShell } from '@/components/layouts/AppShell.jsx';
import { CardProducts } from '@/components/products/CardProducts.jsx';

export function MenuPage() {
  return (
    <AppShell>
      <Hero />

      <CategoryFilter categories={categorias} activeCategoryId="all" />

      <section className="grid gap-4" aria-label="Menu items">
        {productos.map((product) => (
          <CardProducts key={product.id} product={product} />
        ))}
      </section>

      <ComponentShowcase />
    </AppShell>
  );
}
