import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

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
 * Formats a date to a standard format (e.g., Jan 1, 2023)
 * @param date The date to format
 * @param formatString The format string to use
 * @returns The formatted date string
 */
export function formatDate(date: Date | string | number, formatString: string = 'MMM d, yyyy'): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats a time to a standard format (e.g., 14:30:00)
 * @param date The date/time to format
 * @param formatString The format string to use
 * @returns The formatted time string
 */
export function formatTime(date: Date | string | number, formatString: string = 'HH:mm:ss'): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}

/**
 * Formats a percentage value (e.g., 12.34%)
 * @param value The decimal value to format as percentage
 * @param digits The number of digits after decimal point
 * @returns The formatted percentage string
 */
export function formatPercent(value: number, digits: number = 2): string {
  if (isNaN(value)) return '0.00%';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

/**
 * Truncates a string if it exceeds the maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length before truncation
 * @returns The truncated string
 */
export function truncate(str: string, maxLength: number = 30): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength)}...`;
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