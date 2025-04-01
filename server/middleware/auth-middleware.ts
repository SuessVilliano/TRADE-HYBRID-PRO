import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to authenticate a user by checking if they are logged in
 * This is a simplified version for development purposes
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add mock user data to the request for development purposes
  // In production, this would verify a session/token and load the real user
  (req as any).user = {
    id: 1,
    username: 'demo_user',
    email: 'demo@example.com',
    isAdmin: true,
    role: 'admin',
    membership: 'lifetime',
    membershipLevel: 'lifetime'
  };
  next();
};

/**
 * Alias for authMiddleware, used in the settings routes
 */
export const requireAuth = authMiddleware;