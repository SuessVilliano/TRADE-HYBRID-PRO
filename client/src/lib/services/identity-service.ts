/**
 * Identity Service - Handles integration between Whop, Wallet, and Broker IDs
 * This service manages the synchronization of user identity across different systems
 */

import axios from 'axios';

export interface UserIdentity {
  userId: number;
  whopId?: string;
  whopPlanId?: string;
  walletAddress?: string;
  walletAuthEnabled?: boolean;
  hasConnectedBrokers: boolean;
  connectedBrokerIds: number[];
}

class IdentityService {
  /**
   * Get a user's identity information
   */
  async getUserIdentity(userId: number): Promise<UserIdentity | null> {
    try {
      const response = await axios.get(`/api/identity/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user identity:', error);
      return null;
    }
  }
  
  /**
   * Link a Whop ID to a user account
   */
  async linkWhopId(userId: number, whopId: string): Promise<boolean> {
    try {
      const response = await axios.post(`/api/identity/${userId}/whop`, { whopId });
      return response.data.success;
    } catch (error) {
      console.error('Error linking Whop ID:', error);
      return false;
    }
  }
  
  /**
   * Link a wallet address to a user account
   */
  async linkWalletAddress(userId: number, walletAddress: string, enableWalletAuth: boolean = true): Promise<{success: boolean, isTokenHolder: boolean}> {
    try {
      const response = await axios.post(`/api/identity/${userId}/wallet`, { 
        walletAddress, 
        enableWalletAuth 
      });
      
      return {
        success: response.data.success,
        isTokenHolder: response.data.isTokenHolder || false
      };
    } catch (error) {
      console.error('Error linking wallet address:', error);
      return { 
        success: false,
        isTokenHolder: false
      };
    }
  }
  
  /**
   * Sync a user's identity across all systems
   */
  async syncUserIdentity(userId: number): Promise<{success: boolean, identity: UserIdentity | null}> {
    try {
      const response = await axios.post(`/api/identity/${userId}/sync`);
      
      return {
        success: response.data.success,
        identity: response.data.identity
      };
    } catch (error) {
      console.error('Error syncing user identity:', error);
      return {
        success: false,
        identity: null
      };
    }
  }
}

// Export as singleton
export const identityService = new IdentityService();