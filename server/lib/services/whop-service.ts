/**
 * WhopService - Server-side implementation of the Whop service
 * This service uses the shared WhopServiceBase class
 */

import { WhopServiceBase, UserExperienceLevel } from '@shared/services/whop-service';
import { db } from '../../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Define the result type for findOrCreateUser
export interface FindOrCreateUserResult {
  success: boolean;
  userId: number;
  username: string;
  membershipLevel: string;
  message?: string;
}

// Create a class that extends the base service
class ServerWhopService extends WhopServiceBase {
  constructor() {
    // Initialize with the server-side environment variable
    super(process.env.WHOP_API_KEY || '');
  }
  
  /**
   * Find a user by Whop ID or create one if it doesn't exist
   * @param whopId - The Whop user ID
   * @returns The user info with success status
   */
  async findOrCreateUser(whopId: string): Promise<FindOrCreateUserResult> {
    try {
      console.log(`Finding or creating user for Whop ID: ${whopId}`);
      
      // Check if user exists
      const existingUsers = await db.select().from(users).where(eq(users.whopId, whopId));
      
      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        console.log(`Found existing user: ${user.id}`);
        
        // Get latest membership info from Whop
        const membershipStatus = await this.validateMembership(whopId);
        const level = await this.getUserExperienceLevel(whopId);
        
        // Update user with latest Whop data
        await db.update(users)
          .set({
            whopPlanId: membershipStatus.planId,
            whopProductId: membershipStatus.productId,
            whopAccessPassId: membershipStatus.accessPassId,
            walletAddress: membershipStatus.userDetails?.walletAddress || user.walletAddress,
            discord: membershipStatus.userDetails?.discord || user.discord,
            profileImage: membershipStatus.userDetails?.profileImage || user.profileImage,
            membershipLevel: level,
            whopMembershipExpiresAt: membershipStatus.expiresAt,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
        
        console.log(`Updated user ${user.id} with latest Whop membership data`);
        
        return {
          success: true,
          userId: user.id,
          username: user.username || 'User',
          membershipLevel: level
        };
      }
      
      // User doesn't exist, create new user
      console.log('Creating new user for Whop ID:', whopId);
      
      // Determine user level from Whop
      const level = await this.getUserExperienceLevel(whopId);
      
      // For demo users, create a test account
      if (whopId === 'demo') {
        const [newUser] = await db.insert(users).values({
          username: 'Demo User',
          password: 'demo123', // Using a simple password for demo users
          email: 'demo@example.com',
          whopId: whopId,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        return {
          success: true,
          userId: newUser.id,
          username: newUser.username || 'Demo User',
          membershipLevel: UserExperienceLevel.DEMO
        };
      }
      
      // For real users, try to get their info from Whop
      const membershipStatus = await this.validateMembership(whopId);
      
      if (!membershipStatus.isActive) {
        console.log('Membership not active for Whop ID:', whopId);
        // Still create the user but mark them as free tier
        const [newUser] = await db.insert(users).values({
          username: membershipStatus.userDetails?.name || 'New User',
          password: 'temppassword', // Temporary password, will need reset
          email: membershipStatus.userDetails?.email || 'user@example.com',
          whopId: whopId,
          walletAddress: membershipStatus.userDetails?.walletAddress || null,
          discord: membershipStatus.userDetails?.discord || null,
          profileImage: membershipStatus.userDetails?.profileImage || null,
          membershipLevel: UserExperienceLevel.FREE,
          whopCustomerId: membershipStatus.userDetails?.customerId,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        return {
          success: true,
          userId: newUser.id,
          username: newUser.username || 'User',
          membershipLevel: UserExperienceLevel.FREE
        };
      }
      
      // Create user with active membership
      const [newUser] = await db.insert(users).values({
        username: membershipStatus.userDetails?.name || 'New User',
        password: 'temppassword', // Temporary password, will need reset
        email: membershipStatus.userDetails?.email || 'user@example.com',
        whopId: whopId,
        whopPlanId: membershipStatus.planId,
        whopProductId: membershipStatus.productId,
        whopAccessPassId: membershipStatus.accessPassId,
        walletAddress: membershipStatus.userDetails?.walletAddress || null,
        discord: membershipStatus.userDetails?.discord || null,
        profileImage: membershipStatus.userDetails?.profileImage || null,
        membershipLevel: level,
        whopCustomerId: membershipStatus.userDetails?.customerId,
        whopMemberSince: membershipStatus.memberSince || new Date().toISOString(),
        whopMembershipExpiresAt: membershipStatus.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      return {
        success: true,
        userId: newUser.id,
        username: newUser.username || 'User',
        membershipLevel: level
      };
      
    } catch (error) {
      console.error('Error finding/creating user:', error);
      return {
        success: false,
        userId: 0,
        username: '',
        membershipLevel: UserExperienceLevel.FREE,
        message: 'Error processing user authentication'
      };
    }
  }
}

// Export singleton instance
export const whopService = new ServerWhopService();

// Re-export types from the shared service for convenience
export { UserExperienceLevel, type WhopMembershipStatus } from '@shared/services/whop-service';