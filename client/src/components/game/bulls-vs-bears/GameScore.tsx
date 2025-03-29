import React, { useEffect, useState } from 'react';
import { useGameStore } from './gameStore';
import { usePriceStore } from './priceStore';

// Game score and timer display component
export function GameScore() {
  const { player, gameActive, gameTime, updateGameTime } = useGameStore();
  const { marketTrend } = usePriceStore();
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Set up game timer
  useEffect(() => {
    if (gameActive && !timerInterval) {
      const interval = setInterval(() => {
        updateGameTime(gameTime + 1);
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
        setTimerInterval(null);
      };
    }
    
    // Clear timer when game ends
    if (!gameActive && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [gameActive, gameTime, timerInterval]);
  
  // Don't show anything if game is not active
  if (!gameActive) {
    return null;
  }
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get color based on market trend
  const trendColor = marketTrend === 'bullish' 
    ? 'bg-green-600' 
    : marketTrend === 'bearish' 
      ? 'bg-red-600' 
      : 'bg-blue-600';
  
  return (
    <div className="flex items-center space-x-4">
      <div className={`px-4 py-2 rounded-lg shadow-lg ${trendColor}`}>
        <div className="flex items-center space-x-2">
          <div className="font-bold text-white">{marketTrend.toUpperCase()}</div>
          <div className="text-xs text-white opacity-70">MARKET</div>
        </div>
      </div>
      
      <div className="bg-gray-900 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="font-bold text-white">{player.score}</div>
          <div className="text-xs text-white opacity-70">SCORE</div>
        </div>
      </div>
      
      <div className="bg-gray-900 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="font-bold text-white">{formatTime(gameTime)}</div>
          <div className="text-xs text-white opacity-70">TIME</div>
        </div>
      </div>
    </div>
  );
}