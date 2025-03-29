import React, { useState } from 'react';
import { Lock, Info } from 'lucide-react';
import { 
  useFeatureDisclosure, 
  FeatureCategory, 
  UserExperienceLevel
} from '@/lib/context/FeatureDisclosureProvider';
import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface FeatureGatedProps {
  children: React.ReactNode;
  featureCategory: FeatureCategory;
  tooltipText?: string;
  showLockIcon?: boolean;
  className?: string;
}

// Component that only renders children if the feature is available to the user's experience level
export const FeatureGated: React.FC<FeatureGatedProps> = ({
  children,
  featureCategory,
  tooltipText,
  showLockIcon = true,
  className = '',
}) => {
  const { isFeatureEnabled, getFeatureDescription, userLevel, setUserLevel } = useFeatureDisclosure();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const isEnabled = isFeatureEnabled(featureCategory);
  const description = tooltipText || getFeatureDescription(featureCategory);
  
  if (isEnabled) {
    return <>{children}</>;
  }
  
  // Find the minimum membership tier required for this feature
  const findMinimumLevelRequired = (): UserExperienceLevel => {
    const membershipTiers = [
      UserExperienceLevel.FREE,
      UserExperienceLevel.PAID,
      UserExperienceLevel.PRO
    ];
    
    for (const tier of membershipTiers) {
      const { isFeatureEnabled } = new class {
        isFeatureEnabled(category: FeatureCategory) {
          switch(tier) {
            // Free tier - basic features only
            case UserExperienceLevel.FREE:
              return [
                FeatureCategory.BASIC_TRADING,
                FeatureCategory.EDUCATION
              ].includes(category);
              
            // Paid tier - most features except Market Buddy
            case UserExperienceLevel.PAID:
              return [
                FeatureCategory.BASIC_TRADING,
                FeatureCategory.ADVANCED_TRADING,
                FeatureCategory.EDUCATION,
                FeatureCategory.SOCIAL,
                FeatureCategory.AI_FEATURES,
                FeatureCategory.METAVERSE,
                FeatureCategory.NFT,
                FeatureCategory.BLOCKCHAIN
              ].includes(category);
              
            // Pro tier - all features
            case UserExperienceLevel.PRO:
              return true; // All features available to pro members
              
            default:
              return false;
          }
        }
      };
      
      if (isFeatureEnabled(featureCategory)) {
        return tier;
      }
    }
    
    return UserExperienceLevel.PRO; // Default to PRO if not found
  };
  
  const requiredLevel = findMinimumLevelRequired();
  
  // For locked items, return a disabled version with tooltip
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`relative ${className} cursor-not-allowed opacity-60`}
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              {children}
              {showLockIcon && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded">
                  <Lock className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="text-sm">
              <p className="font-semibold mb-1">Feature Locked</p>
              <p className="text-xs text-slate-300 mb-2">{description}</p>
              <p className="text-xs text-emerald-400">
                Available at <span className="font-semibold">{requiredLevel.charAt(0).toUpperCase() + requiredLevel.slice(1)}</span> level
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-900/50 p-2 rounded-full">
                <Lock className="h-5 w-5 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold">Feature Locked</h3>
            </div>
            
            <p className="text-slate-300 mb-4">
              This feature requires a <span className="text-emerald-400 font-semibold">{requiredLevel.toUpperCase()}</span> membership. 
              {requiredLevel === UserExperienceLevel.PAID && "Upgrade your membership to access advanced trading features and the metaverse."}
              {requiredLevel === UserExperienceLevel.PRO && "Upgrade to PRO to access our premium Market Buddy AI and all advanced features."}
            </p>
            
            <div className="bg-slate-800/50 rounded p-3 mb-4 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                {requiredLevel === UserExperienceLevel.PAID && 
                  "PAID membership includes access to advanced trading tools, the metaverse, NFT marketplace, and most AI features."}
                {requiredLevel === UserExperienceLevel.PRO && 
                  "PRO membership includes all platform features including our advanced Market Buddy AI assistant and premium trading signals."}
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsUpgradeModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setUserLevel(requiredLevel);
                  setIsUpgradeModalOpen(false);
                }}
              >
                Upgrade to {requiredLevel.charAt(0).toUpperCase() + requiredLevel.slice(1)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Route-gated component for use in App.tsx with routes
interface RouteGatedProps {
  children: React.ReactNode;
  route: string;
}

export const RouteGated: React.FC<RouteGatedProps> = ({ children, route }) => {
  const { isRouteEnabled } = useFeatureDisclosure();
  
  if (isRouteEnabled(route)) {
    return <>{children}</>;
  }
  
  // Find the minimum tier required for the route
  const { getFeatureDescription, setUserLevel } = useFeatureDisclosure();
  
  // Map routes to feature categories
  const getFeatureCategoryForRoute = (route: string): FeatureCategory | undefined => {
    const routeMapping: Record<string, FeatureCategory> = {
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
      '/market-buddy': FeatureCategory.MARKET_BUDDY,
      '/app': FeatureCategory.ADVANCED_TRADING,
      '/bulls-vs-bears': FeatureCategory.ADVANCED_TRADING
    };
    
    return routeMapping[route];
  };
  
  const featureCategory = getFeatureCategoryForRoute(route);
  const featureDescription = featureCategory ? getFeatureDescription(featureCategory) : 'Restricted feature';
  
  // Find the required membership tier
  const findRequiredTier = (): UserExperienceLevel => {
    if (!featureCategory) return UserExperienceLevel.FREE;
    
    // Check which membership tier has access to this feature
    if ([FeatureCategory.MARKET_BUDDY].includes(featureCategory)) {
      return UserExperienceLevel.PRO;
    } else if ([
      FeatureCategory.ADVANCED_TRADING,
      FeatureCategory.NFT, 
      FeatureCategory.BLOCKCHAIN,
      FeatureCategory.METAVERSE,
      FeatureCategory.AI_FEATURES
    ].includes(featureCategory)) {
      return UserExperienceLevel.PAID;
    }
    
    return UserExperienceLevel.FREE;
  };
  
  const requiredTier = findRequiredTier();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-slate-900/95">
      <div className="bg-purple-900/20 p-5 rounded-full mb-6">
        <Lock className="h-10 w-10 text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Membership Required</h2>
      <p className="text-slate-300 text-center mb-3 max-w-md">
        This feature requires a <span className="text-emerald-400 font-bold">{requiredTier.toUpperCase()}</span> membership.
      </p>
      <p className="text-slate-400 text-center mb-6 max-w-md text-sm">
        {featureDescription}
      </p>
      
      <div className="flex gap-4 mb-8">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
        
        <Button 
          variant="default" 
          onClick={() => {
            setUserLevel(UserExperienceLevel.DEMO);
            window.location.reload(); // Reload to apply the change
          }}
        >
          Try Demo Access
        </Button>
      </div>
      
      <div className="bg-slate-800/70 rounded-lg p-4 max-w-md">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">
            <strong>Get Full Access:</strong> Visit <a href="https://tradehybrid.club" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">tradehybrid.club</a> to purchase a membership and unlock all platform features.
          </p>
        </div>
      </div>
    </div>
  );
};