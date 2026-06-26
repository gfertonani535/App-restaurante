import { useEffect, useRef, useState } from 'react';
import { Croissant, Hamburger, IceCream, ImageIcon, Pizza, Sandwich, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveProductImage } from '@/utils/productImageResolver.js';

const productIcons = {
  burger: Hamburger,
  croissant: Croissant,
  iceCream: IceCream,
  pizza: Pizza,
  sandwich: Sandwich,
  utensils: Utensils,
};

function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString('es-AR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

export function CardProducts({ onSelect, product }) {
  const Icon = productIcons[product.icon] ?? Utensils;
  const productImage = resolveProductImage(product);
  const titleRef = useRef(null);
  const [descriptionLineClamp, setDescriptionLineClamp] = useState(2);

  useEffect(() => {
    if (!titleRef.current) {
      return;
    }

    const lineHeight = parseFloat(window.getComputedStyle(titleRef.current).lineHeight);
    const titleLines = Math.round(titleRef.current.offsetHeight / lineHeight);

    setDescriptionLineClamp(titleLines === 1 ? 3 : 2);
  }, [product.name]);

  return (
    <article
      className={cn(
        'h-32 overflow-hidden rounded-md border border-border bg-card transition-[border-color,transform] duration-200',
        'hover:border-muted-foreground active:scale-[0.997] active:border-primary',
      )}
    >
      <button
        aria-label={`Ver detalle de ${product.name}`}
        className="flex h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onSelect?.(product)}
        type="button"
      >
        <div className="h-full basis-24 shrink-0 p-2">
          {productImage ? (
            <img className="h-full w-full rounded-md object-cover" src={productImage} alt={product.name} />
          ) : (
            <div className="grid h-full w-full place-items-center rounded-md bg-neutral-100 text-neutral-400">
              <ImageIcon className="size-7" strokeWidth={1.8} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col pb-2 pl-2 pr-4 pt-2">
          <Icon className="absolute right-2 top-2 size-5 text-muted-foreground" strokeWidth={1.9} aria-hidden="true" />

          <h2 ref={titleRef} className="m-0 pr-8 text-lg font-bold leading-tight tracking-normal text-foreground">
            {product.name}
          </h2>
          <p
            className="mt-0 min-w-0 text-sm leading-[1.4] text-copy"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: descriptionLineClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordWrap: 'break-word',
            }}
          >
            {product.shortDescription ?? product.description}
          </p>
          <div className="mb-0 mt-auto flex justify-end">
            <span className="text-xl font-bold leading-none tracking-normal text-primary">{formatPrice(product.price)}</span>
          </div>
        </div>
      </button>
    </article>
  );
}
