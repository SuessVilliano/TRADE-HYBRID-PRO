import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export enum BadgeCategory {
  Trading = 'trading',
  Social = 'social',
  Education = 'education',
  Achievement = 'achievement',
  Special = 'special'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name from Lucide icons or custom SVG
  category: BadgeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // Progress towards unlocking (0-100)
  maxProgress?: number;
  requirements?: string[]; // Text description of requirements
  color?: string; // Optional custom color
}

export interface SocialBadgesState {
  badges: Badge[];
  unlockBadge: (badgeId: string) => void;
  setBadgeProgress: (badgeId: string, progress: number) => void;
  calculateBadgeProgress: (badgeId: string, currentValue: number, targetValue: number) => void;
  getBadgesByCategory: (category: BadgeCategory) => Badge[];
  getUnlockedBadges: () => Badge[];
  getLockedBadges: () => Badge[];
  getRarityColor: (rarity: string) => string;
  hasUnlockedBadge: (badgeId: string) => boolean;
}

// Default badges available in the system
const defaultBadges: Badge[] = [
  // Trading Performance Badges
  {
    id: 'profitable-trader',
    name: 'Profitable Trader',
    description: 'Maintain positive returns for 7 consecutive days',
    icon: 'TrendingUp',
    category: BadgeCategory.Trading,
    rarity: 'common',
    unlocked: false,
    requirements: ['Maintain positive returns for 7 consecutive days']
  },
  {
    id: 'master-trader',
    name: 'Master Trader',
    description: 'Achieve 20% returns in a single month',
    icon: 'Award',
    category: BadgeCategory.Trading,
    rarity: 'rare',
    unlocked: false,
    requirements: ['Achieve 20% returns in a single month']
  },
  {
    id: 'consistent-performer',
    name: 'Consistent Performer',
    description: 'Execute trades for 30 consecutive market days',
    icon: 'LineChart',
    category: BadgeCategory.Trading,
    rarity: 'uncommon',
    unlocked: false,
    progress: 0,
    maxProgress: 30,
    requirements: ['Trade for 30 consecutive market days']
  },
  {
    id: 'risk-manager',
    name: 'Risk Manager',
    description: 'Maintain a Sharpe ratio above 2.0 for a month',
    icon: 'Shield',
    category: BadgeCategory.Trading,
    rarity: 'rare',
    unlocked: false,
    requirements: ['Maintain a Sharpe ratio above 2.0 for a month']
  },
  {
    id: 'volatility-surfer',
    name: 'Volatility Surfer',
    description: 'Successfully profit during high market volatility',
    icon: 'Wave',
    category: BadgeCategory.Trading,
    rarity: 'uncommon',
    unlocked: false,
    requirements: ['Make profitable trades during market volatility (VIX > 25)']
  },
  
  // Social Badges
  {
    id: 'community-contributor',
    name: 'Community Contributor',
    description: 'Help other traders with advice and insights',
    icon: 'Users',
    category: BadgeCategory.Social,
    rarity: 'common',
    unlocked: false,
    requirements: ['Share trading insights with the community']
  },
  {
    id: 'signal-provider',
    name: 'Signal Provider',
    description: 'Share profitable trading signals with the community',
    icon: 'Signal',
    category: BadgeCategory.Social,
    rarity: 'uncommon',
    unlocked: false,
    requirements: ['Share at least 5 profitable signals']
  },
  {
    id: 'influencer',
    name: 'Trading Influencer',
    description: 'Gain 100+ followers in the Trade Hybrid community',
    icon: 'TrendingUp',
    category: BadgeCategory.Social,
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    requirements: ['Gain 100+ followers']
  },
  
  // Education Badges
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 5 educational modules',
    icon: 'BookOpen',
    category: BadgeCategory.Education,
    rarity: 'common',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    requirements: ['Complete 5 educational modules']
  },
  {
    id: 'trading-scholar',
    name: 'Trading Scholar',
    description: 'Score 90%+ on 10 different trading quizzes',
    icon: 'GraduationCap',
    category: BadgeCategory.Education,
    rarity: 'uncommon',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    requirements: ['Score 90%+ on 10 different trading quizzes']
  },
  {
    id: 'master-strategist',
    name: 'Master Strategist',
    description: 'Create and backtest 5 successful trading strategies',
    icon: 'Brain',
    category: BadgeCategory.Education,
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    requirements: ['Create and backtest 5 successful trading strategies']
  },
  
  // Achievement Badges
  {
    id: 'thc-holder',
    name: 'THC Token Holder',
    description: 'Hold THC tokens in your wallet',
    icon: 'Coins',
    category: BadgeCategory.Achievement,
    rarity: 'common',
    unlocked: false,
    requirements: ['Hold THC tokens in your wallet']
  },
  {
    id: 'diamond-hands',
    name: 'Diamond Hands',
    description: 'Hold a position through 20%+ drawdown and recover to profit',
    icon: 'Diamond',
    category: BadgeCategory.Achievement,
    rarity: 'rare',
    unlocked: false,
    requirements: ['Hold position through 20%+ drawdown and recover to profit']
  },
  {
    id: 'trend-stacker',
    name: 'Trend Stacker',
    description: 'Successfully use the Trend Stacking strategy for 10+ trades',
    icon: 'Layers',
    category: BadgeCategory.Achievement,
    rarity: 'epic',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    requirements: ['Use Trend Stacking strategy for 10+ profitable trades']
  },
  
  // Special Badges
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined Trade Hybrid during beta phase',
    icon: 'Rocket',
    category: BadgeCategory.Special,
    rarity: 'legendary',
    unlocked: false,
    requirements: ['Joined Trade Hybrid during beta phase']
  },
  {
    id: 'metaverse-pioneer',
    name: 'Metaverse Pioneer',
    description: 'Explored all areas of the Trade Hybrid metaverse',
    icon: 'Globe',
    category: BadgeCategory.Special,
    rarity: 'epic',
    unlocked: false,
    requirements: ['Explore all areas of the Trade Hybrid metaverse']
  }
];

