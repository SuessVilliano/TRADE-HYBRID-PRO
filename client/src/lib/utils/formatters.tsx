import React from 'react';
import { Bitcoin, Diamond, DollarSign, Euro, Gem, CoinsIcon } from 'lucide-react';

/**
 * Format a number with commas as thousands separators
 */
export const formatNumber = (num: number, decimals = 2): string => {
  if (isNaN(num)) return '0';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format a price as currency (USD by default)
 */
export const formatCurrency = (amount: number, currency = 'USD', decimals = 2): string => {
  if (isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

/**
 * Format a large number in k/m/b format
 */
export const formatCompactNumber = (num: number): string => {
  if (isNaN(num)) return '0';
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(num);
};

/**
 * Convert a token symbol to an appropriate icon component
 */
export const tokenSymbolToIcon = (symbol?: string) => {
  if (!symbol) return <CoinsIcon className="h-6 w-6 mr-2 text-muted-foreground" />;
  
  const lowerSymbol = symbol.toLowerCase();
  
  if (lowerSymbol.includes('btc') || lowerSymbol === 'bitcoin') {
    return <Bitcoin className="h-6 w-6 mr-2 text-amber-500" />;
  } else if (lowerSymbol.includes('thc')) {
    return <Gem className="h-6 w-6 mr-2 text-purple-500" />;
  } else if (lowerSymbol.includes('usd') || lowerSymbol.includes('usdt') || lowerSymbol.includes('usdc')) {
    return <DollarSign className="h-6 w-6 mr-2 text-green-500" />;
  } else if (lowerSymbol.includes('eur')) {
    return <Euro className="h-6 w-6 mr-2 text-blue-500" />;
  } else if (lowerSymbol.includes('sol')) {
    return <Diamond className="h-6 w-6 mr-2 text-purple-400" />;
  } else {
    return <CoinsIcon className="h-6 w-6 mr-2 text-muted-foreground" />;
  }
};

/**
 * Truncate a string (like an address) to a shorter version
 */
export const truncateString = (str: string, frontChars = 6, endChars = 4): string => {
  if (!str) return '';
  if (str.length <= frontChars + endChars) return str;
  return `${str.substring(0, frontChars)}...${str.substring(str.length - endChars)}`;
};

// Adding proper exports for components to avoid import errors

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string | number | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a time to a readable string
 */
export const formatTime = (date: Date | string | number | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Time';
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Format a date and time to a readable string
 */
export const formatDateTime = (date: Date | string | number | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date/Time';
  
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get relative time (like "5 minutes ago")
 */
export const getRelativeTime = (date: Date | string | number | undefined): string => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minute${Math.floor(diffSec / 60) > 1 ? 's' : ''} ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour${Math.floor(diffSec / 3600) > 1 ? 's' : ''} ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} day${Math.floor(diffSec / 86400) > 1 ? 's' : ''} ago`;
  
  // If more than 30 days, just use the normal date
  return formatDate(date);
};

/**
 * Format percentage with a + sign for positive values
 */
export const formatPercentage = (percentage: number | undefined, includeSign = true): string => {
  if (percentage === undefined || isNaN(percentage)) return '0%';
  
  const sign = percentage > 0 && includeSign ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};