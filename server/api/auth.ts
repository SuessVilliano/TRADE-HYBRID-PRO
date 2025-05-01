import express from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authService } from '../services/auth-service';

const router = express.Router();

// Get current authenticated user
router.get('/user', async (req, res) => {
  try {
    // Check if user is authenticated through session
    if (req.session && req.session.userId) {
      // Get user from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.session.userId)
      });
      
      if (user) {
        // Return user without sensitive information
        return res.json({
          authenticated: true,
          id: user.id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          walletAddress: user.walletAddress,
          walletAuthEnabled: user.walletAuthEnabled,
          thcTokenHolder: user.thcTokenHolder,
          membershipLevel: user.membershipLevel,
          whopId: user.whopId,
          favoriteSymbols: user.favoriteSymbols
        });
      }
    }
    
    // User not authenticated
    return res.json({ authenticated: false });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ error: 'Failed to get current user' });
  }
});

// Login with username/password
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // In production, we should use bcrypt to compare passwords
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set user ID in session
    req.session.userId = user.id;
    if (user.whopId) {
      req.session.whopId = user.whopId;
    }
    
    // Update last login time
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    // Return user without sensitive information
    return res.json({
      authenticated: true,
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || user.avatar,
      walletAddress: user.walletAddress,
      walletAuthEnabled: user.walletAuthEnabled,
      thcTokenHolder: user.thcTokenHolder,
      membershipLevel: user.membershipLevel,
      whopId: user.whopId,
      favoriteSymbols: user.favoriteSymbols
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

// Login with Whop token
router.post('/login/whop', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Authenticate with Whop
    const user = await authService.authenticateWithWhop(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Set user ID in session
    req.session.userId = user.id;
    req.session.whopId = user.whopId;
    
    // Update last login time
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    // Return user without sensitive information
    return res.json({
      authenticated: true,
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage || user.avatar,
      walletAddress: user.walletAddress,
      walletAuthEnabled: user.walletAuthEnabled,
      thcTokenHolder: user.thcTokenHolder,
      membershipLevel: user.membershipLevel,
      whopId: user.whopId,
      favoriteSymbols: user.favoriteSymbols
    });
  } catch (error) {
    console.error('Error logging in with Whop:', error);
    return res.status(500).json({ error: 'Failed to login with Whop' });
  }
});

// Register a new user account
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Check if username already exists
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Create new user
    const [newUser] = await db.insert(users)
      .values({
        username,
        email,
        password, // In production, this should be hashed with bcrypt
        createdAt: new Date(),
        updatedAt: new Date(),
        membershipLevel: 'free', // Default membership level
        thcTokenHolder: false,
        walletAuthEnabled: false
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email
      });
    
    // Set session
    req.session.userId = newUser.id;
    
    return res.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        membershipLevel: 'free'
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      
      return res.json({ success: true });
    });
  } catch (error) {
    console.error('Error logging out:', error);
    return res.status(500).json({ error: 'Failed to logout' });
  }
});

// Connect wallet address
router.post('/connect-wallet', async (req, res) => {
  try {
    const { walletAddress, provider } = req.body;
    
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Update user's wallet address
    await db.update(users)
      .set({ 
        walletAddress, 
        walletAuthEnabled: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.session.userId));
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// Verify wallet connection
router.post('/verify-wallet', async (req, res) => {
  try {
    const { signature, message, walletAddress } = req.body;
    
    // In a real implementation, we would verify the signature here
    // For now, we'll just check if the wallet address matches what's in the database
    
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.session.userId)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if wallet address matches
    if (user.walletAddress !== walletAddress) {
      return res.status(401).json({ error: 'Wallet address mismatch' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error verifying wallet:', error);
    return res.status(500).json({ error: 'Failed to verify wallet' });
  }
});

// Check THC token balance
router.get('/thc-balance', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.session.userId)
    });
    
    if (!user || !user.walletAddress) {
      return res.status(400).json({ error: 'No wallet connected' });
    }
    
    // In a real implementation, we would query the blockchain for the THC token balance
    // For now, we'll just check if the user is flagged as a THC token holder in the database
    
    return res.json({
      thcTokenHolder: user.thcTokenHolder || false,
      // We'll add more detailed balance information when implementing the real blockchain query
    });
  } catch (error) {
    console.error('Error checking THC balance:', error);
    return res.status(500).json({ error: 'Failed to check THC balance' });
  }
});

export default router;