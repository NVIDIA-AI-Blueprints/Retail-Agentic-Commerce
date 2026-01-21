/**
 * Mock for @kui/foundations-design-tokens
 * Used in tests/CI when the local linked package isn't available
 */

export const spacingScale = {
  "0": "0px",
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "7": "28px",
  "8": "32px",
} as const;

export const fixedSpacingScale = {
  "0": "0px",
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "7": "28px",
  "8": "32px",
} as const;

export const semanticSpacingScale = {
  "density-xxs": "2px",
  "density-xs": "4px",
  "density-sm": "6px",
  "density-md": "8px",
  "density-lg": "12px",
  "density-xl": "16px",
} as const;

export const designTokens = {} as const;

export function getColor(): string {
  return "#000000";
}