export const useBadges = create<SocialBadgesState>()(
  persist(
    (set, get) => ({
      badges: defaultBadges,
      
      unlockBadge: (badgeId: string) => {
        set((state) => ({
          badges: state.badges.map((badge) => 
            badge.id === badgeId
              ? { ...badge, unlocked: true, unlockedAt: new Date() }
              : badge
          ),
        }));
      },
      
      setBadgeProgress: (badgeId: string, progress: number) => {
        set((state) => ({
          badges: state.badges.map((badge) => 
            badge.id === badgeId
              ? { 
                  ...badge, 
                  progress: Math.min(progress, badge.maxProgress || 100),
                  unlocked: progress >= (badge.maxProgress || 100) ? true : badge.unlocked,
                  unlockedAt: progress >= (badge.maxProgress || 100) && !badge.unlocked ? new Date() : badge.unlockedAt
                }
              : badge
          ),
        }));
      },
      
      calculateBadgeProgress: (badgeId: string, currentValue: number, targetValue: number) => {
        const progress = Math.min(100, Math.floor((currentValue / targetValue) * 100));
        get().setBadgeProgress(badgeId, progress);
      },
      
      getBadgesByCategory: (category: BadgeCategory) => {
        return get().badges.filter((badge) => badge.category === category);
      },
      
      getUnlockedBadges: () => {
        return get().badges.filter((badge) => badge.unlocked);
      },
      
      getLockedBadges: () => {
        return get().badges.filter((badge) => !badge.unlocked);
      },
      
      getRarityColor: (rarity: string) => {
        switch (rarity) {
          case 'common':
            return 'text-gray-500';
          case 'uncommon':
            return 'text-green-500';
          case 'rare':
            return 'text-blue-500';
          case 'epic':
            return 'text-purple-500';
          case 'legendary':
            return 'text-amber-500';
          default:
            return 'text-gray-500';
        }
      },
      
      hasUnlockedBadge: (badgeId: string) => {
        const badge = get().badges.find((b) => b.id === badgeId);
        return badge ? badge.unlocked : false;
      },
    }),
    {
      name: 'trader-badges-storage',
    }
  )
);