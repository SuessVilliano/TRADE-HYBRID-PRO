import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/lib/stores/useMarketData";

interface AIAssistantProps {
  className?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "assistant",
      content: "Hello! I'm your AI trading assistant. Ask me about market trends, trading strategies, or risk management advice.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [insights, setInsights] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { currentPrice, symbol, marketData } = useMarketData();
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  // Generate some market insights based on the current data
  useEffect(() => {
    if (marketData.length > 0) {
      generateMarketInsights();
    }
  }, [marketData]);
  
  const generateMarketInsights = () => {
    // Simple algorithm to generate pseudo-insights
    const latestData = marketData.slice(-20);
    const closes = latestData.map(item => item.close);
    
    const recentAvg = closes.slice(-5).reduce((sum, val) => sum + val, 0) / 5;
    const olderAvg = closes.slice(0, 5).reduce((sum, val) => sum + val, 0) / 5;
    
    const trend = recentAvg > olderAvg ? "uptrend" : "downtrend";
    const momentum = Math.abs(recentAvg - olderAvg) / olderAvg;
    
    // Volatility calculation
    const priceChanges = closes.map((price, i) => {
      if (i === 0) return 0;
      return Math.abs(price - closes[i - 1]) / closes[i - 1];
    }).slice(1);
    
    const avgVolatility = priceChanges.reduce((sum, val) => sum + val, 0) / priceChanges.length;
    
    setInsights([
      {
        id: "trend",
        type: trend === "uptrend" ? "bullish" : "bearish",
        title: `${trend === "uptrend" ? "Bullish" : "Bearish"} Trend Detected`,
        description: `${symbol} is in a ${trend} with ${(momentum * 100).toFixed(2)}% change over the last period.`,
        icon: trend === "uptrend" ? TrendingUp : TrendingDown,
      },
      {
        id: "volatility",
        type: avgVolatility > 0.02 ? "warning" : "info",
        title: avgVolatility > 0.02 ? "High Volatility Alert" : "Normal Market Volatility",
        description: `Current volatility is ${(avgVolatility * 100).toFixed(2)}%. ${avgVolatility > 0.02 ? "Consider reducing position sizes." : "Standard trading sizes are appropriate."}`,
        icon: avgVolatility > 0.02 ? AlertTriangle : Lightbulb,
      },
    ]);
  };
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Generate AI response
    setIsGenerating(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      generateResponse(input);
      setIsGenerating(false);
    }, 1000);
  };
  
  const generateResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    let response = "";
    
    if (lowerQuestion.includes("market") && lowerQuestion.includes("trend")) {
      const trend = insights[0]?.type === "bullish" ? "bullish" : "bearish";
      response = `Based on recent data, ${symbol} is showing a ${trend} trend. The price has ${trend === "bullish" ? "increased" : "decreased"} by approximately ${(Math.random() * 5 + 2).toFixed(2)}% over the last trading period.`;
    } 
    else if (lowerQuestion.includes("volatility")) {
      response = `Current market volatility for ${symbol} is ${(insights[1]?.type === "warning" ? "high" : "normal")}. The average price fluctuation is ${(Math.random() * 3 + 0.5).toFixed(2)}% per period.`;
    }
    else if (lowerQuestion.includes("buy") || lowerQuestion.includes("long")) {
      response = `For ${symbol} at the current price of ${currentPrice.toFixed(2)}, a long position could be considered if you believe in the underlying value. However, always set a stop loss at around ${(currentPrice * 0.95).toFixed(2)} to manage risk.`;
    }
    else if (lowerQuestion.includes("sell") || lowerQuestion.includes("short")) {
      response = `For ${symbol} at the current price of ${currentPrice.toFixed(2)}, a short position is risky given the current market conditions. If you proceed, consider a tight stop loss at ${(currentPrice * 1.03).toFixed(2)}.`;
    }
    else if (lowerQuestion.includes("risk") || lowerQuestion.includes("manage")) {
      response = `For effective risk management, never risk more than 1-2% of your portfolio on a single trade. With the current market volatility, consider reducing position sizes and using stop losses consistently.`;
    }
    else {
      response = `Thank you for your question. As an AI trading assistant, I can help with market analysis, risk management, and trading strategies. Could you provide more specific details about what you'd like to know about ${symbol} or your trading approach?`;
    }
    
    const aiMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>
            <Sparkles className="inline mr-2 h-5 w-5 text-primary" />
            AI Trading Assistant
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat">
          <TabsList className="grid w-full grid-cols-2 h-8 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4">
            <ScrollArea className="h-[300px] pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div 
                      className={cn(
                        "p-3 rounded-lg max-w-[80%]",
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 block mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20">
                          {/* Use first letter of a mock username */}
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                placeholder="Ask about market trends, strategies, or risks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isGenerating) {
                    handleSendMessage();
                  }
                }}
                disabled={isGenerating}
              />
              <Button onClick={handleSendMessage} disabled={isGenerating || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <ScrollArea className="h-[330px]">
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="p-4">
                    <div className="flex gap-3 items-start">
                      <div className={cn(
                        "rounded-full p-2",
                        insight.type === "bullish" ? "bg-green-100 text-green-500" : 
                        insight.type === "bearish" ? "bg-red-100 text-red-500" :
                        insight.type === "warning" ? "bg-amber-100 text-amber-500" :
                        "bg-blue-100 text-blue-500"
                      )}>
                        <insight.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <div className="py-3">
                  <h4 className="text-sm font-semibold mb-2">Market Recommendation</h4>
                  <p className="text-xs text-muted-foreground">
                    Based on current market analysis, a {insights[0]?.type === "bullish" ? "cautious bullish" : "defensive"} approach is recommended for {symbol}. Consider {insights[0]?.type === "bullish" ? "smaller position sizes with clear take-profit levels" : "waiting for a clear reversal signal before entering long positions"}.
                  </p>
                </div>
                
                <div className="py-3">
                  <h4 className="text-sm font-semibold mb-2">Technical Analysis</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs space-y-1">
                      <p>RSI: <span className="font-medium">{Math.floor(Math.random() * 40) + 30}</span></p>
                      <p>MACD: <span className="font-medium">{insights[0]?.type === "bullish" ? "Bullish Crossover" : "Bearish Divergence"}</span></p>
                      <p>Support: <span className="font-medium">${(currentPrice * 0.95).toFixed(2)}</span></p>
                    </div>
                    <div className="text-xs space-y-1">
                      <p>Volume: <span className="font-medium">{Math.floor(Math.random() * 50) + 50}% {insights[0]?.type === "bullish" ? "Increasing" : "Decreasing"}</span></p>
                      <p>MA(50): <span className="font-medium">${(currentPrice * (insights[0]?.type === "bullish" ? 0.98 : 1.02)).toFixed(2)}</span></p>
                      <p>Resistance: <span className="font-medium">${(currentPrice * 1.05).toFixed(2)}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
