import { Router } from 'express';
import { authenticateUser, authenticateWallet, registerUser } from '../lib/auth-service';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Create express router
const router = Router();

/**
 * Login with username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const result = await authenticateUser(username, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    // Set user in session
    if (req.session) {
      req.session.userId = result.userId;
      req.session.username = result.username;
    }
    
    res.json({
      success: true,
      userId: result.userId,
      username: result.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Login with wallet
 */
router.post('/wallet-login', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }
    
    const result = await authenticateWallet(walletAddress);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    // Set user in session
    if (req.session) {
      req.session.userId = result.userId;
      req.session.username = result.username;
      req.session.walletAddress = walletAddress;
    }
    
    res.json({
      success: true,
      userId: result.userId,
      username: result.username
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email required' });
    }
    
    const result = await registerUser(username, password, email);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    // Set user in session
    if (req.session) {
      req.session.userId = result.userId;
      req.session.username = username;
    }
    
    res.json({
      success: true,
      userId: result.userId,
      username
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Logout
 */
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

/**
 * Get current user
 */
router.get('/user', async (req, res) => {
  try {
    if (req.session && req.session.userId) {
      // Get complete user data from the database for consistency
      const result = await db.select().from(users).where(eq(users.id, req.session.userId));
      
      if (result.length > 0) {
        const user = result[0];
        
        // Return only necessary user data (don't include password)
        res.json({
          authenticated: true,
          userId: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
          membershipLevel: req.session.membershipLevel || user.membershipLevel,
          whopId: req.session.whopId || user.whopId,
          hasConnectedApis: user.hasConnectedApis,
          balance: user.balance,
          isAdmin: user.isAdmin || false,
          isTokenHolder: user.thcTokenHolder || false
        });
      } else {
        // User found in session but not in database
        console.warn(`User with ID ${req.session.userId} found in session but not in database`);
        req.session.destroy((err) => {
          if (err) console.error('Error destroying invalid session:', err);
        });
        res.json({ authenticated: false });
      }
    } else {
      res.json({ authenticated: false });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      authenticated: false,
      error: 'Internal server error'
    });
  }
});

export default router;