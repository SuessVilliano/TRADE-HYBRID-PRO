import React, { createContext, useContext, useEffect, useState } from 'react';
import { marketSentimentService, SentimentScore } from '../services/market-sentiment-service';

// Market mood types
export type MarketMoodType = 'neutral' | 'bullish' | 'bearish';

// Intensity levels for mood (determines color intensity)
export type MoodIntensityType = 'low' | 'medium' | 'high';

// Market Mood state interface
interface MarketMoodState {
  mood: MarketMoodType;
  intensity: MoodIntensityType;
  symbol: string;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

// Context interface
interface MarketMoodContextType {
  marketMood: MarketMoodState;
  setSymbol: (symbol: string) => void;
  refreshMood: () => Promise<void>;
  adaptiveColorSchemeEnabled: boolean;
  toggleAdaptiveColorScheme: () => void;
}

// Create context
const MarketMoodContext = createContext<MarketMoodContextType>({
  marketMood: {
    mood: 'neutral',
    intensity: 'medium',
    symbol: 'SPY',
    lastUpdated: null,
    isLoading: false,
    error: null
  },
  setSymbol: () => {},
  refreshMood: async () => {},
  adaptiveColorSchemeEnabled: true,
  toggleAdaptiveColorScheme: () => {}
});

// Hook to use the market mood context
export const useMarketMood = () => useContext(MarketMoodContext);

interface MarketMoodProviderProps {
  children: React.ReactNode;
  defaultSymbol?: string;
}

// Convert sentiment score to mood intensity
const getMoodIntensity = (sentiment: SentimentScore): MoodIntensityType => {
  const score = Math.abs(sentiment.score);
  if (score > 0.7) return 'high';
  if (score > 0.3) return 'medium';
  return 'low';
};

// Provider component
export const MarketMoodProvider: React.FC<MarketMoodProviderProps> = ({
  children,
  defaultSymbol = 'SPY' // Default to SPY (S&P 500 ETF)
}) => {
  // State for market mood
  const [marketMood, setMarketMood] = useState<MarketMoodState>({
    mood: 'neutral',
    intensity: 'medium',
    symbol: defaultSymbol,
    lastUpdated: null,
    isLoading: true,
    error: null
  });

  // State for enabling/disabling adaptive color scheme
  const [adaptiveColorSchemeEnabled, setAdaptiveColorSchemeEnabled] = useState<boolean>(() => {
    // Try to get preference from localStorage
    const savedPreference = typeof window !== 'undefined' 
      ? localStorage.getItem('adaptiveColorScheme') 
      : null;
    return savedPreference !== null ? savedPreference === 'true' : true; // Default to true
  });

  // Function to set the symbol
  const setSymbol = (symbol: string) => {
    setMarketMood(prev => ({
      ...prev,
      symbol,
      isLoading: true
    }));
  };

  // Function to refresh the mood
  const refreshMood = async () => {
    setMarketMood(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      await marketSentimentService.initialize();
      const sentimentData = await marketSentimentService.getMarketSentiment(marketMood.symbol);
      
      if (sentimentData) {
        const { overallSentiment } = sentimentData;
        
        setMarketMood({
          mood: overallSentiment.label,
          intensity: getMoodIntensity(overallSentiment),
          symbol: marketMood.symbol,
          lastUpdated: new Date(),
          isLoading: false,
          error: null
        });
      } else {
        // If no sentiment data, fallback to neutral
        setMarketMood(prev => ({
          ...prev,
          mood: 'neutral',
          intensity: 'low',
          lastUpdated: new Date(),
          isLoading: false,
          error: 'No sentiment data available'
        }));
      }
    } catch (error) {
      console.error('Error fetching market mood:', error);
      setMarketMood(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch market sentiment'
      }));
    }
  };

  // Toggle adaptive color scheme
  const toggleAdaptiveColorScheme = () => {
    setAdaptiveColorSchemeEnabled(prev => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('adaptiveColorScheme', String(newValue));
      }
      return newValue;
    });
  };

  // Save preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adaptiveColorScheme', String(adaptiveColorSchemeEnabled));
    }
  }, [adaptiveColorSchemeEnabled]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    // Initial fetch
    refreshMood();

    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(refreshMood, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [marketMood.symbol]);

  // Apply market mood to CSS variables when mood changes
  useEffect(() => {
    if (!adaptiveColorSchemeEnabled) return;
    
    const root = window.document.documentElement;
    
    // Remove all mood classes first
    root.classList.remove('mood-neutral', 'mood-bullish', 'mood-bearish');
    root.classList.remove('intensity-low', 'intensity-medium', 'intensity-high');
    
    // Add the current mood and intensity classes
    root.classList.add(`mood-${marketMood.mood}`, `intensity-${marketMood.intensity}`);
    
  }, [marketMood.mood, marketMood.intensity, adaptiveColorSchemeEnabled]);

  return (
    <MarketMoodContext.Provider 
      value={{ 
        marketMood, 
        setSymbol, 
        refreshMood,
        adaptiveColorSchemeEnabled,
        toggleAdaptiveColorScheme
      }}
    >
      {children}
    </MarketMoodContext.Provider>
  );
};

export default useMarketMood;