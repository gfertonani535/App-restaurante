import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableStateRow } from '@/components/common/TableStateRow.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { CategoryStatus, CategoryThumbnail } from '@/components/categories/categoryPresentation.jsx';

export function CategoriesTable({
  categories,
  emptyMessage,
  getProductCount,
  isLoading,
  isSaving,
  loadError,
  onEditCategory,
  productCounts,
}) {
  function renderTableBody() {
    if (isLoading) {
      return <TableStateRow colSpan={6}>Cargando categorías...</TableStateRow>;
    }

    if (!loadError && categories.length === 0) {
      return <TableStateRow colSpan={6}>{emptyMessage}</TableStateRow>;
    }

    return categories.map((category) => (
      <TableRow key={category.id}>
        <TableCell>
          <CategoryThumbnail imagePath={category.image_path} name={category.name} />
        </TableCell>
        <TableCell className="font-bold text-neutral-950">{category.name}</TableCell>
        <TableCell>{getProductCount(category.id, productCounts)}</TableCell>
        <TableCell>{category.display_order}</TableCell>
        <TableCell>
          <CategoryStatus isActive={category.is_active} />
        </TableCell>
        <TableCell className="sticky right-0 bg-white text-right shadow-[-16px_0_18px_-22px_rgba(15,15,15,0.8)]">
          <Button
            className="whitespace-nowrap"
            disabled={isSaving}
            onClick={() => onEditCategory(category)}
            size="sm"
            type="button"
            variant="secondary"
          >
            Editar
          </Button>
        </TableCell>
      </TableRow>
    ));
  }

  return (
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
          Mostrando {categories.length === 0 ? 0 : 1} a {categories.length} de {categories.length} categorías
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
  );
}
