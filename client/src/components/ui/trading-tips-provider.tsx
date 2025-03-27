import React, { useEffect } from 'react';
import { useTradingTips } from '@/lib/stores/useTradingTips';
import { TradingTipPopup } from './trading-tips';
import { useLocation } from 'react-router-dom';

interface TradingTipsProviderProps {
  children: React.ReactNode;
  autoShowInterval?: number; // in milliseconds
}

/**
 * A provider component that handles the automatic display of trading tips
 * and ensures the TradingTipPopup is available throughout the app
 */
export function TradingTipsProvider({ 
  children, 
  autoShowInterval = 300000 // 5 minutes by default
}: TradingTipsProviderProps) {
  const { fetchTips, showTip } = useTradingTips();
  const location = useLocation();
  
  // Fetch tips when the component mounts
  useEffect(() => {
    fetchTips();
  }, [fetchTips]);
  
  // Set up automatic display of tips at regular intervals
  useEffect(() => {
    // Only set up automatic tips if interval is positive
    if (autoShowInterval <= 0) return;
    
    const tipTimer = setInterval(() => {
      // Get a random category based on current location
      const categories = ['general', 'technical', 'fundamental', 'crypto', 'forex', 'stocks'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Show a tip from a random category with random difficulty
      const difficulties = ['beginner', 'intermediate', 'advanced'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      showTip(randomCategory, randomDifficulty);
    }, autoShowInterval);
    
    // Clear interval on unmount
    return () => clearInterval(tipTimer);
  }, [autoShowInterval, showTip, location.pathname]);
  
  // Show relevant tips based on the current location
  useEffect(() => {
    // Extract location type from path to determine relevant category
    const path = location.pathname.toLowerCase();
    
    if (path.includes('crypto')) {
      // Show crypto-specific tip for crypto section
      setTimeout(() => {
        showTip('crypto');
      }, 5000); // Delay by 5 seconds to allow page to load
    } else if (path.includes('forex')) {
      // Show forex-specific tip for forex section
      setTimeout(() => {
        showTip('forex');
      }, 5000);
    } else if (path.includes('stocks')) {
      // Show stocks-specific tip for stocks section
      setTimeout(() => {
        showTip('stocks');
      }, 5000);
    }
  }, [location.pathname, showTip]);
  
  return (
    <>
      {children}
      <TradingTipPopup />
    </>
  );
}