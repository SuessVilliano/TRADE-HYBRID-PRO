/**
 * Server-side Whop Service for authentication and membership verification
 */

import axios from 'axios';
import { db } from '../db';
import { users } from '../../../shared/schema';
import { eq, or } from 'drizzle-orm';

// Types to match client implementations
export enum UserExperienceLevel {
  FREE = 'FREE',
  DEMO = 'DEMO',
  PAID = 'PAID',
  PRO = 'PRO',
  ADMIN = 'ADMIN'
}

interface WhopMembershipStatus {
  isActive: boolean;
  planId?: string;
  memberId?: string;
  memberSince?: string;
  userDetails?: {
    name?: string;
    email?: string;
    profileImage?: string;
    discord?: string;
  };
  error?: string;
}

class WhopServerService {
  private apiKey: string;
  private baseUrl: string = 'https://api.whop.com/api/v2';
  
  constructor() {
    // Use the provided API key from environment
    this.apiKey = process.env.WHOP_API_KEY || 'ydROZr0J1kv7LZyMGepujMx7vNrZIC-chXf7lBWIJXE';
    
    if (!this.apiKey) {
      console.error('Whop API key not configured properly');
    }
    console.log('Whop server service initialized');
  }
  
  /**
   * Validate the API key by making a request to the Whop API
   */
  public async validateApiKey(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Whop API key validation failed:', error);
      return false;
    }
  }
  
  /**
   * Check if a user has an active membership
   * @param userId - The Whop user ID to check
   */
  async validateMembership(userId: string): Promise<WhopMembershipStatus> {
    if (!this.apiKey || !(await this.validateApiKey())) {
      console.error('Cannot validate Whop membership: Invalid API configuration');
      return { isActive: false, error: 'Invalid API configuration' };
    }
    
    try {
      // Get detailed user information
      const userResponse = await axios.get(`${this.baseUrl}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userInfo = userResponse.data;

      // Get membership status
      const membershipResponse = await axios.get(`${this.baseUrl}/memberships`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          user_id: userId,
          status: 'active'
        }
      });
      
      const memberships = membershipResponse.data?.data || [];
      
      if (memberships.length > 0) {
        const activeMembership = memberships[0];
        return {
          isActive: true,
          planId: activeMembership.plan_id,
          memberId: activeMembership.id,
          memberSince: activeMembership.created_at,
          userDetails: {
            name: userInfo.username,
            email: userInfo.email,
            profileImage: userInfo.profile_pic_url,
            discord: userInfo.discord_username
          }
        };
      }
      
      return { 
        isActive: false,
        userDetails: {
          name: userInfo.username,
          email: userInfo.email,
          profileImage: userInfo.profile_pic_url,
          discord: userInfo.discord_username
        }
      };
    } catch (error) {
      console.error('Error validating Whop membership:', error);
      return { isActive: false };
    }
  }
  
  /**
   * Get appropriate user level based on membership status and plan
   * @param userId - The Whop user ID to check
   */
  async getUserExperienceLevel(userId: string): Promise<UserExperienceLevel> {
    // Demo login - special case for testing
    if (userId.toLowerCase() === 'demo') {
      return UserExperienceLevel.DEMO;
    }
    
    const membershipStatus = await this.validateMembership(userId);
    
    if (membershipStatus.isActive) {
      // If a plan ID exists, determine the appropriate membership tier
      if (membershipStatus.planId) {
        // Map the Whop planId to our membership tiers
        // This is placeholder logic - customize based on actual Whop plans
        // Pro tier plans would include something like "pro" or "premium" in the name
        const planIdLower = membershipStatus.planId.toLowerCase();
        
        if (planIdLower.includes('pro') || planIdLower.includes('premium') || planIdLower.includes('lifetime')) {
          return UserExperienceLevel.PRO;
        }
        
        // Default to PAID tier for all other active subscriptions
        return UserExperienceLevel.PAID;
      }
      
      // If no plan ID is available but membership is active, default to PAID tier
      return UserExperienceLevel.PAID;
    }
    
    // Default to FREE for non-members
    return UserExperienceLevel.FREE;
  }
  
  /**
   * Find or create a user based on Whop information
   * @param whopId - The Whop user ID
   */
  async findOrCreateUser(whopId: string): Promise<{success: boolean, userId?: number, username?: string, membershipLevel?: string, message?: string}> {
    try {
      // Validate membership first to get user details
      const membershipStatus = await this.validateMembership(whopId);
      if (!membershipStatus.userDetails) {
        return { success: false, message: 'Unable to retrieve user information from Whop' };
      }
      
      const { email, name } = membershipStatus.userDetails;
      if (!email) {
        return { success: false, message: 'Email not provided by Whop' };
      }
      
      // Get the membership level
      const membershipLevel = await this.getUserExperienceLevel(whopId);
      
      // Check if user already exists with this email
      const existingUser = await db.select().from(users).where(
        or(
          eq(users.email, email),
          eq(users.whopId, whopId)
        )
      );
      
      if (existingUser.length > 0) {
        // User exists, update Whop ID if needed
        const user = existingUser[0];
        
        if (!user.whopId || user.whopId !== whopId) {
          await db.update(users)
            .set({ 
              whopId,
              membershipLevel: membershipLevel.toString(),
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
        }
        
        return {
          success: true,
          userId: user.id,
          username: user.username,
          membershipLevel: membershipLevel.toString()
        };
      } else {
        // Create new user
        const username = name || `whop_user_${whopId.substring(0, 8)}`;
        
        const result = await db.insert(users).values({
          username,
          email,
          whopId,
          membershipLevel: membershipLevel.toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning({ id: users.id });
        
        return {
          success: true,
          userId: result[0].id,
          username,
          membershipLevel: membershipLevel.toString()
        };
      }
    } catch (error) {
      console.error('Error finding or creating user from Whop:', error);
      return { success: false, message: 'Error processing user information' };
    }
  }
}

// Export singleton instance
export const whopServerService = new WhopServerService();