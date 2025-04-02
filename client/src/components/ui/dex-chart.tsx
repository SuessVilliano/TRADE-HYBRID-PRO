import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import TradingViewWidget from './TradingViewWidget';

// DEX Chart props
interface DexChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  className?: string;
  showControls?: boolean;
  height?: number;
}

// Popular DEX tokens
const popularTokens = [
  { symbol: 'BTCUSD', displayName: 'Bitcoin' },
  { symbol: 'ETHUSD', displayName: 'Ethereum' },
  { symbol: 'SOLUSD', displayName: 'Solana' },
  { symbol: 'SHIBUSD', displayName: 'Shiba Inu' },
  { symbol: 'DOGEUSD', displayName: 'Dogecoin' },
  { symbol: 'AVAXUSD', displayName: 'Avalanche' },
];

function DexChart({ 
  symbol = 'BTCUSD', 
  theme = 'dark',
  className,
  showControls = true,
  height = 600 // Taller default height for better visibility
}: DexChartProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(`BINANCE:${symbol}`);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Handle fullscreen change from TradingViewWidget
  const handleFullscreenChange = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  };

  return (
    <div className={cn(
      "w-full h-full flex flex-col", 
      isFullscreen ? "fixed inset-0 z-[100]" : "",
      className
    )}>
      <TradingViewWidget 
        symbol={selectedSymbol}
        theme={theme}
        height={isFullscreen ? "100vh" : `${height}px`}
        width="100%"
        interval="15"
        allow_symbol_change={true}
        allowFullscreen={true}
        onFullscreenChange={handleFullscreenChange}
      />
    </div>
  );
}

// Export as default
export default DexChart;

// Also keep named export for backwards compatibility
export { DexChart };