import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Required by signals-list.tsx
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function truncate(text: string, maxLength: number = 20): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// Required by smart-trade-panel.tsx and other components
export async function check_secrets(secretKeys: string[]): Promise<Record<string, boolean>> {
  // Mock implementation for now
  const result: Record<string, boolean> = {};
  secretKeys.forEach(key => {
    result[key] = !!localStorage.getItem(key);
  });
  return result;
}

export async function ask_secrets(secretKeys: string[], message: string): Promise<void> {
  // Mock implementation for now
  console.log(`Please provide the following secrets: ${secretKeys.join(', ')}`);
  console.log(message);
}

export function formatNumber(
  number: number,
  options: {
    decimals?: number;
    style?: "decimal" | "currency" | "percent";
    currency?: string;
  } = {}
) {
  const { decimals = 2, style = "decimal", currency = "USD" } = options;

  const formatter = new Intl.NumberFormat("en-US", {
    style,
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(number);
}

export function formatCurrency(
  number: number,
  currency: string = "USD",
  decimals: number = 2
) {
  return formatNumber(number, {
    style: "currency",
    currency,
    decimals,
  });
}

export function formatPercentage(
  number: number,
  decimals: number = 2
) {
  return formatNumber(number, {
    style: "percent",
    decimals,
  });
}

export function formatCompactNumber(number: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  });

  return formatter.format(number);
}

export function truncateString(str: string, length: number = 20) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}