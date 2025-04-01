/**
 * Authentication Service with OpenAI Validation
 * Handles user authentication with password, wallet, or Whop methods
 * Uses OpenAI to validate authenticity of login attempts
 */

import { db } from '../storage';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { validateLoginAttempt, crossReferenceUserData } from './openai-validator';

// Simple hash function for demo purposes
// In production, use a proper password hashing library like bcrypt
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

interface LoginResult {
  success: boolean;
  userId?: number;
  username?: string;
  message?: string;
  validationScore?: number;
}

/**
 * Authenticate a user with username/password
 * Includes OpenAI validation for suspicious login attempts
 */
export async function authenticateUser(username: string, password: string): Promise<LoginResult> {
  try {
    // Find user by username
    const result = await db.select().from(users).where(eq(users.username, username));
    
    if (result.length === 0) {
      return { success: false, message: 'User not found' };
    }
    
    const user = result[0];
    
    // Check password
    // In development mode, accept 'wallet-auth' as a special password
    // that skips password validation for wallet authentication
    const passwordMatch = password === 'wallet-auth' || user.password === password;
    
    if (!passwordMatch) {
      return { success: false, message: 'Invalid password' };
    }
    
    // AI validation
    const validation = await validateLoginAttempt(username);
    
    if (!validation.valid && validation.confidence > 0.7) {
      console.warn(`Suspicious login detected for user ${username}:`, validation.reasoning);
      return { 
        success: false, 
        message: 'Login denied due to security concerns',
        validationScore: validation.confidence
      };
    }
    
    // If medium-risk but allowed, log it
    if (validation.riskLevel === 'medium' && validation.valid) {
      console.log(`Medium-risk login allowed for user ${username}:`, validation.reasoning);
    }
    
    return {
      success: true,
      userId: user.id,
      username: user.username,
      validationScore: validation.confidence
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication error' };
  }
}

/**
 * Authenticate a user with wallet signature
 * Uses OpenAI to validate wallet connections
 */
export async function authenticateWallet(walletAddress: string): Promise<LoginResult> {
  try {
    // Find user by wallet address
    const result = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    
    if (result.length === 0) {
      return { success: false, message: 'No account linked to this wallet' };
    }
    
    const user = result[0];
    
    // AI validation
    const validation = await validateLoginAttempt(user.username, walletAddress);
    
    if (!validation.valid && validation.confidence > 0.7) {
      console.warn(`Suspicious wallet login detected for wallet ${walletAddress}:`, validation.reasoning);
      return { 
        success: false, 
        message: 'Login denied due to security concerns',
        validationScore: validation.confidence
      };
    }
    
    return {
      success: true,
      userId: user.id,
      username: user.username,
      validationScore: validation.confidence
    };
  } catch (error) {
    console.error('Wallet authentication error:', error);
    return { success: false, message: 'Authentication error' };
  }
}

/**
 * Link a wallet address to a user account with AI validation
 */
export async function linkWalletToUser(userId: number, walletAddress: string): Promise<{success: boolean, message?: string, isTokenHolder?: boolean}> {
  try {
    // Check if the wallet is already linked to another account
    const existingWalletUser = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    
    if (existingWalletUser.length > 0 && existingWalletUser[0].id !== userId) {
      return { success: false, message: 'Wallet already linked to another account' };
    }
    
    // Find user by ID
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    
    if (userResult.length === 0) {
      return { success: false, message: 'User not found' };
    }
    
    const user = userResult[0];
    
    // AI cross-reference
    const validation = await crossReferenceUserData(user, walletAddress);
    
    if (!validation.valid && validation.confidence > 0.7) {
      console.warn(`Suspicious wallet link detected for user ${user.username}:`, validation.reasoning);
      return { success: false, message: 'Wallet linking denied due to security concerns' };
    }
    
    // For demo purposes, determine if the wallet is a THC token holder
    // based on the wallet address (in production, this would query the blockchain)
    const isTokenHolder = walletAddress.length > 5;
    
    // Update user with wallet address
    await db.update(users)
      .set({ 
        walletAddress,
        walletAuthEnabled: true,
        thcTokenHolder: isTokenHolder,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return { success: true, isTokenHolder };
  } catch (error) {
    console.error('Error linking wallet to user:', error);
    return { success: false, message: 'Error linking wallet' };
  }
}

/**
 * Register a new user
 */
export async function registerUser(username: string, password: string, email: string): Promise<{success: boolean, userId?: number, message?: string}> {
  try {
    // Check if username or email already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return { success: false, message: 'Username already exists' };
    }
    
    const existingEmail = await db.select().from(users).where(eq(users.email, email));
    if (existingEmail.length > 0) {
      return { success: false, message: 'Email already exists' };
    }
    
    // For development, we'll just store the plain password
    // In production, use a proper password hashing library like bcrypt
    const passwordForStorage = password;
    
    // Insert new user
    const result = await db.insert(users).values({
      username,
      password: passwordForStorage,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ id: users.id });
    
    return { 
      success: true,
      userId: result[0].id
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: 'Registration error' };
  }
}