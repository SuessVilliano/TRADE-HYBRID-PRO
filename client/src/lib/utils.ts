import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names or class value objects into a single string
 * Uses clsx for conditional classes and twMerge to handle Tailwind CSS class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price number with proper decimal places and currency symbol
 */
export function formatPrice(
  price: number,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "BTC" | "ETH" | "THC"
    notation?: Intl.NumberFormatOptions["notation"]
    decimals?: number
  } = {}
) {
  const { currency = "USD", notation = "standard", decimals = 2 } = options
  
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    BTC: "₿",
    ETH: "Ξ",
    THC: "₮",
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // We'll replace the currency symbol manually
    notation,
    maximumFractionDigits: decimals,
  })

  const formattedPrice = formatter.format(price).replace("$", "")
  return `${symbols[currency]}${formattedPrice}`
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 */
export function truncateString(str: string, maxLength: number = 20): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

// Alias for truncateString
export const truncateText = truncateString;

/**
 * Generates a unique ID with optional prefix
 */
export function generateId(prefix: string = ""): string {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Checks if the client is on a mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // Standard breakpoint for mobile devices
}

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Converts RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Gets a random item from an array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffles an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Formats a Date object to a human-readable string
 */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  return new Date(date).toLocaleDateString('en-US', mergedOptions);
}

// Alias for formatPrice to maintain compatibility
export const formatCurrency = formatPrice;