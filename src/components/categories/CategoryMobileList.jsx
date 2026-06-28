import { EmptyState } from '@/components/common/EmptyState.jsx';
import { LoadingState } from '@/components/common/LoadingState.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { CategoryStatus, CategoryThumbnail } from '@/components/categories/categoryPresentation.jsx';

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

export function CategoryMobileList({
  categories,
  emptyMessage,
  getProductCount,
  isLoading,
  loadError,
  onEditCategory,
  productCounts,
}) {
  return (
    <section className="grid gap-4 lg:hidden" aria-label="Categorías">
      {isLoading ? <LoadingState message="Cargando categorías..." /> : null}
      {!isLoading && !loadError && categories.length === 0 ? <EmptyState title={emptyMessage} /> : null}
      {!isLoading
        ? categories.map((category) => (
            <CategoryMobileCard
              category={category}
              key={category.id}
              onEdit={onEditCategory}
              productCount={getProductCount(category.id, productCounts)}
            />
          ))
        : null}
    </section>
  );
}
