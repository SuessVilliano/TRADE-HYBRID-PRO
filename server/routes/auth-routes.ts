import { Router } from 'express';
import { authenticateUser, authenticateWallet, registerUser } from '../lib/auth-service';

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
router.get('/user', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      userId: req.session.userId,
      username: req.session.username,
      walletAddress: req.session.walletAddress
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

export default router;