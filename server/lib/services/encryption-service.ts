import crypto from 'crypto';

/**
 * Service for securely encrypting and decrypting sensitive data like API keys
 */
export class EncryptionService {
  private algorithm: string = 'aes-256-gcm';
  private encryptionKey: Buffer;
  
  constructor() {
    // Get encryption key from environment or generate a secure one
    // In production, this should be a stable environment variable
    const key = process.env.ENCRYPTION_KEY || 'default-development-encryption-key-change-me-123';
    // Create a 32 byte key using SHA256
    this.encryptionKey = crypto.createHash('sha256').update(key).digest();
  }
  
  /**
   * Encrypt sensitive data
   * @param text The plaintext data to encrypt
   * @returns Encrypted data in format: iv:authTag:encryptedData (base64 encoded)
   */
  encrypt(text: string): string {
    if (!text) return '';
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return IV, auth tag and encrypted data together
    return iv.toString('base64') + ':' + 
           authTag.toString('base64') + ':' + 
           encrypted;
  }
  
  /**
   * Decrypt encrypted data
   * @param encryptedText The encrypted data in format: iv:authTag:encryptedData (base64 encoded)
   * @returns The decrypted plaintext data
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    
    try {
      // Split the encrypted text
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'base64');
      const authTag = Buffer.from(parts[1], 'base64');
      const encryptedData = parts[2];
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

// Create a singleton instance
export const encryptionService = new EncryptionService();