import React from 'react';
import { Link } from 'react-router-dom';
import { PopupContainer } from '../components/ui/popup-container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import TradeRunner from '../components/game/TradeRunner';

function openTradeRunnerWindow() {
  const width = 1200;
  const height = 800;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  window.open('/trade-runner-browser', 'TradeRunner', 
    `width=${width},height=${height},left=${left},top=${top}`);
}

export default function GameCenterPage() {
  return (
    <div className="container mx-auto py-4 px-4 min-h-screen">
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
              <Link to="/bulls-vs-bears" className="block px-3 py-2 text-white hover:bg-slate-700 rounded-md">
                Bulls vs Bears
              </Link>
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
                    <li>Bulls vs Bears - Test your market prediction skills</li>
                    <li>Trade Simulator - Learn trading basics in a risk-free environment</li>
                  </ul>
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