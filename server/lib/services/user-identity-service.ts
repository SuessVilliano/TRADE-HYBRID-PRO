/**
 * User Identity Service - Links Whop IDs, wallet addresses, and broker connections
 * This service ensures that all user identity systems are properly synchronized
 */

import { db } from '../../db';
import { users, brokerConnections } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { whopService } from '../../../client/src/lib/services/whop-service';

/**
 * User identity information linking different authentication methods
 */
export interface UserIdentity {
  userId: number;
  whopId?: string;
  whopPlanId?: string;
  walletAddress?: string;
  walletAuthEnabled?: boolean;
  hasConnectedBrokers: boolean;
  connectedBrokerIds: number[];
}

/**
 * Service for managing user identity synchronization
 */
export class UserIdentityService {
  /**
   * Link a Whop ID to a user account
   */
  async linkWhopId(userId: number, whopId: string): Promise<boolean> {
    try {
      // Verify the Whop membership first
      const membershipStatus = await whopService.validateMembership(whopId);
      
      if (!membershipStatus.isActive) {
        console.warn(`Attempted to link inactive Whop membership for user ${userId}`);
        return false;
      }
      
      // Update the user record with Whop information
      await db.update(users)
        .set({
          whopId,
          whopPlanId: membershipStatus.planId,
          whopMemberSince: membershipStatus.memberSince,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error('Error linking Whop ID:', error);
      return false;
    }
  }
  
  /**
   * Link a wallet address to a user account
   */
  async linkWalletAddress(userId: number, walletAddress: string, enableWalletAuth: boolean = true): Promise<boolean> {
    try {
      // First check if this wallet is already linked to another account
      const existingWalletUser = await db.query.users.findFirst({
        where: eq(users.walletAddress, walletAddress),
      });
      
      if (existingWalletUser && existingWalletUser.id !== userId) {
        console.warn(`Wallet address ${walletAddress} is already linked to user ${existingWalletUser.id}`);
        return false;
      }
      
      // Update the user record with wallet information
      await db.update(users)
        .set({
          walletAddress,
          walletAuthEnabled: enableWalletAuth,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error('Error linking wallet address:', error);
      return false;
    }
  }
  
  /**
   * Verify that a user owns a THC token
   */
  async verifyTHCTokenHolder(walletAddress: string): Promise<boolean> {
    try {
      // This would typically involve a Solana API call to check token holdings
      // For now, we'll simulate this check
      
      // TODO: Implement actual token verification logic
      // For example, query Solana for token holdings
      
      // Placeholder implementation that assumes verification
      return true;
    } catch (error) {
      console.error('Error verifying THC token holder:', error);
      return false;
    }
  }
  
  /**
   * Get user identity information including all authentication methods
   */
  async getUserIdentity(userId: number): Promise<UserIdentity | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      
      if (!user) {
        return null;
      }
      
      // Get all broker connections for this user
      const brokerConns = await db.query.brokerConnections.findMany({
        where: eq(brokerConnections.userId, userId),
      });
      
      return {
        userId: user.id,
        whopId: user.whopId || undefined,
        whopPlanId: user.whopPlanId || undefined,
        walletAddress: user.walletAddress || undefined,
        walletAuthEnabled: user.walletAuthEnabled || false,
        hasConnectedBrokers: brokerConns.length > 0,
        connectedBrokerIds: brokerConns.map(conn => conn.id)
      };
    } catch (error) {
      console.error('Error getting user identity:', error);
      return null;
    }
  }
  
  /**
   * Sync user data between all identity systems
   * This ensures Whop membership is reflected in wallet and broker access
   */
  async syncUserIdentity(userId: number): Promise<boolean> {
    try {
      const userIdentity = await this.getUserIdentity(userId);
      
      if (!userIdentity) {
        return false;
      }
      
      // If user has a Whop ID, verify membership status and update accordingly
      if (userIdentity.whopId) {
        const membershipStatus = await whopService.validateMembership(userIdentity.whopId);
        
        // Update Whop plan ID if it has changed
        if (membershipStatus.isActive && membershipStatus.planId !== userIdentity.whopPlanId) {
          await db.update(users)
            .set({
              whopPlanId: membershipStatus.planId,
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
        }
        
        // If membership is no longer active, we could take action here
        // such as limiting access to certain features
      }
      
      // If user has a wallet address, verify THC token ownership
      if (userIdentity.walletAddress) {
        const isTokenHolder = await this.verifyTHCTokenHolder(userIdentity.walletAddress);
        
        // Update user's token holder status
        await db.update(users)
          .set({
            thcTokenHolder: isTokenHolder,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing user identity:', error);
      return false;
    }
  }
}

// Create singleton instance
export const userIdentityService = new UserIdentityService();