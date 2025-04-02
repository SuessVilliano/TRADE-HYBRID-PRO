/**
 * WhopService - Integration with Whop.com API for membership verification
 * This shared service allows for verification of paid memberships from Whop.com
 * and can be used by both client and server
 */

import axios from 'axios';

export enum UserExperienceLevel {
  FREE = 'free',
  DEMO = 'demo',
  PAID = 'paid',
  PRO = 'pro',
  ADMIN = 'admin',
  // Include legacy types for compatibility with client side
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface WhopMembershipStatus {
  isActive: boolean;
  planId?: string;
  memberId?: string;
  memberSince?: string;
  error?: string;
  userDetails?: {
    name?: string;
    email?: string;
    profileImage?: string;
    discord?: string;
  };
}

export class WhopServiceBase {
  private apiKey: string;
  private baseUrl: string = 'https://api.whop.com/api/v2';
  private userCache: Map<string, any> = new Map();
  
  constructor(apiKey: string) {
    this.apiKey = apiKey || '';
    
    if (!this.apiKey) {
      console.error('Whop API key not configured properly');
    } else {
      console.log('Whop service initialized with API key');
    }
  }

  private async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;
    
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
   * @param userId - The Whop user ID or email to check
   * @returns Promise<WhopMembershipStatus> - Membership status
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

      // Cache user info
      this.userCache.set(userId, userResponse.data);

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
      const userInfo = userResponse.data;
      
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
      
      return { isActive: false };
    } catch (error) {
      console.error('Error validating Whop membership:', error);
      return { isActive: false };
    }
  }
  
  /**
   * Get appropriate user level based on membership status and plan
   * @param userId - The Whop user ID or email to check
   * @returns Promise<UserExperienceLevel> - The appropriate user level
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
        const planIdLower = membershipStatus.planId.toLowerCase();
        
        if (planIdLower.includes('pro') || planIdLower.includes('premium')) {
          return UserExperienceLevel.PRO;
        }
        
        // Default to PAID tier for all other active subscriptions
        return UserExperienceLevel.PAID;
      }
      
      // If no plan ID is available but membership is active,
      // default to PAID tier
      return UserExperienceLevel.PAID;
    }
    
    // Default to FREE for non-members
    return UserExperienceLevel.FREE;
  }
}

// We don't create a singleton instance here since it will be
// instantiated with the proper environment on both client and server