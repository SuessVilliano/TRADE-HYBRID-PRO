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
  isTransparent = true, // Make transparent to allow custom styling
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
    <div 
      className="tradingview-widget-container rounded-md shadow-lg overflow-hidden border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.15)]" 
      ref={containerRef}
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 20, 30, 0.95), rgba(15, 15, 20, 0.97))',
      }}
    >
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-script-container"></div>
      <div 
        className="tradingview-widget-copyright" 
        style={{ 
          fontSize: '11px', 
          padding: '4px 12px', 
          textAlign: 'right',
          borderTop: '1px solid rgba(147, 51, 234, 0.2)', // Light primary border
          background: 'rgba(10, 10, 15, 0.7)',
        }}
      >
        <a 
          href="https://www.tradingview.com/markets/currencies/economic-calendar/" 
          rel="noopener noreferrer" 
          target="_blank"
          style={{ 
            color: 'rgba(147, 51, 234, 0.8)', // Primary color
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
          className="hover:text-primary transition-colors"
        >
          Economic Calendar
        </a>{" "}
        <span className="text-slate-400">by TradingView</span>
      </div>
    </div>
  );
}

export default EconomicCalendar;