import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils';

export function Pagination({
  className,
  currentPage,
  disabled,
  maxVisiblePages = 5,
  onPageChange,
  showPageButtons = true,
  totalPages,
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const visiblePages = showPageButtons
    ? Array.from({ length: safeTotalPages }, (_, index) => index + 1).slice(0, maxVisiblePages)
    : [currentPage];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        className="size-10 min-h-10 p-0"
        disabled={currentPage <= 1 || disabled}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        size="icon"
        type="button"
        variant="secondary"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Button>

      {visiblePages.map((pageNumber) => (
        <Button
          className="size-10 min-h-10 p-0"
          disabled={disabled || (!showPageButtons && pageNumber === currentPage)}
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          size="icon"
          type="button"
          variant={pageNumber === currentPage ? 'default' : 'secondary'}
        >
          {pageNumber}
        </Button>
      ))}

      <Button
        className="size-10 min-h-10 p-0"
        disabled={currentPage >= safeTotalPages || disabled}
        onClick={() => onPageChange(Math.min(safeTotalPages, currentPage + 1))}
        size="icon"
        type="button"
        variant="secondary"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
