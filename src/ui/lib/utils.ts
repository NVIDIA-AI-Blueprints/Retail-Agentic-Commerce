import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount (cents to dollars)
 */
export function formatCurrency(cents: number, currency = "usd"): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(dollars);
}

/**
 * Generate a random ID for demo purposes
 */
export function generateId(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${random}`;
}
