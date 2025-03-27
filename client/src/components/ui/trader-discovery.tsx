import React, { useState, useEffect } from 'react';
// Import UI components
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Filter, Loader2, Search, SortAsc, Star, Trophy, User, Users } from 'lucide-react';
import { useFollowedTraders } from '@/lib/stores/useFollowedTraders';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface PopularTrader {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  pnl: number;
  winRate: number;
  followers: number;
  signals: number;
  trades: number;
  badges: string[];
  isFollowed: boolean;
}

export function TraderDiscovery() {
  const { followedTraders, followTrader, unfollowTrader } = useFollowedTraders();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [popularTraders, setPopularTraders] = useState<PopularTrader[]>([]);
  
  // Generate some sample data for demo purposes
  useEffect(() => {
    const fetchTraders = async () => {
      setIsLoading(true);
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const categories = ['crypto', 'forex', 'stocks', 'futures'];
      const badges = ['Verified', 'Pro', 'Top Performer', 'Educator', 'Signal Provider'];
      
      // Generate 12 sample traders
      const dummyTraders: PopularTrader[] = Array.from({ length: 12 }, (_, i) => {
        const id = `trader-${Date.now()}-${i}`;
        const pnl = Math.random() > 0.7 ? -(Math.random() * 5000) : Math.random() * 30000;
        const winRate = 30 + Math.random() * 60;
        
        // Randomly assign 0-3 badges
        const traderBadges: string[] = [];
        const badgeCount = Math.floor(Math.random() * 3);
        for (let j = 0; j < badgeCount; j++) {
          const badge = badges[Math.floor(Math.random() * badges.length)];
          if (!traderBadges.includes(badge)) {
            traderBadges.push(badge);
          }
        }
        
        // Check if this trader is already followed
        const isFollowed = followedTraders.some(t => t.id === id);
        
        return {
          id,
          username: `Trader${Math.random().toString(36).substring(2, 7)}`,
          avatar: `/avatars/trader${i % 10 + 1}.png`,
          bio: `Professional ${categories[i % categories.length]} trader with ${Math.floor(1 + Math.random() * 10)} years of experience.`,
          pnl,
          winRate,
          followers: Math.floor(Math.random() * 1000),
          signals: Math.floor(Math.random() * 200),
          trades: Math.floor(Math.random() * 500),
          badges: traderBadges,
          isFollowed
        };
      });
      
      // Sort traders based on current sort preference
      const sortedTraders = sortTraders(dummyTraders, sortBy);
      setPopularTraders(sortedTraders);
      setIsLoading(false);
    };
    
    fetchTraders();
  }, [followedTraders, sortBy]);
  
  // Sort traders based on different criteria
  const sortTraders = (traders: PopularTrader[], sortCriteria: string) => {
    const sortedTraders = [...traders];
    
    switch (sortCriteria) {
      case 'popular':
        return sortedTraders.sort((a, b) => b.followers - a.followers);
      case 'performance':
        return sortedTraders.sort((a, b) => b.pnl - a.pnl);
      case 'winrate':
        return sortedTraders.sort((a, b) => b.winRate - a.winRate);
      case 'signals':
        return sortedTraders.sort((a, b) => b.signals - a.signals);
      default:
        return sortedTraders;
    }
  };
  
  // Filter traders based on search query and category
  const filteredTraders = popularTraders.filter(trader => {
    const matchesSearch = searchQuery === '' || 
      trader.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trader.bio.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || 
      trader.bio.toLowerCase().includes(selectedCategory.toLowerCase());
      
    return matchesSearch && matchesCategory;
  });
  
  const handleFollowToggle = async (trader: PopularTrader) => {
    if (trader.isFollowed) {
      await unfollowTrader(trader.id);
    } else {
      await followTrader(trader.id);
    }
    
    // Update the local state to reflect the change
    setPopularTraders(prevTraders => 
      prevTraders.map(t => 
        t.id === trader.id ? { ...t, isFollowed: !t.isFollowed } : t
      )
    );
  };
  
  return (
    <div className="w-full max-w-[1200px]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-blue-500" />
          Discover Traders
        </h2>
        <p className="text-muted-foreground">
          Find successful traders to follow and learn from their strategies.
        </p>
      </div>
      
      <Tabs defaultValue="popular" className="mb-6">
        <TabsList>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search traders by name or description..."
            className="pl-9"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="forex">Forex</SelectItem>
              <SelectItem value="stocks">Stocks</SelectItem>
              <SelectItem value="futures">Futures</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="performance">Best Performance</SelectItem>
              <SelectItem value="winrate">Highest Win Rate</SelectItem>
              <SelectItem value="signals">Most Signals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTraders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No traders found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or explore different categories.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTraders.map((trader) => (
            <Card key={trader.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <img src={trader.avatar} alt={trader.username} />
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{trader.username}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {formatNumber(trader.followers)} followers
                      </div>
                    </div>
                  </div>
                  
                  {trader.badges.length > 0 && (
                    <Badge 
                      variant="secondary"
                      className="font-normal flex items-center gap-1"
                    >
                      {trader.badges[0] === 'Verified' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : trader.badges[0] === 'Top Performer' ? (
                        <Trophy className="h-3 w-3" />
                      ) : (
                        <Star className="h-3 w-3" />
                      )}
                      {trader.badges[0]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground mb-3">{trader.bio}</p>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-secondary/30 p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="font-medium">{trader.winRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-secondary/30 p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">P&L</p>
                    <p className={`font-medium text-sm ${trader.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(trader.pnl)}
                    </p>
                  </div>
                  <div className="bg-secondary/30 p-2 rounded text-center">
                    <p className="text-xs text-muted-foreground">Signals</p>
                    <p className="font-medium">{formatNumber(trader.signals)}</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  className={`w-full gap-2 ${trader.isFollowed ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                  variant={trader.isFollowed ? "default" : "outline"}
                  onClick={() => handleFollowToggle(trader)}
                >
                  {trader.isFollowed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}