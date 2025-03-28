import React, { useState } from 'react';
import { useBadges, Badge as BadgeType } from '@/lib/stores/useBadges';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { BadgeCollectionPopup } from './badge-collection-popup';

interface ProfileBadgesDisplayProps {
  userId?: string; // If not provided, displays current user's badges
  maxBadges?: number; // Max number of badges to display before showing a +X more button
  size?: 'sm' | 'md' | 'lg'; // Size of the badges
  showLabels?: boolean; // Whether to show badge names
  onClick?: () => void; // Optional click handler for the entire component
  className?: string;
}

export function ProfileBadgesDisplay({
  userId,
  maxBadges = 5,
  size = 'md',
  showLabels = false,
  onClick,
  className
}: ProfileBadgesDisplayProps) {
  const { getUnlockedBadges, getRarityColor } = useBadges();
  const [badgePopupOpen, setBadgePopupOpen] = useState(false);
  
  // Get unlocked badges for display
  const unlockedBadges = getUnlockedBadges();
  
  // Determine which badges to display based on maxBadges
  const visibleBadges = unlockedBadges.slice(0, maxBadges);
  const hasMoreBadges = unlockedBadges.length > maxBadges;
  const additionalBadgesCount = unlockedBadges.length - maxBadges;
  
  // Determine size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const containerSizeClasses = {
    sm: 'gap-1 p-1',
    md: 'gap-2 p-2',
    lg: 'gap-3 p-2'
  };
  
  // Get icon component from Lucide icons
  const getBadgeIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Award;
    return Icon;
  };
  
  // Handle click to open badge collection popup
  const handleBadgesClick = () => {
    if (onClick) {
      onClick();
    } else {
      setBadgePopupOpen(true);
    }
  };
  
  return (
    <>
      <div 
        className={cn(
          'flex items-center rounded-md bg-background',
          containerSizeClasses[size],
          className
        )}
      >
        {visibleBadges.length > 0 ? (
          <>
            {visibleBadges.map((badge) => {
              const Icon = getBadgeIcon(badge.icon);
              return (
                <TooltipProvider key={badge.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity",
                          getRarityColor(badge.rarity).replace("text-", "bg-").replace("-500", "-100"),
                          showLabels ? "pr-2" : ""
                        )}
                      >
                        <div 
                          className={cn(
                            "rounded-full p-1",
                            getRarityColor(badge.rarity).replace("text-", "bg-").replace("-500", "-200")
                          )}
                        >
                          <Icon 
                            className={cn(
                              sizeClasses[size],
                              getRarityColor(badge.rarity)
                            )} 
                          />
                        </div>
                        
                        {showLabels && (
                          <span className={cn(
                            "ml-1 text-xs font-medium",
                            getRarityColor(badge.rarity)
                          )}>
                            {badge.name}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="text-center">
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <p className={cn("text-xs capitalize", getRarityColor(badge.rarity))}>
                          {badge.rarity}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
            
            {hasMoreBadges && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-2 h-6",
                  size === 'sm' && "h-5 px-1 text-xs",
                  size === 'lg' && "h-8 px-3"
                )}
                onClick={handleBadgesClick}
              >
                +{additionalBadgesCount} more
              </Button>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground">No badges yet</div>
        )}
      </div>
      
      {badgePopupOpen && (
        <BadgeCollectionPopup 
          isOpen={badgePopupOpen} 
          onClose={() => setBadgePopupOpen(false)}
          userId={userId}
        />
      )}
    </>
  );
}

// A specific badge display for nameplates in the 3D world
export function NameplateBadgeDisplay({ 
  userId, 
  maxBadges = 3
}: { 
  userId: string;
  maxBadges?: number;
}) {
  return (
    <ProfileBadgesDisplay 
      userId={userId}
      maxBadges={maxBadges}
      size="sm"
      className="bg-black/50 backdrop-blur-sm"
    />
  );
}

// A highlighted badge for showcasing special achievements
export function FeaturedBadge({ 
  badge,
  onClick
}: { 
  badge: BadgeType;
  onClick?: () => void;
}) {
  const { getRarityColor } = useBadges();
  const Icon = (LucideIcons as any)[badge.icon] || LucideIcons.Award;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "rounded-md p-2 flex items-center cursor-pointer hover:opacity-90 transition-all",
              getRarityColor(badge.rarity).replace("text-", "bg-").replace("-500", "-100"),
              "border",
              getRarityColor(badge.rarity).replace("text-", "border-")
            )}
            onClick={onClick}
          >
            <div 
              className={cn(
                "rounded-full p-2 mr-2",
                getRarityColor(badge.rarity).replace("text-", "bg-").replace("-500", "-200")
              )}
            >
              <Icon className={cn("h-5 w-5", getRarityColor(badge.rarity))} />
            </div>
            
            <div>
              <div className="font-medium text-sm">{badge.name}</div>
              <div className="text-xs text-muted-foreground">{badge.description}</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className={cn("text-xs capitalize", getRarityColor(badge.rarity))}>
            {badge.rarity} Badge
          </p>
          {badge.unlockedAt && (
            <p className="text-xs text-muted-foreground">
              Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}