import React from 'react';
import { Link } from 'react-router-dom';

const SimpleTradingViewDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">TradingView Simple Demo</h1>
          <p className="text-slate-400">Testing basic TradingView iframe embed</p>
          <div className="mt-4">
            <Link to="/" className="text-blue-400 hover:underline">Back to Dashboard</Link>
          </div>
        </div>

        {/* Direct TradingView Chart Embed */}
        <div className="mb-6 border border-slate-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-slate-800 border-b border-slate-700">
            <h2 className="font-medium">TradingView Chart (Direct iframe)</h2>
          </div>
          <div className="h-[500px] bg-slate-800">
            <iframe 
              src="https://www.tradingview.com/chart/GtJVbpFg/" 
              style={{ width: '100%', height: '100%' }}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>

        {/* Direct TradingView Economic Calendar Embed */}
        <div className="mb-6 border border-slate-700 rounded-lg overflow-hidden">
          <div className="p-3 bg-slate-800 border-b border-slate-700">
            <h2 className="font-medium">Economic Calendar (Direct Widget Code)</h2>
          </div>
          <div className="h-[400px] bg-slate-800 w-full">
            <div className="tradingview-widget-container" style={{ height: '100%', width: '100%' }}>
              <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
              <div className="tradingview-widget-copyright">
                <a href="https://www.tradingview.com/markets/currencies/economic-calendar/" rel="noopener" target="_blank">
                  <span className="blue-text">Economic Calendar</span>
                </a> by TradingView
              </div>
              <script 
                type="text/javascript" 
                src="https://s3.tradingview.com/external-embedding/embed-widget-events.js" 
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "width": "100%",
                    "height": "100%",
                    "colorTheme": "dark",
                    "isTransparent": false,
                    "locale": "en",
                    "importanceFilter": "-1,0,1"
                  })
                }}
              ></script>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleTradingViewDemo;