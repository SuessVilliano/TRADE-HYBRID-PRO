import React, { useState, useEffect, useRef } from 'react';
import { Container } from '@/components/ui/container';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  MicOff, 
  SendHorizonal, 
  BarChart4, 
  BookOpen, 
  Brain, 
  ChevronRight,
  Lightbulb,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTradeCommand?: boolean;
}

const TradingAIView: React.FC = () => {
  const { toast } = useToast();
  const [listening, setListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello, I\'m your AI Trading Assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [muted, setMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Example AI responses for demo purposes
  const aiResponses = [
    "I've analyzed the market conditions and detected a potential buying opportunity for AAPL. The stock has shown strong support at current levels with increasing volume.",
    "Based on technical indicators, TSLA is approaching a resistance level. Consider setting a stop loss if you're currently in a long position.",
    "I'm seeing unusual options activity for NVDA today. This could indicate institutional interest and potential price movement.",
    "The fear and greed index is showing extreme fear in the market today. Historically, this has been a contrarian buying opportunity for quality stocks.",
    "I've analyzed your trade history and noticed your win rate is higher on momentum trades compared to reversal trades. Would you like me to focus more on momentum setups?",
  ];
  
  // Example trade commands for demo purposes
  const tradeCommands = [
    "Buy 10 shares of AAPL at market",
    "Sell 5 shares of TSLA at limit $250.50",
    "Set stop loss for AMZN at $140.25",
    "Close half position in MSFT",
    "Create alert when SPY breaks below $450",
  ];
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Simulated voice recognition functionality
  const toggleListening = () => {
    if (listening) {
      setListening(false);
      // In a real app, we would stop the actual speech recognition here
      toast({
        title: "Voice recognition stopped",
        description: "Voice-to-text conversion paused.",
      });
    } else {
      setListening(true);
      // In a real app, we would start the actual speech recognition here
      toast({
        title: "Listening...",
        description: "Speak now. Your voice will be converted to text.",
      });
      
      // Simulate speech recognition with random example
      const timeout = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds
      setTimeout(() => {
        // Pick a random example
        const examples = [...tradeCommands, "How is the market doing today?", "What's your analysis on tech stocks?"];
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        setTranscription(randomExample);
        setListening(false);
      }, timeout);
    }
  };
  
  // Handle sending a message (either typed or transcribed)
  const handleSendMessage = () => {
    const messageText = transcription || inputMessage;
    if (!messageText.trim()) return;
    
    // Determine if the message is a trade command
    const isTrade = isTradeCommand(messageText);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
      isTradeCommand: isTrade,
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInputMessage('');
    setTranscription('');
    
    // Simulate AI response
    setTimeout(() => {
      let response: string;
      
      if (isTrade) {
        // If it's a trade command, respond accordingly
        response = `I've processed your trade command: "${messageText}". ${Math.random() > 0.5 ? 'Order executed successfully.' : 'Order queued and awaiting market open.'}`;
      } else {
        // Otherwise, use a general AI response
        response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if not muted
      if (!muted) {
        speakResponse(response);
      }
    }, 1000);
  };
  
  // Check if a message is a trade command
  const isTradeCommand = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes('buy') || 
      lowerText.includes('sell') || 
      lowerText.includes('trade') ||
      lowerText.includes('limit') ||
      lowerText.includes('stop loss') ||
      lowerText.includes('position') ||
      lowerText.includes('order') ||
      lowerText.includes('shares')
    );
  };
  
  // Simulate text-to-speech
  const speakResponse = (text: string) => {
    // In a real app, we would use the actual Web Speech API here
    toast({
      title: "Speaking response",
      description: "AI response is being spoken (simulated).",
    });
  };
  
  // Handle pressing Enter to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <Container className="py-6">
      <Card className="border-0 shadow-none bg-background">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Brain className="h-6 w-6 mr-2 text-primary" />
                AI Trading Assistant
              </CardTitle>
              <CardDescription>
                Voice-enabled AI that can analyze markets and execute trades
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setMuted(!muted)}
              title={muted ? "Unmute AI responses" : "Mute AI responses"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              <div className="border rounded-md h-[400px] flex flex-col">
                <ScrollArea className="flex-grow p-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`mb-4 ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } ${message.isTradeCommand ? 'border-2 border-yellow-500' : ''}`}
                      >
                        {message.isTradeCommand && (
                          <Badge variant="outline" className="mb-2 bg-yellow-500/10">
                            Trade Command
                          </Badge>
                        )}
                        <p>{message.content}</p>
                        <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    {transcription ? (
                      <div className="flex-grow rounded-md border bg-background px-3 py-2">
                        {transcription}
                      </div>
                    ) : (
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message or press the mic to speak..."
                        className="flex-grow"
                      />
                    )}
                    
                    <Button 
                      variant={listening ? "destructive" : "outline"}
                      size="icon"
                      onClick={toggleListening}
                      className={listening ? "animate-pulse" : ""}
                    >
                      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    
                    <Button onClick={handleSendMessage}>
                      <SendHorizonal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                  Voice Command Examples
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tradeCommands.slice(0, 4).map((command, index) => (
                    <div key={index} className="text-sm flex items-center">
                      <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{command}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                      Market Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is a placeholder for the AI market analysis dashboard. In the full implementation, 
                      this section would display real-time market data, sentiment analysis, and AI-generated insights
                      based on current market conditions and your portfolio.
                    </p>
                    <div className="mt-4">
                      <Button variant="outline">
                        Request Detailed Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section would provide AI-driven risk assessment for your current positions
                      and potential trades, including volatility analysis, correlation metrics, and portfolio
                      diversification recommendations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="help">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    Using the AI Trading Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Voice Commands</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the microphone icon to start voice recognition. Speak clearly and use natural language
                      to ask questions or issue trade commands. Click again to stop recording.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-1">Trade Commands</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      The AI can understand and execute various trade commands. Here are some examples:
                    </p>
                    <ul className="space-y-2">
                      {tradeCommands.map((command, index) => (
                        <li key={index} className="text-sm bg-muted p-2 rounded-md">
                          "{command}"
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-1">Market Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Ask the AI about market conditions, specific stocks, or technical analysis. 
                      For example: "What's your analysis on AAPL?" or "How are tech stocks performing today?"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Note: This is a simulation of AI trading functionality. In the full implementation, 
            this would connect to real trading APIs and market data sources.
          </p>
        </CardFooter>
      </Card>
    </Container>
  );
};

export default TradingAIView;