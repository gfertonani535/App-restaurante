import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CategoryFilter({ categories, activeCategoryId, onSelectCategory }) {
  const scrollRef = useRef(null);

  function handleScrollCategories(direction) {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -180 : 180,
      behavior: 'smooth',
    });
  }

  return (
    <div className="relative mb-6">
      <div
        className="flex gap-2 overflow-x-auto px-12 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="toolbar"
        aria-label="Categorías del menú"
        ref={scrollRef}
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectCategory?.(category.id)}
              className={cn(
                'min-h-[34px] shrink-0 rounded-[12px] border px-6 py-2 text-xs font-semibold uppercase leading-none tracking-[0.05em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-secondary-foreground hover:border-muted-foreground hover:text-foreground',
              )}
            >
              {category.label ?? category.name}
            </button>
          );
        })}
      </div>

      <button
        aria-label="Ver categorías anteriores"
        className="absolute left-0 top-0 grid size-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => handleScrollCategories('left')}
        type="button"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      <button
        aria-label="Ver más categorías"
        className="absolute right-0 top-0 grid size-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => handleScrollCategories('right')}
        type="button"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
