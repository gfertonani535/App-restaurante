import {
  Croissant,
  Hamburger,
  IceCream,
  Pizza,
  Sandwich,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const productImages = import.meta.glob(
  "../../assets/productos/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
  },
);

const productIcons = {
  burger: Hamburger,
  croissant: Croissant,
  iceCream: IceCream,
  pizza: Pizza,
  sandwich: Sandwich,
  utensils: Utensils,
};

function getProductImage(imageName) {
  return productImages[`../../assets/productos/${imageName}`] ?? "";
}

export function CardProducts({ product }) {
  const Icon = productIcons[product.icon] ?? Utensils;
  const productImage = getProductImage(product.image);
  const titleRef = useRef(null);
  const [descriptionLineClamp, setDescriptionLineClamp] = useState(2);

  useEffect(() => {
    if (titleRef.current) {
      const lineHeight = parseFloat(
        window.getComputedStyle(titleRef.current).lineHeight
      );
      const height = titleRef.current.offsetHeight;
      const lines = Math.round(height / lineHeight);
      
      // Si ocupa 1 renglón, descripción con 2 líneas; si ocupa 2+, descripción con 1 línea
      setDescriptionLineClamp(lines === 1 ? 3 : 2);
    }
  }, [product.name]);

  return (
    <article
      className={cn(
        "flex h-32 overflow-hidden rounded-md border border-border bg-card transition-[border-color,transform] duration-200",
        "hover:border-muted-foreground active:scale-[0.997] active:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      tabIndex={0}
    >
      <div className="h-full basis-24 shrink-0 p-2">
        <img
          className="h-full w-full rounded-md object-cover"
          src={productImage}
          alt={product.imageAlt}
        />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col pt-2 pb-2 pr-4 pl-2">
        <Icon
          className="absolute right-2 top-2 size-5 text-muted-foreground"
          strokeWidth={1.9}
          aria-hidden="true"
        />
        
          <h2 
            ref={titleRef}
            className="pr-8 m-0 text-lg font-bold leading-tight tracking-normal text-foreground"
          >
            {product.name}
          </h2>
          <p
            className="mt-0 min-w-0 text-sm leading-[1.4] text-copy"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: descriptionLineClamp,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordWrap: "break-word",
            }}
          >
            {product.description}
          </p>
        <div className="mt-auto mb-0 flex justify-end">
          <span className="text-xl font-bold leading-none tracking-normal text-primary">
            {product.price}
          </span>
        </div>
      </div>
    </article>
  );
}
