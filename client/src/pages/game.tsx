import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TradeRunner as TradeRunner2D } from '@/components/ui/trade-runner';
import TradeRunner3D from '@/components/games/TradeRunner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GamePage() {
  const [gameMode, setGameMode] = useState<'3d' | '2d'>('3d');
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
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
            <Tabs value={gameMode} onValueChange={(value) => setGameMode(value as '3d' | '2d')}>
              <TabsList>
                <TabsTrigger value="3d">3D Mode</TabsTrigger>
                <TabsTrigger value="2d">2D Mode</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullscreen}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex justify-center">
        <div className={`${fullscreen ? 'w-full h-full' : 'w-full max-w-6xl'}`}>
          {gameMode === '3d' ? (
            <div className="w-full h-full">
              <TradeRunner3D />
            </div>
          ) : (
            <TradeRunner2D className="w-full shadow-lg" />
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