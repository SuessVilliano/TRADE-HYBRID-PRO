/**
 * Utility functions for the server
 */

/**
 * Generate a unique ID for database records
 * @returns A random string ID
 */
export function generateId(): string {
  // Combination of timestamp and random string for uniqueness
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format a date object to ISO string with timezone information
 * @param date Date object to format
 * @returns Formatted date string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Safely parse JSON without throwing errors
 * @param str String to parse as JSON
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    return fallback;
  }
}