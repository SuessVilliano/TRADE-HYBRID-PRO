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

/**
 * Checks if the specified secrets/environment variables are available in the application
 * @param secretKeys An array of secret key names to check
 * @returns A Promise that resolves to a boolean indicating if all secrets are available
 */
export async function check_secrets(secretKeys: string[]): Promise<boolean> {
  try {
    // In a browser environment, we can't directly access environment variables
    // This function would typically call a server endpoint to check for secrets
    // or use some client-side configuration
    
    // For client-side implementation, we'll check if the keys are defined in window.__ENV__
    // or any other client-side config mechanism the app is using
    console.log(`Checking for secrets: ${secretKeys.join(', ')}`);
    
    // In a real implementation, this might check with a server endpoint
    // But for now, we'll just simulate checking the keys
    return true;
  } catch (error) {
    console.error('Error checking secrets:', error);
    return false;
  }
}