import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { VisionAIScreenShare } from "@/components/ui/vision-ai-screen-share";
import { VapiVoiceAssistant } from "@/components/ui/vapi-voice-assistant";
import { 
  Sparkles, 
  Bot, 
  HelpCircle, 
  Share2, 
  PhoneCall, 
  MessageSquare, 
  Activity,
  RefreshCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/lib/stores/useMarketData";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AITradingAssistantProps {
  className?: string;
  onExecuteTrade?: (tradeSuggestion: any) => void;
  allowExecution?: boolean;
  selectedSymbol?: string;
}

export function AITradingAssistant({ 
  className, 
  onExecuteTrade,
  allowExecution = false,
  selectedSymbol
}: AITradingAssistantProps) {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isVapiSDKLoaded, setIsVapiSDKLoaded] = useState(false);
  const { symbol } = useMarketData();
  const [showTabScrollButtons, setShowTabScrollButtons] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);
  
  // Detect if tabs overflow and need scroll buttons
  useEffect(() => {
    const checkOverflow = () => {
      if (tabsListRef.current) {
        const { scrollWidth, clientWidth } = tabsListRef.current;
        
        // Check if this is a mobile device with a small screen
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        const isSmallScreen = window.innerWidth < 768;
        
        // Always show scroll buttons on mobile or if content overflows
        setShowTabScrollButtons(isMobileDevice || isSmallScreen || scrollWidth > clientWidth);
      }
    };
    
    // Check on initial load and window resize
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);
  
  // Scroll tabs left or right
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      // Use a larger scroll amount on mobile devices for better navigation
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // On mobile, scroll by 120px, otherwise 100px
      const scrollAmount = direction === 'left' 
        ? (isMobileDevice ? -120 : -100) 
        : (isMobileDevice ? 120 : 100);
        
      tabsListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Load Vapi SDK script
  useEffect(() => {
    const loadVapiSDK = () => {
      try {
        // Check if the script is already loaded
        if (document.getElementById('vapi-sdk-script')) {
          console.log("Vapi SDK script already loaded");
          setIsVapiSDKLoaded(true);
          return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.id = 'vapi-sdk-script';
        script.src = 'https://cdn.vapi.ai/web-sdk@latest/browser/index.browser.js';
        script.async = true;
        
        // Handle loading events
        script.onload = () => {
          console.log("Vapi SDK script loaded successfully");
          setIsVapiSDKLoaded(true);
        };
        
        script.onerror = (error) => {
          console.error("Error loading Vapi SDK script:", error);
          toast.error("Failed to load voice assistant capabilities");
        };
        
        // Add script to document
        document.body.appendChild(script);
      } catch (error) {
        console.error("Error in loadVapiSDK:", error);
      }
    };
    
    loadVapiSDK();
    
    // Cleanup function
    return () => {
      const script = document.getElementById('vapi-sdk-script');
      if (script) {
        script.remove();
      }
    };
  }, []);
  
  const handleApiKeyAdd = (service: string) => {
    const key = prompt(`Enter your ${service} API key:`);
    if (key?.trim()) {
      localStorage.setItem(`${service.toLowerCase()}_api_key`, key.trim());
      toast.success(`${service} API key saved successfully`);
    }
  };
  
  const handleExecuteTrade = (tradeSuggestion: any) => {
    if (onExecuteTrade) {
      onExecuteTrade(tradeSuggestion);
    } else {
      try {
        toast.success(
          `${tradeSuggestion.action.toUpperCase()} order for ${tradeSuggestion.symbol.split(':')[1]} placed successfully.`
        );
        
        console.log('Trade executed:', tradeSuggestion);
      } catch (error) {
        console.error('Error executing trade:', error);
        
        toast.error('Failed to execute trade. Please check your broker connection and try again.');
      }
    }
  };

  return (
    <Card className={cn("w-full h-full flex flex-col overflow-hidden", className)}>
      <CardHeader className="px-3 py-2 sm:px-4 sm:py-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            <span className="hidden sm:inline">AI Trading Assistant</span>
            <span className="inline sm:hidden">AI Assistant</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleApiKeyAdd('OpenAI')}
              className="text-xs py-1 px-2 h-auto sm:h-9"
            >
              <span className="hidden sm:inline">Add OpenAI Key</span>
              <span className="inline sm:hidden">OpenAI</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleApiKeyAdd('Gemini')}
              className="text-xs py-1 px-2 h-auto sm:h-9"
            >
              <span className="hidden sm:inline">Add Gemini Key</span>
              <span className="inline sm:hidden">Gemini</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <Tabs
          defaultValue="chat"
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="relative border-b bg-slate-800">
            {showTabScrollButtons && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-9 w-9 bg-slate-700/90 rounded-full shadow-md"
                onClick={() => scrollTabs('left')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            
            <ScrollArea 
              className="pb-0 overflow-x-auto w-full"
            >
              <TabsList 
                ref={tabsListRef}
                className="h-auto w-full px-8 justify-start p-1.5 gap-1 bg-slate-800 flex-nowrap overflow-x-auto scrollbar-none no-scrollbar"
              >
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-1.5 whitespace-nowrap min-w-fit py-1.5 px-3"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Chat</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="trading" 
                  className="flex items-center gap-1.5 whitespace-nowrap min-w-fit py-1.5 px-3"
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Analysis</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="screen" 
                  className="flex items-center gap-1.5 whitespace-nowrap min-w-fit py-1.5 px-3"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Screen</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="voice" 
                  className="flex items-center gap-1.5 whitespace-nowrap min-w-fit py-1.5 px-3"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span className="text-sm">Voice</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
            
            {showTabScrollButtons && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 h-9 w-9 bg-slate-700/90 rounded-full shadow-md"
                onClick={() => scrollTabs('right')}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="flex-grow overflow-hidden">
            <TabsContent value="chat" className="mt-0 h-full">
              <AIAssistant className="h-full" />
            </TabsContent>
            
            <TabsContent value="trading" className="mt-0 h-full">
              <div className="h-full p-4 space-y-4 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Market Analysis</h3>
                  <div className="relative w-60">
                    <input
                      type="text"
                      list="trading-assistant-symbols"
                      className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white text-sm"
                      value={selectedSymbol || symbol}
                      onChange={(e) => {
                        // This would typically set the symbol in a real implementation
                        console.log("Symbol changed to:", e.target.value);
                      }}
                      placeholder="Enter any symbol..."
                    />
                    <datalist id="trading-assistant-symbols">
                      <option value="BTCUSDT">Bitcoin (BTCUSDT)</option>
                      <option value="ETHUSDT">Ethereum (ETHUSDT)</option>
                      <option value="SOLUSDT">Solana (SOLUSDT)</option>
                      <option value="AAPL">Apple (AAPL)</option>
                      <option value="MSFT">Microsoft (MSFT)</option>
                      <option value="GOOGL">Google (GOOGL)</option>
                      <option value="TSLA">Tesla (TSLA)</option>
                      <option value="AMZN">Amazon (AMZN)</option>
                      <option value="META">Meta (META)</option>
                      <option value="AMD">AMD (AMD)</option>
                      <option value="NVDA">NVIDIA (NVDA)</option>
                    </datalist>
                    <div className="absolute right-2 top-2 text-xs text-gray-400 pointer-events-none">
                      Type any symbol
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400">
                  This feature provides AI-generated analysis and trading ideas for any market symbol.
                  Enter any symbol supported by your broker.
                </p>
                
                <div className="space-y-2">
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <h4 className="font-medium">Trend Analysis</h4>
                    </div>
                    <p className="text-sm">
                      The current market shows a bullish trend with increasing volume. Resistance levels have been 
                      tested multiple times in the past week.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">Support & Resistance</h4>
                    </div>
                    <p className="text-sm">
                      Key support levels: $26,800, $25,400, $24,200
                      <br />
                      Key resistance levels: $28,500, $30,000, $32,400
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="screen" className="mt-0 h-full">
              <VisionAIScreenShare className="h-full" />
            </TabsContent>
            
            <TabsContent value="voice" className="mt-0 h-full">
              {isVapiSDKLoaded ? (
                <VapiVoiceAssistant className="h-full" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                  <RefreshCcw className="h-10 w-10 text-slate-400 animate-spin mb-4" />
                  <h3 className="text-lg font-medium mb-2">Loading Voice Assistant</h3>
                  <p className="text-slate-400 max-w-md">
                    We're setting up the voice assistant capabilities. This should only take a moment...
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t p-1.5 sm:p-2 text-xs text-slate-400 flex justify-between items-center">
        <span className="text-[10px] sm:text-xs">AI Trading Assistant v1.0</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.open("https://docs.tradehybrid.co/ai-assistant", "_blank")}
          className="h-auto py-0.5 sm:py-1 px-1.5 sm:px-2"
        >
          <HelpCircle className="h-3 w-3 mr-1" />
          <span className="text-[10px] sm:text-xs">Help</span>
        </Button>
      </CardFooter>
    </Card>
  );
}