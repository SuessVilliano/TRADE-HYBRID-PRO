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
  isTransparent = false,
  showSymbolLogo = true,
  showFloatingTooltip = false,
  plotLineColorGrowing = 'rgba(41, 98, 255, 1)',
  plotLineColorFalling = 'rgba(41, 98, 255, 1)',
  gridLineColor = 'rgba(42, 46, 57, 0)',
  scaleFontColor = 'rgba(106, 109, 120, 1)',
  belowLineFillColorGrowing = 'rgba(41, 98, 255, 0.12)',
  belowLineFillColorFalling = 'rgba(41, 98, 255, 0.12)',
  belowLineFillColorGrowingBottom = 'rgba(41, 98, 255, 0)',
  belowLineFillColorFallingBottom = 'rgba(41, 98, 255, 0)',
  symbolActiveColor = 'rgba(41, 98, 255, 0.12)',
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
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-script-container"></div>
      <div className="tradingview-widget-copyright" style={{ fontSize: '11px', padding: '4px 8px', textAlign: 'right' }}>
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener noreferrer" 
          target="_blank"
          style={{ color: colorTheme === 'dark' ? '#9db2bd' : '#2962FF', textDecoration: 'none' }}
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default MarketOverview;