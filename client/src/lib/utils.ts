import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if specified environment secrets are available
 * @param secrets List of secret keys to check
 * @returns True if all specified secrets are available
 */
export async function check_secrets(secrets: string[]): Promise<boolean> {
  try {
    // For client-side environment variables, we have to use a different approach
    // than on the server side. This implementation simulates checking for secrets
    // without actually accessing them directly (which isn't possible in browser).
    
    // In a real implementation, this would call an API endpoint that checks
    // if these secrets are available on the server side.
    
    // For now, we'll simulate that OpenAI key is not available
    if (secrets.includes('OPENAI_API_KEY')) {
      console.log('Simulating OpenAI API key check...');
      return false; // Simulate that OpenAI key is not available
    }
    
    return true; // Default to assuming other keys are available
  } catch (error) {
    console.error('Error checking for secrets:', error);
    return false;
  }
}