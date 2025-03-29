import React from 'react';
import { useBullsVsBearsStore } from '../../lib/stores/useBullsVsBearsStore';

interface MarketChartProps {
  width?: number;
  height?: number;
  darkMode?: boolean;
}

// Simplified market chart implementation
export function MarketChart({
  width = 600,
  height = 300,
  darkMode = true,
}: MarketChartProps) {
  const { gameState } = useBullsVsBearsStore();
  const { priceHistory, currentPrice, asset, timeFrame } = gameState;

  // Calculate price percentage change
  const priceChange = priceHistory.length > 0 
    ? ((currentPrice - priceHistory[0].open) / priceHistory[0].open) * 100
    : 0;
  
  // Determine price movement color
  const priceColor = priceChange >= 0 ? '#26a69a' : '#ef5350';

  // Create simplified chart visual using divs
  const maxPrice = Math.max(...priceHistory.map(p => p.high), currentPrice);
  const minPrice = Math.min(...priceHistory.map(p => p.low), currentPrice);
  const range = maxPrice - minPrice;
  const chartHeight = height * 0.7; // Use different variable name to avoid shadowing

  // Create price bars for visual representation
  const priceBars = priceHistory.map((point, index) => {
    const isUp = point.close >= point.open;
    const barHeight = ((Math.max(point.close, point.open) - Math.min(point.close, point.open)) / range) * chartHeight;
    const top = ((maxPrice - Math.max(point.close, point.open)) / range) * chartHeight;
    const wickTop = ((maxPrice - point.high) / range) * chartHeight;
    const wickHeight = ((point.high - point.low) / range) * chartHeight;
    
    return (
      <div key={index} className="price-bar" style={{ position: 'relative', width: '8px', margin: '0 2px' }}>
        {/* Candle wick */}
        <div style={{
          position: 'absolute',
          top: `${wickTop}px`,
          left: '3px',
          width: '2px',
          height: `${wickHeight}px`,
          backgroundColor: isUp ? '#26a69a' : '#ef5350',
        }} />
        
        {/* Candle body */}
        <div style={{
          position: 'absolute',
          top: `${top}px`,
          width: '8px',
          height: `${Math.max(2, barHeight)}px`,
          backgroundColor: isUp ? '#26a69a' : '#ef5350',
        }} />
      </div>
    );
  });

  return (
    <div className="market-chart-container p-4 rounded-md" 
      style={{ 
        backgroundColor: darkMode ? '#151924' : '#ffffff',
        color: darkMode ? '#d1d4dc' : '#000000',
        width: width,
        height: height,
        border: '1px solid #2a2e39',
        overflow: 'hidden'
      }}>
      <div className="chart-header flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {asset} / USD ({timeFrame})
        </h3>
        <div className="current-price flex flex-col items-end">
          <span className="text-xl font-bold" style={{ color: priceColor }}>
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-sm" style={{ color: priceColor }}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="chart-body h-4/5 flex items-end justify-between relative">
        {/* Price bars */}
        <div className="price-bars-container flex items-end h-full w-full">
          {priceBars}
        </div>
        
        {/* Current price indicator */}
        <div className="current-price-line absolute w-full" 
          style={{ 
            top: `${((maxPrice - currentPrice) / range) * chartHeight}px`,
            borderBottom: `1px dashed ${priceColor}`,
            opacity: 0.8
          }}>
          <span className="text-xs px-1 rounded" style={{ 
            backgroundColor: priceColor,
            color: '#fff',
            position: 'absolute',
            right: '0',
            transform: 'translateY(-50%)'
          }}>
            ${currentPrice.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Volume indicator (simplified) */}
      <div className="volume-indicator h-1/5 mt-2 flex items-end">
        {priceHistory.map((point, index) => (
          <div key={`vol-${index}`} style={{
            width: '8px',
            margin: '0 2px',
            height: `${(point.volume / Math.max(...priceHistory.map(p => p.volume))) * 100}%`,
            backgroundColor: point.close >= point.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
          }} />
        ))}
      </div>
    </div>
  );
}