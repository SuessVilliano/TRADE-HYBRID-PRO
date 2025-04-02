import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DraggableTradingDashboard } from '../components/ui/draggable-trading-dashboard';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Share2, Star, Bookmark, FileQuestion, ArrowUpRightFromCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PopupContainer } from '../components/ui/popup-container';

export default function TradingDashboard() {
  const [selectedTab, setSelectedTab] = useState('trading');
  
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
  
  return (
    <PopupContainer className="min-h-[calc(100vh-130px)] bg-slate-900 text-white p-4 md:p-6" padding>
      <Helmet>
        <title>Trading Dashboard | Trade Hybrid</title>
      </Helmet>
      
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
            <p className="text-slate-400 text-sm">
              Customizable trading workspace with drag-and-drop widgets
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
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
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
          <DraggableTradingDashboard defaultSymbol="BTCUSDT" />
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
              <h3 className="font-medium text-blue-200 mb-1">Pro Tip: Customize Your Dashboard</h3>
              <p className="text-sm text-blue-300">
                Click "Edit Layout" to rearrange widgets by dragging them. Add new widgets with the "Add Widget" button. 
                Your layout will be automatically saved for your next session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PopupContainer>
  );
}