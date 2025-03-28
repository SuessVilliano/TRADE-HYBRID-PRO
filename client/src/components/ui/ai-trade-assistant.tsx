import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Settings, BrainCircuit, Lightbulb, Sparkles, Play, Pause, Volume2, VolumeX, 
         Loader2, BookOpen, TrendingUp, BarChart, Webhook, ChevronDown, ChevronUp, Check, Info } from 'lucide-react';
import { TRADING_SYMBOLS } from '@/lib/constants';

interface AiTradeAssistantProps {
  className?: string;
  apiKeyStatus?: boolean;
  minimized?: boolean;
  onMinimize?: () => void;
}

export function AiTradeAssistant({ 
  className = '', 
  apiKeyStatus = false,
  minimized = false,
  onMinimize
}: AiTradeAssistantProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [useVoiceResponse, setUseVoiceResponse] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('chat');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiModel, setAiModel] = useState<'default' | 'advanced'>('default');
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [tradingAlerts, setTradingAlerts] = useState<any[]>([]);

  // Check for browser speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcriptArray = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');
        
        setTranscript(transcriptArray);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice commands.",
            variant: "destructive"
          });
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
      
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support voice commands. Try using Chrome or Edge.",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, toast]);
  
  // Start with a welcome message
  useEffect(() => {
    if (apiKeyStatus && conversation.length === 0) {
      setConversation([
        {
          role: 'assistant',
          content: "Hello, I'm your AI trading assistant. How can I help you with your trading today? You can ask me to analyze markets, place trades, set alerts, or provide educational content."
        }
      ]);
      
      // Add sample recent trades
      setRecentTrades([
        {
          id: 't1',
          symbol: 'BTC/USD',
          type: 'buy',
          amount: 0.05,
          price: 58432.25,
          timestamp: new Date(Date.now() - 35 * 60000), // 35 minutes ago
          status: 'executed'
        },
        {
          id: 't2',
          symbol: 'ETH/USD',
          type: 'sell',
          amount: 1.2,
          price: 3245.50,
          timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
          status: 'executed'
        }
      ]);
      
      // Add sample alerts
      setTradingAlerts([
        {
          id: 'a1',
          symbol: 'BTC/USD',
          condition: 'price above',
          value: 60000,
          created: new Date(Date.now() - 180 * 60000), // 3 hours ago
          active: true
        },
        {
          id: 'a2',
          symbol: 'AAPL',
          condition: 'price below',
          value: 180,
          created: new Date(Date.now() - 240 * 60000), // 4 hours ago
          active: true
        }
      ]);
    }
  }, [apiKeyStatus, conversation.length]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechSupported) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support voice commands. Try using Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }
    
    if (!apiKeyStatus) {
      toast({
        title: "API key required",
        description: "Please configure your API keys first to use the AI assistant.",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      
      // If there's a transcript, process it
      if (transcript) {
        processVoiceCommand(transcript);
        setTranscript('');
      }
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      toast({
        title: "Listening for commands",
        description: "Speak now to give instructions to your AI trading assistant."
      });
    }
  };
  
  // Process voice command
  const processVoiceCommand = (command: string) => {
    if (!command.trim()) return;
    
    setProcessingCommand(true);
    addMessageToConversation('user', command);
    
    // Simulate AI response delay
    setTimeout(() => {
      generateAiResponse(command);
      setProcessingCommand(false);
    }, 1500);
  };
  
  // Simulate AI response
  const generateAiResponse = (command: string) => {
    const lowercaseCommand = command.toLowerCase();
    
    let response = "I'm sorry, I didn't understand that command. You can ask me to analyze markets, place trades, or set alerts.";
    
    // Check command patterns
    if (lowercaseCommand.includes('buy') || lowercaseCommand.includes('purchase')) {
      const symbols = Object.values(TRADING_SYMBOLS).flat();
      const matchedSymbol = symbols.find(symbol => 
        lowercaseCommand.includes(symbol.toLowerCase()) || 
        lowercaseCommand.includes(symbol.split('/')[0].toLowerCase())
      );
      
      if (matchedSymbol) {
        response = `I've placed a buy order for ${matchedSymbol} at market price. Your order has been executed successfully.`;
        
        // Add to recent trades
        const newTrade = {
          id: `t${Date.now()}`,
          symbol: matchedSymbol,
          type: 'buy',
          amount: parseFloat((Math.random() * 0.2 + 0.01).toFixed(3)),
          price: Math.random() * 50000 + 10000,
          timestamp: new Date(),
          status: 'executed'
        };
        
        setRecentTrades(prev => [newTrade, ...prev]);
        
        toast({
          title: "Trade executed",
          description: `Buy order for ${matchedSymbol} has been placed successfully.`
        });
      } else {
        response = "I couldn't identify which asset you want to buy. Please specify the trading symbol, like 'Buy BTC' or 'Buy AAPL'.";
      }
    } else if (lowercaseCommand.includes('sell')) {
      const symbols = Object.values(TRADING_SYMBOLS).flat();
      const matchedSymbol = symbols.find(symbol => 
        lowercaseCommand.includes(symbol.toLowerCase()) || 
        lowercaseCommand.includes(symbol.split('/')[0].toLowerCase())
      );
      
      if (matchedSymbol) {
        response = `I've placed a sell order for ${matchedSymbol} at market price. Your order has been executed successfully.`;
        
        // Add to recent trades
        const newTrade = {
          id: `t${Date.now()}`,
          symbol: matchedSymbol,
          type: 'sell',
          amount: parseFloat((Math.random() * 0.2 + 0.01).toFixed(3)),
          price: Math.random() * 50000 + 10000,
          timestamp: new Date(),
          status: 'executed'
        };
        
        setRecentTrades(prev => [newTrade, ...prev]);
        
        toast({
          title: "Trade executed",
          description: `Sell order for ${matchedSymbol} has been placed successfully.`
        });
      } else {
        response = "I couldn't identify which asset you want to sell. Please specify the trading symbol, like 'Sell BTC' or 'Sell AAPL'.";
      }
    } else if (lowercaseCommand.includes('analyze') || lowercaseCommand.includes('analysis')) {
      const symbols = Object.values(TRADING_SYMBOLS).flat();
      const matchedSymbol = symbols.find(symbol => 
        lowercaseCommand.includes(symbol.toLowerCase()) || 
        lowercaseCommand.includes(symbol.split('/')[0].toLowerCase())
      );
      
      if (matchedSymbol) {
        const sentiment = Math.random() > 0.5 ? 'bullish' : 'bearish';
        
        response = `Based on my analysis of ${matchedSymbol}, the market appears ${sentiment} at the moment. ` +
                   `Key indicators like RSI, MACD, and moving averages suggest a ${sentiment} trend in the short term. ` +
                   `Volume has ${Math.random() > 0.5 ? 'increased' : 'decreased'} over the past 24 hours, which could indicate ${sentiment === 'bullish' ? 'buying' : 'selling'} pressure. ` +
                   `My recommendation would be to consider a ${sentiment === 'bullish' ? 'long' : 'short'} position with proper risk management.`;
      } else {
        response = "I need to know which market to analyze. For example, 'Analyze BTC/USD' or 'What's your analysis on AAPL?'";
      }
    } else if (lowercaseCommand.includes('alert') || lowercaseCommand.includes('notification')) {
      const symbols = Object.values(TRADING_SYMBOLS).flat();
      const matchedSymbol = symbols.find(symbol => 
        lowercaseCommand.includes(symbol.toLowerCase()) || 
        lowercaseCommand.includes(symbol.split('/')[0].toLowerCase())
      );
      
      if (matchedSymbol) {
        const priceAbove = lowercaseCommand.includes('above') || lowercaseCommand.includes('over');
        const priceBelow = lowercaseCommand.includes('below') || lowercaseCommand.includes('under');
        
        let price = 0;
        const numberMatch = lowercaseCommand.match(/\d+(\.\d+)?/);
        if (numberMatch) {
          price = parseFloat(numberMatch[0]);
        } else {
          // Generate random price
          price = Math.random() * 50000 + 10000;
        }
        
        let condition = priceAbove ? 'price above' : priceBelow ? 'price below' : 'price change';
        
        const newAlert = {
          id: `a${Date.now()}`,
          symbol: matchedSymbol,
          condition,
          value: price,
          created: new Date(),
          active: true
        };
        
        setTradingAlerts(prev => [newAlert, ...prev]);
        
        response = `I've set up a price alert for ${matchedSymbol} ${condition} ${price.toFixed(2)}. You'll be notified when this condition is met.`;
        
        toast({
          title: "Alert created",
          description: `Price alert for ${matchedSymbol} has been set up.`
        });
      } else {
        response = "I need to know which asset to set an alert for. For example, 'Set alert when BTC goes above 60000' or 'Notify me when AAPL drops below 170'.";
      }
    } else if (lowercaseCommand.includes('what is') || lowercaseCommand.includes('explain') || 
               lowercaseCommand.includes('how to') || lowercaseCommand.includes('teach me')) {
      
      if (lowercaseCommand.includes('rsi') || lowercaseCommand.includes('relative strength index')) {
        response = "The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements. " +
                  "RSI oscillates between 0 and 100 and is typically used to identify overbought or oversold conditions in a market. " +
                  "Generally, an RSI reading over 70 suggests an overbought condition, while a reading below 30 indicates an oversold condition.";
      } else if (lowercaseCommand.includes('macd') || lowercaseCommand.includes('moving average convergence divergence')) {
        response = "The Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price. " +
                  "The MACD is calculated by subtracting the 26-period Exponential Moving Average (EMA) from the 12-period EMA. The result of that calculation is the MACD line. " +
                  "A 9-day EMA of the MACD called the 'signal line', is then plotted on top of the MACD line, which can function as a trigger for buy and sell signals.";
      } else if (lowercaseCommand.includes('support') || lowercaseCommand.includes('resistance')) {
        response = "Support and resistance are key concepts in technical analysis that refer to price levels where a market typically has difficulty moving through. " +
                  "Support is a price level where buying interest is strong enough to overcome selling pressure, preventing the price from declining further. " +
                  "Resistance is the opposite - a price level where selling interest is strong enough to overcome buying pressure, preventing the price from rising further. " +
                  "These levels often form because of psychological price points, previous significant highs or lows, or round numbers.";
      } else {
        response = "I'd be happy to explain trading concepts to you. You can ask about specific technical indicators like RSI or MACD, " +
                  "concepts like support and resistance, or trading strategies.";
      }
    } else if (lowercaseCommand.includes('position size') || lowercaseCommand.includes('how much')) {
      response = "To determine an appropriate position size, I recommend using the fixed percentage risk method. " +
                "Choose a percentage of your account you're willing to risk on a single trade (typically 1-2%). " +
                "Then, calculate your position size based on your entry point and stop loss. " +
                "For example, if you have a $10,000 account and want to risk 1% ($100) on a trade with a $5 stop loss, " +
                "your position size would be 20 shares ($100 ÷ $5).";
    } else if (lowercaseCommand.includes('current balance') || lowercaseCommand.includes('portfolio') || 
               lowercaseCommand.includes('account')) {
      response = "Your current account balance is $24,876.42. Your portfolio consists of 0.15 BTC, 2.3 ETH, 15 SOL, and various stocks including AAPL (10 shares), MSFT (5 shares), and TSLA (3 shares). Your overall portfolio performance is +12.4% this month.";
    } else if (lowercaseCommand.includes('news') || lowercaseCommand.includes('headlines')) {
      response = "Here are today's top market headlines:\n\n" +
                "1. Federal Reserve signals potential rate cut in upcoming meeting\n" +
                "2. Bitcoin surges above $60,000 amid ETF inflow reports\n" +
                "3. Tech stocks rally after better-than-expected earnings reports\n" +
                "4. Oil prices stabilize following OPEC production announcement\n" +
                "5. European markets close higher amid positive economic data";
    }
    
    addMessageToConversation('assistant', response);
    
    // Use speech synthesis if enabled
    if (useVoiceResponse) {
      speakResponse(response);
    }
  };
  
  // Use speech synthesis for AI responses
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 1.0;
      speech.pitch = 1.0;
      speech.volume = 1.0;
      
      setSpeaking(true);
      speech.onend = () => {
        setSpeaking(false);
      };
      
      window.speechSynthesis.speak(speech);
    }
  };
  
  // Stop speech synthesis
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };
  
  // Add message to conversation
  const addMessageToConversation = (role: 'user' | 'assistant', content: string) => {
    setConversation(prev => [...prev, { role, content }]);
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <Card className={`${className} overflow-hidden transition-all duration-300 ${minimized ? 'h-16' : ''}`}>
      {minimized ? (
        <div 
          className="flex items-center justify-between p-3 bg-primary/5 cursor-pointer"
          onClick={onMinimize}
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="font-medium">AI Trading Assistant</span>
            {isListening && (
              <Badge variant="success" className="animate-pulse">Listening...</Badge>
            )}
          </div>
          <ChevronUp className="h-4 w-4" />
        </div>
      ) : (
        <>
          <CardHeader className="relative pb-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" />
                  AI Trading Assistant
                </CardTitle>
                <CardDescription>
                  Voice-enabled AI assistant for trading and market analysis
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                {speechSupported && (
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="sm"
                    className="gap-1"
                    onClick={toggleListening}
                    disabled={!apiKeyStatus}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Voice
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {onMinimize && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onMinimize}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {isListening && (
              <div className="mt-2 py-2 px-4 bg-primary/10 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="w-1 h-5 bg-primary rounded-full"
                        animate={{
                          height: [5, 15, 5],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">
                    {transcript || "Listening..."}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={toggleListening}
                >
                  <MicOff className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* Settings panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-3 bg-muted/30 rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="voice-response" className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Voice responses
                      </Label>
                      <Switch 
                        id="voice-response"
                        checked={useVoiceResponse}
                        onCheckedChange={setUseVoiceResponse}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ai-model" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Model
                      </Label>
                      <div className="flex border rounded-md overflow-hidden">
                        <Button
                          variant={aiModel === 'default' ? "default" : "ghost"}
                          size="sm"
                          className="rounded-none h-7 px-2 text-xs"
                          onClick={() => setAiModel('default')}
                        >
                          Standard
                        </Button>
                        <Button
                          variant={aiModel === 'advanced' ? "default" : "ghost"}
                          size="sm"
                          className="rounded-none h-7 px-2 text-xs"
                          onClick={() => setAiModel('advanced')}
                        >
                          Advanced
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                      >
                        <span className="text-sm">Advanced Settings</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                      </div>
                      
                      <AnimatePresence>
                        {showAdvanced && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Label htmlFor="auto-execute" className="text-xs flex items-center gap-1">
                                <Webhook className="h-3 w-3" />
                                Auto-execute trades
                              </Label>
                              <Switch id="auto-execute" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="auto-confirm" className="text-xs flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Confirm before trading
                              </Label>
                              <Switch id="auto-confirm" defaultChecked />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>
          
          <CardContent className="py-3">
            {!apiKeyStatus ? (
              <div className="text-center py-6">
                <div className="mb-4 flex justify-center">
                  <Info className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="font-medium text-lg mb-2">API Key Required</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Connect your broker or set up API keys to access the AI assistant.
                </p>
                <Button variant="outline" className="mx-auto">
                  Set Up API Keys
                </Button>
              </div>
            ) : (
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-3 mb-3">
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="trades" className="flex items-center gap-1">
                    <BarChart className="h-3.5 w-3.5" />
                    Trades
                  </TabsTrigger>
                  <TabsTrigger value="learn" className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    Learn
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="space-y-0 mt-0">
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {conversation.map((message, index) => (
                        <div
                          key={index}
                          className={`flex flex-col ${
                            message.role === 'user' ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {message.role === 'user' ? 'You' : 'AI Assistant'} • {formatTime(new Date())}
                          </div>
                        </div>
                      ))}
                      
                      {processingCommand && (
                        <div className="flex items-start">
                          <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Processing your request...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {speaking && useVoiceResponse && (
                        <div className="fixed bottom-20 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg cursor-pointer"
                          onClick={stopSpeaking}
                        >
                          <div className="relative">
                            <Volume2 className="h-5 w-5" />
                            <motion.div
                              className="absolute -inset-1 rounded-full border-2 border-primary-foreground"
                              animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="trades" className="space-y-4 mt-0">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recent Trades</h3>
                    <ScrollArea className="h-[120px]">
                      {recentTrades.length > 0 ? (
                        <div className="space-y-2">
                          {recentTrades.map(trade => (
                            <div key={trade.id} className="flex justify-between border-b pb-2">
                              <div>
                                <div className="flex items-center gap-1">
                                  <Badge variant={trade.type === 'buy' ? 'success' : 'destructive'} className="text-[10px] px-1 py-0 h-4 uppercase">
                                    {trade.type}
                                  </Badge>
                                  <span className="font-medium">{trade.symbol}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTime(trade.timestamp)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-sm">{trade.amount.toFixed(3)}</div>
                                <div className="text-xs text-muted-foreground">${trade.price.toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground text-sm py-4">
                          No recent trades
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Active Alerts</h3>
                    <ScrollArea className="h-[120px]">
                      {tradingAlerts.length > 0 ? (
                        <div className="space-y-2">
                          {tradingAlerts.map(alert => (
                            <div key={alert.id} className="flex justify-between border-b pb-2">
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{alert.symbol}</span>
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    {alert.condition}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Set {formatTime(alert.created)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-sm">${alert.value.toFixed(2)}</div>
                                <div className="text-xs">
                                  <Badge variant={alert.active ? 'success' : 'outline'} className="text-[10px] px-1 py-0 h-4">
                                    {alert.active ? 'Active' : 'Triggered'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground text-sm py-4">
                          No active alerts
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="learn" className="mt-0">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h3 className="font-medium text-sm mb-1 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          Trading 101
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Get started with trading basics and fundamental concepts.
                        </p>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          View Course
                        </Button>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h3 className="font-medium text-sm mb-1 flex items-center gap-1">
                          <BarChart className="h-4 w-4 text-green-500" />
                          Technical Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Learn to read charts and use technical indicators effectively.
                        </p>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          View Course
                        </Button>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h3 className="font-medium text-sm mb-1 flex items-center gap-1">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          Trading Tips
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Quick trading tips you can ask the assistant:
                        </p>
                        <div className="space-y-1">
                          <div className="text-xs p-1.5 bg-background rounded">
                            "Calculate position size for BTC with 2% risk"
                          </div>
                          <div className="text-xs p-1.5 bg-background rounded">
                            "Explain RSI indicator and how to use it"
                          </div>
                          <div className="text-xs p-1.5 bg-background rounded">
                            "What's the current market sentiment for AAPL?"
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <div className={`h-2 w-2 rounded-full mr-2 ${apiKeyStatus ? 'bg-green-500' : 'bg-orange-500'}`} />
              <span>
                {apiKeyStatus ? 'Connected to trading API' : 'API key required'}
              </span>
            </div>
            
            {apiKeyStatus && (
              <div className="flex gap-1">
                {speaking && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 text-xs"
                    onClick={stopSpeaking}
                  >
                    <VolumeX className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                )}
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  disabled={isListening}
                  onClick={toggleListening}
                >
                  {isListening ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                  {isListening ? 'Listening...' : 'Start Voice'}
                </Button>
              </div>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}