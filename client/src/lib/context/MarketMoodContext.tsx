import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { marketSentimentService } from '../services/market-sentiment-service';

export type MarketMoodType = 'bullish' | 'neutral' | 'bearish';

export interface MarketMoodContextType {
  currentMood: MarketMoodType;
  setCurrentMood: (mood: MarketMoodType) => void;
  moodScore: number; // -1 to 1
  adaptiveColorsEnabled: boolean;
  setAdaptiveColorsEnabled: (enabled: boolean) => void;
  fetchMarketMood: (symbol?: string) => Promise<void>;
}

const MarketMoodContext = createContext<MarketMoodContextType | undefined>(undefined);

export function MarketMoodProvider({ children }: { children: ReactNode }) {
  const [currentMood, setCurrentMood] = useState<MarketMoodType>('neutral');
  const [moodScore, setMoodScore] = useState<number>(0);
  const [adaptiveColorsEnabled, setAdaptiveColorsEnabled] = useState<boolean>(false);
  
  // Apply CSS variables based on the current mood
  useEffect(() => {
    // Exit early if adaptive colors are disabled
    if (!adaptiveColorsEnabled) {
      // Reset to default theme
      document.documentElement.style.removeProperty('--market-primary');
      document.documentElement.style.removeProperty('--market-secondary');
      document.documentElement.style.removeProperty('--market-accent');
      return;
    }
    
    let primary = '';
    let secondary = '';
    let accent = '';
    
    switch (currentMood) {
      case 'bullish':
        primary = 'var(--market-bullish-primary)';
        secondary = 'var(--market-bullish-secondary)';
        accent = 'var(--market-bullish-accent)';
        break;
      case 'bearish':
        primary = 'var(--market-bearish-primary)';
        secondary = 'var(--market-bearish-secondary)';
        accent = 'var(--market-bearish-accent)';
        break;
      case 'neutral':
      default:
        primary = 'var(--market-neutral-primary)';
        secondary = 'var(--market-neutral-secondary)';
        accent = 'var(--market-neutral-accent)';
        break;
    }
    
    // Apply variables to root element
    document.documentElement.style.setProperty('--market-primary', primary);
    document.documentElement.style.setProperty('--market-secondary', secondary);
    document.documentElement.style.setProperty('--market-accent', accent);
  }, [currentMood, adaptiveColorsEnabled]);
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('tradeHybrid_marketMoodSettings');
    if (savedSettings) {
      try {
        const { adaptiveColorsEnabled: savedEnabled } = JSON.parse(savedSettings);
        setAdaptiveColorsEnabled(savedEnabled);
      } catch (error) {
        console.error('Error parsing saved market mood settings:', error);
      }
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tradeHybrid_marketMoodSettings', JSON.stringify({
      adaptiveColorsEnabled
    }));
  }, [adaptiveColorsEnabled]);
  
  // Fetch market mood data
  const fetchMarketMood = async (symbol: string = 'SPY') => {
    try {
      const sentimentData = await marketSentimentService.getMarketSentiment(symbol);
      
      if (sentimentData) {
        setCurrentMood(sentimentData.overallSentiment.label);
        setMoodScore(sentimentData.overallSentiment.score);
        console.log(`Market mood updated: ${sentimentData.overallSentiment.label} (${sentimentData.overallSentiment.score})`);
      } else {
        // Default to neutral if no data is available
        setCurrentMood('neutral');
        setMoodScore(0);
      }
    } catch (error) {
      console.error('Error fetching market mood:', error);
      // Default to neutral on error
      setCurrentMood('neutral');
      setMoodScore(0);
    }
  };
  
  // Initial fetch of market mood
  useEffect(() => {
    fetchMarketMood();
    
    // Set up interval to refresh market mood every 10 minutes
    const intervalId = setInterval(() => {
      fetchMarketMood();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <MarketMoodContext.Provider
      value={{
        currentMood,
        setCurrentMood,
        moodScore,
        adaptiveColorsEnabled,
        setAdaptiveColorsEnabled,
        fetchMarketMood
      }}
    >
      {children}
    </MarketMoodContext.Provider>
  );
}

export function useMarketMood(): MarketMoodContextType {
  const context = useContext(MarketMoodContext);
  
  if (!context) {
    throw new Error('useMarketMood must be used within a MarketMoodProvider');
  }
  
  return context;
}