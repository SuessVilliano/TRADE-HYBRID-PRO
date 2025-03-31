import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PopupContainer } from '@/components/ui/popup-container';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCw, ExternalLink, Maximize, Minimize } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TradeRunnerWebBrowserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [url, setUrl] = useState('https://pro.tradehybrid.club/51411/traderunners');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('TradeRunnerBrowser: Component mounted');
    
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      // Handle any messages from the iframe if needed
      console.log('Received message from iframe:', event.data);
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleIframeLoad = () => {
    console.log('TradeRunnerBrowser: Iframe loaded');
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="container mx-auto py-4 px-4 min-h-screen">
      <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:space-x-6 w-full">
        <div className="w-full lg:w-64 flex-shrink-0 bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Game Center</h3>
          <nav className="space-y-1">
            <Link to="/trade-runner" className="flex items-center px-3 py-2 text-white hover:bg-slate-700 rounded-md">
              <span className="ml-2">Trade Runner</span>
            </Link>
            <Link to="/trade-runner-browser" className="flex items-center px-3 py-2 text-white bg-blue-600 rounded-md">
              <span className="ml-2">Trade Runner</span>
            </Link>
            <Link to="/trade-simulator" className="flex items-center px-3 py-2 text-white hover:bg-slate-700 rounded-md">
              <span className="ml-2">Trade Simulator</span>
            </Link>
            <Link to="/educational-games" className="flex items-center px-3 py-2 text-white hover:bg-slate-700 rounded-md">
              <span className="ml-2">Educational Games</span>
            </Link>
          </nav>
        </div>
        
        <div className="flex-1">
          <PopupContainer padding>
            <Tabs defaultValue="browser" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="browser">Trade Runner</TabsTrigger>
                <TabsTrigger value="info">About Trade Runner</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browser" className="h-full">
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <div className="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 p-0">
                        <RefreshCw size={16} />
                      </Button>
                      <div className="px-3 py-1.5 bg-slate-700 rounded flex-1 max-w-xs md:max-w-md text-sm">
                        {url}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <ExternalLink size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                        <div className="text-center">
                          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-slate-300">Loading Trade Runner...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      ref={iframeRef}
                      src={url}
                      className="w-full h-full border-0"
                      onLoad={handleIframeLoad}
                      title="Trade Runner Application"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="info">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About Trade Runner</h2>
                  <p className="mb-4">
                    Trade Runner allows you to access the full Trade Runner application directly within 
                    the Trade Hybrid platform. This provides a seamless experience without 
                    having to switch between different applications.
                  </p>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Secure sandboxed environment for running the Trade Runner application</li>
                    <li>Integrated with your Trade Hybrid account and wallet</li>
                    <li>Full-screen mode for immersive gameplay</li>
                    <li>Quick access to all game features and controls</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">How To Use</h3>
                  <p className="mb-4">
                    Simply navigate through the Trade Runner interface just as you would with the standalone version. 
                    All features and functionality are preserved while maintaining integration with the Trade Hybrid 
                    ecosystem.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </PopupContainer>
        </div>
      </div>
    </div>
  );
}