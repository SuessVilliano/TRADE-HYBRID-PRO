import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

export function SimpleNewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await axios.get('/api/rss-feeds/news');
        
        if (response.data && response.data.items) {
          setNewsItems(response.data.items);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news feed");
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-sm text-muted-foreground">Loading news...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {newsItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No news articles available at the moment.</p>
        </div>
      ) : (
        newsItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 transition-colors"
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
  );
}