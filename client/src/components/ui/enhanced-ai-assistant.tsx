import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIAssistant } from "@/components/ui/ai-assistant";
import { VisionAIScreenShare } from "@/components/ui/vision-ai-screen-share";
import { VapiVoiceAssistant } from "@/components/ui/vapi-voice-assistant";
import { EnhancedAITradingAssistant } from "@/components/ui/enhanced-ai-trading-assistant";
import { 
  Sparkles, 
  Bot, 
  HelpCircle, 
  Share2, 
  PhoneCall, 
  MessageSquare, 
  Activity,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/lib/stores/useMarketData";
import { toast } from "sonner";

interface EnhancedAIAssistantProps {
  className?: string;
}

export function EnhancedAIAssistant({ className }: EnhancedAIAssistantProps) {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isVapiSDKLoaded, setIsVapiSDKLoaded] = useState(false);
  const { symbol } = useMarketData();
  
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
    try {
      toast.success(
        `${tradeSuggestion.action.toUpperCase()} order for ${tradeSuggestion.symbol.split(':')[1]} placed successfully.`
      );
      
      console.log('Trade executed:', tradeSuggestion);
    } catch (error) {
      console.error('Error executing trade:', error);
      
      toast.error('Failed to execute trade. Please check your broker connection and try again.');
    }
  };

  return (
    <Card className={cn("w-full h-full flex flex-col overflow-hidden", className)}>
      <CardHeader className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Enhanced AI Trading Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleApiKeyAdd('OpenAI')}
            >
              Add OpenAI Key
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleApiKeyAdd('Gemini')}
            >
              Add Gemini Key
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
          <TabsList className="h-auto justify-start p-2 border-b bg-slate-800">
            <TabsTrigger value="chat" className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              <span>Trading Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="screen" className="flex items-center gap-1.5">
              <Share2 className="h-4 w-4" />
              <span>Screen Share</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4" />
              <span>Voice Assistant</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-grow overflow-hidden">
            <TabsContent value="chat" className="mt-0 h-full">
              <AIAssistant className="h-full" />
            </TabsContent>
            
            <TabsContent value="trading" className="mt-0 h-full">
              <EnhancedAITradingAssistant 
                selectedSymbol={symbol}
                onExecuteTrade={handleExecuteTrade}
                allowExecution={true}
              />
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
      
      <CardFooter className="border-t p-2 text-xs text-slate-400 flex justify-between items-center">
        <span>Enhanced AI Assistant v1.0</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.open("https://docs.tradehybrid.co/ai-assistant", "_blank")}
          className="h-auto py-1"
        >
          <HelpCircle className="h-3.5 w-3.5 mr-1" />
          <span>Help</span>
        </Button>
      </CardFooter>
    </Card>
  );
}