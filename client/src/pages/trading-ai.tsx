import React, { useState, useEffect, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SmartTradePanel } from '@/components/ui/smart-trade-panel';
import { 
  Cpu, 
  Sparkles, 
  MessageSquare, 
  ArrowRight, 
  TrendingUp, 
  BarChart3,
  Mic, 
  Play, 
  Square, 
  Loader2,
  CheckCircle,
  BrainCircuit,
  LineChart,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrokerAggregator } from '@/lib/stores/useBrokerAggregator';
import { toast } from 'sonner';

const TradingAIPage: React.FC = () => {
  // Recording and transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [tradeIntent, setTradeIntent] = useState<any | null>(null);
  const [selectedTab, setSelectedTab] = useState('voice');
  const [microphoneAccess, setMicrophoneAccess] = useState<boolean | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string, timestamp: number}[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you analyze markets and execute trades using natural language. Try asking me to analyze a stock or place a trade.',
      timestamp: Date.now()
    }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Mock recent AI signals
  const aiSignals = [
    { symbol: 'AAPL', direction: 'buy', confidence: 87, timeframe: '4H', price: 185.42, timestamp: Date.now() - 1000 * 60 * 30 },
    { symbol: 'BTC/USD', direction: 'sell', confidence: 92, timeframe: '1D', price: 51750.25, timestamp: Date.now() - 1000 * 60 * 120 },
    { symbol: 'EUR/USD', direction: 'buy', confidence: 76, timeframe: '1H', price: 1.0834, timestamp: Date.now() - 1000 * 60 * 240 },
    { symbol: 'SPY', direction: 'buy', confidence: 81, timeframe: '1D', price: 478.84, timestamp: Date.now() - 1000 * 60 * 360 },
  ];

  // Check for microphone access
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneAccess(true);
      } catch (err) {
        console.error("Microphone access error:", err);
        setMicrophoneAccess(false);
      }
    };
    
    checkMicrophoneAccess();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Simulate starting/stopping voice recording
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate processing delay
      setTimeout(() => {
        // Example transcription based on common trading phrases
        const exampleTranscriptions = [
          "Buy 100 shares of Apple stock at market price",
          "Analyze Tesla stock and give me a short term outlook",
          "What's the current price of Bitcoin?",
          "Sell my entire position in Amazon",
          "Set a stop loss for my Microsoft position at 340 dollars"
        ];
        const randomTranscription = exampleTranscriptions[Math.floor(Math.random() * exampleTranscriptions.length)];
        setTranscription(randomTranscription);
        setIsProcessing(false);
        
        // Add to chat history
        setChatHistory(prev => [...prev, {
          role: 'user',
          content: randomTranscription,
          timestamp: Date.now()
        }]);
        
        // Process AI response after a short delay
        processAIResponse(randomTranscription);
      }, 1500);
    } else {
      setIsRecording(true);
      setTranscription('');
      setAiResponse(null);
      setTradeIntent(null);
    }
  };

  // Process message from text input
  const handleSendMessage = () => {
    if (userMessage.trim() === '') return;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }]);
    
    // Process the message
    processAIResponse(userMessage);
    
    // Clear input
    setUserMessage('');
  };

  // Simulate AI processing and response
  const processAIResponse = (message: string) => {
    setIsProcessing(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      // Simple logic to create different responses based on message content
      let response = '';
      let intent = null;
      
      const lowercaseMessage = message.toLowerCase();
      
      // Check for buy intent
      if (lowercaseMessage.includes('buy')) {
        const stockMatch = message.match(/buy.+?(?:of\s+)?([A-Za-z]+)/) || [];
        const quantityMatch = message.match(/buy\s+(\d+)/) || [];
        const stock = stockMatch[1] || 'AAPL';
        const quantity = parseInt(quantityMatch[1]) || 100;
        
        response = `I'll help you buy ${quantity} shares of ${stock.toUpperCase()}. The current market price is $${(Math.random() * 200 + 50).toFixed(2)}. Would you like to proceed with this order?`;
        
        intent = {
          action: 'BUY',
          symbol: stock.toUpperCase(),
          quantity: quantity,
          price: 'MARKET',
          estimatedCost: (Math.random() * 200 + 50) * quantity
        };
      } 
      // Check for sell intent
      else if (lowercaseMessage.includes('sell')) {
        const stockMatch = message.match(/sell.+?(?:of\s+)?([A-Za-z]+)/) || [];
        const stock = stockMatch[1] || 'position';
        
        response = `I can help you sell your ${stock.toUpperCase()} position. Based on your current holdings, you have approximately ${Math.floor(Math.random() * 100) + 1} shares. Would you like to proceed?`;
        
        intent = {
          action: 'SELL',
          symbol: stock.toUpperCase(),
          quantity: 'ALL',
          price: 'MARKET'
        };
      } 
      // Check for analysis intent
      else if (lowercaseMessage.includes('analyze') || lowercaseMessage.includes('outlook') || lowercaseMessage.includes('what')) {
        const stockMatch = message.match(/(?:analyze|outlook|price of)\s+([A-Za-z]+)/) || [];
        const stock = stockMatch[1] || 'the market';
        
        const sentimentOptions = ['BULLISH', 'BEARISH', 'NEUTRAL'];
        const sentiment = sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];
        const direction = sentiment === 'BULLISH' ? 'upward' : sentiment === 'BEARISH' ? 'downward' : 'sideways';
        
        response = `Based on my analysis of ${stock.toUpperCase()}, the short-term outlook appears ${sentiment.toLowerCase()}. Key technical indicators suggest a ${direction} trend over the next few sessions. The RSI is ${Math.floor(Math.random() * 100)}, which indicates ${sentiment === 'BULLISH' ? 'potential buying pressure' : sentiment === 'BEARISH' ? 'potential selling pressure' : 'balanced supply and demand'}. Would you like me to prepare a trade based on this analysis?`;
      }
      // Default response
      else {
        response = `I've analyzed your request: "${message}". Would you like me to help with market analysis, placing a trade, or managing your portfolio?`;
      }
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }]);
      
      setAiResponse(response);
      setTradeIntent(intent);
      setIsProcessing(false);
    }, 2000);
  };

  // Format relative time for messages
  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Format confidence as color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <Container className="py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" /> 
            Smart Trading AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Use natural language to analyze markets and execute trades
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <Tabs defaultValue="voice" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="voice" className="flex items-center gap-1" onClick={() => setSelectedTab('voice')}>
                    <Mic className="h-4 w-4" /> Voice Commands
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-1" onClick={() => setSelectedTab('chat')}>
                    <MessageSquare className="h-4 w-4" /> Chat Interface
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="p-4">
              <TabsContent value="voice" className="mt-0 space-y-4">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  {microphoneAccess === false ? (
                    <div className="space-y-2">
                      <HelpCircle className="h-16 w-16 text-orange-500 mx-auto" />
                      <h3 className="text-xl font-semibold">Microphone Access Required</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Please enable microphone access in your browser settings to use voice commands.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setMicrophoneAccess(null)}
                        className="mt-4"
                      >
                        Check Again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div 
                        className={cn(
                          "w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
                          isRecording 
                            ? "bg-red-500/20 border-4 border-red-500 scale-110" 
                            : isProcessing 
                              ? "bg-yellow-500/20 border-4 border-yellow-500"
                              : "bg-primary/20 border-4 border-primary hover:bg-primary/30"
                        )}
                        onClick={toggleRecording}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
                        ) : isRecording ? (
                          <Square className="h-12 w-12 text-red-500" />
                        ) : (
                          <Mic className="h-12 w-12 text-primary" />
                        )}
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2">
                        {isRecording 
                          ? "Listening..." 
                          : isProcessing 
                            ? "Processing your request..." 
                            : transcription 
                              ? "Command Received" 
                              : "Tap to Speak"}
                      </h3>
                      
                      {transcription && !isRecording && !isProcessing && (
                        <div className="bg-muted rounded-lg p-4 max-w-md mb-6">
                          <p className="text-foreground">{transcription}</p>
                        </div>
                      )}
                      
                      {aiResponse && !isRecording && !isProcessing && (
                        <div className="space-y-4 max-w-md">
                          <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">AI Response</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-foreground">{aiResponse}</p>
                            </CardContent>
                          </Card>
                          
                          {tradeIntent && (
                            <Card className="border-green-500/20 bg-green-500/5">
                              <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                  <BrainCircuit className="h-5 w-5 text-green-500" />
                                  <CardTitle className="text-lg">Trade Intent Detected</CardTitle>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Action:</span>
                                  <span className={`font-medium ${tradeIntent.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tradeIntent.action}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Symbol:</span>
                                  <span className="font-medium">{tradeIntent.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Quantity:</span>
                                  <span className="font-medium">{tradeIntent.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Price:</span>
                                  <span className="font-medium">{tradeIntent.price}</span>
                                </div>
                                {tradeIntent.estimatedCost && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Est. Cost:</span>
                                    <span className="font-medium">${tradeIntent.estimatedCost.toFixed(2)}</span>
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter>
                                <div className="flex gap-2 w-full">
                                  <Button variant="outline" className="flex-1">
                                    Edit Order
                                  </Button>
                                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Execute Trade
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0 space-y-4 h-[600px] flex flex-col">
                <ScrollArea className="pr-4 flex-grow">
                  <div className="space-y-4">
                    {chatHistory.map((message, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "max-w-[80%] rounded-lg p-4",
                            message.role === 'user' 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1 text-right">{formatRelativeTime(message.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex items-center gap-2 pt-2">
                  <Input 
                    placeholder="Ask about markets or enter a trade command..." 
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    disabled={isProcessing}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isProcessing || userMessage.trim() === ''}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Smart Trade Panel</CardTitle>
              <CardDescription>Execute trades with AI assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <SmartTradePanel />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                AI Trading Signals
              </CardTitle>
              <CardDescription>Latest market insights from our AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiSignals.map((signal, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">{signal.symbol}</span>
                        <Badge variant={signal.direction === 'buy' ? "default" : "destructive"} className="capitalize">
                          {signal.direction}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(signal.timestamp)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span className="font-medium">${signal.price}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timeframe: </span>
                        <span className="font-medium">{signal.timeframe}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground text-xs">Confidence: </span>
                        <span className={`font-medium ${getConfidenceColor(signal.confidence)}`}>
                          {signal.confidence}%
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs">Place Trade</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View All Signals
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Voice Command Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-muted rounded-md text-sm">
                "Buy 100 shares of Apple stock at market price"
              </div>
              <div className="p-2 bg-muted rounded-md text-sm">
                "What's your analysis on Tesla for the next week?"
              </div>
              <div className="p-2 bg-muted rounded-md text-sm">
                "Sell half of my Bitcoin position"
              </div>
              <div className="p-2 bg-muted rounded-md text-sm">
                "Set a stop loss for AMD at 115 dollars"
              </div>
              <div className="p-2 bg-muted rounded-md text-sm">
                "Show me bullish stocks in the tech sector"
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                AI Trading Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Natural language trade execution saves time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>AI analyzes 100+ technical indicators instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Sentiment analysis across news and social feeds</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Trade execution confirmation reduces errors</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default TradingAIPage;