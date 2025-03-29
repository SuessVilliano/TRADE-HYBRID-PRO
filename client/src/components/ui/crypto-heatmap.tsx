import React, { useEffect, useRef } from 'react';

interface CryptoHeatmapProps {
  dataSource?: string;
  colorTheme?: 'light' | 'dark';
  height?: string;
  width?: string;
  showTopBar?: boolean;
}

export function CryptoHeatmap({
  dataSource = 'Crypto',
  colorTheme = 'dark',
  height = '100%',
  width = '100%',
  showTopBar = true
}: CryptoHeatmapProps) {
  const container = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (container.current && !scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        dataSource: dataSource,
        blockSize: "market_cap_calc",
        blockColor: "change",
        locale: "en",
        symbolUrl: "",
        colorTheme: colorTheme,
        hasTopBar: showTopBar,
        isDataSetEnabled: true,
        isZoomEnabled: true,
        hasSymbolTooltip: true,
        width: width,
        height: height
      });
      
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      
      container.current.appendChild(widgetContainer);
      container.current.appendChild(script);
      
      scriptLoaded.current = true;
      
      return () => {
        if (container.current) {
          while (container.current.firstChild) {
            container.current.removeChild(container.current.firstChild);
          }
        }
        scriptLoaded.current = false;
      };
    }
  }, [dataSource, colorTheme, height, width, showTopBar]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      {/* Widget will be inserted here by the script */}
    </div>
  );
}

export default CryptoHeatmap;