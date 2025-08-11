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
      try {
        // Use direct SQL to avoid column name issues
        const sql = db.$client;
        const result = await sql`
          SELECT 
            id, 
            username, 
            email, 
            profile_image as "profileImage", 
            avatar,
            wallet_address as "walletAddress", 
            wallet_auth_enabled as "walletAuthEnabled", 
            thc_token_holder as "thcTokenHolder", 
            membership_level as "membershipLevel", 
            whop_id as "whopId",
            favorite_symbols as "favoriteSymbols"
          FROM users 
          WHERE id = ${req.session.userId}
          LIMIT 1
        `;

        if (result && result.length > 0) {
          const user = result[0];
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
        }
      } catch (dbError) {
        console.error('Error fetching user data:', dbError);
        return res.status(500).json({ 
          authenticated: false, 
          error: 'Internal server error fetching user data' 
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
    
    // Find user by username or email (support login with either)
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    }) || await db.query.users.findFirst({
      where: eq(users.email, username)
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Compare password using bcrypt for secure authentication
    try {
      const bcrypt = await import('bcrypt');
      
      // Check if password is already hashed (starts with $2b$)
      if (user.password.startsWith('$2b$')) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }
      } else {
        // Fallback to plain text comparison for legacy users
        if (user.password !== password) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }
      }
    } catch (bcryptError) {
      console.error('BCrypt error:', bcryptError);
      // Fallback to plain text comparison
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
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

// Legacy login route for compatibility (no password required)
router.post('/legacy-login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username or Whop ID is required' });
    }
    
    // Check if this is a Whop ID
    if (username.length > 20) {
      // Attempt to find user with this Whop ID
      const user = await db.query.users.findFirst({
        where: eq(users.whopId, username)
      });
      
      if (user) {
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
      }
    }
    
    // Try to find the user by username
    let user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    // If not found by username, try email
    if (!user) {
      user = await db.query.users.findFirst({
        where: eq(users.email, username)
      });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // For the legacy route, we don't check the password
    // This is for backward compatibility with older clients
    
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
    console.error('Error with legacy login:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

// Login with Whop token
router.post('/whop-login', async (req, res) => {
  try {
    const { whopId } = req.body;
    
    if (!whopId) {
      return res.status(400).json({ error: 'Whop ID is required' });
    }
    
    try {
      // Try to find user by Whop ID
      const user = await db.query.users.findFirst({
        where: eq(users.whopId, whopId)
      });
      
      if (user) {
        // User found, set session and return
        req.session.userId = user.id;
        req.session.whopId = whopId;
        
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
      }
      
      // User not found with this Whop ID, try legacy login
      return res.status(404).json({ error: 'User not found with this Whop ID' });
    } catch (dbError) {
      console.error('Database error in Whop login:', dbError);
      return res.status(500).json({ error: 'Database error' });
    }
  } catch (error) {
    console.error('Error with Whop login:', error);
    return res.status(500).json({ error: 'Failed to login with Whop ID' });
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
    
    try {
      // Use direct SQL query for reliability
      const sql = db.$client;
      
      // Check if username already exists
      const usernameCheck = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
      
      if (usernameCheck.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Check if email already exists in our database
      const emailCheck = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      
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
      if (emailCheck.length > 0) {
        const existingEmail = emailCheck[0];
        
        if (whopSync) {
          // If we found a matching Whop account, update the existing user with Whop info
          await sql`
            UPDATE users
            SET 
              whop_id = ${whopUser.id},
              whop_plan_id = ${whopUser.plan?.id || null},
              membership_level = ${membershipLevel},
              updated_at = ${new Date()}
            WHERE id = ${existingEmail.id}
          `;
            
          // Set up the session with the existing user
          req.session.userId = existingEmail.id;
          
          // Return the updated user info
          return res.json({
            success: true,
            synced: true,
            user: {
              id: existingEmail.id,
              username: existingEmail.username || username,
              email: email,
              membershipLevel: membershipLevel
            }
          });
        } else {
          // If no Whop match but email exists in our DB, just return an error
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      
      // Create new user with potential Whop data
      // Note: We're not including whop_product_id since it doesn't exist in the database schema
      // This fixes the "column whop_product_id does not exist" error
      const insertResult = await sql`
        INSERT INTO users (
          username, 
          email, 
          password, 
          created_at, 
          updated_at, 
          membership_level, 
          thc_token_holder, 
          wallet_auth_enabled, 
          whop_id, 
          whop_plan_id
        ) 
        VALUES (
          ${username}, 
          ${email}, 
          ${password}, 
          ${new Date()}, 
          ${new Date()}, 
          ${membershipLevel}, 
          false, 
          false, 
          ${whopUser?.id || null}, 
          ${whopUser?.plan?.id || null}
        )
        RETURNING id, username, email, membership_level
      `;
    
      // Ensure we have a proper result
      if (!insertResult || insertResult.length === 0) {
        return res.status(500).json({ error: 'Failed to create user account' });
      }
      
      const newUser = insertResult[0];
      console.log("Successfully created new user:", newUser);
    
      // Set session
      req.session.userId = newUser.id;
      
      return res.json({
        success: true,
        synced: whopSync,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          membershipLevel: newUser.membership_level
        }
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError);
      return res.status(400).json({ error: 'Registration error' });
    }
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

// Demo login route (no credentials needed)
router.post('/demo-login', async (req, res) => {
  try {
    console.log('Demo login requested');
    
    // Find or create a demo user account
    try {
      const sql = db.$client;
      
      // Look for existing demo user
      const existingDemo = await sql`
        SELECT * FROM users 
        WHERE username LIKE 'demo%' 
        LIMIT 1
      `;
      
      let demoUser;
      
      if (existingDemo && existingDemo.length > 0) {
        // Use existing demo user
        demoUser = existingDemo[0];
        console.log('Using existing demo user:', demoUser.username);
      } else {
        // Create a new demo user
        console.log('Creating new demo user');
        const demoUsername = `demo_${Math.floor(Math.random() * 10000)}`;
        
        const newDemo = await sql`
          INSERT INTO users (
            username, 
            email, 
            password, 
            created_at, 
            updated_at, 
            membership_level, 
            thc_token_holder,
            wallet_auth_enabled
          ) 
          VALUES (
            ${demoUsername}, 
            ${`${demoUsername}@demo.tradehybrid.io`}, 
            ${'demo123'}, 
            ${new Date()}, 
            ${new Date()}, 
            ${'free'}, 
            ${false},
            ${false}
          )
          RETURNING *
        `;
        
        if (!newDemo || newDemo.length === 0) {
          throw new Error('Failed to create demo user');
        }
        
        demoUser = newDemo[0];
        console.log('Created new demo user:', demoUser);
      }
      
      // Set session
      req.session.userId = demoUser.id;
      // Store demo flag in session
      (req.session as any).isDemo = true;
      
      return res.json({
        authenticated: true,
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        membershipLevel: demoUser.membership_level || 'free',
        isDemo: true
      });
    } catch (dbError) {
      console.error('Database error in demo login:', dbError);
      
      // Fallback if all else fails - return a hardcoded demo response
      return res.json({
        authenticated: true,
        id: -1,
        username: 'demo_user',
        email: 'demo@tradehybrid.io',
        membershipLevel: 'free',
        isDemo: true
      });
    }
  } catch (error) {
    console.error('Error in demo login:', error);
    return res.status(500).json({ error: 'Demo login failed' });
  }
});

export default router;