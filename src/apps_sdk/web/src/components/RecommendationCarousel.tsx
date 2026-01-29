import { useCallback } from "react";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, getProductImage } from "@/types";

interface RecommendationCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

/**
 * Product card for the carousel with dual interaction:
 * - Card click navigates to product detail
 * - Add to Cart button adds to cart (stopPropagation)
 */
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart(product);
    },
    [onAddToCart, product]
  );

  const handleCardClick = useCallback(() => {
    if (onProductClick) {
      onProductClick(product);
    }
  }, [onProductClick, product]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && onProductClick) {
        e.preventDefault();
        onProductClick(product);
      }
    },
    [onProductClick, product]
  );

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name} details`}
      className="group min-w-[220px] max-w-[220px] flex-shrink-0 flex flex-col cursor-pointer overflow-hidden rounded-xl border border-default bg-surface-elevated transition-all hover:border-accent dark:hover:border-accent/70"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={getProductImage(product.id)}
          alt={product.name}
          className="h-60 w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/[0.025] dark:bg-white/[0.025]" />
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-1 px-3 pt-3 pb-2">
        <h3 className="text-base font-medium text-text">{product.name}</h3>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            {product.variant} - {product.size}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" strokeWidth={2} fill="currentColor" /> 4.8
          </span>
        </div>
        <p className="text-base font-semibold text-success">
          {formatPrice(product.basePrice)}
        </p>
      </div>

      {/* Add to Cart Button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleAddToCart}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-accent/30 bg-transparent px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent/5 active:scale-[0.98] dark:border-accent/40 dark:hover:border-accent/70 dark:hover:bg-accent/10"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={2} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}

/**
 * RecommendationCarousel Component
 *
 * Displays a horizontal scrollable carousel with product recommendations.
 * Supports light/dark mode theming.
 * - Card click navigates to product detail
 * - Add to Cart button adds to cart directly
 */
export function RecommendationCarousel({
  products,
  onAddToCart,
  onProductClick,
}: RecommendationCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-5">
      <h2 className="mb-4 flex items-center gap-2 px-1 text-lg font-semibold text-text">
        <span>Recommended For You</span>
      </h2>

      <div className="-mx-5 overflow-x-auto px-5 scrollbar-none">
        <div className="flex gap-4 pb-1">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
