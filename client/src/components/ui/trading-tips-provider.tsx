import React, { useEffect } from 'react';
import { useTradingTips } from '@/lib/stores/useTradingTips';
import { TradingTipPopup } from './trading-tips';

interface TradingTipsProviderProps {
  children: React.ReactNode;
  autoShowInterval?: number; // in milliseconds
  currentPath?: string; // Optional prop to pass the current path
}

/**
 * A provider component that handles the automatic display of trading tips
 * and ensures the TradingTipPopup is available throughout the app
 */
export function TradingTipsProvider({ 
  children, 
  autoShowInterval = 300000, // 5 minutes by default
  currentPath = '/'
}: TradingTipsProviderProps) {
  const { showTip } = useTradingTips();
  
  // No need to fetch tips as they're already pre-loaded in the store
  useEffect(() => {
    // Tips are already pre-loaded in the store
    console.log("Trading tips provider initialized");
  }, []);
  
  // Show a tip only on the first load - automatic intervals are removed
  useEffect(() => {
    // Get a random category
    const categories = ['general', 'technical', 'fundamental', 'crypto', 'forex', 'stocks'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Show a tip from a random category with random difficulty
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    // This will only show on first load due to our updated logic in the store
    showTip(randomCategory, randomDifficulty);
  }, [showTip]);
  
  // Show relevant tips based on the current path (if provided)
  useEffect(() => {
    if (!currentPath) return;
    
    // Extract location type from path to determine relevant category
    const path = currentPath.toLowerCase();
    
    // Only show path-specific tips on first load, no need for forcing
    if (path.includes('crypto')) {
      // Show crypto-specific tip for crypto section
      setTimeout(() => {
        showTip('crypto', undefined, false);
      }, 5000); // Delay by 5 seconds to allow page to load
    } else if (path.includes('forex')) {
      // Show forex-specific tip for forex section
      setTimeout(() => {
        showTip('forex', undefined, false);
      }, 5000);
    } else if (path.includes('stocks')) {
      // Show stocks-specific tip for stocks section
      setTimeout(() => {
        showTip('stocks', undefined, false);
      }, 5000);
    }
  }, [currentPath, showTip]);
  
  return (
    <>
      {children}
      <TradingTipPopup />
    </>
  );
}