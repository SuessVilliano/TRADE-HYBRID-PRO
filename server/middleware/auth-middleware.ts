import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Add type extension for Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate a user by checking if they are logged in via session
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is logged in via session
    if (req.session && req.session.userId) {
      // Fetch the user from the database
      const userResult = await db.select().from(users).where(eq(users.id, req.session.userId));
      
      if (userResult.length > 0) {
        // Add user to request object
        const user = userResult[0];
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false,
          walletAddress: user.walletAddress,
          membershipLevel: user.membershipLevel,
          hasConnectedApis: user.hasConnectedApis
        };
        return next();
      }
    }
    
    // If development mode is enabled, we can use a dummy user for testing
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_USER === 'true') {
      console.warn('Using development user. This should not happen in production!');
      req.user = {
        id: 1,
        username: 'dev_user',
        email: 'dev@example.com',
        isAdmin: true,
        membershipLevel: 'lifetime',
        hasConnectedApis: true
      };
      return next();
    }
    
    // User not authenticated
    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware that doesn't reject the request but still loads user if available
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is logged in via session
    if (req.session && req.session.userId) {
      // Fetch the user from the database
      const userResult = await db.select().from(users).where(eq(users.id, req.session.userId));
      
      if (userResult.length > 0) {
        // Add user to request object
        const user = userResult[0];
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false,
          walletAddress: user.walletAddress,
          membershipLevel: user.membershipLevel,
          hasConnectedApis: user.hasConnectedApis
        };
      }
    }
    
    // Allow request to continue regardless of auth status
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue anyway even if there's an error
    next();
  }
};

/**
 * Admin-only middleware
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  
  next();
};

/**
 * Middleware to check if user has connected API keys
 */
export const apiConnectedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.hasConnectedApis) {
    return res.status(403).json({ error: 'API keys required - Please connect your trading platform' });
  }
  
  next();
};

/**
 * Alias for authMiddleware, used in the settings routes
 */
export const requireAuth = authMiddleware;