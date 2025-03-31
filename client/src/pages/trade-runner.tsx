import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PopupContainer } from '../components/ui/popup-container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';
import TradeRunner from '../components/game/TradeRunner';

export default function GameCenterPage() {
  const [showTradeRunner, setShowTradeRunner] = useState(false);

  function openTradeRunnerWindow() {
    // Use a state in this component to show an iframe
    setShowTradeRunner(true);
  }
  
  function closeTradeRunnerWindow() {
    setShowTradeRunner(false);
  }

  return (
    <div className="container mx-auto py-4 px-4 min-h-screen">
      {/* Trade Runner popup */}
      {showTradeRunner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col border border-slate-700">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-lg font-medium text-white">Trade Runner</h3>
              <Button variant="ghost" size="sm" onClick={closeTradeRunnerWindow} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* URL display bar */}
            <div className="bg-slate-800 border-b border-slate-700 px-3 py-2 flex items-center">
              <div className="flex-1 bg-slate-900 rounded-md px-3 py-1.5 text-sm text-slate-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
                <span className="truncate">https://pro.tradehybrid.club/51411/traderunners</span>
              </div>
            </div>
            
            <div className="flex-1 p-0 overflow-hidden">
              <iframe
                src="https://pro.tradehybrid.club/51411/traderunners"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:space-x-6 w-full">
        <div className="w-full lg:w-64 flex-shrink-0 bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Game Center</h3>
          <nav className="space-y-1">
            <Link to="/trade-runner" className="flex items-center px-3 py-2 text-white bg-blue-600 rounded-md">
              <span className="ml-2">Trading Games</span>
            </Link>
            <div className="ml-4 mt-2 space-y-1">
              <button onClick={openTradeRunnerWindow} className="w-full text-left px-3 py-2 text-white hover:bg-slate-700 rounded-md">
                Trade Runner
              </button>
            </div>
            <Link to="/educational-games" className="flex items-center px-3 py-2 text-white hover:bg-slate-700 rounded-md">
              <span className="ml-2">Educational Games</span>
            </Link>
            <div className="ml-4 mt-2">
              <Link to="/trade-simulator" className="block px-3 py-2 text-white hover:bg-slate-700 rounded-md">
                Trade Simulator
              </Link>
            </div>
          </nav>
        </div>

        <div className="flex-1">
          <PopupContainer padding>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="info">About Game Center</TabsTrigger>
                <TabsTrigger value="tools">Trading Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="h-full">
                <div className="prose prose-invert max-w-none">
                  <h2>Welcome to the Game Center</h2>
                  <p>Choose from our selection of trading games and educational tools to enhance your trading skills.</p>
                  <ul>
                    <li>Trade Runner - Practice real-time trading scenarios</li>
                    <li>Trade Simulator - Learn trading basics in a risk-free environment</li>
                  </ul>
                  
                  <div className="mt-8">
                    <Button onClick={openTradeRunnerWindow} size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                      Launch Trade Runner
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Add trading tools here */}
                </div>
              </TabsContent>
            </Tabs>
          </PopupContainer>
        </div>
      </div>
    </div>
  );
}