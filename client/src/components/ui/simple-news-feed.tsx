import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceId: string;
}

interface SimpleNewsFeedProps {
  sourceId?: string;
}

export function SimpleNewsFeed({ sourceId = 'investing' }: SimpleNewsFeedProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log(`Fetching news from source: ${sourceId || 'all sources'}`);
      
      // If a specific source is selected, fetch from that source
      const url = sourceId 
        ? `/api/rss-feeds/source/${sourceId}` 
        : '/api/rss-feeds/news';
      
      const response = await axios.get(url);
      
      if (response.data && response.data.items) {
        setNewsItems(response.data.items);
        console.log(`Received ${response.data.items.length} news items`);
      }
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news feed. Please try again later.");
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [sourceId]);

  // Handle refresh
  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-sm text-muted-foreground">Loading news...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {error && (
        <div className="p-4 text-red-400 bg-red-950/20 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {newsItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No news articles available at the moment.</p>
          </div>
        ) : (
          newsItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2 leading-tight">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    {item.title}
                  </a>
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">{item.source}</span>
                  </div>
                  <div>
                    {formatDate(item.pubDate)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}