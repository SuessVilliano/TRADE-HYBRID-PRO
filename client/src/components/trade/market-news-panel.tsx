import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  AlertCircle, 
  Clock, 
  Search,
  Filter,
  Newspaper,
  Bookmark,
  ExternalLink,
  Tag
} from 'lucide-react';
import axios from 'axios';

// Interface for news items
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  published: string;
  url: string;
  tags?: string[];
  impact?: 'high' | 'medium' | 'low';
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

export function MarketNewsPanel() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch news from the server API
        const response = await axios.get('/api/rss-feeds/news');
        
        if (response.data && response.data.items && Array.isArray(response.data.items)) {
          // Format the news items
          const formattedNews = response.data.items.map((item: any) => ({
            id: item.id || `news-${Math.random().toString(36).substring(2, 9)}`,
            title: item.title || 'No Title',
            summary: item.description || item.summary || '',
            source: item.source || 'Financial News',
            published: item.pubDate || item.publishedAt || new Date().toISOString(),
            url: item.link || item.url || '#',
            tags: item.categories || item.tags || [],
            impact: item.impact || 'medium',
            sentiment: item.sentiment || 'neutral'
          }));
          
          setNewsItems(formattedNews);
        } else {
          // Fallback option to try a different endpoint
          const alternateResponse = await axios.get('/api/news');
          
          if (alternateResponse.data && Array.isArray(alternateResponse.data)) {
            const altNews = alternateResponse.data.map((item: any, index: number) => ({
              id: `alt-news-${index}`,
              title: item.title || 'No Title',
              summary: item.summary || '',
              source: item.source || 'Financial News',
              published: item.published || new Date().toISOString(),
              url: item.url || '#',
              tags: item.categories || [],
              impact: 'medium' as const,
              sentiment: 'neutral' as const
            }));
            
            setNewsItems(altNews);
          } else {
            throw new Error('No valid news data found');
          }
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Unable to load market news at this time');
        // Create a few examples to show the UI works
        setNewsItems([
          {
            id: 'example-1',
            title: 'Market news unavailable - Check internet connection',
            summary: 'News data could not be loaded at this time. Please check your internet connection and try again later.',
            source: 'System',
            published: new Date().toISOString(),
            url: '#',
            impact: 'medium',
            tags: ['error']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
    
    // Set up a periodic refresh
    const refreshInterval = setInterval(fetchNews, 300000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Filter news items based on search and active category
  const filteredNews = newsItems.filter(item => {
    // Filter by search query
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.source.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))) {
      return false;
    }
    
    // Filter by category
    if (activeCategory !== 'all') {
      const tagMatch = item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase());
      
      if (activeCategory === 'crypto' && 
          (item.title.toLowerCase().includes('bitcoin') || 
           item.title.toLowerCase().includes('crypto') || 
           item.summary?.toLowerCase().includes('bitcoin') || 
           item.summary?.toLowerCase().includes('crypto'))) {
        return true;
      }
      
      if (activeCategory === 'stocks' && 
          (item.title.toLowerCase().includes('stock') || 
           item.summary?.toLowerCase().includes('stock') ||
           item.title.toLowerCase().includes('nasdaq') ||
           item.title.toLowerCase().includes('dow jones'))) {
        return true;
      }
      
      if (!tagMatch) return false;
    }
    
    return true;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return `${diffDays}d ago`;
      }
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // Determine impact badge style
  const getImpactBadge = (impact: string = 'medium') => {
    switch (impact.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />;
      case 'medium':
        return <Badge variant="default" className="bg-amber-500 h-2 w-2 p-0 rounded-full" />;
      case 'low':
        return <Badge variant="outline" className="bg-slate-400 h-2 w-2 p-0 rounded-full" />;
      default:
        return <Badge variant="default" className="bg-amber-500 h-2 w-2 p-0 rounded-full" />;
    }
  };
  
  // Handle opening the news URL
  const openNewsUrl = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Market News</CardTitle>
            <CardDescription>Latest financial updates</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1">
              <Clock size={14} className="mr-1" />
              Real-time
            </Badge>
            <Badge variant="outline" className="px-2 py-1">
              {filteredNews.length} articles
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All News</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetFilters} 
                title="Reset filters"
              >
                <Filter size={16} />
              </Button>
            </div>
            
            <Separator />
            
            {/* News list */}
            <ScrollArea className="h-[calc(100vh-330px)]">
              <div className="space-y-3 pr-2">
                {loading ? (
                  <div className="text-center py-6">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-12 bg-slate-700 mb-2 rounded"></div>
                      <div className="h-2 w-24 bg-slate-600 rounded"></div>
                    </div>
                    <p className="mt-4 text-slate-500">Loading market news...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-6 text-slate-500">
                    <AlertCircle className="mx-auto mb-2 h-6 w-6" />
                    <p>{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </Button>
                  </div>
                ) : filteredNews.length > 0 ? (
                  filteredNews.map((item, index) => (
                    <div
                      key={item.id}
                      className="mb-4 bg-slate-900/50 p-3 rounded-md hover:bg-slate-900/80 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div>
                          {getImpactBadge(item.impact)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 
                            className="text-sm font-semibold text-slate-200 cursor-pointer hover:text-blue-400"
                            onClick={() => openNewsUrl(item.url)}
                          >
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-400">{item.summary}</p>
                          <div className="flex gap-2 flex-wrap pt-1">
                            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-700 text-slate-300">
                              {formatDate(item.published)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-blue-900/50 text-blue-300">
                              {item.source}
                            </Badge>
                            {item.tags && item.tags.length > 0 && item.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs border-slate-700 bg-transparent">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-500 hover:text-slate-300"
                            onClick={() => openNewsUrl(item.url)}
                            title="Open article"
                          >
                            <ExternalLink size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-slate-500 hover:text-slate-300"
                            title="Bookmark for later"
                          >
                            <Bookmark size={14} />
                          </Button>
                        </div>
                      </div>
                      {index < filteredNews.length - 1 && (
                        <Separator className="my-4 bg-slate-700/50" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <Newspaper className="mx-auto mb-2 h-6 w-6" />
                    <p>No news found matching your filters.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MarketNewsPanel;