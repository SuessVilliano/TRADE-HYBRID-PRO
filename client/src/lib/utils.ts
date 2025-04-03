import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the specified secrets are available in the environment
 * @param secretKeys - Array of secret key names to check
 * @returns Promise resolving to boolean indicating if all secrets are available
 */
export async function check_secrets(secretKeys: string[]): Promise<boolean> {
  try {
    // Check if all required secrets are available
    // This is a simple implementation that will always return true in the browser
    // In a real application, you would make an API call to check if secrets exist server-side
    return true;
  } catch (error) {
    console.error('Error checking secrets:', error);
    return false;
  }
}

/**
 * Format a number as currency with $ symbol
 * @param {number} value - The number to format as currency
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(
  value: number,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    smallValuePrecision?: boolean;
  } = {}
): string {
  if (value === undefined || value === null) return '-';
  
  // For very small values, use more decimal places
  const useSmallValuePrecision = options.smallValuePrecision !== false;
  const minDigits = options.minimumFractionDigits !== undefined 
    ? options.minimumFractionDigits 
    : (useSmallValuePrecision && value < 0.01 ? 6 : 2);
  
  const maxDigits = options.maximumFractionDigits !== undefined 
    ? options.maximumFractionDigits
    : (useSmallValuePrecision && value < 0.01 ? 6 : 2);
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: options.currency || 'USD',
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(value);
}

/**
 * Format a number with compact notation (like 1K, 1M)
 * @param {number} value - The number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted compact number string
 */
export function formatCompactNumber(
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: options.minimumFractionDigits || 0,
    maximumFractionDigits: options.maximumFractionDigits || 1,
  }).format(value);
}

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted number string
 */
export function formatNumber(
  value: number, 
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options.minimumFractionDigits || 0,
    maximumFractionDigits: options.maximumFractionDigits || 0,
  }).format(value);
}

/**
 * Format a date with standard localized format
 * @param {Date|number|string} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(
  date: Date | number | string,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full';
    includeTime?: boolean;
  } = {}
): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  // Default to medium format
  const format = options.format || 'medium';
  
  // Format map for different styles
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  // Add time if requested
  if (options.includeTime) {
    formatOptions[format].hour = 'numeric';
    formatOptions[format].minute = 'numeric';
  }
  
  return new Intl.DateTimeFormat('en-US', formatOptions[format]).format(dateObj);
}

/**
 * Format a percentage value
 * @param {number} value - The percentage value (e.g. 0.25 for 25%)
 * @param {object} options - Formatting options
 * @returns {string} Formatted percentage string
 */
export function formatPercent(
  value: number,
  options: {
    multiplier?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showPlusSign?: boolean;
  } = {}
): string {
  if (value === undefined || value === null) return '-';
  
  // If value is already in percentage form (e.g. 25 instead of 0.25)
  // we should not multiply again
  const valueToFormat = options.multiplier === false 
    ? value 
    : value * 100;
  
  let formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: options.minimumFractionDigits || 0,
    maximumFractionDigits: options.maximumFractionDigits || 2,
    // Intl.NumberFormat handles the percentage multiplication automatically
    // when using style: 'percent'
    useGrouping: true
  }).format(options.multiplier === false ? valueToFormat / 100 : value);
  
  // Add + sign for positive values if requested
  if (options.showPlusSign && value > 0) {
    formatted = '+' + formatted;
  }
  
  return formatted;
}