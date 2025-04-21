/**
 * Validator API functions for interacting with Solana validator endpoints
 */

/**
 * Fetch validator credentials from the server
 * This uses the secure server endpoint to get validator identity
 * and vote account information.
 */
export async function getValidatorCredentials() {
  try {
    const response = await fetch('/api/validator/credentials');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch validator credentials: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching validator credentials:', error);
    throw error;
  }
}