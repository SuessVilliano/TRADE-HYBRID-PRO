import { create } from "zustand";
import { NewsItem } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface NewsState {
  news: NewsItem[];
  loading: boolean;
  
  fetchNews: () => Promise<void>;
}

export const useNews = create<NewsState>((set) => ({
  news: [],
  loading: false,
  
  fetchNews: async () => {
    set({ loading: true });
    
    try {
      // Use the RSS feeds API which provides formatted news
      const response = await apiRequest("GET", "/api/rss-feeds/feed/bloomberg");
      const data = await response.json();
      
      // Format the news items to match our NewsItem interface
      if (data && data.items && Array.isArray(data.items)) {
        const formattedNews: NewsItem[] = data.items.map((item: any, index: number) => ({
          id: item.id || `news-${index}`,
          title: item.title || 'No Title',
          summary: item.description || '',
          source: item.source || 'Financial News',
          published: item.pubDate || new Date().toISOString(),
          url: item.link || '#',
          tags: item.categories || [],
          impact: item.impact || 'medium',
          sentiment: item.sentiment || 'neutral'
        }));
        
        console.log("Successfully fetched news items:", formattedNews.length);
        set({ news: formattedNews, loading: false });
      } else {
        throw new Error("Invalid news data format");
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      
      // Try alternative endpoint if the main one fails
      try {
        const response = await apiRequest("GET", "/api/rss-feeds/news");
        const data = await response.json();
        
        if (data && data.items && Array.isArray(data.items)) {
          const formattedNews: NewsItem[] = data.items.map((item: any, index: number) => ({
            id: item.id || `news-${index}`,
            title: item.title || 'No Title',
            summary: item.description || '',
            source: item.source || 'Financial News',
            published: item.pubDate || new Date().toISOString(),
            url: item.link || '#',
            tags: item.categories || [],
            impact: item.impact || 'medium',
            sentiment: item.sentiment || 'neutral'
          }));
          
          console.log("Successfully fetched news from alternate source:", formattedNews.length);
          set({ news: formattedNews, loading: false });
        } else {
          throw new Error("Invalid news data format from alternate source");
        }
      } catch (fallbackError) {
        console.error("Failed to fetch news from alternate source:", fallbackError);
        set({ news: [], loading: false });
      }
    }
  },
}));
