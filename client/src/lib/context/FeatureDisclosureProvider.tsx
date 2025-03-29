import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user experience levels
export enum UserExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Define feature categories
export enum FeatureCategory {
  BASIC_TRADING = 'basic_trading',
  ADVANCED_TRADING = 'advanced_trading',
  AI_FEATURES = 'ai_features',
  METAVERSE = 'metaverse',
  SOCIAL = 'social',
  NFT = 'nft',
  BLOCKCHAIN = 'blockchain',
  EDUCATION = 'education'
}

// Feature visibility configuration based on user level
const FEATURE_VISIBILITY: Record<UserExperienceLevel, FeatureCategory[]> = {
  [UserExperienceLevel.BEGINNER]: [
    FeatureCategory.BASIC_TRADING,
    FeatureCategory.EDUCATION
  ],
  [UserExperienceLevel.INTERMEDIATE]: [
    FeatureCategory.BASIC_TRADING,
    FeatureCategory.EDUCATION,
    FeatureCategory.SOCIAL,
    FeatureCategory.AI_FEATURES
  ],
  [UserExperienceLevel.ADVANCED]: [
    FeatureCategory.BASIC_TRADING,
    FeatureCategory.ADVANCED_TRADING,
    FeatureCategory.EDUCATION,
    FeatureCategory.SOCIAL,
    FeatureCategory.AI_FEATURES,
    FeatureCategory.METAVERSE,
    FeatureCategory.NFT
  ],
  [UserExperienceLevel.EXPERT]: [
    FeatureCategory.BASIC_TRADING,
    FeatureCategory.ADVANCED_TRADING,
    FeatureCategory.EDUCATION,
    FeatureCategory.SOCIAL,
    FeatureCategory.AI_FEATURES,
    FeatureCategory.METAVERSE,
    FeatureCategory.NFT,
    FeatureCategory.BLOCKCHAIN
  ]
};

// Map routes to feature categories
export const ROUTE_TO_FEATURE_CATEGORY: Record<string, FeatureCategory> = {
  '/': FeatureCategory.BASIC_TRADING,
  '/trade-runner': FeatureCategory.BASIC_TRADING,
  '/trade-journal': FeatureCategory.BASIC_TRADING,
  '/news': FeatureCategory.BASIC_TRADING,
  '/solana-dex': FeatureCategory.BLOCKCHAIN,
  '/nft-marketplace': FeatureCategory.NFT,
  '/learn': FeatureCategory.EDUCATION,
  '/metaverse': FeatureCategory.METAVERSE,
  '/thc-staking': FeatureCategory.BLOCKCHAIN,
  '/live-stream': FeatureCategory.SOCIAL,
  '/ai-market-analysis': FeatureCategory.AI_FEATURES,
  '/trading-signals': FeatureCategory.AI_FEATURES,
  '/app': FeatureCategory.ADVANCED_TRADING
};

// Feature descriptions for tooltips
export const FEATURE_DESCRIPTIONS: Record<FeatureCategory, string> = {
  [FeatureCategory.BASIC_TRADING]: 'Core trading functionality with charts and order placement.',
  [FeatureCategory.ADVANCED_TRADING]: 'Advanced trading tools including algorithmic strategies and custom indicators.',
  [FeatureCategory.AI_FEATURES]: 'AI-powered market analysis and trading signals.',
  [FeatureCategory.METAVERSE]: '3D virtual environment to interact with other traders.',
  [FeatureCategory.SOCIAL]: 'Social features to connect with the trading community.',
  [FeatureCategory.NFT]: 'Buy, sell, and create NFTs in the marketplace.',
  [FeatureCategory.BLOCKCHAIN]: 'Blockchain-based features including THC token staking and DEX trading.',
  [FeatureCategory.EDUCATION]: 'Educational resources to improve trading skills.'
};

// Define the context type
interface FeatureDisclosureContextType {
  userLevel: UserExperienceLevel;
  setUserLevel: (level: UserExperienceLevel) => void;
  isFeatureEnabled: (featureCategory: FeatureCategory) => boolean;
  isRouteEnabled: (route: string) => boolean;
  getFeatureDescription: (featureCategory: FeatureCategory) => string;
  getAllEnabledFeatures: () => FeatureCategory[];
  completedTutorials: string[];
  markTutorialCompleted: (tutorialId: string) => void;
  resetTutorials: () => void;
}

// Create the context
const FeatureDisclosureContext = createContext<FeatureDisclosureContextType | undefined>(undefined);

// Provider component
export const FeatureDisclosureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get stored user level from localStorage or default to beginner
  const [userLevel, setUserLevelState] = useState<UserExperienceLevel>(() => {
    if (typeof window !== 'undefined') {
      const storedLevel = localStorage.getItem('userExperienceLevel');
      return storedLevel ? (storedLevel as UserExperienceLevel) : UserExperienceLevel.BEGINNER;
    }
    return UserExperienceLevel.BEGINNER;
  });

  // Track completed tutorials
  const [completedTutorials, setCompletedTutorials] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('completedTutorials');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Update localStorage when user level changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userExperienceLevel', userLevel);
    }
  }, [userLevel]);

  // Update localStorage when completed tutorials change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
    }
  }, [completedTutorials]);

  // Function to set user level
  const setUserLevel = (level: UserExperienceLevel) => {
    setUserLevelState(level);
  };

  // Check if a feature category is enabled for current user level
  const isFeatureEnabled = (featureCategory: FeatureCategory): boolean => {
    return FEATURE_VISIBILITY[userLevel].includes(featureCategory);
  };

  // Check if a route is enabled for current user level
  const isRouteEnabled = (route: string): boolean => {
    const category = ROUTE_TO_FEATURE_CATEGORY[route];
    if (!category) return true; // If route is not mapped, enable by default
    return isFeatureEnabled(category);
  };

  // Get feature description
  const getFeatureDescription = (featureCategory: FeatureCategory): string => {
    return FEATURE_DESCRIPTIONS[featureCategory] || '';
  };

  // Get all enabled features
  const getAllEnabledFeatures = (): FeatureCategory[] => {
    return FEATURE_VISIBILITY[userLevel];
  };

  // Mark a tutorial as completed
  const markTutorialCompleted = (tutorialId: string) => {
    if (!completedTutorials.includes(tutorialId)) {
      setCompletedTutorials([...completedTutorials, tutorialId]);
    }
  };

  // Reset all tutorials
  const resetTutorials = () => {
    setCompletedTutorials([]);
  };

  // Context value
  const value = {
    userLevel,
    setUserLevel,
    isFeatureEnabled,
    isRouteEnabled,
    getFeatureDescription,
    getAllEnabledFeatures,
    completedTutorials,
    markTutorialCompleted,
    resetTutorials
  };

  return (
    <FeatureDisclosureContext.Provider value={value}>
      {children}
    </FeatureDisclosureContext.Provider>
  );
};

// Custom hook to use the context
export const useFeatureDisclosure = (): FeatureDisclosureContextType => {
  const context = useContext(FeatureDisclosureContext);
  if (context === undefined) {
    throw new Error('useFeatureDisclosure must be used within a FeatureDisclosureProvider');
  }
  return context;
};