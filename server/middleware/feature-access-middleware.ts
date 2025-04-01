import { Request, Response, NextFunction } from 'express';
import { db } from '../storage';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user has access to a specific feature
 * based on their membership level
 */
export const requireFeatureAccess = (featureId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get user's membership level
      const result = await db
        .select({
          id: users.id,
          membershipLevel: users.membershipLevel,
          membershipExpirationDate: users.membershipExpirationDate,
          customPermissions: users.customPermissions,
          isAdmin: users.isAdmin
        })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = result[0];
      
      // Admin always has access to all features
      if (user.isAdmin) {
        return next();
      }
      
      // Check if membership is expired
      const isExpired = user.membershipExpirationDate && 
                        new Date(user.membershipExpirationDate) < new Date();
      
      if (isExpired) {
        return res.status(403).json({ 
          error: 'Membership expired',
          membershipExpired: true
        });
      }
      
      // Define feature access by membership level
      // In production, this would be fetched from a database or configuration file
      const featureAccess: Record<string, string[]> = {
        // Basic features - available to all members
        'basic_charts': ['free', 'monthly', 'yearly', 'lifetime'],
        'learning_center_basic': ['free', 'monthly', 'yearly', 'lifetime'],
        
        // Standard features - available to paid members
        'advanced_charts': ['monthly', 'yearly', 'lifetime'],
        'smart_trade_panel': ['monthly', 'yearly', 'lifetime'],
        'learning_center_full': ['monthly', 'yearly', 'lifetime'],
        'broker_connections': ['monthly', 'yearly', 'lifetime'],
        'api_access': ['monthly', 'yearly', 'lifetime'],
        
        // Premium features - available to yearly and lifetime members
        'prop_firm_challenges': ['yearly', 'lifetime'],
        'copy_trading': ['yearly', 'lifetime'],
        
        // Exclusive features - available only to lifetime members
        'priority_support': ['lifetime'],
        'beta_features': ['lifetime'],
        'custom_prop_firm_rules': ['lifetime']
      };
      
      // Get user's membership level (default to 'free')
      const membershipLevel = user.membershipLevel || 'free';
      
      // Check if user has custom permissions that override default access
      let hasCustomAccess = false;
      if (user.customPermissions) {
        const customPermissions = user.customPermissions as Record<string, boolean>;
        if (customPermissions[featureId] === true) {
          hasCustomAccess = true;
        }
      }
      
      // Check if user has access based on membership level or custom permissions
      const allowedLevels = featureAccess[featureId] || [];
      const hasAccess = hasCustomAccess || allowedLevels.includes(membershipLevel);
      
      if (hasAccess) {
        return next();
      }
      
      // User doesn't have access to this feature
      return res.status(403).json({ 
        error: 'Feature access denied',
        requiredMembership: getMinimumRequiredMembership(featureAccess, featureId),
        currentMembership: membershipLevel
      });
    } catch (error) {
      console.error('Error checking feature access:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Get the minimum membership level required for a feature
 */
function getMinimumRequiredMembership(
  featureAccess: Record<string, string[]>, 
  featureId: string
): string {
  const membershipOrder = ['free', 'monthly', 'yearly', 'lifetime'];
  const allowedLevels = featureAccess[featureId] || [];
  
  // Find the lowest level that has access
  for (const level of membershipOrder) {
    if (allowedLevels.includes(level)) {
      return level;
    }
  }
  
  return 'lifetime'; // Default to highest level if not found
}