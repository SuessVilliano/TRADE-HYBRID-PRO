import { create } from 'zustand';
import { 
  aiMarketAnalysisService, 
  AIMarketAnalysis, 
  AITradeSuggestion, 
  MarketPattern 
} from '@/lib/services/ai-market-analysis-service';
import { MarketData } from "@/lib/types";

interface AIAnalysisState {
  // Analysis data
  currentAnalysis: AIMarketAnalysis | null;
  suggestions: AITradeSuggestion[];
  favoritePatterns: MarketPattern[];
  selectedTimeframe: string;
  loadingAnalysis: boolean;
  loadingSuggestions: boolean;
  error: string | null;
  
  // Historical performance
  historicalPerformance: {
    accuracy: number; // 0-100%
    profitLoss: number;
    successfulSuggestions: number;
    failedSuggestions: number;
    totalSuggestions: number;
  };
  
  // Actions
  analyzeMarket: (symbol: string, marketData: MarketData[], timeframe?: string) => Promise<void>;
  getSuggestions: (symbol: string, count?: number) => Promise<void>;
  favoritePattern: (pattern: MarketPattern) => void;
  unfavoritePattern: (patternName: string) => void;
  clearAnalysis: () => void;
  setTimeframe: (timeframe: string) => void;
  
  // Helper methods
  isPatternsAvailable: () => boolean;
  isSuggestionsAvailable: () => boolean;
}

export const useAIAnalysis = create<AIAnalysisState>((set, get) => ({
  // Initial state
  currentAnalysis: null,
  suggestions: [],
  favoritePatterns: [],
  selectedTimeframe: "medium-term",
  loadingAnalysis: false,
  loadingSuggestions: false,
  error: null,
  
  historicalPerformance: {
    accuracy: 0,
    profitLoss: 0,
    successfulSuggestions: 0,
    failedSuggestions: 0,
    totalSuggestions: 0
  },
  
  // Analyze market and get insights
  analyzeMarket: async (symbol, marketData, timeframe = "1d") => {
    try {
      set({ loadingAnalysis: true, error: null });
      
      const analysis = await aiMarketAnalysisService.analyzeMarket(
        symbol,
        marketData,
        timeframe
      );
      
      set({ currentAnalysis: analysis, loadingAnalysis: false });
    } catch (error) {
      console.error("Error analyzing market:", error);
      set({ 
        loadingAnalysis: false, 
        error: error instanceof Error ? error.message : "Failed to analyze market" 
      });
    }
  },
  
  // Get AI trading suggestions
  getSuggestions: async (symbol, count = 5) => {
    try {
      set({ loadingSuggestions: true, error: null });
      
      const suggestions = await aiMarketAnalysisService.getTradeSuggestions(
        symbol,
        count
      );
      
      set({ suggestions, loadingSuggestions: false });
    } catch (error) {
      console.error("Error getting trade suggestions:", error);
      set({ 
        loadingSuggestions: false, 
        error: error instanceof Error ? error.message : "Failed to get trading suggestions" 
      });
    }
  },
  
  // Favorite/save a pattern for future reference
  favoritePattern: (pattern) => {
    set(state => ({
      favoritePatterns: [...state.favoritePatterns, pattern]
    }));
  },
  
  // Remove a pattern from favorites
  unfavoritePattern: (patternName) => {
    set(state => ({
      favoritePatterns: state.favoritePatterns.filter(p => p.name !== patternName)
    }));
  },
  
  // Clear the current analysis
  clearAnalysis: () => {
    set({ currentAnalysis: null });
  },
  
  // Set the analysis timeframe
  setTimeframe: (timeframe) => {
    set({ selectedTimeframe: timeframe });
  },
  
  // Check if pattern data is available
  isPatternsAvailable: () => {
    const { currentAnalysis } = get();
    return Boolean(currentAnalysis && currentAnalysis.patterns.length > 0);
  },
  
  // Check if suggestions are available
  isSuggestionsAvailable: () => {
    const { suggestions } = get();
    return suggestions.length > 0;
  }
}));