import React, { useEffect, useRef, memo } from 'react';

interface TradingViewStockHeatmapWidgetProps {
  dataSource?: string;
  grouping?: string;
  blockSize?: string;
  blockColor?: string;
  colorTheme?: 'light' | 'dark';
  hasTopBar?: boolean;
  isZoomEnabled?: boolean;
  width?: string;
  height?: string;
  className?: string;
}

function TradingViewStockHeatmapWidget({
  dataSource = 'NASDAQ100',
  grouping = 'sector',
  blockSize = 'market_cap_basic',
  blockColor = 'change',
  colorTheme = 'dark',
  hasTopBar = true,
  isZoomEnabled = true,
  width = '100%',
  height = '100%',
  className = ''
}: TradingViewStockHeatmapWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const uniqueId = useRef<string>(`tradingview_stocks_${Math.random().toString(36).substring(2, 10)}`);

  useEffect(() => {
    // Clean up any existing script
    const existingScript = document.getElementById(`${uniqueId.current}_script`);
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }

    if (!container.current) return;

    // Create and setup the script
    const script = document.createElement('script');
    script.id = `${uniqueId.current}_script`;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
    script.type = 'text/javascript';
    script.async = true;
    
    // Configure the widget
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: dataSource,
      grouping: grouping,
      blockSize: blockSize,
      blockColor: blockColor,
      locale: 'en',
      symbolUrl: '',
      colorTheme: colorTheme,
      hasTopBar: hasTopBar,
      isDataSetEnabled: true,
      isZoomEnabled: isZoomEnabled,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: width,
      height: height
    });

    // Add the script to the container
    container.current.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [dataSource, grouping, blockSize, blockColor, colorTheme, hasTopBar, isZoomEnabled, width, height]);

  return (
    <div className={`tradingview-widget-container ${className}`} ref={container}>
      <div className="tradingview-widget-container__widget" style={{ height, width }}></div>
      <div className="tradingview-widget-copyright">
        <a 
          href="https://www.tradingview.com/" 
          rel="noopener nofollow" 
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewStockHeatmapWidget);