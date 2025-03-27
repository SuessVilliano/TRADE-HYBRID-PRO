import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number)
}

export function formatPercentage(number: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero'
  }).format(number / 100)
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getAssetColor(symbol: string): string {
  // Default colors for different assets
  const colors: Record<string, string> = {
    BTC: '#F7931A', // Bitcoin orange
    ETH: '#627EEA', // Ethereum blue
    XAU: '#D4AF37', // Gold
    EUR: '#0052B4', // Euro blue
    USD: '#21AF73', // Dollar green
    THC: '#9333EA', // THC Coin purple
  }
  
  // Extract the base asset
  const baseAsset = symbol.substring(0, 3)
  
  return colors[baseAsset] || '#64748b' // Default slate color
}

export function getRandomId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Function to mock asking for secrets - used in development
export async function ask_secrets(secretKeys: string[], userMessage: string): Promise<Record<string, string>> {
  console.log(`Requesting secrets: ${secretKeys.join(', ')}. Message: ${userMessage}`);
  // In a real implementation, this would use the ask_secrets tool
  // For now, just return mock values
  return secretKeys.reduce((acc, key) => {
    acc[key] = `mock_${key}_value`;
    return acc;
  }, {} as Record<string, string>);
}

// Function to mock checking for secrets - used in development
export async function check_secrets(secretKeys: string[]): Promise<Record<string, boolean>> {
  console.log(`Checking for secrets: ${secretKeys.join(', ')}`);
  // In a real implementation, this would use the check_secrets tool
  // For now, just return mock values
  return secretKeys.reduce((acc, key) => {
    acc[key] = key === 'OPENAI_API_KEY';
    return acc;
  }, {} as Record<string, boolean>);
}