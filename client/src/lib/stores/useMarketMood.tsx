import { create } from 'zustand';
import { useAudio } from './useAudio';

// Define market mood types
export type MarketMood = 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'calm';

// Market mood detection parameters
interface PriceData {
  price: number;
  timestamp: number;
}

interface MarketMoodState {
  // Current detected market mood
  currentMood: MarketMood;
  
  // Last detected moods for smooth transitions
  previousMood: MarketMood;
  
  // Price history for analysis
  priceHistory: PriceData[];
  
  // Analysis parameters
  volatilityThreshold: number;
  trendThreshold: number;
  analysisWindowSize: number;
  
  // Mood detection metrics
  volatility: number;
  trend: number;
  
  // Mood detection state
  isAnalyzing: boolean;
  lastAnalysisTime: number;
  
  // Flag for background music
  ambientMusicEnabled: boolean;
  
  // Actions
  updatePrice: (price: number) => void;
  analyzeMarketMood: () => void;
  setMood: (mood: MarketMood) => void;
  resetAnalysis: () => void;
  toggleAmbientMusic: () => void;
  clearPriceHistory: () => void;
}

// Utility functions for market analysis
const calculateVolatility = (priceHistory: PriceData[]): number => {
  if (priceHistory.length < 2) return 0;
  
  // Calculate price percent changes
  const percentChanges = [];
  for (let i = 1; i < priceHistory.length; i++) {
    const prevPrice = priceHistory[i-1].price;
    const currPrice = priceHistory[i].price;
    const percentChange = Math.abs((currPrice - prevPrice) / prevPrice * 100);
    percentChanges.push(percentChange);
  }
  
  // Calculate standard deviation of percent changes (volatility)
  const mean = percentChanges.reduce((sum, val) => sum + val, 0) / percentChanges.length;
  const squaredDiffs = percentChanges.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  
  return Math.sqrt(variance);
};

const calculateTrend = (priceHistory: PriceData[]): number => {
  if (priceHistory.length < 2) return 0;
  
  // Simple trend calculation - positive for uptrend, negative for downtrend
  const firstPrice = priceHistory[0].price;
  const lastPrice = priceHistory[priceHistory.length - 1].price;
  
  return (lastPrice - firstPrice) / firstPrice * 100;
};

// Create the store
export const useMarketMood = create<MarketMoodState>((set, get) => ({
  // Initial mood state
  currentMood: 'neutral',
  previousMood: 'neutral',
  
  // Price history
  priceHistory: [],
  
  // Analysis parameters
  volatilityThreshold: 2.0, // 2% threshold for volatility
  trendThreshold: 1.5,      // 1.5% threshold for trend detection
  analysisWindowSize: 20,   // Number of price points to analyze
  
  // Metrics
  volatility: 0,
  trend: 0,
  
  // Status
  isAnalyzing: false,
  lastAnalysisTime: 0,
  
  // Feature flags
  ambientMusicEnabled: true,
  
  // Update price history
  updatePrice: (price) => {
    set(state => {
      // Add new price with timestamp
      const newPriceData: PriceData = {
        price,
        timestamp: Date.now()
      };
      
      // Add to price history
      const updatedHistory = [...state.priceHistory, newPriceData];
      
      // Limit history size to analysis window
      const trimmedHistory = updatedHistory.slice(-state.analysisWindowSize);
      
      return { priceHistory: trimmedHistory };
    });
    
    // Check if we should analyze after update
    const timeSinceLastAnalysis = Date.now() - get().lastAnalysisTime;
    
    // Analyze market mood every 10 seconds
    if (timeSinceLastAnalysis > 10000) {
      get().analyzeMarketMood();
    }
  },
  
  // Analyze market mood based on price history
  analyzeMarketMood: () => {
    const { priceHistory, volatilityThreshold, trendThreshold } = get();
    
    // Skip analysis if not enough data
    if (priceHistory.length < 2) {
      return;
    }
    
    set({ isAnalyzing: true });
    
    // Calculate market metrics
    const volatility = calculateVolatility(priceHistory);
    const trend = calculateTrend(priceHistory);
    
    // Determine market mood
    let newMood: MarketMood = 'neutral';
    
    if (volatility > volatilityThreshold) {
      newMood = 'volatile';
    } else if (volatility < volatilityThreshold * 0.3) {
      newMood = 'calm';
    } else if (trend > trendThreshold) {
      newMood = 'bullish';
    } else if (trend < -trendThreshold) {
      newMood = 'bearish';
    }
    
    // Store previous mood before updating
    const previousMood = get().currentMood;
    
    // Update state with new mood and analysis results
    set({
      volatility,
      trend,
      currentMood: newMood,
      previousMood,
      isAnalyzing: false,
      lastAnalysisTime: Date.now()
    });
    
    // If mood changed and ambient music is enabled, update the trading music
    if (newMood !== previousMood && get().ambientMusicEnabled) {
      const audioStore = useAudio.getState();
      
      // Find tracks matching the current mood
      const musicTracks = audioStore.musicTracks || [];
      const moodTracks = musicTracks.filter(
        (track: any) => track.category === 'trading' && track.mood === newMood
      );
      
      if (moodTracks.length > 0) {
        // Find the index of the first matching track
        const trackIndex = musicTracks.findIndex(
          (track: any) => track.id === moodTracks[0].id
        );
        
        if (trackIndex !== -1) {
          // Play the appropriate mood music
          audioStore.setTrack(trackIndex);
          
          // Ensure music is playing
          if (audioStore.musicIsPlaying) {
            audioStore.playMusic();
          }
        }
      }
    }
  },
  
  // Manually set market mood
  setMood: (mood) => {
    const previousMood = get().currentMood;
    set({ currentMood: mood, previousMood });
    
    // If ambient music is enabled, update the trading music
    if (mood !== previousMood && get().ambientMusicEnabled) {
      const audioStore = useAudio.getState();
      
      // Find tracks matching the current mood
      const musicTracks = audioStore.musicTracks || [];
      const moodTracks = musicTracks.filter(
        (track: any) => track.category === 'trading' && track.mood === mood
      );
      
      if (moodTracks.length > 0) {
        // Find the index of the first matching track
        const trackIndex = musicTracks.findIndex(
          (track: any) => track.id === moodTracks[0].id
        );
        
        if (trackIndex !== -1) {
          // Play the appropriate mood music
          audioStore.setTrack(trackIndex);
          
          // Ensure music is playing
          if (!audioStore.musicIsPlaying) {
            audioStore.playMusic();
          }
        }
      }
    }
  },
  
  // Reset analysis parameters
  resetAnalysis: () => {
    set({
      volatility: 0,
      trend: 0,
      isAnalyzing: false,
      lastAnalysisTime: 0
    });
  },
  
  // Toggle ambient music feature
  toggleAmbientMusic: () => {
    set(state => ({ ambientMusicEnabled: !state.ambientMusicEnabled }));
    
    // If toggling on, analyze and play appropriate music
    if (!get().ambientMusicEnabled && get().priceHistory.length > 0) {
      get().analyzeMarketMood();
    }
  },
  
  // Clear price history
  clearPriceHistory: () => {
    set({ priceHistory: [] });
  }
}));