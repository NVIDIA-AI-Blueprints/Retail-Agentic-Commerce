"use client";

import { useCallback } from "react";

/**
 * Available checkout modes
 */
export type CheckoutMode = "native" | "apps-sdk";

/**
 * Props for the ModeTabSwitcher component
 */
interface ModeTabSwitcherProps {
  activeMode: CheckoutMode;
  onModeChange: (mode: CheckoutMode) => void;
}

/**
 * Tab configuration for the mode switcher
 */
interface TabConfig {
  mode: CheckoutMode;
  label: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    mode: "native",
    label: "Native",
    description: "Standard ACP checkout flow",
  },
  {
    mode: "apps-sdk",
    label: "Apps SDK",
    description: "Merchant-controlled iframe",
  },
];

/**
 * ModeTabSwitcher Component
 *
 * A tab interface at the top of the Client Agent panel to switch between
 * Native checkout and Apps SDK (merchant iframe) modes.
 *
 * Features:
 * - Two tabs: "Native" and "Apps SDK"
 * - Glassmorphic styling matching the existing design system
 * - Active tab uses NVIDIA green accent
 * - Smooth transition animations
 */
export function ModeTabSwitcher({ activeMode, onModeChange }: ModeTabSwitcherProps) {
  const handleTabClick = useCallback(
    (mode: CheckoutMode) => {
      if (mode !== activeMode) {
        onModeChange(mode);
      }
    },
    [activeMode, onModeChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, mode: CheckoutMode) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTabClick(mode);
      }
    },
    [handleTabClick]
  );

  return (
    <div className="mode-tab-switcher" role="tablist" aria-label="Checkout mode">
      <div className="mode-tab-container">
        {TABS.map((tab) => {
          const isActive = activeMode === tab.mode;
          return (
            <button
              key={tab.mode}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.mode}`}
              tabIndex={isActive ? 0 : -1}
              className={`mode-tab ${isActive ? "active" : ""}`}
              onClick={() => handleTabClick(tab.mode)}
              onKeyDown={(e) => handleKeyDown(e, tab.mode)}
              title={tab.description}
            >
              <span className="mode-tab-label">{tab.label}</span>
              {isActive && <span className="mode-tab-indicator" />}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .mode-tab-switcher {
          padding: 12px 16px;
          border-bottom: 1px solid var(--glass-border-subtle, rgba(255, 255, 255, 0.08));
        }

        .mode-tab-container {
          display: flex;
          gap: 4px;
          background: var(--block-bg, rgba(255, 255, 255, 0.045));
          border-radius: 10px;
          padding: 4px;
        }

        .mode-tab {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-muted, rgba(255, 255, 255, 0.62));
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .mode-tab:hover:not(.active) {
          color: var(--text-secondary, rgba(255, 255, 255, 0.82));
          background: rgba(255, 255, 255, 0.04);
        }

        .mode-tab:focus-visible {
          box-shadow: 0 0 0 2px var(--accent-green, #76b900);
        }

        .mode-tab.active {
          background: var(--accent-green-bg, rgba(118, 185, 0, 0.12));
          color: var(--accent-green, #76b900);
        }

        .mode-tab-label {
          position: relative;
          z-index: 1;
        }

        .mode-tab-indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 2px;
          background: var(--accent-green, #76b900);
          border-radius: 1px;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scaleX(0);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
