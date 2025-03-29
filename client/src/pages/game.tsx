import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TradeRunner as TradeRunner2D } from '@/components/ui/trade-runner';
import TradeRunner3D from '@/components/games/TradeRunner';
import { TradeRunnerBrowser } from '@/components/ui/trade-runner-browser';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2, Layout } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTradingTips } from '@/lib/stores/useTradingTips';

export default function GamePage() {
  const location = useLocation();
  const { showTip } = useTradingTips();
  
  // Show a game-specific tip when the page loads
  useEffect(() => {
    // Delay the tip to give the page time to load
    const timer = setTimeout(() => {
      showTip('general', 'beginner');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [showTip]);
  
  return <GameContent />;
}

function GameContent() {
  const [gameMode, setGameMode] = useState<'3d' | '2d' | 'browser'>('3d');
  const [fullscreen, setFullscreen] = useState(false);
  const [showTradeRunnerBrowser, setShowTradeRunnerBrowser] = useState(false);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const toggleTradeRunnerBrowser = () => {
    setShowTradeRunnerBrowser(!showTradeRunnerBrowser);
  };

  const handleCloseTradeRunnerBrowser = () => {
    setShowTradeRunnerBrowser(false);
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-black ${fullscreen ? 'p-0' : 'p-4'}`}>
      {!fullscreen && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="outline" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main App
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-cyan-400">Trade Runner</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tabs value={gameMode} onValueChange={(value) => setGameMode(value as '3d' | '2d' | 'browser')}>
              <TabsList>
                <TabsTrigger value="3d">3D Mode</TabsTrigger>
                <TabsTrigger value="2d">2D Mode</TabsTrigger>
                <TabsTrigger value="browser">Browser Mode</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {gameMode !== 'browser' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleFullscreen}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            
            {gameMode !== 'browser' && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTradeRunnerBrowser}
                className="bg-purple-900/50 border-purple-700 hover:bg-purple-800/70"
              >
                <Layout className="h-4 w-4 mr-2" />
                Open Trade Runner
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 flex justify-center">
        <div className={`${fullscreen ? 'w-full h-full' : 'w-full max-w-6xl'}`}>
          {gameMode === '3d' ? (
            <div className="w-full h-full">
              <TradeRunner3D />
            </div>
          ) : gameMode === '2d' ? (
            <TradeRunner2D className="w-full shadow-lg" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TradeRunnerBrowser 
                initialHeight={Math.min(700, window.innerHeight - 150)} 
                initialWidth={Math.min(1000, window.innerWidth - 80)}
                isMinimizable={false}
                isResizable={true}
                className="w-full h-full"
              />
            </div>
          )}
          
          {fullscreen && (
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2 bg-black/50"
              onClick={toggleFullscreen}
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </Button>
          )}
          
          {/* Overlay TradeRunnerBrowser when button is clicked */}
          {showTradeRunnerBrowser && gameMode !== 'browser' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <TradeRunnerBrowser 
                onClose={handleCloseTradeRunnerBrowser}
                initialHeight={Math.min(700, window.innerHeight - 150)} 
                initialWidth={Math.min(1000, window.innerWidth - 100)}
                isMinimizable={true}
                isResizable={true}
              />
            </div>
          )}
        </div>
      </div>
      
      {!fullscreen && (
        <footer className="mt-auto pt-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Trade Hybrid</p>
        </footer>
      )}
    </div>
  );
}