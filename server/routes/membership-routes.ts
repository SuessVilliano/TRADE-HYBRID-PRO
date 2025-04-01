import express, { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth-middleware';
import { admin as requireAdmin } from '../middleware/admin-middleware';

const router = express.Router();

/**
 * Membership levels schema
 */
const membershipLevels = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    duration: null, // No expiration
    features: [
      'Basic chart access',
      'Limited signal alerts',
      'Learning center basics',
      'Community access'
    ]
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 49.99,
    duration: '30d', // 30 days
    features: [
      'Advanced charts with all indicators',
      'Full smart trade panel access',
      'Unlimited signal alerts',
      'Full learning center access',
      'API trading access',
      'Broker connections'
    ]
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 499.99,
    duration: '365d', // 365 days
    features: [
      'All Pro Monthly features',
      'Prop firm challenge access',
      'Trading journal with AI analysis',
      'Copy trading functionality',
      'Premium signals',
      'Economic calendar alerts'
    ]
  },
  {
    id: 'lifetime',
    name: 'Elite Lifetime',
    price: 1999.99,
    duration: null, // No expiration
    features: [
      'All Pro Yearly features',
      'Unlimited lifetime access',
      'Priority support',
      'Beta features access',
      'Custom prop firm rules',
      'API key creation for developers',
      'Strategy backtest engine'
    ]
  }
];

/**
 * Update user membership schema
 */
const updateMembershipSchema = z.object({
  userId: z.number(),
  membershipLevel: z.enum(['free', 'monthly', 'yearly', 'lifetime']),
  membershipExpirationDate: z.string().datetime().nullable().optional(),
  customPermissions: z.record(z.string(), z.boolean()).optional()
});

/**
 * Feature access schema
 */
const featureAccessSchema = z.object({
  featureId: z.string()
});

// Get all membership levels
router.get('/levels', async (req: Request, res: Response) => {
  try {
    res.json(membershipLevels);
  } catch (error) {
    console.error('Error getting membership levels:', error);
    res.status(500).json({ error: 'Failed to get membership levels' });
  }
});

// Get current user's membership
router.get('/current', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const result = await db
      .select({
        id: users.id,
        membershipLevel: users.membershipLevel,
        membershipExpirationDate: users.membershipExpirationDate,
        customPermissions: users.customPermissions
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userMembership = result[0];
    
    // Get membership details
    const membershipDetails = membershipLevels.find(
      level => level.id === (userMembership.membershipLevel || 'free')
    ) || membershipLevels[0]; // Default to free if not found
    
    // Calculate if membership is expired
    const isExpired = userMembership.membershipExpirationDate && 
                      new Date(userMembership.membershipExpirationDate) < new Date();
    
    res.json({
      ...userMembership,
      membershipDetails,
      isExpired
    });
  } catch (error) {
    console.error('Error getting user membership:', error);
    res.status(500).json({ error: 'Failed to get user membership' });
  }
});

// Update a user's membership (admin only)
router.put('/users/:userId', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId);
    
    // Validate input
    const validatedData = updateMembershipSchema.parse({
      ...req.body,
      userId: parsedUserId
    });
    
    // Calculate expiration date based on membership level if not provided
    let expirationDate = validatedData.membershipExpirationDate;
    
    if (!expirationDate && validatedData.membershipLevel !== 'free' && validatedData.membershipLevel !== 'lifetime') {
      const membershipInfo = membershipLevels.find(level => level.id === validatedData.membershipLevel);
      
      if (membershipInfo && membershipInfo.duration) {
        const duration = parseInt(membershipInfo.duration);
        const unit = membershipInfo.duration.slice(-1);
        
        const now = new Date();
        if (unit === 'd') {
          now.setDate(now.getDate() + duration);
        } else if (unit === 'm') {
          now.setMonth(now.getMonth() + duration);
        } else if (unit === 'y') {
          now.setFullYear(now.getFullYear() + duration);
        }
        
        expirationDate = now.toISOString();
      }
    }
    
    // If membership is lifetime or free, set expiration to null
    if (validatedData.membershipLevel === 'lifetime' || validatedData.membershipLevel === 'free') {
      expirationDate = null;
    }
    
    // Update the user's membership
    const result = await db
      .update(users)
      .set({
        membershipLevel: validatedData.membershipLevel,
        membershipExpirationDate: expirationDate,
        customPermissions: validatedData.customPermissions,
        updatedAt: new Date()
      })
      .where(eq(users.id, parsedUserId))
      .returning({
        id: users.id,
        membershipLevel: users.membershipLevel,
        membershipExpirationDate: users.membershipExpirationDate,
        customPermissions: users.customPermissions
      });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating user membership:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input data', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to update user membership' });
  }
});

// Check if user has access to a feature
router.post('/check-access', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { featureId } = featureAccessSchema.parse(req.body);
    
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
      .where(eq(users.id, userId))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result[0];
    
    // Admin always has access to all features
    if (user.isAdmin) {
      return res.json({ hasAccess: true });
    }
    
    // Check if membership is expired
    const isExpired = user.membershipExpirationDate && 
                      new Date(user.membershipExpirationDate) < new Date();
    
    if (isExpired) {
      return res.json({ 
        hasAccess: false,
        reason: 'Membership expired'
      });
    }
    
    // Define feature access by membership level
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
    
    // Find the minimum required membership level
    const membershipOrder = ['free', 'monthly', 'yearly', 'lifetime'];
    let minimumRequiredLevel = 'lifetime';
    
    for (const level of membershipOrder) {
      if (allowedLevels.includes(level)) {
        minimumRequiredLevel = level;
        break;
      }
    }
    
    res.json({
      hasAccess,
      currentMembership: membershipLevel,
      requiredMembership: hasAccess ? null : minimumRequiredLevel
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input data', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// Get all users' membership info (admin only)
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        membershipLevel: users.membershipLevel,
        membershipExpirationDate: users.membershipExpirationDate,
        customPermissions: users.customPermissions,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(users.createdAt);
    
    // Enhanced with membership status
    const usersWithStatus = result.map((user: {
      membershipExpirationDate: string | null;
      membershipLevel: string | null;
      [key: string]: any;
    }) => {
      const isExpired = user.membershipExpirationDate && 
                        new Date(user.membershipExpirationDate) < new Date();
      
      return {
        ...user,
        membershipStatus: isExpired ? 'expired' : 'active',
        membershipDetails: membershipLevels.find(
          level => level.id === (user.membershipLevel || 'free')
        )
      };
    });
    
    res.json(usersWithStatus);
  } catch (error) {
    console.error('Error getting users membership info:', error);
    res.status(500).json({ error: 'Failed to get users membership info' });
  }
});

// Export the router
export default router;