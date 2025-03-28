import React, { useEffect, useRef } from 'react';

interface MarketOverviewProps {
  width?: string;
  height?: string;
  colorTheme?: 'light' | 'dark';
  dateRange?: string;
  showChart?: boolean;
  locale?: string;
  largeChartUrl?: string;
  isTransparent?: boolean;
  showSymbolLogo?: boolean;
  showFloatingTooltip?: boolean;
  plotLineColorGrowing?: string;
  plotLineColorFalling?: string;
  gridLineColor?: string;
  scaleFontColor?: string;
  belowLineFillColorGrowing?: string;
  belowLineFillColorFalling?: string;
  belowLineFillColorGrowingBottom?: string;
  belowLineFillColorFallingBottom?: string;
  symbolActiveColor?: string;
  tabs?: Array<{
    title: string;
    symbols: Array<{
      s: string;
      d: string;
    }>;
    originalTitle?: string;
  }>;
}

export function MarketOverview({
  width = '100%',
  height = '100%',
  colorTheme = 'dark',
  dateRange = '12M',
  showChart = true,
  locale = 'en',
  largeChartUrl = '',
  isTransparent = true, // Making transparent so we can style container ourselves
  showSymbolLogo = true,
  showFloatingTooltip = true,
  // Cyberpunk-themed colors (purple and aqua blue) for growing/falling
  plotLineColorGrowing = 'rgba(147, 51, 234, 1)', // Purple
  plotLineColorFalling = 'rgba(6, 182, 212, 1)', // Aqua blue
  gridLineColor = 'rgba(30, 30, 40, 0.5)', // Dark grid lines
  scaleFontColor = 'rgba(248, 250, 252, 0.8)', // Lighter text for better visibility
  belowLineFillColorGrowing = 'rgba(147, 51, 234, 0.15)', // Transparent purple
  belowLineFillColorFalling = 'rgba(6, 182, 212, 0.15)', // Transparent aqua
  belowLineFillColorGrowingBottom = 'rgba(147, 51, 234, 0)', // Fade to transparent
  belowLineFillColorFallingBottom = 'rgba(6, 182, 212, 0)', // Fade to transparent
  symbolActiveColor = 'rgba(147, 51, 234, 0.2)', // Active symbol highlight
  tabs = [
    {
      title: 'Indices',
      symbols: [
        {
          s: 'FOREXCOM:SPXUSD',
          d: 'S&P 500'
        },
        {
          s: 'FOREXCOM:NSXUSD',
          d: 'US 100'
        },
        {
          s: 'FOREXCOM:DJI',
          d: 'Dow 30'
        },
        {
          s: 'INDEX:NKY',
          d: 'Nikkei 225'
        },
        {
          s: 'INDEX:DEU40',
          d: 'DAX Index'
        },
        {
          s: 'FOREXCOM:UKXGBP',
          d: 'UK 100'
        }
      ],
      originalTitle: 'Indices'
    },
    {
      title: 'Futures',
      symbols: [
        {
          s: 'CME_MINI:ES1!',
          d: 'S&P 500'
        },
        {
          s: 'CME:6E1!',
          d: 'Euro'
        },
        {
          s: 'COMEX:GC1!',
          d: 'Gold'
        },
        {
          s: 'NYMEX:CL1!',
          d: 'Oil'
        },
        {
          s: 'NYMEX:NG1!',
          d: 'Gas'
        },
        {
          s: 'CBOT:ZC1!',
          d: 'Corn'
        }
      ],
      originalTitle: 'Futures'
    },
    {
      title: 'Crypto',
      symbols: [
        {
          s: 'BITSTAMP:BTCUSD',
          d: 'Bitcoin'
        },
        {
          s: 'BITSTAMP:ETHUSD',
          d: 'Ethereum'
        },
        {
          s: 'BINANCE:SOLUSDT',
          d: 'Solana'
        },
        {
          s: 'BINANCE:DOGEUSDT',
          d: 'Dogecoin'
        },
        {
          s: 'BINANCE:AVAXUSDT',
          d: 'Avalanche'
        },
        {
          s: 'BINANCE:MATICUSDT',
          d: 'Polygon'
        }
      ],
      originalTitle: 'Crypto'
    },
    {
      title: 'Forex',
      symbols: [
        {
          s: 'FX:EURUSD',
          d: 'EUR to USD'
        },
        {
          s: 'FX:GBPUSD',
          d: 'GBP to USD'
        },
        {
          s: 'FX:USDJPY',
          d: 'USD to JPY'
        },
        {
          s: 'FX:USDCHF',
          d: 'USD to CHF'
        },
        {
          s: 'FX:AUDUSD',
          d: 'AUD to USD'
        },
        {
          s: 'FX:USDCAD',
          d: 'USD to CAD'
        }
      ],
      originalTitle: 'Forex'
    }
  ]
}: MarketOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      width,
      height,
      colorTheme,
      dateRange,
      showChart,
      locale,
      largeChartUrl,
      isTransparent,
      showSymbolLogo,
      showFloatingTooltip,
      plotLineColorGrowing,
      plotLineColorFalling,
      gridLineColor,
      scaleFontColor,
      belowLineFillColorGrowing,
      belowLineFillColorFalling,
      belowLineFillColorGrowingBottom,
      belowLineFillColorFallingBottom,
      symbolActiveColor,
      tabs
    });

    if (containerRef.current) {
      // Clear any existing widgets
      const widgetContainer = containerRef.current.querySelector('.tradingview-widget-container__widget');
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
      
      // Append the new script
      const scriptContainer = containerRef.current.querySelector('.tradingview-widget-script-container');
      if (scriptContainer) {
        scriptContainer.innerHTML = '';
        scriptContainer.appendChild(script);
      }
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [
    width, height, colorTheme, dateRange, showChart, locale, largeChartUrl, 
    isTransparent, showSymbolLogo, showFloatingTooltip, plotLineColorGrowing, 
    plotLineColorFalling, gridLineColor, scaleFontColor, belowLineFillColorGrowing, 
    belowLineFillColorFalling, belowLineFillColorGrowingBottom, belowLineFillColorFallingBottom, 
    symbolActiveColor, tabs
  ]);

  return (
    <div 
      className="tradingview-widget-container rounded-md shadow-lg overflow-hidden border border-secondary/30 shadow-[0_0_10px_rgba(var(--secondary),0.15)]" 
      ref={containerRef}
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 20, 30, 0.95), rgba(15, 15, 20, 0.97))',
      }}
    >
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-script-container"></div>
      <div className="tradingview-widget-copyright" style={{ 
        fontSize: '11px', 
        padding: '4px 12px', 
        textAlign: 'right',
        borderTop: '1px solid rgba(6, 182, 212, 0.2)', // Light secondary border
        background: 'rgba(10, 10, 15, 0.7)',
      }}>
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener noreferrer" 
          target="_blank"
          style={{ 
            color: 'rgba(6, 182, 212, 0.8)', // Secondary color
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
          className="hover:text-secondary transition-colors"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default MarketOverview;