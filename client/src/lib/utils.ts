import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simulate checking for environment secrets
export async function check_secrets(secretKeys: string[]): Promise<string[]> {
  const availableSecrets: string[] = [];
  
  for (const key of secretKeys) {
    // Check if the environment variable exists and has a value
    if (process.env[key]) {
      availableSecrets.push(key);
    } else {
      console.log(`Secret ${key} is not available`);
    }
  }
  
  return availableSecrets;
}

// Ask for secrets function (uses the backend API)
export async function ask_secrets(secretKeys: string[], message: string): Promise<void> {
  console.log(`Requesting secrets: ${secretKeys.join(', ')}`);
  console.log(`Message to user: ${message}`);
  
  // This would call the API to request secrets from the user
  // For now, we're returning a promise that resolves immediately
  return Promise.resolve();
}

// Format number as currency
export function formatCurrency(value: number, currency = 'USD', showCents = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }).format(value);
}

// Format number as percentage
export function formatPercentage(value: number, digits = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;
}

// Get relative time (e.g. "5 minutes ago")
export function getRelativeTime(date: Date | number | string): string {
  const now = new Date();
  const pastDate = new Date(date);
  const secondsAgo = Math.round((now.getTime() - pastDate.getTime()) / 1000);
  
  if (secondsAgo < 60) {
    return 'just now';
  }
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
  }
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
  }
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) {
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  }
  
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`;
  }
  
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Generate a random ID
export function generateId(length = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Delay for a specified number of milliseconds
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Download data as a file
export function downloadFile(data: string, filename: string, type = 'text/plain'): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Parse a date string into a Date object
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

// Format a date
export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  return new Intl.DateTimeFormat('en-US', mergedOptions).format(new Date(date));
}