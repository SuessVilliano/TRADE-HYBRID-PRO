import React, { useEffect, useRef } from 'react';

interface EconomicCalendarProps {
  width?: string;
  height?: string;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  locale?: string;
  importanceFilter?: string;
}

export function EconomicCalendar({
  width = '100%',
  height = '100%',
  colorTheme = 'dark',
  isTransparent = false,
  locale = 'en',
  importanceFilter = '-1,0,1'
}: EconomicCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      width,
      height,
      colorTheme,
      isTransparent,
      locale,
      importanceFilter
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
  }, [width, height, colorTheme, isTransparent, locale, importanceFilter]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-script-container"></div>
      <div className="tradingview-widget-copyright" style={{ fontSize: '11px', padding: '4px 8px', textAlign: 'right' }}>
        <a 
          href="https://www.tradingview.com/markets/currencies/economic-calendar/" 
          rel="noopener noreferrer" 
          target="_blank"
          style={{ color: colorTheme === 'dark' ? '#9db2bd' : '#2962FF', textDecoration: 'none' }}
        >
          Economic Calendar
        </a> by TradingView
      </div>
    </div>
  );
}

export default EconomicCalendar;