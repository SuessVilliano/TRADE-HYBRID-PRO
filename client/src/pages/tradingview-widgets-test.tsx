import React from 'react';
import { TradingViewIframeChart } from '../components/ui/tradingview-iframe-chart';
import { TradingViewEconomicCalendar } from '../components/ui/tradingview-economic-calendar';
import { TradingViewMarketOverview } from '../components/ui/tradingview-market-overview';
import { TradingViewCryptoHeatmap } from '../components/ui/tradingview-crypto-heatmap';
import { TradingViewStockHeatmap } from '../components/ui/tradingview-stock-heatmap';
import { TradingViewCryptoScreener } from '../components/ui/tradingview-crypto-screener';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const TradingViewWidgetsTest: React.FC = () => {
  const handleRefreshAll = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TradingView Widgets Test Page</h1>
            <p className="text-slate-400">Testing all TradingView widget components</p>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <Button onClick={handleRefreshAll} variant="default" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh All
            </Button>
          </div>
        </div>

        {/* Main Chart */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle>TradingView Chart</CardTitle>
            <CardDescription className="text-slate-400">
              Direct chart embed via iframe
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[500px]">
              <TradingViewIframeChart 
                symbol="BTCUSDT" 
                chartId="GtJVbpFg" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Economic Calendar */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle>Economic Calendar</CardTitle>
              <CardDescription className="text-slate-400">
                Global economic events
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <TradingViewEconomicCalendar 
                  colorTheme="dark" 
                  isTransparent={false}
                  locale="en"
                  importanceFilter="-1,0,1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Market Overview */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle>Market Overview</CardTitle>
              <CardDescription className="text-slate-400">
                Multi-market summary view
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <TradingViewMarketOverview 
                  colorTheme="dark" 
                  showChart={true}
                  showSymbolLogo={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Crypto Screener */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle>Crypto Screener</CardTitle>
              <CardDescription className="text-slate-400">
                Filter and sort cryptocurrencies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <TradingViewCryptoScreener 
                  colorTheme="dark" 
                  defaultColumn="overview"
                  displayCurrency="USD"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crypto Heatmap */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle>Crypto Heatmap</CardTitle>
              <CardDescription className="text-slate-400">
                Visual representation of crypto markets
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <TradingViewCryptoHeatmap 
                  colorTheme="dark" 
                  hasTopBar={true}
                  isZoomEnabled={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock Heatmap */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle>Stock Heatmap</CardTitle>
              <CardDescription className="text-slate-400">
                Visual representation of stock markets
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <TradingViewStockHeatmap 
                  colorTheme="dark" 
                  dataSource="SPX500"
                  grouping="sector"
                  hasTopBar={true}
                  isZoomEnabled={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TradingViewWidgetsTest;