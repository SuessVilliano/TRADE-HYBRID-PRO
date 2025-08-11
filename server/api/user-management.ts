import express from 'express';
import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';

const router = express.Router();

// Get database connection
const getDbConnection = () => {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
  return neon(connectionString);
};

// User registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, walletAddress } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address' 
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const sql = getDbConnection();

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE username = ${username} OR email = ${email}
    `;

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Check if wallet address is already in use (if provided)
    if (walletAddress) {
      const existingWallet = await sql`
        SELECT id FROM users WHERE wallet_address = ${walletAddress}
      `;
      
      if (existingWallet.length > 0) {
        return res.status(409).json({ 
          error: 'Wallet address is already associated with another account' 
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await sql`
      INSERT INTO users (
        username, 
        email, 
        password, 
        wallet_address,
        wallet_auth_enabled,
        balance,
        membership_level,
        created_at,
        updated_at
      ) VALUES (
        ${username},
        ${email},
        ${hashedPassword},
        ${walletAddress || null},
        ${walletAddress ? true : false},
        10000,
        'free',
        NOW(),
        NOW()
      )
      RETURNING id, username, email, wallet_address, membership_level, balance, created_at
    `;

    const userId = newUser[0].id;

    // Initialize user profile data
    await initializeUserData(userId);

    // Create session
    req.session.userId = userId;
    req.session.username = username;
    req.session.authenticated = true;

    console.log(`New user registered: ${username} (ID: ${userId})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        walletAddress: newUser[0].wallet_address,
        membershipLevel: newUser[0].membership_level,
        balance: newUser[0].balance,
        createdAt: newUser[0].created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to create account. Please try again.' 
    });
  }
});

// User login endpoint
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be username or email

    if (!identifier || !password) {
      return res.status(400).json({ 
        error: 'Username/email and password are required' 
      });
    }

    const sql = getDbConnection();

    // Find user by username or email
    const users = await sql`
      SELECT 
        id, username, email, password, wallet_address, 
        membership_level, balance, thc_token_holder,
        has_connected_apis, last_login
      FROM users 
      WHERE username = ${identifier} OR email = ${identifier}
    `;

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    await sql`
      UPDATE users 
      SET last_login = NOW(), updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.authenticated = true;

    console.log(`User logged in: ${user.username} (ID: ${user.id})`);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.wallet_address,
        membershipLevel: user.membership_level,
        balance: user.balance,
        thcTokenHolder: user.thc_token_holder,
        hasConnectedApis: user.has_connected_apis
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ 
        error: 'Not authenticated' 
      });
    }

    const sql = getDbConnection();
    
    const users = await sql`
      SELECT 
        id, username, email, avatar, wallet_address,
        balance, membership_level, thc_token_holder,
        has_connected_apis, dashboard_order, favorite_symbols,
        whop_id, whop_plan_id, discord, profile_image,
        created_at, last_login
      FROM users 
      WHERE id = ${req.session.userId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const user = users[0];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        walletAddress: user.wallet_address,
        balance: user.balance,
        membershipLevel: user.membership_level,
        thcTokenHolder: user.thc_token_holder,
        hasConnectedApis: user.has_connected_apis,
        dashboardOrder: user.dashboard_order,
        favoriteSymbols: user.favorite_symbols,
        whopId: user.whop_id,
        whopPlanId: user.whop_plan_id,
        discord: user.discord,
        profileImage: user.profile_image,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile' 
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        error: 'Not authenticated' 
      });
    }

    const { 
      avatar, 
      dashboardOrder, 
      favoriteSymbols, 
      discord,
      profileImage 
    } = req.body;

    const sql = getDbConnection();

    await sql`
      UPDATE users 
      SET 
        avatar = COALESCE(${avatar}, avatar),
        dashboard_order = COALESCE(${JSON.stringify(dashboardOrder)}, dashboard_order),
        favorite_symbols = COALESCE(${JSON.stringify(favoriteSymbols)}, favorite_symbols),
        discord = COALESCE(${discord}, discord),
        profile_image = COALESCE(${profileImage}, profile_image),
        updated_at = NOW()
      WHERE id = ${req.session.userId}
    `;

    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Logout failed' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    authenticated: !!req.session.userId,
    userId: req.session.userId || null,
    username: req.session.username || null
  });
});

// Initialize user data after registration
async function initializeUserData(userId: number) {
  const sql = getDbConnection();
  
  try {
    // Initialize default user preferences
    await sql`
      UPDATE users 
      SET 
        dashboard_order = ${JSON.stringify([
          'trade-dashboard',
          'dex-dashboard', 
          'prop-firm-dashboard',
          'trading-signals',
          'trade-journal'
        ])},
        favorite_symbols = ${JSON.stringify([
          'BTC/USD', 'ETH/USD', 'SOL/USD', 'EUR/USD', 'GBP/USD'
        ])}
      WHERE id = ${userId}
    `;

    console.log(`Initialized data for user ID: ${userId}`);
    
  } catch (error) {
    console.error('Error initializing user data:', error);
  }
}

export default router;