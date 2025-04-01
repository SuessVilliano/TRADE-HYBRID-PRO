/**
 * Whop integration routes for authentication and membership verification
 */

import { Router } from 'express';
import { whopServerService } from '../lib/services/whop-service';
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
  // In a real OAuth implementation, we would redirect to Whop's OAuth page
  // For this demo, we'll use a simplified approach that mimics OAuth behavior
  
  // Generate a state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in the session
  if (req.session) {
    req.session.oauthState = state;
  }
  
  // Normally, we would redirect to Whop's OAuth URL
  // Since we're using a simplified approach for demo purposes, we'll redirect to our own callback with a mock code
  const redirectUrl = `/api/whop/callback?state=${state}&code=mock_auth_code`;
  
  res.redirect(redirectUrl);
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
    
    // In a real OAuth flow, we would exchange the code for an access token
    // For this demo, we'll use a mock Whop user ID
    const mockWhopUserId = process.env.MOCK_WHOP_USER_ID || 'whop_user_123456';
    
    // Find or create user based on Whop ID
    const result = await whopServerService.findOrCreateUser(mockWhopUserId);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    // Set user in session
    if (req.session) {
      req.session.userId = result.userId;
      req.session.username = result.username;
      req.session.whopId = mockWhopUserId;
      req.session.membershipLevel = result.membershipLevel;
    }
    
    // Redirect to dashboard
    res.redirect('/dashboard');
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
    
    const membershipStatus = await whopServerService.validateMembership(req.session.whopId);
    
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

export default router;