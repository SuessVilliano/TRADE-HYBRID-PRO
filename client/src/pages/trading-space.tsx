import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scene from "@/components/game/Scene";
import { HUD } from "@/components/ui/hud";
import { Button } from "@/components/ui/button";
import { MarketChart } from "@/components/ui/market-chart";
import { NewsFeed } from "@/components/ui/news-feed";
import { TradingInterface } from "@/components/ui/trading-interface";
import { TradeJournal } from "@/components/ui/trade-journal";
import { Leaderboard } from "@/components/ui/leaderboard";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { ArrowLeft, LayoutGrid, Maximize2, Minimize2, X } from "lucide-react";
import { useMarketData } from "@/lib/stores/useMarketData";
import { useNews } from "@/lib/stores/useNews";
import { useTrader } from "@/lib/stores/useTrader";
import { useLeaderboard } from "@/lib/stores/useLeaderboard";
import { useBots } from "@/lib/stores/useBots";
import { useAudio } from "@/lib/stores/useAudio";

export default function TradingSpace() {
  const [activePanel, setActivePanel] = useState<string>("market");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  
  // Initialize data stores
  const { fetchMarketData } = useMarketData();
  const { fetchNews } = useNews();
  const { fetchTrades } = useTrader();
  const { fetchLeaderboard } = useLeaderboard();
  const { fetchBots } = useBots();
  
  // Load initial data
  useEffect(() => {
    fetchMarketData("BTCUSD");
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
  }, [fetchMarketData, fetchNews, fetchTrades, fetchLeaderboard, fetchBots]);
  
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
  
  const renderActivePanel = () => {
    switch (activePanel) {
      case "market":
        return <MarketChart className="h-full" />;
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
      <div className="absolute left-0 right-0 top-0 z-10 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Trade Hybrid Metaverse</h1>
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
          className="absolute -left-10 top-4 bg-background/80 backdrop-blur"
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        >
          {isPanelExpanded ? (
            <X className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
        
        {isPanelExpanded ? (
          <div className="flex h-full flex-col bg-background/80">
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
                variant={activePanel === "leaderboard" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("leaderboard")}
              >
                Leaders
              </Button>
              <Button
                variant={activePanel === "assistant" ? "default" : "ghost"}
                className="flex-1 rounded-none"
                onClick={() => setActivePanel("assistant")}
              >
                AI
              </Button>
            </div>
            
            {/* Active Panel Content */}
            <div className="flex-1 overflow-auto p-4">
              {renderActivePanel()}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-start space-y-4 bg-background/80 py-4">
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
                setActivePanel("leaderboard");
                setIsPanelExpanded(true);
              }}
            >
              L
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActivePanel("assistant");
                setIsPanelExpanded(true);
              }}
            >
              AI
            </Button>
          </div>
        )}
      </div>
      
      {/* Game HUD */}
      <HUD className="z-20" />
    </div>
  );
}
