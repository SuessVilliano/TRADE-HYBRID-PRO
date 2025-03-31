import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into a compact representation (e.g., 1.2k, 3.5M)
 * @param value The number to format
 * @param maximumFractionDigits Maximum number of decimal places to show
 * @returns The formatted string
 */
export function formatCompactNumber(value: number, maximumFractionDigits: number = 1): string {
  if (value === 0) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits
  });
  
  return formatter.format(value);
}

/**
 * Formats a number as currency (e.g., $1,234.56)
 * @param value The number to format
 * @param currency The currency code (default: 'USD')
 * @param locale The locale code (default: 'en-US')
 * @returns The formatted string
 */
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  if (isNaN(value)) return '$0.00';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Function to check API secrets 
 * @param secretKey The name of the secret to check
 * @returns Boolean indicating whether the secret is available
 */
export function check_secrets(secretKey: string): boolean {
  // This is a stub function that always returns true
  // In production, this would actually check for environment variables
  return true;
}