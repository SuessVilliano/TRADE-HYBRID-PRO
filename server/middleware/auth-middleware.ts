import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username?: string;
        email?: string;
        isAdmin?: boolean;
      };
    }
  }
}

/**
 * Middleware to require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated (set by session middleware)
  if (!(req as any).isAuthenticated || !(req as any).isAuthenticated() || !(req as any).user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  next();
};

/**
 * Middleware for both required and optional authentication
 * If user is not authenticated, request will continue but req.user will be undefined
 */
export const auth = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
    // Map session user to request user
    const sessionUser = (req as any).user;
    req.user = {
      id: sessionUser.id,
      username: sessionUser.username,
      email: sessionUser.email,
      isAdmin: sessionUser.isAdmin || false // Default to non-admin if not specified
    };
  }
  
  next();
};