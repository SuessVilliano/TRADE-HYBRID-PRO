import React, { useState } from 'react';
import { Lock, Info } from 'lucide-react';
import { useFeatureDisclosure, FeatureCategory, UserExperienceLevel } from '@/lib/context/FeatureDisclosureProvider';
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
  
  // Find the minimum level required for this feature
  const findMinimumLevelRequired = (): UserExperienceLevel => {
    const levels = [
      UserExperienceLevel.BEGINNER,
      UserExperienceLevel.INTERMEDIATE,
      UserExperienceLevel.ADVANCED,
      UserExperienceLevel.EXPERT
    ];
    
    for (const level of levels) {
      const { isFeatureEnabled } = new class {
        isFeatureEnabled(category: FeatureCategory) {
          switch(level) {
            case UserExperienceLevel.BEGINNER:
              return [FeatureCategory.BASIC_TRADING, FeatureCategory.EDUCATION].includes(category);
            case UserExperienceLevel.INTERMEDIATE:
              return [FeatureCategory.BASIC_TRADING, FeatureCategory.EDUCATION, 
                    FeatureCategory.SOCIAL, FeatureCategory.AI_FEATURES].includes(category);
            case UserExperienceLevel.ADVANCED:
              return [FeatureCategory.BASIC_TRADING, FeatureCategory.ADVANCED_TRADING,
                    FeatureCategory.EDUCATION, FeatureCategory.SOCIAL, 
                    FeatureCategory.AI_FEATURES, FeatureCategory.METAVERSE, 
                    FeatureCategory.NFT].includes(category);
            case UserExperienceLevel.EXPERT:
              return true; // All features available to experts
            default:
              return false;
          }
        }
      };
      
      if (isFeatureEnabled(featureCategory)) {
        return level;
      }
    }
    
    return UserExperienceLevel.EXPERT; // Default to expert if not found
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
              This feature is currently locked based on your experience level. You need to upgrade
              to <span className="text-emerald-400 font-semibold">{requiredLevel.charAt(0).toUpperCase() + requiredLevel.slice(1)}</span> level to access it.
            </p>
            
            <div className="bg-slate-800/50 rounded p-3 mb-4 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                Advancing your experience level will unlock more powerful features, but make sure
                you're comfortable with the basics first. You can change your level at any time in settings.
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
  
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="bg-purple-900/20 p-3 rounded-full mb-4">
        <Lock className="h-8 w-8 text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Feature Not Available</h2>
      <p className="text-slate-300 text-center mb-6 max-w-md">
        This feature is not available at your current experience level. You can change your
        experience level in settings to access more features.
      </p>
      <Button onClick={() => window.history.back()}>
        Go Back
      </Button>
    </div>
  );
};