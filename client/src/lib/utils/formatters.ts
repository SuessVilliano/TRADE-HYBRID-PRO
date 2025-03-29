/**
 * Utility functions for formatting values in the application
 */

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

/**
 * Format a file size in bytes to a human-readable format
 * @param {number} bytes - File size in bytes
 * @param {object} options - Formatting options
 * @returns {string} Formatted file size
 */
export function formatFileSize(
  bytes: number,
  options: {
    precision?: number;
  } = {}
): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const precision = options.precision || 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(precision)) + ' ' + sizes[i];
}

/**
 * Format an address string by shortening it (e.g. for blockchain addresses)
 * @param {string} address - The address to shorten
 * @param {object} options - Formatting options
 * @returns {string} Shortened address
 */
export function formatShortAddress(
  address: string,
  options: {
    prefixLength?: number;
    suffixLength?: number;
    separator?: string;
  } = {}
): string {
  if (!address) return '';
  
  const prefixLength = options.prefixLength || 4;
  const suffixLength = options.suffixLength || 4;
  const separator = options.separator || '...';
  
  if (address.length <= prefixLength + suffixLength) return address;
  
  return `${address.substring(0, prefixLength)}${separator}${address.substring(address.length - suffixLength)}`;
}

/**
 * Format a time duration in milliseconds to a human-readable format
 * @param {number} ms - Duration in milliseconds
 * @param {object} options - Formatting options
 * @returns {string} Formatted duration
 */
export function formatDuration(
  ms: number,
  options: {
    format?: 'short' | 'long';
    maxUnits?: number;
  } = {}
): string {
  if (ms === 0) return '0s';
  
  const format = options.format || 'short';
  const maxUnits = options.maxUnits || 2;
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  const units = [
    { value: days, long: ' days', short: 'd' },
    { value: hours, long: ' hours', short: 'h' },
    { value: minutes, long: ' minutes', short: 'm' },
    { value: seconds, long: ' seconds', short: 's' }
  ];
  
  const result = units
    .filter(unit => unit.value > 0)
    .slice(0, maxUnits)
    .map(unit => `${unit.value}${format === 'short' ? unit.short : unit.long}`)
    .join(' ');
  
  return result || `0${format === 'short' ? 's' : ' seconds'}`;
}