import { useCallback } from "react";
import { Minus, Plus, X, ShoppingCart as CartIcon, Truck } from "lucide-react";
import type { CartItem, CartState } from "@/types";
import { formatPrice, getProductImage } from "@/types";

interface ShoppingCartProps {
  items: CartItem[];
  cartState: CartState;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

/**
 * Cart item row component with theme support
 */
interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const handleDecrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity - 1);
  }, [onUpdateQuantity, item.id, item.quantity]);

  const handleIncrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity + 1);
  }, [onUpdateQuantity, item.id, item.quantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [onRemove, item.id]);

  const itemTotal = item.basePrice * item.quantity;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-default bg-surface-elevated p-3 transition-colors">
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-default">
          <img
            src={getProductImage(item.id)}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Item details */}
        <div>
          <p className="text-sm font-semibold text-text">{item.name}</p>
          <p className="text-xs text-text-secondary">
            {item.variant} · {formatPrice(item.basePrice)}
          </p>
        </div>
      </div>

      {/* Quantity controls + total */}
      <div className="flex items-center gap-3">
        {/* Quantity pill */}
        <div className="flex items-center rounded-full bg-surface-secondary px-1.5 py-1 transition-colors dark:bg-surface-tertiary">
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text dark:hover:bg-surface"
            onClick={handleDecrease}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" strokeWidth={2.5} />
          </button>
          <span className="min-w-[20px] px-1 text-center text-sm font-medium text-text">
            {item.quantity}
          </span>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text dark:hover:bg-surface"
            onClick={handleIncrease}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>

        {/* Item total */}
        <span className="min-w-[60px] text-right text-sm font-semibold text-text">
          {formatPrice(itemTotal)}
        </span>

        {/* Remove button */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-default text-text-tertiary transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-500/50 dark:hover:bg-red-500/10"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/**
 * ShoppingCart Component
 *
 * Displays the shopping cart with items, quantity controls, and order summary.
 * Supports light/dark mode theming.
 */
export function ShoppingCart({
  items,
  cartState,
  onUpdateQuantity,
  onRemoveItem,
}: ShoppingCartProps) {
  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-default bg-surface-secondary/50 px-5 py-8 transition-colors dark:bg-surface-secondary/30">
        <CartIcon className="mb-3 h-10 w-10 text-text-tertiary" strokeWidth={1.5} />
        <p className="mb-1 text-base font-medium text-text-secondary">
          Your cart is empty
        </p>
        <p className="text-sm text-text-tertiary">
          Add items from the recommendations above
        </p>
      </section>
    );
  }

  return (
    <section className="py-5">
      {/* Cart Header */}
      <h2 className="mb-4 flex items-center gap-2 px-1 text-lg font-semibold text-text">
        <CartIcon className="h-5 w-5" strokeWidth={2} />
        Your Cart
        <span className="text-sm font-normal text-text-secondary">
          ({cartState.itemCount} items)
        </span>
      </h2>

      {/* Cart Items */}
      <div className="mb-4 flex flex-col gap-2">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Order Summary Panel */}
      <div className="space-y-4 rounded-3xl border border-default bg-surface-elevated px-5 pb-5 pt-4 shadow-lg transition-colors dark:shadow-none">
        {/* Delivery section */}
        <section className="border-t border-default/50 pt-3">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Delivery
          </h3>
          <div className="flex items-center justify-between rounded-xl border border-default bg-surface px-4 py-2.5 shadow-sm transition-colors dark:shadow-none">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
              <span className="text-sm text-text">Standard Delivery</span>
            </div>
            <span className="text-sm font-semibold text-success">
              {cartState.shipping === 0 ? "Free" : formatPrice(cartState.shipping)}
            </span>
          </div>
        </section>

        {/* Order summary */}
        <section className="space-y-2 border-t border-default/50 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text">{formatPrice(cartState.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Tax</span>
            <span className="text-text">{formatPrice(cartState.tax)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <span className="text-text">Total</span>
            <span className="text-text">{formatPrice(cartState.total)}</span>
          </div>
        </section>
      </div>
    </section>
  );
}
