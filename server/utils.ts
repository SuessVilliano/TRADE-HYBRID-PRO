/**
 * Generate a random UUID v4
 */
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a random string token
 */
export const generateToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
};

/**
 * Safely parse JSON with a fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    return fallback;
  }
};

/**
 * Format a date as a string
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Try to convert a stringified number to a number
 */
export const toNumber = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  
  return parsed;
};

/**
 * Sanitize a string for use in URLs
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove non-word chars
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores, and hyphens with a single hyphen
    .replace(/^-+|-+$/g, '');  // Trim hyphens from start and end
};

/**
 * Truncate a string to a certain length and add an ellipsis
 */
export const truncate = (str: string, length: number = 100): string => {
  if (str.length <= length) {
    return str;
  }
  
  return str.substring(0, length) + '...';
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj)) as T;
};

/**
 * Get current timestamp in seconds
 */
export const getTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get random integer between min and max (inclusive)
 */
export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};