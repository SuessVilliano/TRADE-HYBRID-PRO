import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Share2, 
  Bookmark, 
  FileQuestion, 
  ArrowUpRightFromCircle, 
  Globe,
  MonitorPlay,
  Menu,
  Settings
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { PopupContainer } from '../components/ui/popup-container';
import { useMediaQuery } from '../lib/hooks/useMediaQuery';
import { EmbeddedBrowser, MultiTabBrowser } from '../components/ui/embedded-browser';
import { toast } from 'sonner';

// Popular broker and platform websites
const brokerPresets = [
  { name: "TradeHybrid TV", url: "https://tv.tradehybrid.club", icon: <MonitorPlay className="w-4 h-4 mr-2" /> },
  { name: "TradingView", url: "https://pro.tradingview.com/chart/", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "MetaTrader Web", url: "https://trade.mql5.com/trade", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "Interactive Brokers", url: "https://www.interactivebrokers.com/portal", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "cTrader", url: "https://ctrader.com/", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "Oanda", url: "https://www.oanda.com/trade/", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "TD Ameritrade", url: "https://www.tdameritrade.com/tools-and-platforms.html", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "E*TRADE", url: "https://us.etrade.com/platforms/power-etrade", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "Binance", url: "https://www.binance.com/en/trade", icon: <Globe className="w-4 h-4 mr-2" /> },
  { name: "Coinbase Pro", url: "https://pro.coinbase.com/", icon: <Globe className="w-4 h-4 mr-2" /> },
];

export default function EmbeddedBrowserPage() {
  const [browserUrl, setBrowserUrl] = useState('https://tv.tradehybrid.club');
  const [activeTab, setActiveTab] = useState('single');
  
  // Check if mobile
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleShareClick = () => {
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast.success('Page link copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };
  
  const handleBookmarkClick = () => {
    toast.success('Page bookmarked');
  };
  
  // Handle selection of a broker from the preset list
  const handleBrokerSelect = (value: string) => {
    const selected = brokerPresets.find(broker => broker.name === value);
    if (selected) {
      setBrowserUrl(selected.url);
      toast.success(`Loading ${selected.name}`);
    }
  };
  
  // Handle mobile settings toggle
  const handleShowSettings = () => {
    toast.info("Settings panel will open here");
  };
  
  return (
    <PopupContainer className="min-h-[calc(100vh-130px)] bg-slate-900 text-white p-4 md:p-6" padding>
      <Helmet>
        <title>Trading Embedded Browser | Trade Hybrid</title>
      </Helmet>
      
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Menu icon instead of hamburger component */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white">Trading Web Browser</h1>
              <p className="text-slate-400 text-sm">
                Access your trading platforms and broker websites without leaving Trade Hybrid
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleShareClick}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleBookmarkClick}>
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <FileQuestion className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Access</CardTitle>
              <p className="text-sm text-slate-400">Select a trading platform or broker website to open</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {brokerPresets.map((broker, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => setBrowserUrl(broker.url)}
                  >
                    {broker.icon}
                    {broker.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="single" className="data-[state=active]:bg-blue-600">
              Single Browser
            </TabsTrigger>
            <TabsTrigger value="multi" className="data-[state=active]:bg-blue-600">
              Multi-Tab Browser
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-4">
            <EmbeddedBrowser 
              defaultUrl={browserUrl} 
              height={750} 
              className="bg-slate-800 border-slate-700" 
            />
          </TabsContent>
          
          <TabsContent value="multi" className="mt-4">
            <MultiTabBrowser 
              defaultTabs={[
                { title: 'TradeHybrid TV', url: 'https://tv.tradehybrid.club' },
                { title: 'TradingView', url: 'https://pro.tradingview.com/chart/' }
              ]} 
              height={750} 
              className="bg-slate-800 border-slate-700" 
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 rounded-full p-2 mt-1">
              <ArrowUpRightFromCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-200 mb-1">Pro Tip: Browser Limitations</h3>
              <p className="text-sm text-blue-300">
                Some trading platforms may not allow embedding due to security restrictions. 
                If a site doesn't load properly, use the "Open in New Tab" button to launch it in a separate window.
              </p>
            </div>
          </div>
        </div>
        
        {/* Mobile actions replaced with simple button */}
        <div className="fixed bottom-4 right-4 md:hidden">
          <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </PopupContainer>
  );
}