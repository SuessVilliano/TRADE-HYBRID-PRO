import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and applies Tailwind's merge strategy.
 * @param inputs Any number of class values to be merged
 * @returns A merged and cleaned up class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into a compact string representation (eg: 1,200 -> 1.2K)
 * @param num The number to format
 * @returns A compact string representation
 */
export function formatCompactNumber(num: number): string {
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
}

/**
 * Formats a number as currency (USD by default)
 * @param amount The amount to format
 * @param currency The currency code (default: 'USD')
 * @returns A formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}