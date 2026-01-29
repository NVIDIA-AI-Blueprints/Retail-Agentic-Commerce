import { useState, useCallback } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, getProductImage } from "@/types";
import { RecommendationSkeleton } from "@/components/RecommendationSkeleton";

interface ProductDetailPageProps {
  product: Product;
  recommendations: Product[];
  isLoadingRecommendations: boolean;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

/**
 * Recommendation card with dual interaction:
 * - Card click navigates to product detail
 * - Quick-add button adds to cart
 */
function RecommendationCard({
  product,
  onProductClick,
  onQuickAdd,
}: {
  product: Product;
  onProductClick: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}) {
  const handleQuickAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onQuickAdd(product);
    },
    [onQuickAdd, product]
  );

  return (
    <article
      onClick={() => onProductClick(product)}
      className="group min-w-[140px] max-w-[140px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-default bg-surface-elevated transition-all hover:border-accent dark:hover:border-accent/70"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onProductClick(product);
        }
      }}
      aria-label={`View ${product.name} details`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={getProductImage(product.id)}
          alt={product.name}
          className="h-[100px] w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1 p-2">
        <h4 className="truncate text-xs font-medium text-text">{product.name}</h4>
        <p className="text-xs font-semibold text-success">{formatPrice(product.basePrice)}</p>
      </div>

      {/* Quick Add Button */}
      <div className="px-2 pb-2">
        <button
          onClick={handleQuickAdd}
          className="flex w-full items-center justify-center gap-1 rounded-full border border-accent/30 bg-transparent px-2 py-1.5 text-xs font-medium text-accent transition-colors hover:border-accent hover:bg-accent/5 active:scale-[0.98]"
          aria-label={`Quick add ${product.name} to cart`}
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
          Quick Add
        </button>
      </div>
    </article>
  );
}

/**
 * ProductDetailPage Component
 *
 * Displays full product details with:
 * - Back navigation
 * - Product image, name, variant, price
 * - Quantity selector
 * - Add to Cart button
 * - Recommendations section with skeleton loading
 */
export function ProductDetailPage({
  product,
  recommendations,
  isLoadingRecommendations,
  onBack,
  onAddToCart,
  onProductClick,
  onQuickAdd,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleIncrement = useCallback(() => {
    setQuantity((prev) => Math.min(10, prev + 1));
  }, []);

  const handleAddToCart = useCallback(() => {
    onAddToCart(product, quantity);
    setQuantity(1);
  }, [onAddToCart, product, quantity]);

  return (
    <div className="flex flex-col">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-default bg-surface px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-elevated"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-text" strokeWidth={2} />
        </button>
        <h1 className="flex-1 truncate text-base font-semibold text-text">{product.name}</h1>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Product Image */}
        <div className="relative">
          <img
            src={getProductImage(product.id)}
            alt={product.name}
            className="h-64 w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="px-5 py-4">
          <h2 className="text-xl font-semibold text-text">{product.name}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {product.variant} • {product.size}
          </p>
          <p className="mt-2 text-2xl font-bold text-success">{formatPrice(product.basePrice)}</p>
        </div>

        {/* Quantity Selector and Add to Cart */}
        <div className="flex items-center gap-3 px-5 pb-4">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-full border border-default bg-surface-elevated">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-l-full transition-colors hover:bg-surface disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4 text-text" strokeWidth={2} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-text">{quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= 10}
              className="flex h-10 w-10 items-center justify-center rounded-r-full transition-colors hover:bg-surface disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4 text-text" strokeWidth={2} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={2} />
            Add to Cart
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-default" />

        {/* Recommendations Section */}
        <div className="px-5 py-4">
          <h3 className="mb-3 text-base font-semibold text-text">You May Also Like</h3>

          {/* Loading Skeleton */}
          {isLoadingRecommendations && <RecommendationSkeleton />}

          {/* Recommendations */}
          {!isLoadingRecommendations && recommendations.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  product={rec}
                  onProductClick={onProductClick}
                  onQuickAdd={onQuickAdd}
                />
              ))}
            </div>
          )}

          {/* No recommendations */}
          {!isLoadingRecommendations && recommendations.length === 0 && (
            <p className="text-sm text-text-secondary">No recommendations available</p>
          )}
        </div>
      </div>
    </div>
  );
}
