import React, { useRef, useEffect, useState, memo } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface MarketOverviewProps {
  className?: string;
  theme?: 'light' | 'dark';
}

function MarketOverview({ className, theme = 'dark' }: MarketOverviewProps) {
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetIdRef = useRef<string>(`market_overview_${Math.floor(Math.random() * 1000000)}`);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing widgets
    container.current.innerHTML = '';
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading TradingView market overview widget');
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": theme,
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "100%",
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(42, 46, 57, 0)",
        "scaleFontColor": "rgba(120, 123, 134, 1)",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              {
                "s": "FOREXCOM:SPXUSD",
                "d": "S&P 500"
              },
              {
                "s": "FOREXCOM:NSXUSD",
                "d": "US 100"
              },
              {
                "s": "FOREXCOM:DJI",
                "d": "Dow 30"
              },
              {
                "s": "INDEX:NKY",
                "d": "Nikkei 225"
              },
              {
                "s": "INDEX:DEU40",
                "d": "DAX Index"
              },
              {
                "s": "FOREXCOM:UKXGBP",
                "d": "UK 100"
              }
            ],
            "originalTitle": "Indices"
          },
          {
            "title": "Futures",
            "symbols": [
              {
                "s": "CME_MINI:ES1!",
                "d": "S&P 500"
              },
              {
                "s": "CME:6E1!",
                "d": "Euro"
              },
              {
                "s": "COMEX:GC1!",
                "d": "Gold"
              },
              {
                "s": "NYMEX:CL1!",
                "d": "Crude Oil"
              },
              {
                "s": "NYMEX:NG1!",
                "d": "Natural Gas"
              },
              {
                "s": "CBOT:ZC1!",
                "d": "Corn"
              }
            ],
            "originalTitle": "Futures"
          },
          {
            "title": "Crypto",
            "symbols": [
              {
                "s": "BINANCE:BTCUSDT",
                "d": "Bitcoin"
              },
              {
                "s": "BINANCE:ETHUSDT",
                "d": "Ethereum"
              },
              {
                "s": "BINANCE:SOLUSDT",
                "d": "Solana"
              },
              {
                "s": "BINANCE:BNBUSDT",
                "d": "Binance Coin"
              },
              {
                "s": "BINANCE:ADAUSDT",
                "d": "Cardano"
              },
              {
                "s": "BINANCE:DOGEUSDT",
                "d": "Dogecoin"
              }
            ],
            "originalTitle": "Crypto"
          },
          {
            "title": "Forex",
            "symbols": [
              {
                "s": "FX:EURUSD",
                "d": "EUR/USD"
              },
              {
                "s": "FX:GBPUSD",
                "d": "GBP/USD"
              },
              {
                "s": "FX:USDJPY",
                "d": "USD/JPY"
              },
              {
                "s": "FX:USDCHF",
                "d": "USD/CHF"
              },
              {
                "s": "FX:AUDUSD",
                "d": "AUD/USD"
              },
              {
                "s": "FX:USDCAD",
                "d": "USD/CAD"
              }
            ],
            "originalTitle": "Forex"
          }
        ]
      });

      // Add event listeners
      script.onload = () => {
        setLoading(false);
        console.log('Market overview widget loaded successfully');
      };
      
      script.onerror = () => {
        setError('Failed to load market overview widget. Please check your internet connection.');
        setLoading(false);
        console.error('Failed to load market overview widget script');
      };
      
      // Append the script to the container
      container.current.appendChild(script);
    } catch (err) {
      setError('An error occurred while loading the market overview widget.');
      setLoading(false);
      console.error('Error initializing market overview widget:', err);
    }
    
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme]);
  
  const handleReload = () => {
    if (!container.current) return;
    container.current.innerHTML = '';
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "colorTheme": theme,
        "dateRange": "12M",
        "showChart": true,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "100%",
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(42, 46, 57, 0)",
        "scaleFontColor": "rgba(120, 123, 134, 1)",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              {
                "s": "FOREXCOM:SPXUSD",
                "d": "S&P 500"
              },
              {
                "s": "FOREXCOM:NSXUSD",
                "d": "US 100"
              },
              {
                "s": "FOREXCOM:DJI",
                "d": "Dow 30"
              },
              {
                "s": "INDEX:NKY",
                "d": "Nikkei 225"
              },
              {
                "s": "INDEX:DEU40",
                "d": "DAX Index"
              },
              {
                "s": "FOREXCOM:UKXGBP",
                "d": "UK 100"
              }
            ],
            "originalTitle": "Indices"
          },
          {
            "title": "Futures",
            "symbols": [
              {
                "s": "CME_MINI:ES1!",
                "d": "S&P 500"
              },
              {
                "s": "CME:6E1!",
                "d": "Euro"
              },
              {
                "s": "COMEX:GC1!",
                "d": "Gold"
              },
              {
                "s": "NYMEX:CL1!",
                "d": "Crude Oil"
              },
              {
                "s": "NYMEX:NG1!",
                "d": "Natural Gas"
              },
              {
                "s": "CBOT:ZC1!",
                "d": "Corn"
              }
            ],
            "originalTitle": "Futures"
          },
          {
            "title": "Crypto",
            "symbols": [
              {
                "s": "BINANCE:BTCUSDT",
                "d": "Bitcoin"
              },
              {
                "s": "BINANCE:ETHUSDT",
                "d": "Ethereum"
              },
              {
                "s": "BINANCE:SOLUSDT",
                "d": "Solana"
              },
              {
                "s": "BINANCE:BNBUSDT",
                "d": "Binance Coin"
              },
              {
                "s": "BINANCE:ADAUSDT",
                "d": "Cardano"
              },
              {
                "s": "BINANCE:DOGEUSDT",
                "d": "Dogecoin"
              }
            ],
            "originalTitle": "Crypto"
          },
          {
            "title": "Forex",
            "symbols": [
              {
                "s": "FX:EURUSD",
                "d": "EUR/USD"
              },
              {
                "s": "FX:GBPUSD",
                "d": "GBP/USD"
              },
              {
                "s": "FX:USDJPY",
                "d": "USD/JPY"
              },
              {
                "s": "FX:USDCHF",
                "d": "USD/CHF"
              },
              {
                "s": "FX:AUDUSD",
                "d": "AUD/USD"
              },
              {
                "s": "FX:USDCAD",
                "d": "USD/CAD"
              }
            ],
            "originalTitle": "Forex"
          }
        ]
      });
      
      script.onload = () => {
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Failed to reload market overview widget');
        setLoading(false);
      };
      
      if (container.current) {
        container.current.appendChild(script);
      }
    }, 500);
  };

  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="flex-grow relative">
        <div
          id={widgetIdRef.current}
          ref={container}
          className="tradingview-widget-container w-full h-full"
        ></div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-slate-300">Loading market overview...</p>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-90 z-10">
            <div className="text-center p-6 max-w-md">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <Button onClick={handleReload} size="sm" variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reload Market Overview
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MarketOverview);

// Export named export for compatibility
export { MarketOverview };