import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Scene from "@/components/game/Scene";
import { HUD } from "@/components/ui/hud";
import { Button } from "@/components/ui/button";
import { MarketChart } from "@/components/ui/market-chart";
import { NewsFeed } from "@/components/ui/news-feed";
import { TradingInterface } from "@/components/ui/trading-interface";
import { TradeJournal } from "@/components/ui/trade-journal";
import { Leaderboard } from "@/components/ui/leaderboard";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { SignalsList } from "@/components/ui/signals-list";
import { ArrowLeft, LayoutGrid, Maximize2, Minimize2, X, Info, Sparkles, Bot, BookOpen, BarChart2, Activity } from "lucide-react";
import { useMarketData } from "@/lib/stores/useMarketData";
import { useNews } from "@/lib/stores/useNews";
import { useTrader } from "@/lib/stores/useTrader";
import { useLeaderboard } from "@/lib/stores/useLeaderboard";
import { useBots } from "@/lib/stores/useBots";
import { useAudio } from "@/lib/stores/useAudio";
import { WebApp } from "@/components/ui/web-app";
import { useWebApp } from "@/lib/stores/useWebApp";

// Map of location parameters to appropriate default panels
const LOCATION_TO_PANEL = {
  crypto: "market",
  forex: "market",
  stocks: "market",
  signals: "signals",
  tradehouse: "assistant"
};

// Map of location parameters to appropriate market symbols
const LOCATION_TO_SYMBOL = {
  crypto: "BTCUSD",
  forex: "EURUSD",
  stocks: "AAPL",
  signals: "BTCUSD",
  tradehouse: "BTCUSD"
};

