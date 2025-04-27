import { db } from '../db';
import { users, User } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

interface WhopUser {
  id: string;
  username: string;
  email: string;
  profile_pic_url?: string;
  plan?: {
    id: string;
    name: string;
  };
  experience_level?: string;
  social_accounts?: any[];
}

/**
 * Authentication Service
 * 
 * This service handles user authentication, validation, and profile management.
 * It integrates with Whop for authentication and stores user data in our database.
 */
class AuthService {
  private whopApiUrl = 'https://api.whop.com/api/v2';
  private whopApiKey = process.env.WHOP_API_KEY || '';
  private whopAppId = process.env.WHOP_APP_ID || '';
  
  constructor() {
    if (!this.whopApiKey) {
      console.warn('WHOP_API_KEY not set. Whop integration will be limited.');
    }
    
    if (!this.whopAppId) {
      console.warn('WHOP_APP_ID not set. Whop integration will be limited.');
    }
  }
  
  /**
   * Get a user by their Whop ID
   */
  async getUserByWhopId(whopId: string): Promise<User | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.whopId, whopId)
      });
      
      return user || null;
    } catch (error) {
      console.error('Error getting user by Whop ID:', error);
      return null;
    }
  }
  
  /**
   * Create a new user from Whop data
   */
  async createUserFromWhop(whopUser: WhopUser): Promise<User | null> {
    try {
      // Determine membership level from Whop plan name
      let membershipLevel = 'free';
      if (whopUser.plan) {
        const planName = whopUser.plan.name.toLowerCase();
        if (planName.includes('premium') || planName.includes('pro')) {
          membershipLevel = 'premium';
        } else if (planName.includes('basic') || planName.includes('standard')) {
          membershipLevel = 'basic';
        } else if (planName.includes('institutional')) {
          membershipLevel = 'institutional';
        }
      }
      
      // Create the user
      const [newUser] = await db.insert(users).values({
        whopId: whopUser.id,
        username: whopUser.username,
        email: whopUser.email,
        profilePicture: whopUser.profile_pic_url || '',
        experienceLevel: whopUser.experience_level || 'beginner',
        membershipLevel: membershipLevel as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return newUser;
    } catch (error) {
      console.error('Error creating user from Whop data:', error);
      return null;
    }
  }
  
  /**
   * Validate a Whop token
   */
  async validateWhopToken(token: string): Promise<WhopUser | null> {
    try {
      if (!token) return null;
      
      // Call Whop API to validate token
      const response = await axios.get(`${this.whopApiUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.status !== 200) {
        return null;
      }
      
      return response.data as WhopUser;
    } catch (error) {
      console.error('Error validating Whop token:', error);
      return null;
    }
  }
  
  /**
   * Authenticate a user with Whop
   */
  async authenticateWithWhop(token: string): Promise<User | null> {
    try {
      // Validate the token
      const whopUser = await this.validateWhopToken(token);
      if (!whopUser) return null;
      
      // Check if user exists
      let user = await this.getUserByWhopId(whopUser.id);
      
      // If user doesn't exist, create them
      if (!user) {
        user = await this.createUserFromWhop(whopUser);
      } else {
        // Update user data if needed
        await db.update(users)
          .set({
            username: whopUser.username,
            email: whopUser.email,
            profilePicture: whopUser.profile_pic_url || '',
            updatedAt: new Date()
          })
          .where(eq(users.whopId, whopUser.id));
          
        // Refresh user data
        user = await this.getUserByWhopId(whopUser.id);
      }
      
      return user;
    } catch (error) {
      console.error('Error authenticating with Whop:', error);
      return null;
    }
  }
  
  /**
   * Get user's membership level
   */
  async getUserMembershipLevel(userId: number): Promise<string> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      return user?.membershipLevel || 'free';
    } catch (error) {
      console.error('Error getting user membership level:', error);
      return 'free';
    }
  }
  
  /**
   * Check if a user has access to a specific feature
   */
  async hasFeatureAccess(userId: number, feature: string): Promise<boolean> {
    try {
      const membershipLevel = await this.getUserMembershipLevel(userId);
      
      // Define feature access by membership level
      const featureAccess: Record<string, string[]> = {
        'free': ['basic_trading', 'basic_signals', 'basic_journal'],
        'basic': ['basic_trading', 'basic_signals', 'basic_journal', 'advanced_signals', 'advanced_journal'],
        'premium': ['basic_trading', 'basic_signals', 'basic_journal', 'advanced_signals', 'advanced_journal', 'ai_analysis', 'copy_trading'],
        'institutional': ['basic_trading', 'basic_signals', 'basic_journal', 'advanced_signals', 'advanced_journal', 'ai_analysis', 'copy_trading', 'institutional_tools']
      };
      
      return featureAccess[membershipLevel]?.includes(feature) || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();