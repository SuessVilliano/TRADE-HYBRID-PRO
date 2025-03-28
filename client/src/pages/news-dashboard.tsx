import { useState } from "react";
import { TradingViewTools } from "@/components/ui/trading-view-tools";
import { EnhancedNewsFeed } from "@/components/ui/enhanced-news-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Globe, BarChart, Layers } from "lucide-react";

export default function NewsDashboard() {
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  
  const regions = [
    { id: "all", name: "All Regions" },
    { id: "us", name: "United States" },
    { id: "europe", name: "Europe" },
    { id: "asia", name: "Asia Pacific" },
    { id: "americas", name: "Americas" },
    { id: "emerging", name: "Emerging Markets" }
  ];
  
  return (
    <>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial News Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time market news, economic calendar, and RSS feeds from top financial sources
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <Label htmlFor="region">Region:</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region" className="w-36">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="timeframe">Range:</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="timeframe" className="w-24">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1 Day</SelectItem>
                  <SelectItem value="1W">1 Week</SelectItem>
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                <TradingViewTools height="400px" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Market Scanner & Heat Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="screener" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="screener">Scanner</TabsTrigger>
                    <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
                  </TabsList>
                  <TabsContent value="screener">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden h-[400px]">
                      <div
                        id="tv_screener_widget_alt"
                        style={{ height: "100%" }}
                        className="flex items-center justify-center"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="heatmap">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden h-[400px]">
                      <div
                        id="tv_heatmap_widget_alt"
                        style={{ height: "100%" }}
                        className="flex items-center justify-center"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
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
                <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden h-[300px]">
                  <div className="text-center py-4 px-6">
                    <p className="text-sm text-muted-foreground">
                      This widget displays AI-powered market analysis based on news sentiment, technical indicators, and fundamental data.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}