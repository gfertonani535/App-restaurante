import { cn } from '@/lib/utils';

export function CategoryFilter({ categories, activeCategoryId }) {
  return (
    <div
      className="mb-6 flex gap-2 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="toolbar"
      aria-label="Categorias del menu"
    >
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            className={cn(
              'min-h-[34px] shrink-0 rounded-[12px] border px-6 py-2 text-xs font-semibold uppercase leading-none tracking-[0.05em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-secondary text-secondary-foreground hover:border-muted-foreground hover:text-foreground',
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
