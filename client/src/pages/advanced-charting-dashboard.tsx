import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Share2, Star, Bookmark, FileQuestion, ArrowUpRightFromCircle, LayoutGrid, MonitorPlay } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PopupContainer } from '../components/ui/popup-container';
import { useMediaQuery } from '../lib/hooks/useMediaQuery';
import { AdvancedTradeLayout } from '../components/ui/advanced-trade-layout';

export default function AdvancedChartingDashboard() {
  const [selectedTab, setSelectedTab] = useState('trading');
  const [selectedLayout, setSelectedLayout] = useState<'classic' | 'advanced'>('advanced');
  
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
    setSelectedLayout(selectedLayout === 'classic' ? 'advanced' : 'classic');
    toast.success(`Switched to ${selectedLayout === 'classic' ? 'Advanced' : 'Classic'} trading layout`);
  };
  
  return (
    <PopupContainer className="min-h-[calc(100vh-130px)] bg-slate-900 text-white p-4 md:p-6" padding>
      <Helmet>
        <title>Advanced Charting | Trade Hybrid</title>
      </Helmet>
      
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Advanced Charting Dashboard</h1>
            <p className="text-slate-400 text-sm">
              Professional-grade trading interface with advanced panels and tools
            </p>
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
          
          {selectedTab === 'trading' && (
            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-9 gap-1.5 ${selectedLayout === 'classic' ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-300'}`}
                onClick={toggleLayout}
              >
                <LayoutGrid className="h-4 w-4" />
                Classic
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-9 gap-1.5 ${selectedLayout === 'advanced' ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-300'}`}
                onClick={toggleLayout}
              >
                <MonitorPlay className="h-4 w-4" />
                Advanced
              </Button>
            </div>
          )}
        </div>
        
        {selectedTab === 'trading' && (
          <div className="h-[calc(100vh-230px)] md:h-[calc(100vh-260px)] w-full rounded-lg overflow-hidden border border-slate-700">
            <AdvancedTradeLayout defaultSymbol="BTCUSDT" />
          </div>
        )}
        
        {selectedTab === 'journal' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Trade Journal</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your trade journal will be integrated here.</p>
              <Button className="mt-4" onClick={() => setSelectedTab('trading')}>
                Return to Trading Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
        
        {selectedTab === 'analysis' && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Advanced market analysis tools will be available here.</p>
              <Button className="mt-4" onClick={() => setSelectedTab('trading')}>
                Return to Trading Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 rounded-full p-2 mt-1">
              <ArrowUpRightFromCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-200 mb-1">Pro Tip: Advanced Charting Tools</h3>
              <p className="text-sm text-blue-300">
                Use the sidebar tools to access Trading Signals, Market News, and the Smart Trade Panel. 
                The Smart Trade Panel can be undocked and moved freely around the screen for a customized workspace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PopupContainer>
  );
}