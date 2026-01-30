import { ShoppingBag } from "lucide-react";
import type { MerchantUser } from "@/types";

interface LoyaltyHeaderProps {
  user: MerchantUser;
  cartItemCount?: number;
  onCartClick?: () => void;
}

/**
 * LoyaltyHeader Component
 *
 * Clean, minimalist header with store branding and user info.
 * Uses a single accent color and text hierarchy for visual clarity.
 */
export function LoyaltyHeader({ user, cartItemCount = 0, onCartClick }: LoyaltyHeaderProps) {
  return (
    <header className="border-b border-default/50 bg-surface px-5 py-3.5 pr-14 transition-colors">
      <div className="flex items-center justify-between">
        {/* Store Branding */}
        <span className="text-base font-semibold tracking-tight text-text">
          NVShop
        </span>

        {/* User Info + Cart */}
        <div className="flex items-center gap-4">
          {/* Combined user info - clean text hierarchy */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text">{user.name}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-medium text-accent">{user.tier}</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-secondary">
              {user.loyaltyPoints.toLocaleString()} pts
            </span>
          </div>

          {/* Cart Icon - only accent element */}
          {onCartClick && (
            <button
              onClick={onCartClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 transition-colors hover:bg-accent/20 dark:bg-accent/20 dark:hover:bg-accent/30"
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingBag className="h-5 w-5 text-accent" strokeWidth={2} />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow-sm">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
