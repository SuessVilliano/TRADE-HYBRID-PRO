import React, { useState, useEffect } from 'react';
import { TradingDashboardLayout } from '@/components/ui/trading-dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedNewsFeed } from "@/components/ui/enhanced-news-feed";
import { TradingViewTools } from "@/components/ui/trading-view-tools";
import { Globe, Calendar, BarChart, Layers } from "lucide-react";

export default function NewsView() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay to ensure components are properly initialized
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <TradingDashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-300">Loading news dashboard...</p>
          </div>
        </div>
      </TradingDashboardLayout>
    );
  }

  return (
    <TradingDashboardLayout>
      <div className="px-6 py-4 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Financial News Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time market news, economic calendar, and RSS feeds from top financial sources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Economic Calendar & Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Economic Calendar</h3>
                    <p className="text-muted-foreground mb-4">View upcoming economic events and market releases</p>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground">Apr 4</p>
                        <p className="font-medium">US Non-Farm Payrolls</p>
                        <p className="text-xs text-amber-400">High Impact</p>
                      </div>
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground">Apr 5</p>
                        <p className="font-medium">US Unemployment Rate</p>
                        <p className="text-xs text-amber-400">High Impact</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Market Scanner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden h-[300px] p-4">
                  <h3 className="text-md font-medium mb-3">Top Movers</h3>
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 text-xs font-medium text-slate-400">Symbol</th>
                          <th className="text-right py-2 text-xs font-medium text-slate-400">Price</th>
                          <th className="text-right py-2 text-xs font-medium text-slate-400">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800">
                          <td className="py-3 text-sm">AAPL</td>
                          <td className="py-3 text-sm text-right">168.82</td>
                          <td className="py-3 text-sm text-right text-green-400">+2.45%</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="py-3 text-sm">MSFT</td>
                          <td className="py-3 text-sm text-right">421.90</td>
                          <td className="py-3 text-sm text-right text-green-400">+1.28%</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="py-3 text-sm">GOOGL</td>
                          <td className="py-3 text-sm text-right">153.94</td>
                          <td className="py-3 text-sm text-right text-green-400">+0.89%</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="py-3 text-sm">META</td>
                          <td className="py-3 text-sm text-right">487.52</td>
                          <td className="py-3 text-sm text-right text-red-400">-0.54%</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-sm">TSLA</td>
                          <td className="py-3 text-sm text-right">175.34</td>
                          <td className="py-3 text-sm text-right text-red-400">-1.12%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  News Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <EnhancedNewsFeed />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    AI-powered market analysis based on news sentiment and technical indicators
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Sentiment Analysis</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-700 rounded-full">
                          <div className="h-full rounded-full bg-green-500" style={{ width: "65%" }} />
                        </div>
                        <span className="text-sm">65%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Bullish sentiment</p>
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Market Mood</h3>
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 rounded-full bg-amber-500 mb-1"></div>
                        <p className="text-xs">Cautiously Optimistic</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TradingDashboardLayout>
  );
}