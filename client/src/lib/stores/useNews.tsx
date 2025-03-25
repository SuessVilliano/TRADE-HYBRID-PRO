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
      const response = await apiRequest("GET", "/api/news");
      const data = await response.json();
      
      set({ news: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch news:", error);
      
      // Fallback to mock data for development
      const mockNews: NewsItem[] = [
        {
          id: "1",
          title: "Fed Announces Rate Decision",
          summary: "The Federal Reserve maintains interest rates steady at 5.25-5.50%, signaling potential cuts later this year as inflation gradually eases.",
          source: "Bloomberg",
          published: new Date().toISOString(),
          url: "#",
          tags: ["Fed", "Rates", "Inflation"],
          impact: "high",
          sentiment: "neutral"
        },
        {
          id: "2",
          title: "Bitcoin Reaches New All-Time High",
          summary: "Bitcoin surpassed its previous record, reaching $73,000 amid increased institutional adoption and spot ETF inflows.",
          source: "CoinDesk",
          published: new Date(Date.now() - 1800000).toISOString(),
          url: "#",
          tags: ["Bitcoin", "Crypto", "ETF"],
          impact: "medium",
          sentiment: "bullish"
        },
        {
          id: "3",
          title: "Oil Prices Tumble on Supply Concerns",
          summary: "Crude oil prices dropped 3% following reports of increased production from OPEC+ members despite previous agreements to limit output.",
          source: "Reuters",
          published: new Date(Date.now() - 3600000).toISOString(),
          url: "#",
          tags: ["Oil", "OPEC", "Commodities"],
          impact: "medium",
          sentiment: "bearish"
        },
        {
          id: "4",
          title: "Tech Earnings Beat Expectations",
          summary: "Major tech companies reported stronger-than-expected quarterly earnings, driven by AI investments and cloud services growth.",
          source: "CNBC",
          published: new Date(Date.now() - 7200000).toISOString(),
          url: "#",
          tags: ["Tech", "Earnings", "AI"],
          impact: "medium",
          sentiment: "bullish"
        },
        {
          id: "5",
          title: "Market Volatility Rises Ahead of Economic Data",
          summary: "The VIX index jumped 15% as traders position for upcoming inflation and employment reports that could influence Federal Reserve policy.",
          source: "Financial Times",
          published: new Date(Date.now() - 10800000).toISOString(),
          url: "#",
          tags: ["Volatility", "Data", "VIX"],
          impact: "medium",
          sentiment: "neutral"
        }
      ];
      
      set({ news: mockNews, loading: false });
    }
  },
}));
