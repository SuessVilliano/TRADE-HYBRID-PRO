/**
 * Whop integration routes for authentication and membership verification
 */

import { Router } from 'express';
import axios from 'axios';
import { whopService } from '../lib/services/whop-service';
import { SessionData } from 'express-session';

// Extend session data type with our custom fields
declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    userId?: number;
    username?: string;
    whopId?: string;
    membershipLevel?: string;
  }
}

// Create express router
const router = Router();

/**
 * Login redirect to Whop for OAuth
 */
router.get('/login', (req, res) => {
  // Generate a state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in the session
  if (req.session) {
    req.session.oauthState = state;
  }
  
  // Get client ID for Whop OAuth
  const clientId = process.env.WHOP_CLIENT_ID;
  if (!clientId) {
    console.error('Missing WHOP_CLIENT_ID environment variable');
    return res.status(500).json({ error: 'Whop authentication not properly configured' });
  }
  
  // Redirect URL (callback URL registered with Whop)
  const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/whop/callback`);
  
  // Redirect to the actual Whop OAuth URL
  const whopOAuthUrl = `https://app.whop.com/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&response_type=code`;
  
  console.log(`Redirecting to Whop OAuth: ${whopOAuthUrl}`);
  res.redirect(whopOAuthUrl);
});

/**
 * OAuth callback from Whop
 */
router.get('/callback', async (req, res) => {
  try {
    const { state, code } = req.query;
    
    // Verify state parameter to prevent CSRF
    if (!req.session || req.session.oauthState !== state) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }
    
    // Clear the state from session
    delete req.session.oauthState;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    // Get client credentials
    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Missing Whop OAuth credentials');
      return res.status(500).json({ error: 'Whop authentication not properly configured' });
    }

    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post('https://data.whop.com/oauth/token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}/api/whop/callback`
      });

      const accessToken = tokenResponse.data.access_token;
      
      // Get user info with the access token
      const userResponse = await axios.get('https://data.whop.com/api/v2/me', {
        headers: { 
          Authorization: `Bearer ${accessToken}` 
        }
      });
      
      const whopUserId = userResponse.data.id;
      
      // Find or create user based on Whop ID, including membership details
      const result = await whopService.findOrCreateUser(whopUserId);
      
      if (!result.success) {
        console.error('Failed to create/find user with Whop ID:', whopUserId, result.message);
        return res.status(401).json({ error: result.message });
      }
      
      console.log('Successfully authenticated user with Whop ID:', whopUserId, 'User ID:', result.userId);
      
      // Set user in session with complete information
      if (req.session) {
        req.session.userId = result.userId;
        req.session.username = result.username;
        req.session.whopId = whopUserId;
        req.session.membershipLevel = result.membershipLevel;
        
        // Set the session cookie to expire in 30 days for persistent login
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      }
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (oauthError) {
      console.error('Error exchanging code for token:', oauthError);
      
      // Fall back to demo user for development if OAuth exchange fails
      console.log('Falling back to demo user authentication');
      const demoWhopUserId = 'demo';
      
      // Find or create user based on demo Whop ID
      const result = await whopService.findOrCreateUser(demoWhopUserId);
      
      if (!result.success) {
        console.error('Failed to create/find demo user:', result.message);
        return res.status(401).json({ error: result.message });
      }
      
      console.log('Successfully authenticated with demo user, User ID:', result.userId);
      
      // Set user in session with complete information
      if (req.session) {
        req.session.userId = result.userId;
        req.session.username = result.username;
        req.session.whopId = demoWhopUserId;
        req.session.membershipLevel = result.membershipLevel;
        
        // Set the session cookie to expire in 30 days for persistent login
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      }
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Whop callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Verify Whop membership status
 */
router.get('/verify', async (req, res) => {
  try {
    if (!req.session || !req.session.whopId) {
      return res.status(401).json({ error: 'Not authenticated with Whop' });
    }
    
    const membershipStatus = await whopService.validateMembership(req.session.whopId);
    
    res.json({
      isActive: membershipStatus.isActive,
      membershipLevel: req.session.membershipLevel,
      userDetails: membershipStatus.userDetails
    });
  } catch (error) {
    console.error('Whop verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Direct authentication with Whop ID or email
 * This endpoint allows users to authenticate directly without OAuth
 */
router.post('/direct-auth', async (req, res) => {
  try {
    const { whopId } = req.body;
    
    if (!whopId || typeof whopId !== 'string' || whopId.trim() === '') {
      return res.status(400).json({ error: 'Invalid Whop ID or email' });
    }
    
    console.log('Attempting direct auth with Whop ID/email:', whopId);
    
    // Find or create user based on Whop ID
    const result = await whopService.findOrCreateUser(whopId.trim());
    
    if (!result.success) {
      console.error('Failed to authenticate with Whop ID:', whopId, result.message);
      return res.status(401).json({ 
        success: false,
        error: result.message || 'Authentication failed' 
      });
    }
    
    console.log('Successfully authenticated with Whop ID/email:', whopId, 'User ID:', result.userId);
    
    // Set user in session
    if (req.session) {
      req.session.userId = result.userId;
      req.session.username = result.username;
      req.session.whopId = whopId.trim();
      req.session.membershipLevel = result.membershipLevel;
      
      // Set the session cookie to expire in 30 days
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    }
    
    // Return success with user data
    res.json({
      success: true,
      userId: result.userId,
      username: result.username,
      membershipLevel: result.membershipLevel
    });
  } catch (error) {
    console.error('Direct Whop auth error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;