import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DraggableTradingDashboard } from '../components/ui/draggable-trading-dashboard';
import { SmartTradeLayout } from '../components/ui/smart-trade-layout';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { 
  Share2, 
  Star, 
  Bookmark, 
  FileQuestion, 
  ArrowUpRightFromCircle, 
  LayoutGrid, 
  MonitorPlay,
  FileText,
  BarChart4,
  PlusCircle,
  Bell,
  Link,
  Settings
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PopupContainer } from '../components/ui/popup-container';
import { useMediaQuery } from '../lib/hooks/useMediaQuery';
import { TradeJournal } from '../components/ui/trade-journal';
import { HamburgerMenu } from '../components/mobile/hamburger-menu';
import { MobileQuickActions } from '../components/mobile/mobile-quick-actions';
import { TradingViewTickerTape } from '../components/ui/tradingview-ticker-tape';
import { TradingViewWidgetPanel } from '../components/ui/tradingview-widget-panel';

export default function TradingDashboard() {
  const [selectedTab, setSelectedTab] = useState('trading');
  const [selectedLayout, setSelectedLayout] = useState<'classic' | 'smart'>('smart');
  
  // Check if mobile
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleShareClick = () => {
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast.success('Dashboard link copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };
  
  const handleBookmarkClick = () => {
    toast.success('Dashboard layout bookmarked');
  };
  
  const handleSaveAsDefault = () => {
    toast.success('Dashboard saved as your default layout');
  };
  
  const toggleLayout = () => {
    setSelectedLayout(selectedLayout === 'classic' ? 'smart' : 'classic');
    toast.success(`Switched to ${selectedLayout === 'classic' ? 'Smart' : 'Classic'} trading layout`);
  };
  
  // Handle mobile add trade action
  const handleAddTrade = () => {
    setSelectedTab('journal');
    toast("Journal opened", {
      description: "You can now add a new trade entry"
    });
  };
  
  // Handle mobile settings toggle
  const handleShowSettings = () => {
    // We could navigate to settings page or toggle settings panel
    toast("Settings", {
      description: "Settings panel will open here"
    });
  };
  
  return (
    <PopupContainer className="min-h-[calc(100vh-130px)] bg-slate-900 text-white p-4 md:p-6" padding>
      <Helmet>
        <title>Trading Dashboard | Trade Hybrid</title>
      </Helmet>
      
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile Hamburger Menu (only visible on mobile) */}
            <div className="md:hidden">
              <HamburgerMenu />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
              <p className="text-slate-400 text-sm">
                Professional prop firm trading workspace with multi-platform integration
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
            <Button variant="outline" size="sm" onClick={handleSaveAsDefault}>
              <Star className="h-4 w-4 mr-2" />
              Save as Default
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <FileQuestion className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="trading" className="data-[state=active]:bg-blue-600">
                Trading Dashboard
              </TabsTrigger>
              <TabsTrigger value="journal" className="data-[state=active]:bg-blue-600">
                Trade Journal
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">
                Market Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
          

        </div>
        
        {/* Add Ticker Tape at the top of the dashboard */}
        <div className="mb-4">
          <TradingViewTickerTape className="w-full" />
        </div>
        
        {selectedTab === 'trading' && (
          <div className="h-[calc(100vh-230px)] md:h-[calc(100vh-260px)] w-full rounded-lg overflow-hidden border border-slate-700">
            <SmartTradeLayout defaultSymbol="BTCUSDT" />
          </div>
        )}
        
        {selectedTab === 'journal' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 pb-0">
              <h2 className="text-xl font-bold mb-2">Trade Journal</h2>
              <p className="text-slate-400 text-sm mb-4">
                Record and analyze your trading activity
              </p>
            </div>
            <div className="h-[calc(100vh-280px)] overflow-auto">
              <TradeJournal />
            </div>
          </div>
        )}
        
        {selectedTab === 'analysis' && (
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Market Analysis Tools</CardTitle>
              </CardHeader>
              <CardContent>
                {/* TradingView Ticker Tape */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Market Overview</h3>
                  <TradingViewTickerTape className="w-full" />
                </div>
                
                {/* TradingView Widget Panel */}
                <div>
                  <h3 className="text-lg font-medium mb-3">TradingView Tools</h3>
                  <TradingViewWidgetPanel height={500} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 rounded-full p-2 mt-1">
              <ArrowUpRightFromCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-200 mb-1">Pro Tip: Customize Your Dashboard</h3>
              <p className="text-sm text-blue-300">
                Click "Edit Layout" to rearrange widgets by dragging them. Add new widgets with the "Add Widget" button. 
                Your layout will be automatically saved for your next session.
              </p>
            </div>
          </div>
        </div>
        
        {/* Desktop Quick Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-slate-700 z-50 hidden md:block">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedTab('trading')}>
                  <LayoutGrid className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedTab('journal')}>
                  <FileText className="h-4 w-4" />
                  <span>Journal</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedTab('analysis')}>
                  <BarChart4 className="h-4 w-4" />
                  <span>Analysis</span>
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 mr-2">Quick Actions:</span>
                
                <Button
                  variant="ghost"
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => {
                    if (selectedTab !== 'journal') {
                      setSelectedTab('journal');
                    }
                    toast("Journal opened", {
                      description: "You can now add a new trade entry"
                    });
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only">Add Trade</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Signals</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <Link className="h-4 w-4" />
                  <span className="sr-only">Connect</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Quick Actions */}
        <MobileQuickActions 
          onAddTrade={handleAddTrade}
          onShowSettings={handleShowSettings}
        />
      </div>
    </PopupContainer>
  );
}