import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine and merge class names with Tailwind CSS classes
 * This is used extensively in UI components
 * @param inputs Class values to combine and merge
 * @returns Merged className string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Check if the specified environment secrets are available
 * @param keys Array of secret keys to check
 * @returns boolean indicating if all keys are available
 */
export async function check_secrets(keys: string[]): Promise<boolean> {
  if (!keys || keys.length === 0) {
    return false;
  }
  
  // In a browser context, we check if the environment variables are available
  const hasSecrets = keys.every(key => process.env[key] !== undefined);
  return hasSecrets;
}

/**
 * Request the user to provide specific API keys
 * This is a client-side implementation that shows a prompt to the user
 * @param keys Array of secret keys to request
 * @param message Message explaining why the keys are needed
 * @returns Promise that resolves when the user has provided the keys
 */
export async function ask_secrets(keys: string[], message: string): Promise<void> {
  if (!keys || keys.length === 0) {
    return;
  }
  
  // In an actual implementation, this would show a modal dialog
  // For now, we log to console
  console.log('API keys needed:', keys);
  console.log('Reason:', message);
  
  // Display a modal or notification to the user
  // This is just a placeholder - in a real app we would show a proper UI
  alert(`Please provide the following API keys: ${keys.join(', ')}\n\n${message}`);
  
  // In a real implementation, we would update environment variables
  // or securely store the keys provided by the user
  return Promise.resolve();
}

/**
 * Format a number with a specific number of decimal places
 * @param num Number to format
 * @param places Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(num: number, places: number = 2): string {
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: places,
    maximumFractionDigits: places
  });
}

/**
 * Format currency value with a specific currency code
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format a percentage value
 * @param value Number to format as percentage
 * @param places Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, places: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: places,
    maximumFractionDigits: places
  }).format(value / 100);
}

/**
 * Alias for formatPercent for backward compatibility
 * @param value Number to format as percentage
 * @param places Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, places: number = 2): string {
  return formatPercent(value, places);
}

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number = 25): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Alias for truncateString for backward compatibility
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number = 25): string {
  return truncateString(str, maxLength);
}

/**
 * Generate a random string ID of specified length
 * @param length Length of the ID to generate
 * @returns Random string ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle a function call
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Deep clone an object
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 * @param target Target object
 * @param source Source object
 * @returns Merged object
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const output = { ...target } as T & U;
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key as keyof U])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof U] });
        } else {
          output[key as keyof (T & U)] = deepMerge(
            target[key as keyof T] as object,
            source[key as keyof U] as object
          ) as any;
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof U] });
      }
    });
  }
  
  return output;
}

/**
 * Check if value is an object
 * @param item Value to check
 * @returns Boolean indicating if value is an object
 */
function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Wait for a specified number of milliseconds
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function multiple times
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Delay between retries in milliseconds
 * @param exponential Whether to use exponential backoff
 * @returns Promise resolving to the function result
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  exponential: boolean = true
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    await sleep(delay);
    return retry(
      fn,
      retries - 1,
      exponential ? delay * 2 : delay,
      exponential
    );
  }
}

/**
 * Get a nested value from an object using a path string
 * @param obj Object to get value from
 * @param path Path to the value (e.g. 'user.address.city')
 * @param defaultValue Default value if path doesn't exist
 * @returns Value at path or default value
 */
export function getNestedValue<T, D = undefined>(
  obj: any,
  path: string,
  defaultValue?: D
): T | D {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue as D;
    }
    result = result[key];
  }
  
  return (result === undefined) ? (defaultValue as D) : (result as T);
}

/**
 * This function is used to get a consistent timestamp for tracking
 * service calls, requests, and other time-sensitive operations
 * @returns Current timestamp in milliseconds
 */
export function timestamp(): number {
  return Date.now();
}

/**
 * Format a date string to a readable format
 * @param dateStr Date string to format
 * @param options Date formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateStr: string | Date,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }
): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format a time string (hours and minutes) from a date
 * @param dateStr Date string or Date object to format
 * @param includeSeconds Whether to include seconds in the output
 * @returns Formatted time string (HH:MM or HH:MM:SS)
 */
export function formatTime(dateStr: string | Date, includeSeconds: boolean = false): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  if (includeSeconds) {
    options.second = '2-digit';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}