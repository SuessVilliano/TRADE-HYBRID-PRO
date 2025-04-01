import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify admin permissions
 */
export const admin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists in request (set by auth middleware)
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Check if user has admin role
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  // User is an admin, continue to next middleware/route handler
  next();
};