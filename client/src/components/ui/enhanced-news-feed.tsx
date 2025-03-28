import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BarChart2, TrendingUp, TrendingDown, Globe, Calendar, Rss, Filter, RefreshCw } from "lucide-react";
import { financialNewsService, FinancialNewsItem, NewsSource, EconomicCalendarEvent } from "@/lib/services/financial-news-service";
import { cn } from "@/lib/utils";

interface EnhancedNewsFeedProps {
  className?: string;
  height?: string | number;
}

export function EnhancedNewsFeed({ className, height = 500 }: EnhancedNewsFeedProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'calendar' | 'rss'>('news');
  const [newsItems, setNewsItems] = useState<FinancialNewsItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<EconomicCalendarEvent[]>([]);
  const [rssItems, setRssItems] = useState<FinancialNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [activeRssSource, setActiveRssSource] = useState<string>('bloomberg');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch the news when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        await financialNewsService.initialize();
        
        // Get available sources
        const availableSources = financialNewsService.getNewsSources();
        setSources(availableSources);
        
        // Get initial news data
        const newsData = await financialNewsService.getNews();
        setNewsItems(newsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error initializing news feed:", error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Fetch different data when tab changes
  useEffect(() => {
    async function fetchTabData() {
      try {
        setLoading(true);
        
        if (activeTab === 'calendar' && calendarEvents.length === 0) {
          // Get economic calendar
          const today = new Date().toISOString().split('T')[0];
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          
          const events = await financialNewsService.getEconomicCalendar(
            today,
            oneMonthLater.toISOString().split('T')[0]
          );
          setCalendarEvents(events);
        } 
        else if (activeTab === 'rss' && rssItems.length === 0) {
          // Get RSS feed for the active source
          const rssData = await financialNewsService.getRssFeed(activeRssSource);
          setRssItems(rssData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching data for ${activeTab} tab:`, error);
        setLoading(false);
      }
    }
    
    fetchTabData();
  }, [activeTab, calendarEvents.length, rssItems.length, activeRssSource]);
  
  // Change RSS source
  const handleRssSourceChange = async (sourceId: string) => {
    if (sourceId === activeRssSource) return;
    
    try {
      setLoading(true);
      setActiveRssSource(sourceId);
      
      // Get RSS feed for the new source
      const rssData = await financialNewsService.getRssFeed(sourceId);
      setRssItems(rssData);
      
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching RSS feed for ${sourceId}:`, error);
      setLoading(false);
    }
  };
  
  // Refresh data
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      
      if (activeTab === 'news') {
        const newsData = await financialNewsService.getNews();
        setNewsItems(newsData);
      } 
      else if (activeTab === 'calendar') {
        const today = new Date().toISOString().split('T')[0];
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        
        const events = await financialNewsService.getEconomicCalendar(
          today,
          oneMonthLater.toISOString().split('T')[0]
        );
        setCalendarEvents(events);
      } 
      else if (activeTab === 'rss') {
        const rssData = await financialNewsService.getRssFeed(activeRssSource);
        setRssItems(rssData);
      }
      
      setIsRefreshing(false);
    } catch (error) {
      console.error(`Error refreshing ${activeTab} data:`, error);
      setIsRefreshing(false);
    }
  };
  
  // Render different icons based on impact and sentiment
  const renderItemIcon = (item: FinancialNewsItem) => {
    if (item.impact === "high") {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
    if (item.impact === "medium") {
      return <BarChart2 className="h-5 w-5 text-amber-500" />;
    }
    if (item.sentiment === "bullish") {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    }
    if (item.sentiment === "bearish") {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Globe className="h-5 w-5 text-muted-foreground" />;
  };
  
  // Get country flag emoji
  const getCountryFlag = (countryCode: string): string => {
    const countryCodeMap: Record<string, string> = {
      'USD': '🇺🇸',
      'EUR': '🇪🇺',
      'GBP': '🇬🇧',
      'JPY': '🇯🇵',
      'CHF': '🇨🇭',
      'CAD': '🇨🇦',
      'AUD': '🇦🇺',
      'NZD': '🇳🇿',
      'CNY': '🇨🇳',
      'US': '🇺🇸',
      'EU': '🇪🇺',
      'GB': '🇬🇧',
      'UK': '🇬🇧',
      'JP': '🇯🇵',
      'CH': '🇨🇭',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'NZ': '🇳🇿',
      'CN': '🇨🇳'
    };
    
    return countryCodeMap[countryCode] || '';
  };
  
  // Get impact color
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high':
        return 'text-destructive bg-destructive/10';
      case 'medium':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {activeTab === 'news' && <Globe className="h-5 w-5" />}
            {activeTab === 'calendar' && <Calendar className="h-5 w-5" />}
            {activeTab === 'rss' && <Rss className="h-5 w-5" />}
            {activeTab === 'news' && 'Financial News'}
            {activeTab === 'calendar' && 'Economic Calendar'}
            {activeTab === 'rss' && 'RSS Feeds'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="rss">RSS</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="pt-2">
          {/* News Tab */}
          {activeTab === 'news' && (
            <ScrollArea className="h-[400px] px-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                    {index < 4 && <Separator className="my-4" />}
                  </div>
                ))
              ) : (
                <>
                  {newsItems.map((item, index) => (
                    <div key={item.id} className="mb-4">
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          {renderItemIcon(item)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-semibold hover:underline"
                          >
                            {item.title}
                          </a>
                          <p className="text-xs text-muted-foreground">{item.summary}</p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {new Date(item.publishedAt).toLocaleTimeString()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.source}
                            </Badge>
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      {index < newsItems.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                  
                  {newsItems.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No news available at the moment.</p>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          )}
          
          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <ScrollArea className="h-[400px] px-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                    {index < 4 && <Separator className="my-4" />}
                  </div>
                ))
              ) : (
                <>
                  {calendarEvents.map((event, index) => (
                    <div key={event.id} className="mb-4">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 text-lg">
                          {getCountryFlag(event.country)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-sm font-semibold">{event.title}</h4>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {event.date} {event.time}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getImpactColor(event.impact)}`}
                            >
                              {event.impact.toUpperCase()}
                            </Badge>
                            {event.country && (
                              <Badge variant="secondary" className="text-xs">
                                {event.country}
                              </Badge>
                            )}
                          </div>
                          
                          {(event.forecast || event.previous || event.actual) && (
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                              {event.forecast && (
                                <div>
                                  <span className="text-muted-foreground">Forecast: </span>
                                  <span>{event.forecast} {event.unit}</span>
                                </div>
                              )}
                              {event.previous && (
                                <div>
                                  <span className="text-muted-foreground">Previous: </span>
                                  <span>{event.previous} {event.unit}</span>
                                </div>
                              )}
                              {event.actual && (
                                <div>
                                  <span className="text-muted-foreground">Actual: </span>
                                  <span className="font-medium">{event.actual} {event.unit}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < calendarEvents.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                  
                  {calendarEvents.length === 0 && !loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No economic events available at the moment.</p>
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          )}
          
          {/* RSS Tab */}
          {activeTab === 'rss' && (
            <>
              <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {sources
                  .filter(source => source.active)
                  .map((source) => (
                    <Button
                      key={source.id}
                      variant={activeRssSource === source.id ? "default" : "outline"}
                      size="sm"
                      className="h-7 whitespace-nowrap"
                      onClick={() => handleRssSourceChange(source.id)}
                    >
                      {source.name}
                    </Button>
                  ))}
              </div>
              <ScrollArea className="h-[370px] px-4">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                      {index < 4 && <Separator className="my-4" />}
                    </div>
                  ))
                ) : (
                  <>
                    {rssItems.map((item, index) => (
                      <div key={item.id} className="mb-4">
                        <div className="flex items-start gap-2">
                          <div className="mt-1">
                            {renderItemIcon(item)}
                          </div>
                          <div className="space-y-1 flex-1">
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-semibold hover:underline"
                            >
                              {item.title}
                            </a>
                            <p className="text-xs text-muted-foreground">{item.summary}</p>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {new Date(item.publishedAt).toLocaleTimeString()}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {item.source}
                              </Badge>
                              {item.tags && item.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {index < rssItems.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                    
                    {rssItems.length === 0 && !loading && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No RSS items available for {sources.find(s => s.id === activeRssSource)?.name || activeRssSource}.</p>
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}