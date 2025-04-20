import { NextFunction, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Add the userId to the Express request
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      walletAddress?: string;
      isAdmin?: boolean;
      user?: any; // Full user object
    }
  }
}

/**
 * Authentication middleware that focuses on session-based authentication
 * This creates a cohesive auth system that ensures user identity is maintained
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log the request details for debugging
    console.log(`Auth middleware: ${req.method} ${req.path}`, {
      hasSession: !!req.session,
      hasUserId: req.session && !!req.session.userId,
      userId: req.session?.userId,
      sessionData: req.session ? { ...req.session } : null
    });

    // Check for session-based authentication (primary method)
    if (req.session && req.session.userId) {
      const userId = req.session.userId;
      console.log(`Auth middleware: Checking session-based authentication for user ID ${userId}`);
      
      // Fetch user from database
      const userResult = await db.select().from(users).where(eq(users.id, userId));
      
      if (userResult.length > 0) {
        const user = userResult[0];
        console.log(`Auth middleware: User ${user.username} (ID: ${user.id}) authenticated successfully`);
        
        // Set both legacy userId and new user object
        req.userId = user.id;
        req.isAdmin = user.isAdmin || false;
        req.walletAddress = user.walletAddress || undefined;
        req.user = user;
        return next();
      } else {
        console.warn(`Auth middleware: Session contained user ID ${userId}, but no matching user found in database`);
        
        // Clear invalid session
        if (req.session) {
          req.session.destroy((err) => {
            if (err) {
              console.error('Error destroying invalid session:', err);
            }
          });
        }
      }
    } else {
      console.log('Auth middleware: No user ID in session');
    }
    
    // If development mode is enabled and ENABLE_DEV_USER is true
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_USER === 'true') {
      console.warn('Auth middleware: Using development user. This should not happen in production!');
      req.userId = 1;
      req.isAdmin = true;
      req.walletAddress = "test-wallet-address";
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
    
    // For development and testing - this bypasses authentication only in development
    // IMPORTANT: This should be removed in production!
    if (process.env.NODE_ENV === 'development') {
      console.warn('Auth middleware: TEST MODE - Bypassing authentication check in development mode');
      
      // Create a fixed user for testing purposes
      req.userId = 999;
      req.isAdmin = true;
      req.walletAddress = "test-wallet-address";
      req.user = {
        id: 999, 
        username: 'test_user',
        email: 'test@example.com', 
        isAdmin: true,
        membershipLevel: 'lifetime',
        hasConnectedApis: true
      };
      
      // For testing purposes we also update the session
      if (req.session) {
        req.session.userId = 999;
        req.session.username = 'test_user';
      }
      
      return next();
    }
    
    // User is not authenticated
    console.log('Auth middleware: Authentication failed, returning 401 Unauthorized');
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource' 
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication error occurred' 
    });
  }
};

/**
 * Middleware that doesn't reject the request but still loads user if available
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to authenticate the user but don't reject if not authenticated
    if (req.session && req.session.userId) {
      const userId = req.session.userId;
      
      // Fetch user from database
      const userResult = await db.select().from(users).where(eq(users.id, userId));
      
      if (userResult.length > 0) {
        const user = userResult[0];
        // Set both legacy userId and new user object
        req.userId = user.id;
        req.isAdmin = user.isAdmin || false;
        req.walletAddress = user.walletAddress || undefined;
        req.user = user;
      }
    }
    
    // Always continue to next middleware regardless of auth status
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue anyway even if there's an error with authentication
    next();
  }
};

// Admin middleware for protected routes
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  
  next();
};

// Wallet authentication middleware
export const walletAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.walletAddress) {
    return res.status(403).json({ error: 'Forbidden - Wallet authentication required' });
  }
  
  next();
};

// Middleware to check if user has connected API keys
export const apiConnectedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.hasConnectedApis) {
    return res.status(403).json({ error: 'API keys required - Please connect your trading platform' });
  }
  
  next();
};

export default authMiddleware;