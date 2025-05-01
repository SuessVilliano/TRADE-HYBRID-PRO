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
    
    // Check if email already exists in our database
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    // Check if a Whop account with this email exists by attempting to get Whop data
    let whopUser = null;
    let whopSync = false;
    let membershipLevel = 'free';
    
    try {
      // Try to find a matching Whop account
      whopUser = await authService.findWhopUserByEmail(email);
      
      if (whopUser) {
        console.log(`Found matching Whop user for email ${email}:`, whopUser);
        whopSync = true;
        
        if (whopUser.plan && whopUser.plan.name) {
          // Map Whop plan to our membership levels
          const planName = whopUser.plan.name.toLowerCase();
          if (planName.includes('pro')) {
            membershipLevel = 'pro';
          } else if (planName.includes('advanced')) {
            membershipLevel = 'advanced';
          } else if (planName.includes('intermediate')) {
            membershipLevel = 'intermediate';
          } else if (planName.includes('beginner')) {
            membershipLevel = 'beginner';
          } else {
            membershipLevel = 'paid';
          }
        }
      }
    } catch (whopError) {
      console.warn('Failed to check Whop for email match:', whopError);
      // Continue with registration as a free user
    }
    
    // If the email exists in our database, we won't create a new account
    if (existingEmail) {
      if (whopSync) {
        // If we found a matching Whop account, update the existing user with Whop info
        await db.update(users)
          .set({
            whopId: whopUser.id,
            whopPlanId: whopUser.plan?.id,
            membershipLevel: membershipLevel,
            updatedAt: new Date()
          })
          .where(eq(users.id, existingEmail.id));
          
        // Set up the session with the existing user
        req.session.userId = existingEmail.id;
        
        // Return the updated user info
        return res.json({
          success: true,
          synced: true,
          user: {
            id: existingEmail.id,
            username: existingEmail.username,
            email: existingEmail.email,
            membershipLevel: membershipLevel
          }
        });
      } else {
        // If no Whop match but email exists in our DB, just return an error
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    // Create new user with potential Whop data
    const [newUser] = await db.insert(users)
      .values({
        username,
        email,
        password, // In production, this should be hashed with bcrypt
        createdAt: new Date(),
        updatedAt: new Date(),
        membershipLevel: membershipLevel,
        thcTokenHolder: false,
        walletAuthEnabled: false,
        whopId: whopUser?.id,
        whopPlanId: whopUser?.plan?.id
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        membershipLevel: users.membershipLevel
      });
    
    // Set session
    req.session.userId = newUser.id;
    
    return res.json({
      success: true,
      synced: whopSync,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        membershipLevel: newUser.membershipLevel
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