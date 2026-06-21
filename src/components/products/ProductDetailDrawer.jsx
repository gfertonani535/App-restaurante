import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { resolveProductImage } from '@/utils/productImageResolver.js';
import { cn } from '@/lib/utils.js';

function formatPrice(price) {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }

  return price ?? '';
}

// Bottom sheet mobile con transición y drag hacia abajo para aplicar interacciones de Unidad 6.
export function ProductDetailDrawer({ isOpen, onClose, product }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const dragOffsetRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!product) {
    return null;
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 639px)').matches;
  }

  function resetDrag() {
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
  }

  function handleDragStart(event) {
    if (!isOpen || !isMobileViewport()) {
      return;
    }

    dragStartYRef.current = event.clientY;
    dragOffsetRef.current = 0;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleDragMove(event) {
    if (!isDragging) {
      return;
    }

    const nextOffset = Math.max(0, event.clientY - dragStartYRef.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  }

  function handleDragEnd(event) {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (dragOffsetRef.current > 110) {
      resetDrag();
      onClose();
      return;
    }

    resetDrag();
  }

  const imageSrc = resolveProductImage(product);
  const categoryLabel = product.category?.name ?? '';
  const shortDescription = product.shortDescription ?? '';
  const fullDescription = product.description ?? '';
  const panelStyle = dragOffset > 0 && isOpen
    ? { transform: `translate3d(0, ${dragOffset}px, 0)` }
    : undefined;

  return createPortal(
    <div
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center px-0 backdrop-blur-[2px] transition-colors duration-200 ease-out sm:items-center sm:px-6',
        isOpen ? 'pointer-events-auto bg-black/60' : 'pointer-events-none bg-black/0',
      )}
      inert={isOpen ? undefined : ''}
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="product-detail-drawer-title"
        aria-modal="true"
        className={cn(
          'relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl will-change-transform sm:max-h-[86vh] sm:rounded-2xl',
          isDragging ? 'transition-none' : 'transition-[transform,opacity] duration-200 ease-out',
          isOpen
            ? 'translate-y-0 opacity-100 motion-safe:animate-[product-sheet-enter_180ms_ease-out]'
            : 'translate-y-full opacity-0 sm:translate-y-6 sm:scale-[0.98]',
        )}
        onMouseDown={(event) => event.stopPropagation()}
        style={panelStyle}
        role="dialog"
      >
        <div
          className="sticky top-0 z-10 cursor-grab touch-none border-b border-neutral-100 bg-white/95 px-5 pb-3 pt-3 backdrop-blur active:cursor-grabbing sm:cursor-default sm:touch-auto sm:px-6"
          onPointerCancel={handleDragEnd}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
        >
          <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-neutral-300" aria-hidden="true" />
          <Button
            aria-label="Cerrar detalle del producto"
            className="absolute right-3 top-3 size-10 min-h-10 p-0"
            onClick={onClose}
            onPointerDown={(event) => event.stopPropagation()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-5" strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="aspect-[4/3] overflow-hidden rounded-md bg-neutral-100 sm:aspect-[16/9]">
            {imageSrc ? (
              <img className="size-full object-cover" src={imageSrc} alt={product.name} />
            ) : (
              <div className="grid size-full place-items-center text-neutral-400">
                <ImageIcon className="size-10" strokeWidth={1.8} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="product-detail-drawer-title" className="text-2xl font-bold leading-tight tracking-normal text-neutral-950 sm:text-3xl">
                {product.name}
              </h2>
              {categoryLabel ? (
                <Badge className="mt-3 w-max" variant="secondary">
                  {categoryLabel}
                </Badge>
              ) : null}
            </div>
            <p className="shrink-0 pt-1 text-xl font-bold leading-none text-neutral-950 sm:text-2xl">{formatPrice(product.price)}</p>
          </div>

          {shortDescription ? (
            <div className="mt-5 border-t border-neutral-200 pt-5">
              <h3 className="text-sm font-bold leading-5 text-neutral-950">Descripción breve</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{shortDescription}</p>
            </div>
          ) : null}

          {fullDescription ? (
            <div className={shortDescription ? 'mt-5' : 'mt-5 border-t border-neutral-200 pt-5'}>
              <h3 className="text-sm font-bold leading-5 text-neutral-950">Descripción completa</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{fullDescription}</p>
            </div>
          ) : null}

          <Button className="mt-6 w-full" onClick={onClose} type="button">
            Volver al menú
          </Button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
