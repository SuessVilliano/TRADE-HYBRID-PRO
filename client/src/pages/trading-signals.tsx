import React, { useState } from 'react';
import { AiTradingSignals } from '@/components/ui/ai-trading-signals';
import { SavedSignalsPanel, CreateSignalDialog, SavedSignal } from '@/components/ui/saved-signals';
import { PopupContainer } from '@/components/ui/popup-container';
import { NotificationSettingsDialog } from '@/components/ui/notification-settings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BellPlus, BellRing, Bell, Info } from 'lucide-react';
import useLocalStorage from '@/lib/hooks/useLocalStorage';

export default function TradingSignalsPage() {
  const [apiKeyStatus] = useState(true); // Simulate API key being valid
  const [savedSignals, setSavedSignals] = useLocalStorage<SavedSignal[]>('saved-signals', []);
  
  // Handle adding a new signal
  const handleSignalCreate = (signal: SavedSignal) => {
    setSavedSignals([...savedSignals, signal]);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trading Signals</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered trade ideas with entry, stop loss and take profit levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationSettingsDialog />
          <CreateSignalDialog onSignalCreate={handleSignalCreate} />
        </div>
      </div>
      
      <Tabs defaultValue="signals" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signals" className="flex items-center gap-1.5">
            <BellRing className="h-4 w-4" />
            Live Signals
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-1.5">
            <BellPlus className="h-4 w-4" />
            Saved Signals
            <Badge variant="outline" className="ml-1 bg-primary/20 text-primary">
              New
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signals" className="mt-0">
          <PopupContainer padding>
            <AiTradingSignals apiKeyStatus={apiKeyStatus} maxSignals={25} />
          </PopupContainer>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="space-y-4 text-slate-300">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                About Trading Signals
              </h2>
              
              <p>
                Our AI Trading Signals provide actionable trading ideas across multiple markets, generated through a combination of technical analysis, fundamental data, and market sentiment processed by our advanced machine learning algorithms.
              </p>
              
              <div className="mt-6 bg-purple-900/30 border border-purple-400 p-4 rounded-md">
                <h3 className="font-bold text-purple-300 mb-2">Key Features</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 mb-4">
                  <li><span className="font-semibold">Multi-market Coverage</span> - Signals for crypto, forex, stocks, and futures markets</li>
                  <li><span className="font-semibold">Complete Trade Setup</span> - Entry, stop loss, and multiple take profit levels for each signal</li>
                  <li><span className="font-semibold">Confidence Scoring</span> - AI-driven confidence rating for each trading signal</li>
                  <li><span className="font-semibold">Risk Management</span> - Risk/reward ratios and potential profit calculations</li>
                  <li><span className="font-semibold">Push Notifications</span> - Get notified when new signals matching your criteria are generated</li>
                </ul>
              </div>
              
              <div className="mt-4 bg-primary/10 border border-primary/30 p-4 rounded-md">
                <h3 className="font-bold text-primary mb-2">New Feature: Signal Notifications</h3>
                <p className="mb-3">
                  You can now subscribe to specific trading signals and receive notifications when they are triggered or updated. Simply click the bell icon on any signal card to subscribe.
                </p>
                <p>
                  Configure your notification preferences in the settings to receive alerts via in-app notifications, browser notifications, or sound alerts.
                </p>
              </div>
              
              <div className="mt-6 bg-purple-900/30 border border-purple-800 p-4 rounded-md">
                <h3 className="font-bold text-purple-300 mb-2">Important Disclaimer</h3>
                <p className="text-sm">
                  The trading signals provided are for informational purposes only and do not constitute investment advice. Past performance is not indicative of future results. Always conduct your own analysis and consider your financial situation before making any trading decisions.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="mt-0">
          <PopupContainer padding>
            <SavedSignalsPanel />
          </PopupContainer>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="space-y-4 text-slate-300">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                About Saved Signals
              </h2>
              
              <p>
                The Saved Signals feature allows you to track and manage trading signals that you're interested in following. Subscribe to any signal from the Live Signals tab to receive notifications when price targets are reached.
              </p>
              
              <div className="mt-6 bg-purple-900/30 border border-purple-400 p-4 rounded-md">
                <h3 className="font-bold text-purple-300 mb-2">How It Works</h3>
                <ol className="list-decimal pl-5 space-y-2 text-slate-300 mb-4">
                  <li>
                    <span className="font-semibold">Subscribe to Signals</span>
                    <p className="text-sm mt-1">Click the bell icon on any trading signal to subscribe to it.</p>
                  </li>
                  <li>
                    <span className="font-semibold">Manage Notifications</span>
                    <p className="text-sm mt-1">Enable or disable notifications for individual signals or update your global notification preferences.</p>
                  </li>
                  <li>
                    <span className="font-semibold">Get Notified</span>
                    <p className="text-sm mt-1">Receive alerts when price targets (entry, stop loss, or take profit) are reached or when new updates are available.</p>
                  </li>
                  <li>
                    <span className="font-semibold">Create Custom Signals</span>
                    <p className="text-sm mt-1">You can also create your own custom signals and price alerts using the "Create Signal" button.</p>
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