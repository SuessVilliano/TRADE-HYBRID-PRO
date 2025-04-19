/**
 * Re-export utility functions from the formatter library
 */
import { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  formatDate, 
  formatFileSize, 
  formatDuration, 
  formatShortAddress 
} from './formatters';

// Export utility functions directly
export { 
  formatCurrency, 
  formatNumber, 
  formatPercent, 
  formatDate, 
  formatFileSize, 
  formatDuration, 
  formatShortAddress 
};

/**
 * Merge classnames for better component styling
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}