import { ShoppingCart, User, Trophy } from "lucide-react";
import type { MerchantUser, LoyaltyTier } from "@/types";

interface LoyaltyHeaderProps {
  user: MerchantUser;
}

/**
 * Get tier badge color based on loyalty tier
 * Uses theme-aware colors for light/dark mode
 */
function getTierColor(tier: LoyaltyTier): { bg: string; text: string; darkBg: string; darkText: string } {
  switch (tier) {
    case "Platinum":
      return {
        bg: "rgba(100, 116, 139, 0.15)",
        text: "#475569",
        darkBg: "rgba(148, 163, 184, 0.25)",
        darkText: "#94a3b8",
      };
    case "Gold":
      return {
        bg: "rgba(234, 179, 8, 0.15)",
        text: "#a16207",
        darkBg: "rgba(234, 179, 8, 0.25)",
        darkText: "#fbbf24",
      };
    case "Silver":
      return {
        bg: "rgba(156, 163, 175, 0.15)",
        text: "#6b7280",
        darkBg: "rgba(156, 163, 175, 0.25)",
        darkText: "#9ca3af",
      };
    case "Bronze":
    default:
      return {
        bg: "rgba(180, 83, 9, 0.15)",
        text: "#92400e",
        darkBg: "rgba(217, 119, 6, 0.25)",
        darkText: "#f59e0b",
      };
  }
}

/**
 * LoyaltyHeader Component
 *
 * Displays the merchant store branding along with the pre-authenticated
 * user's information and loyalty points balance.
 * Supports light/dark mode theming.
 */
export function LoyaltyHeader({ user }: LoyaltyHeaderProps) {
  const tierColors = getTierColor(user.tier);

  return (
    <header className="border-b border-default bg-surface-secondary/50 px-5 py-3 pr-14 transition-colors dark:bg-surface-secondary/30">
      <div className="flex items-center justify-between gap-3">
        {/* Store Branding */}
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" strokeWidth={2} />
          <span className="text-base font-semibold tracking-tight text-primary">
            NVShop
          </span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          {/* User Name */}
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <User className="h-4 w-4" strokeWidth={1.5} />
            <span>{user.name}</span>
          </div>

          {/* Tier Badge - uses inline styles for dynamic tier colors */}
          <div
            className="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
            style={{
              background: `var(--tier-bg, ${tierColors.bg})`,
              color: `var(--tier-text, ${tierColors.text})`,
            }}
          >
            <style>{`
              [data-theme="dark"] .tier-badge-${user.tier.toLowerCase()} {
                --tier-bg: ${tierColors.darkBg};
                --tier-text: ${tierColors.darkText};
              }
            `}</style>
            <span className={`tier-badge-${user.tier.toLowerCase()}`}>
              {user.tier}
            </span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 dark:bg-amber-500/20">
            <Trophy className="h-3 w-3 text-amber-600 dark:text-amber-400" strokeWidth={2} />
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {user.loyaltyPoints.toLocaleString()}
            </span>
            <span className="text-xs text-text-secondary">pts</span>
          </div>
        </div>
      </div>
    </header>
  );
}
