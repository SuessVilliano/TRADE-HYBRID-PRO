import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Home, 
  X, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  Bookmark,
  Settings
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmbeddedBrowserProps {
  defaultUrl?: string;
  height?: string | number;
  className?: string;
}

/**
 * An embedded web browser component that allows users to browse websites within the application
 * Includes basic browser controls like navigation, refresh, and bookmarks
 */
export function EmbeddedBrowser({ 
  defaultUrl = "https://pro.tradingview.com/chart/", 
  height = 600,
  className = ""
}: EmbeddedBrowserProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [title, setTitle] = useState('Embedded Browser');
  const [bookmarks, setBookmarks] = useState<{ title: string; url: string }[]>([
    { title: 'TradingView', url: 'https://pro.tradingview.com/chart/' },
    { title: 'MetaTrader Web', url: 'https://trade.mql5.com/trade' },
    { title: 'Interactive Brokers', url: 'https://www.interactivebrokers.com/portal' },
    { title: 'cTrader', url: 'https://ctrader.com/' },
  ]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Navigate to new URL when submitted
  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add https:// if not present and not local
    let navigateUrl = url;
    if (!navigateUrl.startsWith('http') && !navigateUrl.startsWith('localhost')) {
      navigateUrl = `https://${navigateUrl}`;
      setUrl(navigateUrl);
    }
    
    setCurrentUrl(navigateUrl);
    setIsLoading(true);
  };
  
  // Go back in history
  const handleBack = () => {
    if (iframeRef.current) {
      try {
        // This will work only for same-origin frames due to security restrictions
        iframeRef.current.contentWindow?.history.back();
      } catch (error) {
        console.error("Could not navigate back:", error);
      }
    }
  };
  
  // Go forward in history
  const handleForward = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.forward();
      } catch (error) {
        console.error("Could not navigate forward:", error);
      }
    }
  };
  
  // Refresh the current page
  const handleRefresh = () => {
    setIsLoading(true);
    // Force refresh by setting to empty and back
    setCurrentUrl('');
    setTimeout(() => {
      setCurrentUrl(url);
    }, 100);
  };
  
  // Go to home URL
  const handleHome = () => {
    setUrl(defaultUrl);
    setCurrentUrl(defaultUrl);
    setIsLoading(true);
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Add current page to bookmarks
  const addBookmark = () => {
    const newBookmark = { title: title || url, url: currentUrl };
    setBookmarks([...bookmarks, newBookmark]);
  };
  
  // Load a bookmark
  const loadBookmark = (bookmarkUrl: string) => {
    setUrl(bookmarkUrl);
    setCurrentUrl(bookmarkUrl);
    setIsLoading(true);
  };
  
  // Handle iframe load completion
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Try to get the title, but this will only work for same-origin frames
    try {
      if (iframeRef.current?.contentDocument?.title) {
        setTitle(iframeRef.current.contentDocument.title);
      }
    } catch (error) {
      // Ignore cross-origin errors
      setTitle(url);
    }
  };

  // Open in new tab
  const openInNewTab = () => {
    window.open(currentUrl, '_blank');
  };
  
  return (
    <Card className={`w-full ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Trading Browser</CardTitle>
          <div className="flex items-center space-x-1">
            {isFullScreen ? (
              <Button variant="ghost" size="icon" onClick={toggleFullScreen} title="Exit Full Screen">
                <Minimize2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleFullScreen} title="Full Screen">
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={openInNewTab} title="Open in New Tab">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="mt-2">
          Access your trading platforms and broker websites
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBack} 
              title="Back"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleForward} 
              title="Forward"
              disabled={isLoading}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              title="Refresh"
              disabled={isLoading}
              className={isLoading ? "animate-spin" : ""}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleHome} 
              title="Home"
              disabled={isLoading}
            >
              <Home className="h-4 w-4" />
            </Button>
            
            <form onSubmit={handleNavigate} className="flex-1 flex">
              <Input
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="secondary" 
                className="ml-1" 
                disabled={isLoading}
              >
                Go
              </Button>
            </form>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={addBookmark} 
              title="Bookmark"
              disabled={isLoading}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Bookmarks Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {bookmarks.map((bookmark, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs whitespace-nowrap"
                onClick={() => loadBookmark(bookmark.url)}
              >
                {bookmark.title}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      
      <div 
        className="relative overflow-hidden"
        style={{ height: isFullScreen ? 'calc(100vh - 150px)' : typeof height === 'number' ? `${height}px` : height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {currentUrl && (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="fullscreen"
            title="Embedded Browser"
          />
        )}
      </div>
      
      <CardFooter className="flex justify-between p-2 text-xs text-muted-foreground">
        <div>
          {title}
        </div>
        <div>
          {isLoading ? 'Loading...' : 'Ready'}
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Multi-tab browser component that allows users to browse multiple sites simultaneously
 */
export function MultiTabBrowser({ 
  defaultTabs = [
    { title: 'TradingView', url: 'https://pro.tradingview.com/chart/' },
    { title: 'MetaTrader', url: 'https://trade.mql5.com/trade' }
  ],
  height = 700,
  className = ""
}: {
  defaultTabs?: { title: string; url: string }[];
  height?: string | number;
  className?: string;
}) {
  const [tabs, setTabs] = useState(defaultTabs);
  const [activeTab, setActiveTab] = useState('0');
  
  // Add a new tab
  const addTab = () => {
    const newTabIndex = tabs.length;
    setTabs([...tabs, { title: 'New Tab', url: 'about:blank' }]);
    setActiveTab(newTabIndex.toString());
  };
  
  // Close a tab
  const closeTab = (index: number) => {
    if (tabs.length <= 1) return; // Don't close the last tab
    
    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);
    
    // If we closed the active tab, activate the previous one
    if (parseInt(activeTab) === index) {
      const newActiveTab = Math.max(0, index - 1);
      setActiveTab(newActiveTab.toString());
    } else if (parseInt(activeTab) > index) {
      // If we closed a tab before the active one, adjust the active tab index
      setActiveTab((parseInt(activeTab) - 1).toString());
    }
  };
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Multi-Platform Browser</CardTitle>
          <Button variant="outline" size="sm" onClick={addTab}>
            New Tab
          </Button>
        </div>
        <CardDescription className="my-2">
          Access multiple trading platforms simultaneously
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center border-b px-3">
          <TabsList className="h-9 bg-transparent">
            {tabs.map((tab, index) => (
              <div key={index} className="flex items-center">
                <TabsTrigger 
                  value={index.toString()}
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none px-3 h-8"
                >
                  {tab.title}
                </TabsTrigger>
                {tabs.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </TabsList>
        </div>
        
        {tabs.map((tab, index) => (
          <TabsContent key={index} value={index.toString()} className="mt-0 border-none p-0">
            <EmbeddedBrowser 
              defaultUrl={tab.url} 
              height={height} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}