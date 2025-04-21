import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface MarketOverviewProps {
  height?: string | number;
  width?: string | number;
  colorTheme?: 'light' | 'dark';
  showChart?: boolean;
  showSymbolLogo?: boolean;
  className?: string;
}

export function TradingViewMarketOverview({
  height = '100%',
  width = '100%',
  colorTheme = 'dark',
  showChart = true,
  showSymbolLogo = true,
  className = ''
}: MarketOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useRef(`tv_market_overview_${Math.floor(Math.random() * 1000000)}`);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing widgets
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      
      // Create the copyright element
      const copyrightElement = document.createElement('div');
      copyrightElement.className = 'tradingview-widget-copyright';
      
      const link = document.createElement('a');
      link.href = 'https://www.tradingview.com/markets/currencies/economic-calendar/';
      link.rel = 'noopener';
      link.target = '_blank';
      
      const span = document.createElement('span');
      span.className = 'blue-text';
      span.textContent = 'Market Overview';
      
      link.appendChild(span);
      link.appendChild(document.createTextNode(' by TradingView'));
      copyrightElement.appendChild(link);
      
      // Create script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      
      // Widget configuration with the forex symbols you provided
      const widgetConfig = {
        "colorTheme": colorTheme,
        "dateRange": "12M",
        "showChart": showChart,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": showSymbolLogo,
        "showFloatingTooltip": false,
        "width": width,
        "height": height,
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
                "d": "EUR to USD"
              },
              {
                "s": "FX:GBPUSD",
                "d": "GBP to USD"
              },
              {
                "s": "FX:USDJPY",
                "d": "USD to JPY"
              },
              {
                "s": "FX:USDCHF",
                "d": "USD to CHF"
              },
              {
                "s": "FX:AUDUSD",
                "d": "AUD to USD"
              },
              {
                "s": "FX:USDCAD",
                "d": "USD to CAD"
              }
            ],
            "originalTitle": "Forex"
          }
        ]
      };
      
      script.innerHTML = JSON.stringify(widgetConfig);
      
      // Success and error handling
      script.onload = () => {
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Failed to load market overview. Please try again later.');
        setLoading(false);
      };
      
      // Append elements to container
      containerRef.current.appendChild(widgetContainer);
      containerRef.current.appendChild(copyrightElement);
      containerRef.current.appendChild(script);
      
      // Set a timeout to detect if the widget doesn't load properly
      const loadTimeout = setTimeout(() => {
        if (loading) {
          setError('The market overview is taking longer than expected to load. Please try refreshing.');
        }
      }, 8000);
      
      return () => {
        clearTimeout(loadTimeout);
        if (containerRef.current) {
          // Clear the container on unmount
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
        }
      };
    } catch (err) {
      setError('An error occurred while loading the market overview.');
      setLoading(false);
      console.error('Error loading market overview:', err);
    }
  }, [height, width, colorTheme, showChart, showSymbolLogo]);
  
  const handleReload = () => {
    if (containerRef.current) {
      // Clear the container
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      setLoading(true);
      setError(null);
      
      // Recreate widget with a slight delay
      setTimeout(() => {
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        
        const copyrightElement = document.createElement('div');
        copyrightElement.className = 'tradingview-widget-copyright';
        
        const link = document.createElement('a');
        link.href = 'https://www.tradingview.com';
        link.rel = 'noopener';
        link.target = '_blank';
        link.innerHTML = '<span class="blue-text">Market Overview</span> by TradingView';
        copyrightElement.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        
        const widgetConfig = {
          "colorTheme": colorTheme,
          "dateRange": "12M",
          "showChart": showChart,
          "locale": "en",
          "largeChartUrl": "",
          "isTransparent": false,
          "showSymbolLogo": showSymbolLogo,
          "showFloatingTooltip": false,
          "width": width,
          "height": height,
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
              ]
            },
            {
              "title": "Forex",
              "symbols": [
                {
                  "s": "FX:EURUSD",
                  "d": "EUR to USD"
                },
                {
                  "s": "FX:GBPUSD",
                  "d": "GBP to USD"
                },
                {
                  "s": "FX:USDJPY",
                  "d": "USD to JPY"
                },
                {
                  "s": "FX:USDCHF",
                  "d": "USD to CHF"
                },
                {
                  "s": "FX:AUDUSD",
                  "d": "AUD to USD"
                },
                {
                  "s": "FX:USDCAD",
                  "d": "USD to CAD"
                }
              ]
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
              ]
            }
          ]
        };
        
        script.innerHTML = JSON.stringify(widgetConfig);
        
        script.onload = () => {
          setLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to reload market overview.');
          setLoading(false);
        };
        
        if (containerRef.current) {
          containerRef.current.appendChild(widgetContainer);
          containerRef.current.appendChild(copyrightElement);
          containerRef.current.appendChild(script);
        }
      }, 300);
    }
  };

  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-2 border-b border-slate-700 flex justify-between items-center">
        <div className="font-medium text-sm">Market Overview</div>
        <Button variant="outline" size="sm" className="text-xs" onClick={handleReload}>
          <RefreshCcw className="h-3 w-3 mr-1" />
          Reload
        </Button>
      </div>
      
      <div className="flex-grow relative">
        <div 
          id={uniqueId.current}
          ref={containerRef}
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

export default TradingViewMarketOverview;