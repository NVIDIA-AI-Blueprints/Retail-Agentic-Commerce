import { Lock } from "lucide-react";
import type { CartState } from "@/types";
import { formatPrice } from "@/types";

interface CheckoutButtonProps {
  cartState: CartState;
  isProcessing: boolean;
  onCheckout: () => void;
}

/**
 * CheckoutButton Component
 *
 * A prominent checkout button that triggers the ACP payment flow.
 * Uses the primary orange color from the style guide.
 * Supports light/dark mode theming.
 */
export function CheckoutButton({
  cartState,
  isProcessing,
  onCheckout,
}: CheckoutButtonProps) {
  const isEmpty = cartState.items.length === 0;
  const isDisabled = isEmpty || isProcessing;

  return (
    <div className="mt-auto py-5">
      <button
        className={`flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-4 text-base font-semibold transition-all ${
          isDisabled
            ? "cursor-not-allowed bg-surface-secondary text-text-disabled dark:bg-surface-tertiary"
            : "bg-primary text-white shadow-lg hover:bg-primary-hover active:scale-[0.98] dark:shadow-primary/20"
        }`}
        onClick={onCheckout}
        disabled={isDisabled}
        aria-busy={isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" strokeWidth={2} />
            <span className="flex-1 text-center">
              {isEmpty ? "Cart is Empty" : "Continue to payment"}
            </span>
            {!isEmpty && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                {formatPrice(cartState.total)}
              </span>
            )}
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-text-tertiary">
        Secure checkout powered by Agentic Commerce Protocol
      </p>
    </div>
  );
}
