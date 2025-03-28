import { useBadges } from '../stores/useBadges';
import { useTrader } from '../stores/useTrader';
import { useMultiplayer } from '../stores/useMultiplayer';

/**
 * Badge Service - Handles checking and unlocking badges based on user actions
 * This service should be initialized at the application level to listen for 
 * events that might unlock badges.
 */
export class BadgeService {
  private static instance: BadgeService;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  /**
   * Initialize the badge service and set up event listeners
   */
  public initialize() {
    // Set up periodic checks for badge unlocking
    this.setupBadgeChecks();
  }

  /**
   * Set up periodic checks for badge unlocking conditions
   */
  private setupBadgeChecks() {
    // Check trading performance badges
    this.checkTradingBadges();
    
    // Set up periodic check (every 5 minutes)
    setInterval(() => {
      this.checkTradingBadges();
    }, 5 * 60 * 1000);
  }

  /**
   * Check trading performance badges
   */
  public checkTradingBadges() {
    const badges = useBadges.getState();
    const traderState = useTrader.getState();
    
    // Check for Profitable Trader badge
    if (!badges.hasUnlockedBadge('profitable-trader')) {
      // In a real implementation, this would check for 7 consecutive profitable days
      // For demo purposes, we'll check if the overall PnL is positive
      if (traderState.tradeStats.netPnL > 0) {
        badges.unlockBadge('profitable-trader');
        this.showBadgeNotification('Profitable Trader');
      }
    }
    
    // Check for Master Trader badge
    if (!badges.hasUnlockedBadge('master-trader')) {
      // In a real implementation, this would check for 20% returns in a month
      // For demo purposes, we'll check if the overall PnL is very high
      if (traderState.tradeStats.netPnL > 10000) {
        badges.unlockBadge('master-trader');
        this.showBadgeNotification('Master Trader');
      }
    }
    
    // Check for Risk Manager badge
    if (!badges.hasUnlockedBadge('risk-manager')) {
      // In a real implementation, this would calculate the Sharpe ratio
      // For demo purposes, we'll check if the profit factor is high enough
      if (traderState.tradeStats.profitFactor >= 2.0) {
        badges.unlockBadge('risk-manager');
        this.showBadgeNotification('Risk Manager');
      }
    }
    
    // Check for Consistent Performer badge progress
    if (!badges.hasUnlockedBadge('consistent-performer')) {
      // Update progress based on consecutive trading days
      // For demo purposes, we'll use the total trades as a proxy
      const progress = Math.min(traderState.tradeStats.totalTrades, 30);
      badges.setBadgeProgress('consistent-performer', progress);
      
      if (progress >= 30) {
        this.showBadgeNotification('Consistent Performer');
      }
    }
  }
  
  /**
   * Update social badges based on social activity
   */
  public checkSocialBadges() {
    const badges = useBadges.getState();
    const multiplayer = useMultiplayer.getState();
    
    // Check for Influencer badge progress
    if (!badges.hasUnlockedBadge('influencer')) {
      // In a real implementation, this would check the number of followers
      // For demo purposes, we'll use a placeholder value
      const followerCount = 0; // This would be replaced with actual follower count
      
      badges.setBadgeProgress('influencer', followerCount);
      
      if (followerCount >= 100) {
        this.showBadgeNotification('Trading Influencer');
      }
    }
  }
  
  /**
   * Record when a user completes an educational module
   */
  public recordModuleCompletion() {
    const badges = useBadges.getState();
    
    // Update Knowledge Seeker badge progress
    if (!badges.hasUnlockedBadge('knowledge-seeker')) {
      const currentProgress = badges.badges.find(b => b.id === 'knowledge-seeker')?.progress || 0;
      badges.setBadgeProgress('knowledge-seeker', currentProgress + 1);
      
      if (currentProgress + 1 >= 5) {
        this.showBadgeNotification('Knowledge Seeker');
      }
    }
  }
  
  /**
   * Record when a user passes a quiz with high score
   */
  public recordQuizSuccess() {
    const badges = useBadges.getState();
    
    // Update Trading Scholar badge progress
    if (!badges.hasUnlockedBadge('trading-scholar')) {
      const currentProgress = badges.badges.find(b => b.id === 'trading-scholar')?.progress || 0;
      badges.setBadgeProgress('trading-scholar', currentProgress + 1);
      
      if (currentProgress + 1 >= 10) {
        this.showBadgeNotification('Trading Scholar');
      }
    }
  }
  
  /**
   * Check if user has THC tokens
   */
  public checkThcTokenOwnership(hasTokens: boolean) {
    const badges = useBadges.getState();
    
    if (!badges.hasUnlockedBadge('thc-holder') && hasTokens) {
      badges.unlockBadge('thc-holder');
      this.showBadgeNotification('THC Token Holder');
    }
  }
  
  /**
   * Record Trend Stacking strategy usage
   */
  public recordTrendStackingUse() {
    const badges = useBadges.getState();
    
    // Update Trend Stacker badge progress
    if (!badges.hasUnlockedBadge('trend-stacker')) {
      const currentProgress = badges.badges.find(b => b.id === 'trend-stacker')?.progress || 0;
      badges.setBadgeProgress('trend-stacker', currentProgress + 1);
      
      if (currentProgress + 1 >= 10) {
        this.showBadgeNotification('Trend Stacker');
      }
    }
  }
  
  /**
   * Unlock the Early Adopter badge
   */
  public unlockEarlyAdopterBadge() {
    const badges = useBadges.getState();
    
    if (!badges.hasUnlockedBadge('early-adopter')) {
      badges.unlockBadge('early-adopter');
      this.showBadgeNotification('Early Adopter');
    }
  }
  
  /**
   * Mark a location as visited and check for Metaverse Pioneer badge
   */
  public recordLocationVisit(locationId: string) {
    // This would track which locations have been visited
    // When all key locations are visited, unlock the badge
    // For demo purposes, we won't implement the full logic
  }
  
  /**
   * Show a notification when a badge is unlocked
   */
  private showBadgeNotification(badgeName: string) {
    // In a production app, this would display a toast or popup notification
    console.log(`🏆 Badge Unlocked: ${badgeName}`);
    
    // Broadcast achievement to other players
    const multiplayer = useMultiplayer.getState();
    if (multiplayer && multiplayer.shareSocialActivity) {
      multiplayer.shareSocialActivity('achievement', `earned the ${badgeName} badge!`);
    }
  }
}

// Export a singleton instance
export const badgeService = BadgeService.getInstance();