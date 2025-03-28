import React, { useState } from 'react';
import { useBadges, BadgeCategory, Badge } from '@/lib/stores/useBadges';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { PopupContainer } from './popup-container';
import { Progress } from './progress';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Search } from 'lucide-react';
import { Input } from './input';

export function BadgeCollectionPopup({
  isOpen,
  onClose,
  userId
}: {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // If not provided, shows current user's badges
}) {
  const {
    badges,
    getBadgesByCategory,
    getUnlockedBadges,
    getLockedBadges,
    getRarityColor
  } = useBadges();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Filter badges based on search and selected category
  const filteredBadges = badges.filter((badge) => {
    const matchesSearch = 
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'all' ||
      selectedCategory === 'unlocked' && badge.unlocked ||
      selectedCategory === 'locked' && !badge.unlocked ||
      selectedCategory === badge.category;
      
    return matchesSearch && matchesCategory;
  });
  
  // Get icon component from Lucide
  const getBadgeIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Award;
    return Icon;
  };
  
  if (!isOpen) return null;
  
  return (
    <PopupContainer 
      title="Achievement Badges" 
      onClose={onClose}
    >
      <div className="flex flex-col h-full">
        {/* Search and Filter */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search badges..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Category Tabs */}
        <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="mb-4">
          <TabsList className="grid grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
            <TabsTrigger value={BadgeCategory.Trading}>Trading</TabsTrigger>
            <TabsTrigger value={BadgeCategory.Social}>Social</TabsTrigger>
            <TabsTrigger value={BadgeCategory.Education}>Education</TabsTrigger>
            <TabsTrigger value={BadgeCategory.Achievement}>Achievement</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Badge Collection */}
        <ScrollArea className="flex-1">
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBadges.map((badge) => {
                const IconComponent = getBadgeIcon(badge.icon);
                return (
                  <BadgeCard 
                    key={badge.id} 
                    badge={badge} 
                    IconComponent={IconComponent}
                    rarityColor={getRarityColor(badge.rarity)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground p-4">
              <p>No badges match your search criteria.</p>
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </ScrollArea>
        
        {/* Summary Footer */}
        <div className="pt-4 mt-2 border-t flex justify-between text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">{getUnlockedBadges().length}</span> of {badges.length} badges unlocked
          </div>
          <div>
            <span className="font-medium text-foreground">{Math.round((getUnlockedBadges().length / badges.length) * 100)}%</span> complete
          </div>
        </div>
      </div>
    </PopupContainer>
  );
}

// Individual Badge Card
function BadgeCard({ 
  badge, 
  IconComponent,
  rarityColor
}: { 
  badge: Badge;
  IconComponent: React.ElementType;
  rarityColor: string;
}) {
  // Get rarity color and styles
  const borderColor = badge.unlocked 
    ? rarityColor.replace('text-', 'border-')
    : 'border-gray-200 dark:border-gray-800';
  
  const bgColor = badge.unlocked 
    ? rarityColor.replace('text-', 'bg-').replace('-500', '-50') 
    : 'bg-gray-50 dark:bg-gray-800';
    
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border transition-all",
        badge.unlocked ? `${borderColor} ${bgColor}` : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 opacity-75"
      )}
    >
      <div className="flex items-start">
        <div 
          className={cn(
            "p-2 rounded-md mr-3",
            badge.unlocked ? bgColor : "bg-gray-100 dark:bg-gray-700"
          )}
        >
          <IconComponent 
            className={cn(
              "h-5 w-5",
              badge.unlocked ? rarityColor : "text-gray-400 dark:text-gray-500"
            )} 
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-sm flex items-center">
            {badge.name}
            <span className={cn("text-xs ml-2 capitalize", rarityColor)}>
              {badge.rarity}
            </span>
          </h3>
          
          <p className="text-xs text-muted-foreground mt-1">
            {badge.description}
          </p>
          
          {/* Show requirements for locked badges */}
          {!badge.unlocked && badge.requirements && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
              <ul className="text-xs text-muted-foreground ml-4 mt-1 list-disc">
                {badge.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Show progress if applicable */}
          {badge.maxProgress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progress</span>
                <span>
                  {badge.progress || 0}/{badge.maxProgress}
                </span>
              </div>
              <Progress 
                value={(badge.progress || 0) / badge.maxProgress * 100} 
                className="h-1" 
              />
            </div>
          )}
          
          {/* Show unlock date for unlocked badges */}
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}