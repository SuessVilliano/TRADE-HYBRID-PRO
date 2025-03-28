import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTradingTips } from '@/lib/stores/useTradingTips';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Lightbulb, Bookmark, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onChange: (category: string | null) => void;
}

function CategoryFilter({ selectedCategory, onChange }: CategoryFilterProps) {
  const categories = [
    { id: null, name: 'All', icon: '🌐' },
    { id: 'crypto', name: 'Crypto', icon: '₿' },
    { id: 'forex', name: 'Forex', icon: '💱' },
    { id: 'stocks', name: 'Stocks', icon: '📈' },
    { id: 'technical', name: 'Technical', icon: '📊' },
    { id: 'general', name: 'General', icon: '🧠' },
    { id: 'fundamental', name: 'Fundamental', icon: '📰' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
        <Button
          key={category.id ?? 'all'}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(category.id)}
          className="flex items-center gap-1"
        >
          <span className="mr-1">{category.icon}</span>
          {category.name}
        </Button>
      ))}
    </div>
  );
}

interface DifficultyFilterProps {
  selectedDifficulty: string | null;
  onChange: (difficulty: string | null) => void;
}

function DifficultyFilter({ selectedDifficulty, onChange }: DifficultyFilterProps) {
  const difficulties = [
    { id: null, name: 'All Levels' },
    { id: 'beginner', name: 'Beginner', color: 'text-green-600 dark:text-green-400' },
    { id: 'intermediate', name: 'Intermediate', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'advanced', name: 'Advanced', color: 'text-purple-600 dark:text-purple-400' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {difficulties.map((difficulty) => (
        <Button
          key={difficulty.id ?? 'all'}
          variant={selectedDifficulty === difficulty.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(difficulty.id)}
          className={selectedDifficulty !== difficulty.id && difficulty.color ? difficulty.color : ''}
        >
          {difficulty.name}
        </Button>
      ))}
    </div>
  );
}

export function TradingTipsExplorer() {
  const { tips, showTip, viewedTips } = useTradingTips();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter tips based on search query, category, and difficulty
  const filteredTips = tips.filter(tip => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = categoryFilter === null || tip.category === categoryFilter;
    
    // Difficulty filter
    const matchesDifficulty = difficultyFilter === null || tip.difficulty === difficultyFilter;
    
    // Tab filter
    if (activeTab === 'viewed') {
      return matchesSearch && matchesCategory && matchesDifficulty && viewedTips.includes(tip.id);
    } else if (activeTab === 'unviewed') {
      return matchesSearch && matchesCategory && matchesDifficulty && !viewedTips.includes(tip.id);
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  
  const handleShowTip = (tipId: string) => {
    // When tip is explicitly shown from explorer, we should force show it
    // instead of using setState directly, we should use the showTip method
    // which will handle the firstLoad logic properly
    const selectedTip = tips.find(tip => tip.id === tipId);
    if (selectedTip) {
      // We force the tip to show regardless of first load status
      showTip(selectedTip.category, selectedTip.difficulty, true);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Trading Tips Explorer
        </CardTitle>
        <CardDescription>
          Browse and discover helpful trading tips for different markets and skill levels.
        </CardDescription>
        
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tips by keyword..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <CategoryFilter 
            selectedCategory={categoryFilter} 
            onChange={setCategoryFilter} 
          />
          
          <DifficultyFilter 
            selectedDifficulty={difficultyFilter} 
            onChange={setDifficultyFilter} 
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Tips</TabsTrigger>
            <TabsTrigger value="viewed">
              <CheckCircle2 size={14} className="mr-1" />
              Viewed
            </TabsTrigger>
            <TabsTrigger value="unviewed">
              <Bookmark size={14} className="mr-1" />
              New
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {filteredTips.length > 0 ? (
                <div className="space-y-3">
                  {filteredTips.map(tip => (
                    <TipCard 
                      key={tip.id} 
                      tip={tip} 
                      isViewed={viewedTips.includes(tip.id)}
                      onView={() => handleShowTip(tip.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <Lightbulb size={48} className="text-muted-foreground mb-4 opacity-30" />
                  <p className="text-muted-foreground">No tips match your current filters.</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter(null);
                      setDifficultyFilter(null);
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="viewed" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {filteredTips.length > 0 ? (
                <div className="space-y-3">
                  {filteredTips.map(tip => (
                    <TipCard 
                      key={tip.id} 
                      tip={tip} 
                      isViewed={true}
                      onView={() => handleShowTip(tip.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <CheckCircle2 size={48} className="text-muted-foreground mb-4 opacity-30" />
                  <p className="text-muted-foreground">You haven't viewed any tips matching these filters yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      // Force show tip when explicitly requested
                      showTip(undefined, undefined, true);
                    }}
                  >
                    View a random tip
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unviewed" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              {filteredTips.length > 0 ? (
                <div className="space-y-3">
                  {filteredTips.map(tip => (
                    <TipCard 
                      key={tip.id} 
                      tip={tip} 
                      isViewed={false}
                      onView={() => handleShowTip(tip.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <Bookmark size={48} className="text-muted-foreground mb-4 opacity-30" />
                  <p className="text-muted-foreground">You've viewed all tips matching these filters!</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setCategoryFilter(null);
                      setDifficultyFilter(null);
                    }}
                  >
                    Explore more categories
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredTips.length} tips found
        </div>
        <Button onClick={() => showTip(categoryFilter ?? undefined, difficultyFilter ?? undefined, true)}>
          Show Random Tip
        </Button>
      </CardFooter>
    </Card>
  );
}

interface TipCardProps {
  tip: {
    id: string;
    title: string;
    content: string;
    category: string;
    difficulty: string;
    tags: string[];
  };
  isViewed: boolean;
  onView: () => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
};

const categoryIcons = {
  crypto: '₿',
  forex: '💱',
  stocks: '📈',
  general: '🧠',
  technical: '📊',
  fundamental: '📰'
};

function TipCard({ tip, isViewed, onView }: TipCardProps) {
  return (
    <Card className={`w-full transition-all hover:shadow-md ${!isViewed ? 'border-yellow-300 dark:border-yellow-700' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{tip.title}</CardTitle>
          
          {!isViewed && (
            <Badge variant="default" className="bg-yellow-500">New</Badge>
          )}
          
          {isViewed && (
            <CheckCircle2 size={16} className="text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">{categoryIcons[tip.category as keyof typeof categoryIcons]}</span>
            {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${difficultyColors[tip.difficulty as keyof typeof difficultyColors]}`}
          >
            {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {tip.content}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {tip.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tip.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{tip.tags.length - 2} more
            </Badge>
          )}
        </div>
        
        <Button size="sm" onClick={onView}>View Tip</Button>
      </CardFooter>
    </Card>
  );
}