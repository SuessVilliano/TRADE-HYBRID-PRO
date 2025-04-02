import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Copy, Bell, Info, Star } from 'lucide-react';
import { PopupContainer } from '@/components/ui/popup-container';
import { CopyTradePanel } from '@/components/ui/copy-trade-panel';
import { SignalsList } from '@/components/ui/signals-list';

export default function CopyTradingPage() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <Helmet>
        <title>Copy Trading | Trade Hybrid</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Copy Trading</h1>
          <p className="text-muted-foreground mt-1">
            Follow top traders and automatically copy their trades
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="traders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="traders" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Signal Providers
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Recent Signals
            <Badge variant="outline" className="ml-1 bg-primary/20 text-primary">
              Live
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="traders" className="mt-0">
          <PopupContainer padding>
            <CopyTradePanel />
          </PopupContainer>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="space-y-4 text-slate-300">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                About Copy Trading
              </h2>
              
              <p>
                Trade Hybrid's Copy Trading feature allows you to automatically replicate the trades of successful traders in real-time. 
                Choose from a curated list of verified signal providers and set your risk preferences.
              </p>
              
              <div className="mt-6 bg-purple-900/30 border border-purple-400 p-4 rounded-md">
                <h3 className="font-bold text-purple-300 mb-2">Key Features</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 mb-4">
                  <li><span className="font-semibold">Real-time Execution</span> - Trades are copied instantly when the signal provider executes</li>
                  <li><span className="font-semibold">Risk Management</span> - Set maximum exposure and risk multipliers for each copied trader</li>
                  <li><span className="font-semibold">Performance Metrics</span> - View detailed statistics for each signal provider</li>
                  <li><span className="font-semibold">Customizable Settings</span> - Choose which aspects of trades to copy (entry, stop loss, take profit)</li>
                  <li><span className="font-semibold">Multiple Brokers</span> - Works with your connected broker accounts</li>
                </ul>
              </div>
              
              <div className="mt-4 bg-primary/10 border border-primary/30 p-4 rounded-md">
                <h3 className="font-bold text-primary mb-2">How to Get Started</h3>
                <ol className="list-decimal pl-5 space-y-2 mb-3">
                  <li>Browse the list of signal providers and review their performance metrics</li>
                  <li>Select a provider that matches your trading style and risk tolerance</li>
                  <li>Configure your copy trading settings (risk level, maximum exposure)</li>
                  <li>Start copy trading and monitor your positions in your trading dashboard</li>
                </ol>
              </div>
              
              <div className="mt-6 bg-purple-900/30 border border-purple-800 p-4 rounded-md">
                <h3 className="font-bold text-purple-300 mb-2">Important Disclaimer</h3>
                <p className="text-sm">
                  Copy trading involves risk and past performance is not indicative of future results. Only invest what you can afford to lose and always use proper risk management. Copy trading is not suitable for all investors.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="signals" className="mt-0">
          <PopupContainer padding>
            <SignalsList />
          </PopupContainer>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="space-y-4 text-slate-300">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                About Trading Signals
              </h2>
              
              <p>
                Trading signals are notifications with actionable trade ideas generated by our signal providers. 
                Each signal includes entry price, stop loss, take profit levels, and other important details.
              </p>
              
              <div className="mt-6 bg-purple-900/30 border border-purple-400 p-4 rounded-md">
                <h3 className="font-bold text-purple-300 mb-2">How To Use Signals</h3>
                <ol className="list-decimal pl-5 space-y-2 text-slate-300 mb-4">
                  <li>
                    <span className="font-semibold">Review Signal Details</span>
                    <p className="text-sm mt-1">Examine the entry price, stop loss, take profit, and other parameters carefully.</p>
                  </li>
                  <li>
                    <span className="font-semibold">Copy to Trading Panel</span>
                    <p className="text-sm mt-1">Use the "Copy to Panel" button to automatically fill your trade panel with the signal details.</p>
                  </li>
                  <li>
                    <span className="font-semibold">Execute or Automate</span>
                    <p className="text-sm mt-1">Execute the trade manually or set up copy trading to automate the process.</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}