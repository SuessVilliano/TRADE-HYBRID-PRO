import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The ISO currency code (e.g., USD, EUR)
 * @param locale The locale to use for formatting (defaults to user's locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = navigator.language
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number with thousands separators
 * @param number The number to format
 * @param locale The locale to use for formatting (defaults to user's locale)
 * @returns Formatted number string
 */
export function formatNumber(
  number: number,
  locale: string = navigator.language
): string {
  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Format a percentage
 * @param value The decimal value to format as percentage
 * @param decimals Number of decimal places to show
 * @param locale The locale to use for formatting (defaults to user's locale)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  locale: string = navigator.language
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}

/**
 * Check if specified environment secrets are available
 * @param secrets List of secret keys to check
 * @returns True if all specified secrets are available
 */
export async function check_secrets(secrets: string[]): Promise<boolean> {
  try {
    // For client-side environment variables, we have to use a different approach
    // than on the server side. This implementation simulates checking for secrets
    // without actually accessing them directly (which isn't possible in browser).
    
    // In a real implementation, this would call an API endpoint that checks
    // if these secrets are available on the server side.
    
    // For now, we'll simulate that OpenAI key is not available
    if (secrets.includes('OPENAI_API_KEY')) {
      console.log('Simulating OpenAI API key check...');
      return false; // Simulate that OpenAI key is not available
    }
    
    return true; // Default to assuming other keys are available
  } catch (error) {
    console.error('Error checking for secrets:', error);
    return false;
  }
}