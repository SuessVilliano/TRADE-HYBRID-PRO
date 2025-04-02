/**
 * WhopService - Client-side implementation of the Whop service
 * This service uses the shared WhopServiceBase class
 */

import { config } from '../config';
import { UserExperienceLevel as FeatureUserExperienceLevel } from '../context/FeatureDisclosureProvider';
import { WhopServiceBase, UserExperienceLevel } from '@shared/services/whop-service';

// Create a class that extends the base service
class ClientWhopService extends WhopServiceBase {
  constructor() {
    // Initialize with the client-side API key
    super(config.WHOP_API_KEY || '');
  }
  
  // Add method to convert shared UserExperienceLevel to client-specific enum if needed
  mapToFeatureUserLevel(level: UserExperienceLevel): FeatureUserExperienceLevel {
    switch (level) {
      case UserExperienceLevel.FREE:
        return FeatureUserExperienceLevel.FREE;
      case UserExperienceLevel.DEMO:
        return FeatureUserExperienceLevel.DEMO;
      case UserExperienceLevel.PAID:
        return FeatureUserExperienceLevel.PAID;
      case UserExperienceLevel.PRO:
        return FeatureUserExperienceLevel.PRO;
      // Map any admin enums to PRO until we implement admin in the feature provider
      default:
        return FeatureUserExperienceLevel.FREE;
    }
  }
  
  // Override the getUserExperienceLevel to return the client-specific enum
  async getClientUserExperienceLevel(userId: string): Promise<FeatureUserExperienceLevel> {
    const level = await super.getUserExperienceLevel(userId);
    return this.mapToFeatureUserLevel(level);
  }
}

// Export singleton instance
export const whopService = new ClientWhopService();

// Re-export types from the shared service for convenience
export { UserExperienceLevel, type WhopMembershipStatus } from '@shared/services/whop-service';