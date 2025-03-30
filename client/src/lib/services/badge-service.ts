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
    
    // Register for trading events
    this.setupTradingEventListeners();
    
    // If this is a new user, unlock the Early Adopter badge
    // For production, add a cut-off date check
    this.unlockEarlyAdopterBadge();
  }
  
  /**
   * Setup event listeners for trading activities
   */
  private setupTradingEventListeners() {
    // In a production app, we'd use a proper event system
    // For demo purposes, we'll use a direct approach
    
    // Check trade execution for "Diamond Hands" badge
    document.addEventListener('trade:position-held', (event) => {
      const customEvent = event as CustomEvent<{drawdownPercent: number, profitable: boolean}>;
      if (customEvent.detail.drawdownPercent >= 20 && customEvent.detail.profitable) {
        const badges = useBadges.getState();
        if (!badges.hasUnlockedBadge('diamond-hands')) {
          badges.unlockBadge('diamond-hands');
          this.showBadgeNotification('Diamond Hands');
        }
      }
    });
    
    // Check signal sharing for "Signal Provider" badge
    document.addEventListener('signal:shared', () => {
      const badges = useBadges.getState();
      if (!badges.hasUnlockedBadge('signal-provider')) {
        // Count shared signals
        const currentProgress = badges.badges.find(b => b.id === 'signal-provider')?.progress || 0;
        badges.setBadgeProgress('signal-provider', currentProgress + 1);
        
        if (currentProgress + 1 >= 5) {
          this.showBadgeNotification('Signal Provider');
        }
      }
    });
    
    // Check community contributions for "Community Contributor" badge
    document.addEventListener('community:contribution', () => {
      const badges = useBadges.getState();
      if (!badges.hasUnlockedBadge('community-contributor')) {
        badges.unlockBadge('community-contributor');
        this.showBadgeNotification('Community Contributor');
      }
    });
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
  
  // Keep track of visited locations
  private visitedLocations: Set<string> = new Set();
  
  // Key locations in the metaverse that need to be visited for the Pioneer badge
  private readonly KEY_LOCATIONS = [
    'trade_floor',
    'education_center',
    'social_hub',
    'signal_room',
    'crypto_exchange',
    'thc_vault'
  ];

  /**
   * Mark a location as visited and check for Metaverse Pioneer badge
   * @param locationId The unique identifier for the location
   */
  public recordLocationVisit(locationId: string) {
    const badges = useBadges.getState();
    
    // Add to visited locations
    this.visitedLocations.add(locationId);
    
    // Check if this is a key location
    if (this.KEY_LOCATIONS.includes(locationId)) {
      console.log(`🌍 Visited key location: ${locationId}`);
      
      // Calculate progress as percentage of key locations visited
      const visitedKeyLocations = this.KEY_LOCATIONS.filter(loc => 
        this.visitedLocations.has(loc)
      );
      
      const progress = Math.floor(
        (visitedKeyLocations.length / this.KEY_LOCATIONS.length) * 100
      );
      
      // Update badge progress
      badges.setBadgeProgress('metaverse-pioneer', progress);
      
      // Notify the user about progress
      if (progress === 100 && !badges.hasUnlockedBadge('metaverse-pioneer')) {
        this.showBadgeNotification('Metaverse Pioneer');
      } else if (visitedKeyLocations.length > 0) {
        console.log(`🏆 Metaverse Pioneer progress: ${visitedKeyLocations.length}/${this.KEY_LOCATIONS.length} locations`);
      }
    }
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
export const badgeService = BadgeService.getInstance();stance();