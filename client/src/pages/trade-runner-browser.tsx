import React from 'react';
import { PopupContainer } from '@/components/ui/popup-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { TradeRunnerWebBrowser } from '@/components/ui/trade-runner-web-browser';

export default function TradeRunnerWebBrowserPage() {
  return (
    <div className="container mx-auto py-4 px-4 min-h-screen">
      <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:space-x-6 w-full">
        <div className="w-full lg:w-64 flex-shrink-0 bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Game Center</h3>
          <nav className="space-y-1">
            <Link to="/trade-runner-browser" className="flex items-center px-3 py-2 text-white bg-blue-600 rounded-md">
              <span className="ml-2">Trade Runner</span>
            </Link>
            <Link to="/bulls-vs-bears" className="flex items-center px-3 py-2 text-white hover:bg-slate-700 rounded-md">
              <span className="ml-2">Bulls vs Bears</span>
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
                <TabsTrigger value="browser">Web App</TabsTrigger>
                <TabsTrigger value="info">About Trade Runner</TabsTrigger>
                <TabsTrigger value="tools">Trading Tools</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browser" className="h-full">
                <TradeRunnerWebBrowser className="w-full" />
              </TabsContent>
              
              <TabsContent value="info">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About Trade Runner</h2>
                  <p className="mb-4">Trade Runner is a gamified trading experience that helps you learn trading concepts while having fun. The app provides a realistic trading simulation with game elements to make learning engaging.</p>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Key Features</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Real-time market data visualization</li>
                    <li>Trading challenges with leaderboards</li>
                    <li>Educational missions to improve trading skills</li>
                    <li>Risk-free practice with virtual currency</li>
                    <li>Social features to compete with friends</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">How To Use</h3>
                  <p className="mb-4">Access Trade Runner directly in your browser through the Web App tab. The application is optimized for both desktop and mobile use, providing a seamless experience across devices.</p>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Integration with Trade Hybrid</h3>
                  <p>Trade Runner is fully integrated with the Trade Hybrid platform. Your progress, achievements, and learning path are synchronized between both applications, providing a unified trading education experience.</p>
                </Card>
              </TabsContent>
              
              <TabsContent value="tools">
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Trading Tools</h2>
                  <p className="mb-4">Trade Runner offers several powerful tools to enhance your trading experience:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                      <h3 className="font-semibold text-lg mb-2">Pattern Recognition</h3>
                      <p>Automatically identify common chart patterns to improve trade entry and exit points.</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                      <h3 className="font-semibold text-lg mb-2">Risk Calculator</h3>
                      <p>Calculate position size based on your risk tolerance and account size.</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                      <h3 className="font-semibold text-lg mb-2">Trading Journal</h3>
                      <p>Track your trades and analyze performance with detailed metrics.</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                      <h3 className="font-semibold text-lg mb-2">Market Scanner</h3>
                      <p>Find trading opportunities based on your preferred strategies and indicators.</p>
                    </div>
                  </div>
                  
                  <p className="mt-6">Access these tools directly in the Trade Runner application through the Web App tab.</p>
                </Card>
              </TabsContent>
            </Tabs>
          </PopupContainer>
        </div>
      </div>
    </div>
  );
}