import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Card } from './card';
import { Button } from './button';
import { Tabs, TabsList, TabsTrigger } from './tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './select';
import { 
  Settings, 
  RefreshCw,
  Maximize2,
  ChevronDown,
  BookOpen
} from 'lucide-react';

// DEX Chart props
interface DexChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  className?: string;
  showControls?: boolean;
  height?: number;
}

// DEX Chart timeframes
const TIMEFRAMES = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
];

// Chart types
type ChartType = 'candle' | 'line' | 'area' | 'bar';

export function DexChart({ 
  symbol = 'BTCUSD', 
  theme = 'dark',
  className,
  showControls = true,
  height = 500
}: DexChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartId = useRef(`dex-chart-${Math.random().toString(36).substring(7)}`);
  const [timeframe, setTimeframe] = useState('15m');
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedToken, setSelectedToken] = useState('BTC');
  
  // Popular DEX tokens
  const popularTokens = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'JUP', name: 'Jupiter' },
    { symbol: 'BONK', name: 'Bonk' },
    { symbol: 'THC', name: 'TradeHouse Coin' },
  ];

  // Create the TradingView widget
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const loadTradingViewWidget = () => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (typeof TradingView !== 'undefined') {
          const widget = new (window as any).TradingView.widget({
            container_id: chartId.current,
            symbol: `BINANCE:${selectedToken}USDT`,
            interval: timeframe,
            timezone: 'exchange',
            theme: theme,
            style: chartType === 'candle' ? '1' : chartType === 'bar' ? '0' : '2',
            locale: 'en',
            toolbar_bg: theme === 'dark' ? '#1e1e2d' : '#f8f9fa',
            enable_publishing: false,
            allow_symbol_change: true,
            save_image: false,
            width: '100%',
            height: isFullscreen ? window.innerHeight : height,
            studies: [
              "BB@tv-basicstudies",
              "MASimple@tv-basicstudies",
              "RSI@tv-basicstudies"
            ],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
            withdateranges: true,
            hide_side_toolbar: false,
            details: true,
            hotlist: true,
            calendar: false,
            studies_overrides: {},
          });
          
          setIsChartLoaded(true);
          console.log('DEX Chart initialized successfully');
        }
      };
      
      // Load the script if it doesn't exist
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        // If script already exists, manually trigger the load event
        if (typeof TradingView !== 'undefined') {
          script.onload && script.onload({} as any);
        }
      }
    };

    // Clear previous chart if exists
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
      
      // Create chart container
      const container = document.createElement('div');
      container.id = chartId.current;
      container.className = 'w-full h-full';
      chartContainerRef.current.appendChild(container);
      
      loadTradingViewWidget();
    }

    // Cleanup on unmount
    return () => {
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = '';
      }
    };
  }, [selectedToken, timeframe, chartType, theme, isFullscreen, height]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Overlay toggle
  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  // Update chart when timeframe changes
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  // Update chart type
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };
  
  // Update token
  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
  };

  return (
    <div 
      className={cn(
        "flex flex-col w-full", 
        isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : "", 
        className
      )}
    >
      {/* Chart controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
          <div className="flex items-center space-x-2">
            <Select value={selectedToken} onValueChange={handleTokenChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {popularTokens.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol} - {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Tabs value={timeframe} onValueChange={handleTimeframeChange} className="border-0">
              <TabsList>
                {TIMEFRAMES.map(tf => (
                  <TabsTrigger key={tf.value} value={tf.value} className="text-xs py-1 px-2">
                    {tf.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tabs value={chartType} onValueChange={handleChartTypeChange as (value: string) => void} className="border-0">
              <TabsList>
                <TabsTrigger value="candle" className="text-xs py-1 px-2">Candle</TabsTrigger>
                <TabsTrigger value="line" className="text-xs py-1 px-2">Line</TabsTrigger>
                <TabsTrigger value="area" className="text-xs py-1 px-2">Area</TabsTrigger>
                <TabsTrigger value="bar" className="text-xs py-1 px-2">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Chart container */}
      <div 
        className={cn(
          "relative w-full rounded-lg border border-border overflow-hidden",
          isFullscreen ? "flex-grow" : `h-[${height}px]`
        )}
      >
        <div ref={chartContainerRef} className="w-full h-full" />
        
        {/* Loading indicator */}
        {!isChartLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading DEX chart...</p>
            </div>
          </div>
        )}
        
        {/* DEX info overlay */}
        {showOverlay && (
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t border-border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">DEX Trading Information</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This chart displays real-time decentralized exchange (DEX) data for {selectedToken}/USDT.
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Lower fees than centralized exchanges</li>
                  <li>Direct on-chain trading with your wallet</li>
                  <li>No KYC requirements or account setup</li>
                  <li>Full control of your assets at all times</li>
                </ul>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleOverlay}>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* DEX stats footer */}
      <div className="flex items-center justify-between mt-3 px-2 text-sm">
        <div className="flex items-center space-x-3">
          <div>
            <span className="text-muted-foreground mr-1">Volume:</span>
            <span className="font-medium">$487.2M</span>
          </div>
          <div>
            <span className="text-muted-foreground mr-1">Liquidity:</span>
            <span className="font-medium">$1.2B</span>
          </div>
          <div>
            <span className="text-muted-foreground mr-1">Avg Fee:</span>
            <span className="font-medium">0.25%</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={toggleOverlay}>
            <BookOpen className="h-3 w-3" />
            <span>DEX Info</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
}