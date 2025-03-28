import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Button } from './button';
import { TRADING_CONFIG } from '../../lib/constants';

interface TradingViewToolsProps {
  height?: string;
}

export const TradingViewTools: React.FC<TradingViewToolsProps> = ({ height = '500px' }) => {
  const [activeTab, setActiveTab] = useState<'screener' | 'heatmap' | 'calendar' | 'news'>('screener');
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRefs = {
    screener: useRef<HTMLDivElement>(null),
    heatmap: useRef<HTMLDivElement>(null),
    calendar: useRef<HTMLDivElement>(null),
    news: useRef<HTMLDivElement>(null),
  };

  // Cleanup function to remove all existing scripts
  const cleanupScripts = () => {
    if (typeof document !== 'undefined') {
      const scripts = document.querySelectorAll('script[data-trading-view-widget]');
      scripts.forEach(script => script.remove());
    }
  };

  useEffect(() => {
    return () => {
      cleanupScripts();
    };
  }, []);

  // Initialize Trading View Screener Widget
  useEffect(() => {
    if (activeTab === 'screener' && widgetRefs.screener.current) {
      const containerElement = widgetRefs.screener.current;
      if (!containerElement) return;

      // Clear previous widget if any
      containerElement.innerHTML = '';

      const script = document.createElement('script');
      script.setAttribute('data-trading-view-widget', 'screener');
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        new TradingView.widget({
          "container_id": "${containerElement.id}",
          "width": "100%",
          "height": "${height}",
          "defaultColumn": "overview",
          "screener_type": "crypto_mkt",
          "displayCurrency": "USD",
          "colorTheme": "dark",
          "locale": "en"
        });
      `;

      containerElement.appendChild(script);
    }
  }, [activeTab, height]);

  // Initialize Trading View Heatmap Widget
  useEffect(() => {
    if (activeTab === 'heatmap' && widgetRefs.heatmap.current) {
      const containerElement = widgetRefs.heatmap.current;
      if (!containerElement) return;

      // Clear previous widget if any
      containerElement.innerHTML = '';

      const script = document.createElement('script');
      script.setAttribute('data-trading-view-widget', 'heatmap');
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        new TradingView.widget({
          "container_id": "${containerElement.id}",
          "width": "100%",
          "height": "${height}",
          "currencies": [
            "USD",
            "EUR",
            "JPY",
            "GBP",
            "CHF",
            "AUD",
            "CAD",
            "NZD",
            "CNY"
          ],
          "isTransparent": false,
          "colorTheme": "dark",
          "locale": "en"
        });
      `;

      containerElement.appendChild(script);
    }
  }, [activeTab, height]);

  // Initialize Trading View Economic Calendar Widget
  useEffect(() => {
    if (activeTab === 'calendar' && widgetRefs.calendar.current) {
      const containerElement = widgetRefs.calendar.current;
      if (!containerElement) return;

      // Clear previous widget if any
      containerElement.innerHTML = '';

      const script = document.createElement('script');
      script.setAttribute('data-trading-view-widget', 'calendar');
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        new TradingView.widget({
          "container_id": "${containerElement.id}",
          "width": "100%",
          "height": "${height}",
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "en",
          "importanceFilter": "-1,0,1"
        });
      `;

      containerElement.appendChild(script);
    }
  }, [activeTab, height]);

  // Initialize Trading View News Widget
  useEffect(() => {
    if (activeTab === 'news' && widgetRefs.news.current) {
      const containerElement = widgetRefs.news.current;
      if (!containerElement) return;

      // Clear previous widget if any
      containerElement.innerHTML = '';

      const script = document.createElement('script');
      script.setAttribute('data-trading-view-widget', 'news');
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        new TradingView.widget({
          "container_id": "${containerElement.id}",
          "width": "100%",
          "height": "${height}",
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "en",
          "newsFilter": "headlines",
          "symbolsFilter": "${TRADING_CONFIG.DEFAULT_SYMBOL}"
        });
      `;

      containerElement.appendChild(script);
    }
  }, [activeTab, height]);

  // Ensure TradingView is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).TradingView) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        // Once loaded, initialize current active tab
        switch (activeTab) {
          case 'screener':
            if (widgetRefs.screener.current) widgetRefs.screener.current.innerHTML = '';
            break;
          case 'heatmap':
            if (widgetRefs.heatmap.current) widgetRefs.heatmap.current.innerHTML = '';
            break;
          case 'calendar':
            if (widgetRefs.calendar.current) widgetRefs.calendar.current.innerHTML = '';
            break;
          case 'news':
            if (widgetRefs.news.current) widgetRefs.news.current.innerHTML = '';
            break;
        }
      };
      document.head.appendChild(script);
    }
  }, [activeTab]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden" ref={containerRef}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <div className="border-b border-slate-700 px-3 py-2">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="screener" className="data-[state=active]:bg-blue-600">Scanner</TabsTrigger>
            <TabsTrigger value="heatmap" className="data-[state=active]:bg-blue-600">Heatmap</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-600">Calendar</TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-blue-600">News</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="screener" className="mt-0">
          <div 
            id="tv_screener_widget" 
            ref={widgetRefs.screener} 
            style={{ height }}
            className="flex items-center justify-center bg-slate-800"
          >
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-300">Loading scanner...</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-0">
          <div 
            id="tv_heatmap_widget" 
            ref={widgetRefs.heatmap} 
            style={{ height }}
            className="flex items-center justify-center bg-slate-800"
          >
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-300">Loading heatmap...</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <div 
            id="tv_calendar_widget" 
            ref={widgetRefs.calendar} 
            style={{ height }}
            className="flex items-center justify-center bg-slate-800"
          >
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-300">Loading economic calendar...</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="mt-0">
          <div 
            id="tv_news_widget" 
            ref={widgetRefs.news} 
            style={{ height }}
            className="flex items-center justify-center bg-slate-800"
          >
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-300">Loading news...</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};