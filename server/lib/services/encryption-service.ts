import * as crypto from 'crypto';

// Add type definitions to fix TypeScript errors
interface CipherGCM extends crypto.Cipher {
  getAuthTag(): Buffer;
}

interface DecipherGCM extends crypto.Decipher {
  setAuthTag(buffer: Buffer): void;
}

/**
 * Encryption utility for sensitive data like API keys
 * Uses AES-256-GCM encryption for high security
 */
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private encryptionKey: Buffer;
  private ivLength = 16; // Initialization vector length
  private authTagLength = 16; // Authentication tag length

  constructor() {
    // Use environment variable for encryption key, or use a fallback for development (not secure for production)
    const key = process.env.ENCRYPTION_KEY || 'trade-hybrid-dev-encryption-key-123456789';
    if (!process.env.ENCRYPTION_KEY) {
      console.warn('ENCRYPTION_KEY environment variable not set. Using default key for development only.');
    }
    
    // Derive a 32-byte key using SHA-256 from the provided key
    this.encryptionKey = crypto.createHash('sha256').update(key).digest();
  }

  /**
   * Encrypts a string using AES-256-GCM
   * @param plaintext The text to encrypt
   * @returns The encrypted data with IV and auth tag as a single base64 string
   */
  encrypt(plaintext: string): string {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(this.ivLength);
    
    // Create cipher with key and IV
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv) as CipherGCM;
    
    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV, encrypted data, and auth tag into a single string
    // Format: base64(iv):base64(encrypted):base64(authTag)
    return Buffer.concat([
      iv,
      Buffer.from(encrypted, 'base64'),
      authTag
    ]).toString('base64');
  }

  /**
   * Decrypts an encrypted string
   * @param encryptedData The encrypted data string (from encrypt())
   * @returns The decrypted plaintext
   */
  decrypt(encryptedData: string): string {
    try {
      // Convert the combined string back to a buffer
      const data = Buffer.from(encryptedData, 'base64');
      
      // Extract the IV, encrypted data, and auth tag
      const iv = data.subarray(0, this.ivLength);
      const encryptedText = data.subarray(this.ivLength, data.length - this.authTagLength);
      const authTag = data.subarray(data.length - this.authTagLength);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv) as DecipherGCM;
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encryptedText.toString('base64'), 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw new Error('Failed to decrypt sensitive data. The data may be corrupted or tampered with.');
    }
  }

  /**
   * Generates a secure random token for connection identification
   * This is used as the connectionToken for broker connections
   * @param length Length of the token in bytes (default: 32)
   * @returns A secure random token as a hex string
   */
  generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Singleton instance for use throughout the application
const encryptionService = new EncryptionService();
export default encryptionService;