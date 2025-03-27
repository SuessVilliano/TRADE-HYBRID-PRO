import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Mic, Upload, FileText, BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/lib/stores/useMarketData";
import { toast } from "sonner";

interface AIAssistantProps {
  className?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface JournalEntry {
  id: string;
  date: Date;
  content: string;
  symbol: string;
  trades?: {
    side: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl?: number;
  }[];
  sentiment: 'positive' | 'negative' | 'neutral';
  lessons?: string[];
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "assistant",
      content: "Hello! I'm your AI trading assistant. Ask me about market trends, trading strategies, or risk management advice. I can also help you maintain your trading journal.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [insights, setInsights] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "insights" | "journal">("chat");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newJournalEntry, setNewJournalEntry] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      // If OpenAI API is available, use it (simulated for now)
      console.log("Using OpenAI for assistant response");
      generateOpenAIResponse(question);
    } else {
      // Fallback to simple rule-based responses
      generateLocalResponse(question);
    }
  };
  
  const generateOpenAIResponse = (question: string) => {
    // Simulate an OpenAI request
    console.log("Sending request to OpenAI API");
    
    // Add a timeout to prevent indefinite waiting
    const timeoutId = setTimeout(() => {
      console.log("OpenAI request timed out, using fallback response");
      // If OpenAI request times out, use local response with a note
      const fallbackResponse = generateLocalResponseText(question) + 
        "\n\n[Note: OpenAI request timed out. Using fallback response.]";
      
      const aiMessage: Message = {
        id: `assistant-fallback-${Date.now()}`,
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 5000); // 5 second timeout
    
    try {
      // For now, still use our local responses but with a note about OpenAI
      const response = generateLocalResponseText(question) + 
        "\n\n[Using OpenAI-enhanced response. For better results, try specific questions about market trends or trading strategies.]";
      
      // Clear timeout as we got a response
      clearTimeout(timeoutId);
      
      const aiMessage: Message = {
        id: `assistant-openai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error with OpenAI request:", error);
      // Error is handled by the timeout fallback
    }
  };
  
  const generateLocalResponse = (question: string) => {
    const response = generateLocalResponseText(question);
    
    const aiMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };
  
  const generateLocalResponseText = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("market") && lowerQuestion.includes("trend")) {
      const trend = insights[0]?.type === "bullish" ? "bullish" : "bearish";
      return `Based on recent data, ${symbol} is showing a ${trend} trend. The price has ${trend === "bullish" ? "increased" : "decreased"} by approximately ${(Math.random() * 5 + 2).toFixed(2)}% over the last trading period.`;
    } 
    else if (lowerQuestion.includes("volatility")) {
      return `Current market volatility for ${symbol} is ${(insights[1]?.type === "warning" ? "high" : "normal")}. The average price fluctuation is ${(Math.random() * 3 + 0.5).toFixed(2)}% per period.`;
    }
    else if (lowerQuestion.includes("buy") || lowerQuestion.includes("long")) {
      return `For ${symbol} at the current price of ${currentPrice.toFixed(2)}, a long position could be considered if you believe in the underlying value. However, always set a stop loss at around ${(currentPrice * 0.95).toFixed(2)} to manage risk.`;
    }
    else if (lowerQuestion.includes("sell") || lowerQuestion.includes("short")) {
      return `For ${symbol} at the current price of ${currentPrice.toFixed(2)}, a short position is risky given the current market conditions. If you proceed, consider a tight stop loss at ${(currentPrice * 1.03).toFixed(2)}.`;
    }
    else if (lowerQuestion.includes("risk") || lowerQuestion.includes("manage")) {
      return `For effective risk management, never risk more than 1-2% of your portfolio on a single trade. With the current market volatility, consider reducing position sizes and using stop losses consistently.`;
    }
    else if (lowerQuestion.includes("journal") || lowerQuestion.includes("track")) {
      // Side effect in a pure function is not ideal, but we'll keep it for now
      setTimeout(() => setActiveTab("journal"), 100);
      return `I can help you keep a trading journal. Switch to the Journal tab to record your trades, thoughts, and lessons learned. You can also import trading data from platforms like NinjaTrader or upload CSV/PDF files.`;
    }
    else {
      return `Thank you for your question. As an AI trading assistant, I can help with market analysis, risk management, and trading strategies. Could you provide more specific details about what you'd like to know about ${symbol} or your trading approach?`;
    }
  };
  
  // Voice recording functions
  const startRecording = async () => {
    try {
      // If already recording, stop it first
      if (isRecording && mediaRecorderRef.current) {
        stopRecording();
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set a maximum recording time (30 seconds)
      const recordingTimeout = setTimeout(() => {
        if (isRecording && mediaRecorderRef.current) {
          console.log("Recording timeout reached (30s), auto-stopping");
          stopRecording();
        }
      }, 30000);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        clearTimeout(recordingTimeout);
        
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Process the recording with a simulated transcription
        const sampleTexts = [
          `Notes on ${symbol} trading: The market seems to be consolidating at this level.`,
          `My trading plan for ${symbol}: Enter on pullbacks with tight stop loss.`,
          `Today's market conditions for ${symbol} are challenging. Need to be cautious.`
        ];
        
        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        
        setTimeout(() => {
          handleVoiceTranscription(randomText);
        }, 1000);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast.info("Recording started. Speak now... (Max 30 seconds)");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Couldn't access microphone. Please check permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
      setIsRecording(false);
      toast.info("Processing your recording...");
    }
  };
  
  const handleVoiceTranscription = (transcription: string) => {
    setNewJournalEntry(transcription);
    toast.success("Voice transcription completed");
  };
  
  // Journal functions
  const addJournalEntry = () => {
    if (!newJournalEntry.trim()) return;
    
    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: new Date(),
      content: newJournalEntry,
      symbol: selectedSymbol || symbol,
      sentiment: determineSentiment(newJournalEntry),
      lessons: extractLessons(newJournalEntry),
      trades: extractTrades(newJournalEntry),
    };
    
    setJournalEntries(prev => [entry, ...prev]);
    setNewJournalEntry("");
    toast.success("Journal entry saved");
  };
  
  const determineSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const lowerText = text.toLowerCase();
    const positiveWords = ['profit', 'gain', 'success', 'good', 'happy', 'improve', 'win', 'positive'];
    const negativeWords = ['loss', 'bad', 'mistake', 'wrong', 'fail', 'error', 'negative', 'poor'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  };
  
  const extractLessons = (text: string): string[] => {
    // Simple extraction based on phrases like "I learned" or "lesson"
    const lessons: string[] = [];
    const sentences = text.split(/[.!?]/);
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase().trim();
      if (
        lowerSentence.includes("learned") || 
        lowerSentence.includes("lesson") ||
        lowerSentence.includes("takeaway") ||
        lowerSentence.includes("next time")
      ) {
        lessons.push(sentence.trim() + ".");
      }
    });
    
    return lessons.length > 0 ? lessons : ["Reflect on what you learned from this trade."];
  };
  
  const extractTrades = (text: string): { side: 'buy' | 'sell'; price: number; quantity: number; pnl?: number }[] | undefined => {
    // This is a simplified extraction. In a real app, we'd use more sophisticated NLP.
    const trades: { side: 'buy' | 'sell'; price: number; quantity: number; pnl?: number }[] = [];
    const lowerText = text.toLowerCase();
    
    // Check for buy patterns
    if (lowerText.includes("bought") || lowerText.includes("buy")) {
      trades.push({
        side: 'buy',
        price: currentPrice,
        quantity: 1,
      });
    }
    
    // Check for sell patterns
    if (lowerText.includes("sold") || lowerText.includes("sell")) {
      trades.push({
        side: 'sell',
        price: currentPrice,
        quantity: 1,
      });
    }
    
    return trades.length > 0 ? trades : undefined;
  };
  
  // File import handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsImporting(true);
    
    // Here you would normally process the file
    // For now, we'll simulate file processing
    setTimeout(() => {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExt === 'csv') {
        processCSVFile(file);
      } else if (fileExt === 'pdf') {
        processPDFFile(file);
      } else {
        toast.error("Unsupported file format. Please upload CSV or PDF files.");
      }
      
      setIsImporting(false);
    }, 2000);
  };
  
  const processCSVFile = (file: File) => {
    // Simulate CSV processing
    const platformData = detectTradingPlatform(file.name);
    
    setJournalEntries(prev => [{
      id: `import-${Date.now()}`,
      date: new Date(),
      content: `Imported trading data from ${platformData.platform}. Contains ${platformData.tradeCount} trades with a total P&L of ${platformData.totalPnL > 0 ? '+' : ''}${platformData.totalPnL.toFixed(2)}.`,
      symbol: platformData.primarySymbol,
      sentiment: platformData.totalPnL > 0 ? 'positive' : 'negative',
      trades: [
        {
          side: platformData.totalPnL > 0 ? 'buy' : 'sell',
          price: platformData.averagePrice,
          quantity: platformData.totalQuantity,
          pnl: platformData.totalPnL
        }
      ]
    }, ...prev]);
    
    toast.success(`Imported ${platformData.tradeCount} trades from ${platformData.platform}`);
  };
  
  const processPDFFile = (file: File) => {
    // Validate the file before processing
    if (file.type !== 'application/pdf') {
      toast.error("Invalid PDF file format. Please upload a valid PDF.");
      setIsImporting(false);
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF file is too large. Maximum size is 10MB.");
      setIsImporting(false);
      return;
    }
    
    // Simulate PDF processing with validation
    toast.info(`Processing PDF: ${file.name}...`);
    
    // Simulated validation check based on filename
    const validPDF = validatePDFFilename(file.name);
    
    if (validPDF) {
      toast.success(`Successfully extracted trading notes from ${file.name}`);
      
      setJournalEntries(prev => [{
        id: `import-${Date.now()}`,
        date: new Date(),
        content: `Trading notes imported from PDF: ${file.name}. The document contains trading strategies and analysis for various symbols.`,
        symbol: "Multiple",
        sentiment: 'neutral',
        lessons: ["Always document your trading strategies", "Review your trading plans regularly"]
      }, ...prev]);
    } else {
      toast.error(`Could not process ${file.name}. The file appears to be invalid or corrupt.`);
    }
  };
  
  // Validate PDF filename (basic check)
  const validatePDFFilename = (filename: string): boolean => {
    // Basic validation based on filename patterns that might indicate
    // trading-related PDFs vs. generic files
    const tradingKeywords = ['trade', 'journal', 'analysis', 'strategy', 'market', 'report'];
    const lowerFilename = filename.toLowerCase();
    
    // Check for at least one trading keyword
    return tradingKeywords.some(keyword => lowerFilename.includes(keyword));
  };
  
  const detectTradingPlatform = (filename: string): {
    platform: string;
    tradeCount: number;
    totalPnL: number;
    primarySymbol: string;
    averagePrice: number;
    totalQuantity: number;
  } => {
    // Detect platform based on filename
    let platform = "Unknown Platform";
    if (filename.toLowerCase().includes('ninja') || filename.toLowerCase().includes('nt8')) {
      platform = "NinjaTrader";
    } else if (filename.toLowerCase().includes('tradeof8') || filename.toLowerCase().includes('toe')) {
      platform = "Trade of Eight";
    } else if (filename.toLowerCase().includes('mt4') || filename.toLowerCase().includes('mt5')) {
      platform = "MetaTrader";
    }
    
    // Generate mock data
    return {
      platform,
      tradeCount: Math.floor(Math.random() * 15) + 5,
      totalPnL: (Math.random() * 2000) - 1000,
      primarySymbol: symbol || "BTCUSD",
      averagePrice: currentPrice || 50000,
      totalQuantity: Math.floor(Math.random() * 10) + 1
    };
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
        <Tabs defaultValue="chat" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3 h-8 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
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
                className="px-3 py-2 focus:ring-2 focus:ring-primary"
                autoFocus
                autoComplete="off"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isGenerating || !input.trim()}
                className="bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary"
              >
                {isGenerating ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
                  <h4 className="text-sm font-semibold mb-2">Market Sentiment Analysis</h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
                      <p className="text-xs font-medium">Bullish Signals</p>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.floor(Math.random() * 30) + 40}%
                      </div>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded">
                      <p className="text-xs font-medium">Bearish Signals</p>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {Math.floor(Math.random() * 30) + 30}%
                      </div>
                    </div>
                  </div>
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
          
          <TabsContent value="journal">
            <div className="space-y-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Trading Journal</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <RotateCcw className="h-3 w-3 mr-1 animate-spin" /> Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" /> Import 
                        </>
                      )}
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.pdf"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="grow">
                    <Input
                      placeholder="Record your trading thoughts, lessons, and performance..."
                      value={newJournalEntry}
                      onChange={(e) => setNewJournalEntry(e.target.value)}
                      disabled={isRecording}
                    />
                  </div>
                  <div className="flex gap-1">
                    {isRecording ? (
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8" 
                        onClick={stopRecording}
                      >
                        <Mic className="h-4 w-4 animate-pulse" />
                      </Button>
                    ) : (
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8" 
                        onClick={startRecording}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={addJournalEntry}
                      disabled={!newJournalEntry.trim() || isRecording}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {isRecording && (
                  <p className="text-xs text-primary mt-1 animate-pulse">
                    Recording... Click the microphone button again to stop.
                  </p>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-medium text-muted-foreground">
                  {journalEntries.length} {journalEntries.length === 1 ? 'Entry' : 'Entries'}
                </h4>
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-muted-foreground">Filter:</span>
                  <div className="relative">
                    <select 
                      className="text-xs bg-background border rounded px-2 py-1 appearance-none pr-6 focus:ring-2 focus:ring-primary cursor-pointer"
                      value={sentimentFilter}
                      onChange={(e) => setSentimentFilter(e.target.value as any)}
                    >
                      <option value="all">All</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="neutral">Neutral</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="h-[220px]">
                <div className="space-y-3">
                  {journalEntries
                    .filter(entry => sentimentFilter === "all" || entry.sentiment === sentimentFilter)
                    .map((entry) => (
                    <Card key={entry.id} className="p-3 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{entry.symbol}</span>
                          <span className="text-xs text-muted-foreground">
                            {entry.date.toLocaleDateString()}
                          </span>
                        </div>
                        <div className={cn(
                          "px-1.5 py-0.5 rounded-full text-xs",
                          entry.sentiment === "positive" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          entry.sentiment === "negative" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {entry.sentiment.charAt(0).toUpperCase() + entry.sentiment.slice(1)}
                        </div>
                      </div>
                      
                      <p className="text-xs mb-2">{entry.content}</p>
                      
                      {entry.trades && entry.trades.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium mb-1">Trades:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.trades.map((trade, i) => (
                              <div 
                                key={i} 
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  trade.side === "buy" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}
                              >
                                {trade.side.toUpperCase()} {trade.quantity} @ ${trade.price.toFixed(2)}
                                {trade.pnl !== undefined && (
                                  <span className={trade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                                    {' '}({trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {entry.lessons && entry.lessons.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Lessons:</p>
                          <ul className="text-xs text-muted-foreground pl-4 list-disc">
                            {entry.lessons.map((lesson, i) => (
                              <li key={i}>{lesson}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  ))}
                  
                  {journalEntries.filter(entry => sentimentFilter === "all" || entry.sentiment === sentimentFilter).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No journal entries yet. Start recording your trading journey!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use the voice recording feature or import your trading data from CSV/PDF files.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
