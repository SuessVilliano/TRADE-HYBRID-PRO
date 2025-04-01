import crypto from 'crypto';

/**
 * Service for encrypting and decrypting sensitive data
 * This is used for storing API keys, secrets, and other credentials securely
 */
class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;
  private isInitialized = false;
  
  /**
   * Initialize the encryption service with a secret key
   * This should be called on server startup
   */
  initialize(): void {
    // In a production environment, this key should be stored securely
    // and not hardcoded or committed to version control
    const secretKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    
    // Create a fixed-length key using SHA-256
    this.key = crypto.createHash('sha256').update(secretKey).digest();
    this.isInitialized = true;
    
    console.log('Encryption service initialized');
  }
  
  /**
   * Encrypt a string
   * @param text The text to encrypt
   * @returns The encrypted text as a base64-encoded string
   */
  async encrypt(text: string): Promise<string> {
    this.ensureInitialized();
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Combine IV and encrypted text (IV needs to be stored with the encrypted data for decryption)
    // Convert the IV to base64 and prepend it to the encrypted text
    return iv.toString('base64') + ':' + encrypted;
  }
  
  /**
   * Decrypt a string
   * @param encryptedText The encrypted text (with IV) to decrypt
   * @returns The decrypted text
   */
  async decrypt(encryptedText: string): Promise<string> {
    this.ensureInitialized();
    
    // Split the IV and encrypted text
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const encryptedData = parts[1];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Ensure the service is initialized before use
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      this.initialize();
    }
  }
}

// Create and export singleton instance
export const encryptionService = new EncryptionService();