export default function TradingSpace() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const locationParam = searchParams.get('location') || 'tradehouse';

  // The additional panels we offer
  const [activePanel, setActivePanel] = useState<string>(
    LOCATION_TO_PANEL[locationParam as keyof typeof LOCATION_TO_PANEL] || "market"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(window.innerWidth > 768);
  const [showAITools, setShowAITools] = useState(false);
  
  // Initialize data stores
  const { fetchMarketData } = useMarketData();
  const { fetchNews } = useNews();
  const { fetchTrades } = useTrader();
  const { fetchLeaderboard } = useLeaderboard();
  const { fetchBots } = useBots();
  const { openWebApp } = useWebApp();
  
  // Load initial data
  useEffect(() => {
    // Get the appropriate symbol for this location
    const symbol = LOCATION_TO_SYMBOL[locationParam as keyof typeof LOCATION_TO_SYMBOL] || "BTCUSD";
    
    fetchMarketData(symbol);
    fetchNews();
    fetchTrades();
    fetchLeaderboard();
    fetchBots();
    
    // Start background music when entering trading space
    const { backgroundMusic, isMuted } = useAudio.getState();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
    
    // Clean up on unmount
    return () => {
      const { backgroundMusic } = useAudio.getState();
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    };
  }, [fetchMarketData, fetchNews, fetchTrades, fetchLeaderboard, fetchBots, locationParam]);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  // Get location-specific title
  const getLocationTitle = () => {
    switch (locationParam) {
      case 'crypto':
        return 'Crypto Trading Center';
      case 'forex':
        return 'Forex Trading Floor';
      case 'stocks':
        return 'Stock Market Exchange';
      case 'signals':
        return 'Signal Towers Command Center';
      case 'tradehouse':
      default:
        return 'Trade House Hub';
    }
  };
  
  const renderActivePanel = () => {
    switch (activePanel) {
      case "market":
        return <MarketChart className="h-full" symbol={LOCATION_TO_SYMBOL[locationParam as keyof typeof LOCATION_TO_SYMBOL]} />;
      case "news":
        return <NewsFeed className="h-full" />;
      case "trade":
        return <TradingInterface className="h-full" />;
      case "journal":
        return <TradeJournal className="h-full" />;
      case "leaderboard":
        return <Leaderboard className="h-full" />;
      case "assistant":
        return <AIAssistant className="h-full" />;
      case "signals":
        return <SignalsList className="h-full" />;
      case "bots":
        return (
          <div className="h-full flex flex-col space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-2">AI Trading Bots</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Create and manage AI-powered trading bots that can automate your trading strategies.</p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="font-medium flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-500" />
                    <span>AI Strategy Builder</span>
                  </h3>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">Build trading strategies using natural language and AI assistance</p>
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => openWebApp("https://app.tradehybrid.co/ai-builder")}>
                    Open Builder
                  </Button>
                </div>
                
                <div className="border border-green-200 dark:border-green-800 rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bot size={16} className="text-green-500" />
                    <span>Bot Management</span>
                  </h3>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">Monitor and control your active trading bots</p>
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => openWebApp("https://app.tradehybrid.co/bots")}>
                    Manage Bots
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-2">AI Trading Tools</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                    <Activity size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Market Sentiment Analysis</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered analysis of market sentiment from social media and news</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <BarChart2 size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Pattern Recognition</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI detection of chart patterns and trading opportunities</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <BookOpen size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Trading Journal Analysis</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI insights on your trading patterns and improvement suggestions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <MarketChart className="h-full" />;
    }
  };
  
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene showStats={false} />
      </div>
      
      {/* Top Navigation Bar */}
      <div className="absolute left-0 right-0 top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">{getLocationTitle()}</h1>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 h-7 hidden md:flex items-center gap-1"
              onClick={() => setShowAITools(!showAITools)}
            >
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-xs">AI Tools</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* AI Tools Panel */}
      {showAITools && (
        <div className="absolute left-4 top-16 z-20 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500" />
              AI Trading Tools
            </h3>
            <Button 
              variant="ghost" 
              size="icon"  
              className="h-6 w-6"
              onClick={() => setShowAITools(false)}
            >
              <X size={14} />
            </Button>
          </div>
          <div className="p-3">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left flex items-center gap-2"
                onClick={() => setActivePanel("bots")}
              >
                <Bot size={14} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="block font-medium">Trading Bots</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Create and manage AI bots</span>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left flex items-center gap-2"
                onClick={() => setActivePanel("assistant")}
              >
                <Info size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="block font-medium">Trading Assistant</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Get AI trading advice</span>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left flex items-center gap-2"
                onClick={() => setActivePanel("signals")}
              >
                <Activity size={14} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="block font-medium">AI Signals</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">AI-generated trade signals</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Side Panel */}
      <div 
        className={`absolute right-0 top-12 z-10 h-[calc(100vh-48px)] backdrop-blur transition-all duration-200 ${
          isPanelExpanded ? "w-full sm:w-2/3 md:w-1/2 lg:w-1/3" : "w-12"
        }`}
      >
        {/* Panel Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-10 top-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          {isPanelExpanded ? (
            <X className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
        
        {isPanelExpanded ? (
          <div className="flex h-full flex-col bg-white/90 dark:bg-gray-900/90">
            {/* Panel Navigation */}
            <div className="flex border-b">
              <Button
                variant={activePanel === "market" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("market")}
              >
                Market
              </Button>
              <Button
                variant={activePanel === "trade" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("trade")}
              >
                Trade
              </Button>
              <Button
                variant={activePanel === "news" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("news")}
              >
                News
              </Button>
            </div>
            
            <div className="flex border-b">
              <Button
                variant={activePanel === "journal" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("journal")}
              >
                Journal
              </Button>
              <Button
                variant={activePanel === "signals" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("signals")}
              >
                Signals
              </Button>
              <Button
                variant={activePanel === "bots" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("bots")}
              >
                Bots
              </Button>
            </div>
            
            {/* Active Panel Content */}
            <div className="flex-1 overflow-auto p-4">
              {renderActivePanel()}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-start space-y-4 bg-white/90 dark:bg-gray-900/90 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel("market");
                setIsPanelExpanded(true);
              }}
            >
              M
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel("trade");
                setIsPanelExpanded(true);
              }}
            >
              T
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel("news");
                setIsPanelExpanded(true);
              }}
            >
              N
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel("journal");
                setIsPanelExpanded(true);
              }}
            >
              J
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel("signals");
                setIsPanelExpanded(true);
              }}
            >
              S
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel("bots");
                setIsPanelExpanded(true);
              }}
            >
              B
            </Button>
          </div>
        )}
      </div>
      
      {/* Web App */}
      <WebApp />
      
      {/* Game HUD */}
      <HUD className="z-20" />
    </div>
  );
}
