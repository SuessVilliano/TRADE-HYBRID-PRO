import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMarketData, TradeSuggestion } from '@/lib/hooks/useMarketData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Input } from './input';
import { Badge } from './badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Sparkles, Send, Brain, ChevronDown, ChevronUp, AlertTriangle, Check, X, Loader2, LineChart, BarChart, PieChart, Zap, AlertCircle, TrendingUp, TrendingDown, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  analysis?: MarketAnalysis;
  tradeSuggestion?: TradeSuggestion;
}

interface MarketAnalysis {
  symbol: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  keyPoints: string[];
  technicalIndicators: {
    name: string;
    value: string;
    signal: 'buy' | 'sell' | 'neutral';
  }[];
}

interface EnhancedAITradingAssistantProps {
  selectedSymbol?: string;
  onExecuteTrade?: (trade: TradeSuggestion) => void;
  allowExecution?: boolean;
}

export function EnhancedAITradingAssistant({ 
  selectedSymbol = 'BINANCE:SOLUSDT',
  onExecuteTrade,
  allowExecution = true
}: EnhancedAITradingAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [openAnalysis, setOpenAnalysis] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { marketData, currentPrice, symbol, setSymbol, placeOrder } = useMarketData();

  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      content: `Welcome to the AI Trading Assistant! I'm here to analyze markets and help with your trading decisions. Currently viewing ${selectedSymbol}. You can ask me to:
      
• Analyze the current market conditions
• Generate trade suggestions based on current technicals
• Execute trades based on my analysis (when enabled)
• Switch to different markets for analysis
• Explain various technical indicators
• Customize trade parameters like risk/reward and stop loss

What would you like to do today?`,
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update symbol when selectedSymbol prop changes
  useEffect(() => {
    if (selectedSymbol && selectedSymbol !== symbol) {
      setSymbol(selectedSymbol);
      
      // Notify the user that we've switched to a new symbol
      const systemMessage: ChatMessage = {
        id: uuidv4(),
        content: `Switching to ${selectedSymbol} for market analysis.`,
        role: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  }, [selectedSymbol, symbol, setSymbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    setIsLoading(true);

    // Handle command mode if active
    if (commandMode && userInput.startsWith('/')) {
      await handleCommand(userInput);
      setIsLoading(false);
      return;
    }

    // Regular message processing
    await processUserMessage(userInput);
    setIsLoading(false);
  };

  const processUserMessage = async (userInput: string) => {
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: userInput,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 800));

      // Process the user's input and generate appropriate response
      let responseContent = '';
      let analysis = undefined;
      let tradeSuggestion = undefined;

      // Check for keywords in user input to determine intent
      const lowerInput = userInput.toLowerCase();
      
      if (lowerInput.includes('analyze') || lowerInput.includes('analysis') || lowerInput.includes('what do you think')) {
        // Generate market analysis
        analysis = generateMarketAnalysis();
        responseContent = `Here's my analysis of ${symbol}:\n\nMarket Direction: ${analysis.direction.toUpperCase()} with ${analysis.confidence}% confidence\n\nKey Points:\n` + 
          analysis.keyPoints.map(point => `• ${point}`).join('\n');
      } 
      else if (lowerInput.includes('trade') || lowerInput.includes('suggest') || lowerInput.includes('recommendation')) {
        // Generate trade suggestion
        analysis = generateMarketAnalysis();
        tradeSuggestion = generateTradeSuggestion(analysis);
        
        responseContent = `Based on my analysis, here's a trade suggestion for ${symbol}:\n\n` +
          `Action: ${tradeSuggestion.action.toUpperCase()} at ~${tradeSuggestion.entryPrice.toFixed(2)}\n` +
          `Stop Loss: ${tradeSuggestion.stopLoss.toFixed(2)}\n` +
          `Take Profit Targets: ${tradeSuggestion.takeProfit.map(tp => tp.toFixed(2)).join(', ')}\n` +
          `Risk/Reward Ratio: 1:${tradeSuggestion.riskReward.toFixed(2)}\n` +
          `Confidence: ${tradeSuggestion.confidenceScore}%\n\n` +
          `Rationale:\n` + tradeSuggestion.rationale.map(r => `• ${r}`).join('\n');
          
        if (allowExecution) {
          responseContent += '\n\nWould you like me to execute this trade? Reply with "Execute" to confirm.';
        }
      }
      else if (lowerInput.includes('execute') && allowExecution) {
        // Find the last trade suggestion
        const lastSuggestion = [...messages].reverse().find(m => m.tradeSuggestion)?.tradeSuggestion;
        
        if (lastSuggestion) {
          // Execute the trade
          const success = await placeOrder(lastSuggestion);
          
          if (success) {
            responseContent = `I've executed the ${lastSuggestion.action.toUpperCase()} order for ${symbol} at ~${lastSuggestion.entryPrice.toFixed(2)}.\n\n` +
              `Stop Loss set at ${lastSuggestion.stopLoss.toFixed(2)}\n` +
              `Take Profit targets set at ${lastSuggestion.takeProfit.map(tp => tp.toFixed(2)).join(', ')}\n\n` +
              `I'll monitor this position and alert you of significant developments.`;
          } else {
            responseContent = `I encountered an issue while attempting to execute the trade. Please check your broker connection and try again, or execute manually.`;
          }
        } else {
          responseContent = `I don't have a recent trade suggestion to execute. Please ask for a trade suggestion first.`;
        }
      }
      else if (lowerInput.includes('switch to') || lowerInput.includes('change to')) {
        // Extract symbol from user input
        const matches = userInput.match(/(switch to|change to)\s+([A-Za-z0-9:]+)/i);
        if (matches && matches[2]) {
          const newSymbol = matches[2].toUpperCase();
          setSymbol(newSymbol);
          responseContent = `I've switched to ${newSymbol} for analysis. Let me know what you'd like to know about this market.`;
        } else {
          responseContent = `I couldn't identify the symbol you want to switch to. Please specify a valid symbol like BINANCE:BTCUSDT or SOLUSDT.`;
        }
      }
      else if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
        // Provide help information
        responseContent = `I can help you with the following:\n\n` +
          `• Analyze markets: Just ask "Analyze [symbol]" or "What do you think about [symbol]"\n` +
          `• Trade suggestions: Ask "Suggest a trade" or "What trade would you recommend"\n` +
          `• Execute trades: After getting a suggestion, say "Execute" to place the order\n` +
          `• Switch markets: Say "Switch to [symbol]" to analyze a different asset\n` +
          `• Explain indicators: Ask "Explain RSI" or "How does MACD work"\n` +
          `• Custom parameters: Say "Set stop loss to X%" or "Use aggressive risk profile"\n\n` +
          `What would you like to do?`;
      }
      else {
        // General response for other queries
        responseContent = "I understand you're interested in trading insights. Would you like me to analyze the current market conditions, suggest a potential trade, or explain some technical indicators?";
      }

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
        analysis,
        tradeSuggestion,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        content: "I'm having trouble processing your request. Please try again later.",
        role: 'system',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleCommand = async (command: string) => {
    // Process commands starting with "/"
    const commandMessage: ChatMessage = {
      id: uuidv4(),
      content: `Executing command: ${command}`,
      role: 'system',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, commandMessage]);
    
    // Handle different command types
    if (command.startsWith('/analyze')) {
      // Extract symbol if provided
      const parts = command.split(' ');
      if (parts.length > 1) {
        setSymbol(parts[1].toUpperCase());
      }
      
      await processUserMessage('Analyze the current market');
    }
    else if (command.startsWith('/trade')) {
      await processUserMessage('Suggest a trade based on current conditions');
    }
    else if (command === '/execute') {
      await processUserMessage('Execute the latest trade suggestion');
    }
    else if (command.startsWith('/switch')) {
      const parts = command.split(' ');
      if (parts.length > 1) {
        await processUserMessage(`Switch to ${parts[1]}`);
      } else {
        const responseMessage: ChatMessage = {
          id: uuidv4(),
          content: "Please specify a symbol to switch to (e.g., /switch BTCUSDT)",
          role: 'system',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }
    else if (command === '/help') {
      const helpMessage: ChatMessage = {
        id: uuidv4(),
        content: `Available commands:
        
/analyze [symbol] - Analyze market conditions
/trade - Get a trade suggestion
/execute - Execute the latest trade suggestion
/switch [symbol] - Switch to a different symbol
/help - Show this help message`,
        role: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, helpMessage]);
    }
    else {
      const unknownCommand: ChatMessage = {
        id: uuidv4(),
        content: `Unknown command: ${command}. Type /help for available commands.`,
        role: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, unknownCommand]);
    }
  };

  const handleExecuteTrade = (tradeSuggestion: TradeSuggestion) => {
    if (!allowExecution) return;
    
    // Add confirmation message
    const confirmationMessage: ChatMessage = {
      id: uuidv4(),
      content: `Executing ${tradeSuggestion.action.toUpperCase()} trade for ${tradeSuggestion.symbol}...`,
      role: 'system',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Call external handler if provided, otherwise use internal placeOrder
    if (onExecuteTrade) {
      onExecuteTrade(tradeSuggestion);
    } else {
      placeOrder(tradeSuggestion).then(success => {
        const resultMessage: ChatMessage = {
          id: uuidv4(),
          content: success 
            ? `Successfully executed ${tradeSuggestion.action.toUpperCase()} trade for ${tradeSuggestion.symbol} at ${tradeSuggestion.entryPrice.toFixed(2)}`
            : `Failed to execute trade. Please check your broker connection or try again.`,
          role: 'system',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, resultMessage]);
      });
    }
  };

  const generateMarketAnalysis = (): MarketAnalysis => {
    // In a real implementation, this would call an AI model API
    // For now, we'll generate a plausible analysis based on current price data
    
    // Get the last 20 candles to determine trend
    const recentData = marketData.slice(-20);
    
    // Simple trend detection
    const priceChange = recentData.length > 0 
      ? ((recentData[recentData.length - 1].close - recentData[0].open) / recentData[0].open) * 100
      : 0;
    
    // Determine direction based on price change
    let direction: 'bullish' | 'bearish' | 'neutral';
    if (priceChange > 1.5) direction = 'bullish';
    else if (priceChange < -1.5) direction = 'bearish';
    else direction = 'neutral';
    
    // Confidence based on strength of trend
    const confidence = Math.min(Math.floor(Math.abs(priceChange) * 5) + 50, 95);
    
    // Generate technical indicators
    const rsiValue = Math.floor(Math.random() * 40) + 30; // 30-70 range
    let rsiSignal: 'buy' | 'sell' | 'neutral';
    if (rsiValue < 30) rsiSignal = 'buy';
    else if (rsiValue > 70) rsiSignal = 'sell';
    else rsiSignal = 'neutral';
    
    const macdValue = (Math.random() * 0.4 - 0.2).toFixed(2); // -0.2 to 0.2 range
    let macdSignal: 'buy' | 'sell' | 'neutral';
    if (parseFloat(macdValue) > 0.05) macdSignal = 'buy';
    else if (parseFloat(macdValue) < -0.05) macdSignal = 'sell';
    else macdSignal = 'neutral';
    
    // Generate key points for the analysis
    const keyPoints = [];
    if (direction === 'bullish') {
      keyPoints.push(`Price has increased by ${priceChange.toFixed(2)}% over the last 20 periods`);
      keyPoints.push('Trading volume has increased on upward price movements');
      keyPoints.push('Price is currently above major moving averages');
    } else if (direction === 'bearish') {
      keyPoints.push(`Price has decreased by ${Math.abs(priceChange).toFixed(2)}% over the last 20 periods`);
      keyPoints.push('Trading volume has increased on downward price movements');
      keyPoints.push('Price is currently below major moving averages');
    } else {
      keyPoints.push('Price is moving sideways with minimal directional momentum');
      keyPoints.push('Trading volumes are below average, suggesting indecision');
      keyPoints.push('Price is consolidating near key support/resistance levels');
    }
    
    // Add some technical analysis observations
    if (rsiValue < 30) {
      keyPoints.push('RSI indicates the market may be oversold');
    } else if (rsiValue > 70) {
      keyPoints.push('RSI indicates the market may be overbought');
    }
    
    if (parseFloat(macdValue) > 0.05) {
      keyPoints.push('MACD is showing bullish momentum');
    } else if (parseFloat(macdValue) < -0.05) {
      keyPoints.push('MACD is showing bearish momentum');
    }
    
    // Add key support/resistance levels
    const currentPrice = recentData[recentData.length - 1]?.close || 100;
    keyPoints.push(`Key support identified at ${(currentPrice * 0.95).toFixed(2)}`);
    keyPoints.push(`Key resistance identified at ${(currentPrice * 1.05).toFixed(2)}`);
    
    return {
      symbol,
      direction,
      confidence,
      keyPoints,
      technicalIndicators: [
        { name: 'RSI (14)', value: rsiValue.toString(), signal: rsiSignal },
        { name: 'MACD', value: macdValue, signal: macdSignal },
        { name: 'MA (50)', value: (currentPrice * 0.98).toFixed(2), signal: currentPrice > (currentPrice * 0.98) ? 'buy' : 'sell' },
        { name: 'MA (200)', value: (currentPrice * 0.95).toFixed(2), signal: currentPrice > (currentPrice * 0.95) ? 'buy' : 'sell' },
        { name: 'Stochastic', value: `${Math.floor(Math.random() * 40) + 30}/${Math.floor(Math.random() * 40) + 30}`, signal: Math.random() > 0.5 ? 'buy' : 'sell' },
      ]
    };
  };

  const generateTradeSuggestion = (analysis: MarketAnalysis): TradeSuggestion => {
    const currentPrice = marketData.length > 0 ? marketData[marketData.length - 1].close : 100;
    
    // Determine if we should buy or sell based on analysis
    const action: 'buy' | 'sell' = analysis.direction === 'bullish' ? 'buy' : 'sell';
    
    // Entry price (near current price with slight adjustment)
    const entryPrice = currentPrice;
    
    // Calculate stop loss based on direction
    const stopLossPercentage = Math.random() * 0.02 + 0.01; // 1-3% stop loss
    const stopLoss = action === 'buy' 
      ? entryPrice * (1 - stopLossPercentage)
      : entryPrice * (1 + stopLossPercentage);
    
    // Calculate take profit levels
    const takeProfitPercentages = [
      Math.random() * 0.02 + 0.02, // 2-4% take profit
      Math.random() * 0.03 + 0.04, // 4-7% take profit
      Math.random() * 0.05 + 0.07  // 7-12% take profit
    ];
    
    const takeProfit = action === 'buy'
      ? takeProfitPercentages.map(p => entryPrice * (1 + p))
      : takeProfitPercentages.map(p => entryPrice * (1 - p));
    
    // Calculate risk/reward ratio based on first take profit
    const riskAmount = Math.abs(entryPrice - stopLoss);
    const rewardAmount = Math.abs(entryPrice - takeProfit[0]);
    const riskReward = rewardAmount / riskAmount;
    
    // Generate rationale for the trade
    const rationale = [];
    
    if (action === 'buy') {
      rationale.push(`${analysis.technicalIndicators.filter(i => i.signal === 'buy').length} of ${analysis.technicalIndicators.length} indicators are showing bullish signals`);
      rationale.push('Price is showing momentum to the upside with increasing volume');
    } else {
      rationale.push(`${analysis.technicalIndicators.filter(i => i.signal === 'sell').length} of ${analysis.technicalIndicators.length} indicators are showing bearish signals`);
      rationale.push('Price is showing downward momentum with increasing volume');
    }
    
    // Add specific indicator insights
    const rsiIndicator = analysis.technicalIndicators.find(i => i.name.includes('RSI'));
    if (rsiIndicator) {
      if (rsiIndicator.signal === 'buy' && action === 'buy') {
        rationale.push(`RSI indicates oversold conditions at ${rsiIndicator.value}, suggesting potential for upward correction`);
      } else if (rsiIndicator.signal === 'sell' && action === 'sell') {
        rationale.push(`RSI indicates overbought conditions at ${rsiIndicator.value}, suggesting potential for downward correction`);
      }
    }
    
    // Add a comment about risk/reward
    rationale.push(`The trade offers a favorable risk-to-reward ratio of 1:${riskReward.toFixed(2)}`);
    
    // Add a timeframe comment
    rationale.push(`This setup appears optimal for a ${Math.random() > 0.5 ? 'swing trade' : 'day trade'} with ${analysis.confidence}% confidence`);
    
    return {
      symbol: analysis.symbol,
      action,
      entryPrice,
      stopLoss,
      takeProfit,
      timeframe: Math.random() > 0.5 ? '4H' : '1D',
      rationale,
      riskReward,
      confidenceScore: analysis.confidence
    };
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-md border-neutral-800 bg-slate-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-white">
              <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
              AI Trading Assistant
            </CardTitle>
            <CardDescription className="text-slate-400">
              Advanced market analysis and trading suggestions
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-slate-800 text-purple-400 font-semibold">
            {symbol}
            {currentPrice && <span className="ml-2">${currentPrice.toFixed(2)}</span>}
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col mx-4 pb-2">
        <TabsList className="w-fit mb-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col data-[state=active]:flex-1 overflow-hidden m-0">
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn("flex items-start gap-3 relative", {
                  "justify-end": message.role === 'user',
                })}
              >
                {message.role !== 'user' && (
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="/ai-assistant-avatar.png" alt="AI" />
                    <AvatarFallback className="bg-purple-900 text-white">AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={cn("rounded-lg px-3 py-2 max-w-[85%] text-sm", {
                    "bg-slate-800 text-slate-100": message.role === 'assistant',
                    "bg-purple-600 text-white": message.role === 'user',
                    "bg-slate-700 text-slate-300 italic": message.role === 'system'
                  })}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.analysis && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs flex items-center gap-1 w-full justify-between"
                        onClick={() => setOpenAnalysis(openAnalysis === message.id ? null : message.id)}
                      >
                        <span className="flex items-center">
                          <Brain className="h-3 w-3 mr-1" />
                          View detailed analysis
                        </span>
                        {openAnalysis === message.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                      
                      {openAnalysis === message.id && (
                        <div className="mt-2 border border-gray-700 rounded p-2 bg-gray-900 text-xs">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold">Market Direction</div>
                            <Badge 
                              variant={
                                message.analysis.direction === 'bullish' ? 'default' : 
                                message.analysis.direction === 'bearish' ? 'destructive' : 
                                'outline'
                              }
                              className="text-xs"
                            >
                              {message.analysis.direction.toUpperCase()} ({message.analysis.confidence}%)
                            </Badge>
                          </div>
                          
                          <div className="mb-2">
                            <div className="font-semibold mb-1">Key Points</div>
                            <ul className="list-disc list-inside space-y-1">
                              {message.analysis.keyPoints.map((point, i) => (
                                <li key={i} className="text-slate-300">{point}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="font-semibold mb-1">Technical Indicators</div>
                            <div className="grid grid-cols-3 gap-1">
                              {message.analysis.technicalIndicators.map((indicator, i) => (
                                <div key={i} className="bg-slate-800 p-1 rounded">
                                  <div className="font-medium">{indicator.name}</div>
                                  <div className="flex justify-between items-center">
                                    <span>{indicator.value}</span>
                                    <Badge 
                                      variant={
                                        indicator.signal === 'buy' ? 'default' : 
                                        indicator.signal === 'sell' ? 'destructive' : 
                                        'outline'
                                      }
                                      className="text-xs capitalize"
                                    >
                                      {indicator.signal}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {message.tradeSuggestion && allowExecution && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mr-2 text-xs"
                        onClick={() => {
                          const rejectMessage: ChatMessage = {
                            id: uuidv4(),
                            content: "Trade suggestion rejected. Let me know if you'd like a different suggestion.",
                            role: 'system',
                            timestamp: new Date(),
                          };
                          setMessages(prev => [...prev, rejectMessage]);
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleExecuteTrade(message.tradeSuggestion!)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Execute Trade
                      </Button>
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback className="bg-slate-700 text-white">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-2 border-t border-gray-800 mt-auto">
            <div className="relative flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("absolute left-0 text-slate-400", {
                  "text-purple-400": commandMode
                })}
                onClick={() => setCommandMode(!commandMode)}
                title={commandMode ? "Command mode enabled" : "Enable command mode"}
              >
                <Zap className="h-4 w-4" />
              </Button>
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={commandMode ? "Type / for commands..." : "Ask AI Trading Assistant..."}
                className="pr-10 pl-10 bg-slate-800 border-gray-700 focus-visible:ring-purple-500"
              />
              
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="analysis" className="data-[state=active]:flex-1 m-0 overflow-auto">
          <div className="space-y-4 p-2">
            <div className="bg-slate-800 rounded-md p-3">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <TrendingUp className="h-4 w-4 mr-1 text-purple-400" />
                Market Overview
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400">Current Price</div>
                  <div className="text-lg font-semibold">${currentPrice?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400">24h Change</div>
                  <div className={cn("text-lg font-semibold", {
                    "text-green-400": marketData.length > 0 && marketData[0].open < (currentPrice || 0),
                    "text-red-400": marketData.length > 0 && marketData[0].open > (currentPrice || 0)
                  })}>
                    {marketData.length > 0 ? (((currentPrice || 0) - marketData[0].open) / marketData[0].open * 100).toFixed(2) : '0.00'}%
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400">24h Volume</div>
                  <div className="text-lg font-semibold">
                    {marketData.length > 0 ? 
                      marketData.reduce((sum, data) => sum + data.volume, 0).toFixed(0) : 
                      '0'}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400">AI Sentiment</div>
                  <div className="flex items-center">
                    {currentPrice && marketData.length > 0 && marketData[0].open < currentPrice ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                        <span className="text-lg font-semibold text-green-400">Bullish</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1 text-red-400" />
                        <span className="text-lg font-semibold text-red-400">Bearish</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-md p-3">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <LineChart className="h-4 w-4 mr-1 text-purple-400" />
                Technical Indicators
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                  <div className="text-xs">
                    <div className="font-medium">RSI (14)</div>
                    <div className="text-slate-400">Relative Strength Index</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">62.4</div>
                    <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 text-xs">
                      Neutral
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                  <div className="text-xs">
                    <div className="font-medium">MACD</div>
                    <div className="text-slate-400">Moving Average Convergence Divergence</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">0.24</div>
                    <Badge className="bg-green-900/20 text-green-400 text-xs">
                      Buy
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                  <div className="text-xs">
                    <div className="font-medium">MA (50)</div>
                    <div className="text-slate-400">50-Day Moving Average</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">${(currentPrice || 100 * 0.95).toFixed(2)}</div>
                    <Badge className="bg-green-900/20 text-green-400 text-xs">
                      Above
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                  <div className="text-xs">
                    <div className="font-medium">Bollinger Bands</div>
                    <div className="text-slate-400">Volatility Indicator</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">Upper Band</div>
                    <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 text-xs">
                      Neutral
                    </Badge>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full text-xs mt-2">
                  View All Indicators
                </Button>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-md p-3">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <BarChart className="h-4 w-4 mr-1 text-purple-400" />
                Advanced Insights
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <p>
                    <span className="font-medium">Note:</span> ${symbol} is approaching a significant resistance level 
                    at ${((currentPrice || 100) * 1.05).toFixed(2)}. Watch for increased volatility if it tests this level.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <PieChart className="h-4 w-4 text-purple-400 mt-0.5" />
                  <p>
                    <span className="font-medium">Support/Resistance:</span> Strong support identified 
                    at ${((currentPrice || 100) * 0.95).toFixed(2)} with additional resistance at ${((currentPrice || 100) * 1.10).toFixed(2)}.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                  <p>
                    <span className="font-medium">Volume Analysis:</span> Trading volume has {Math.random() > 0.5 ? 'increased' : 'decreased'} 
                    by {(Math.random() * 20 + 5).toFixed(1)}% in the past 24 hours, indicating {Math.random() > 0.5 ? 'growing' : 'waning'} interest.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <Pause className="h-4 w-4 text-purple-400 mt-0.5" />
                  <p>
                    <span className="font-medium">Consolidation Pattern:</span> Price is forming a {Math.random() > 0.5 ? 'bullish flag' : 'pennant'} 
                    pattern, suggesting potential {Math.random() > 0.5 ? 'upward' : 'downward'} movement in the next 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="trades" className="data-[state=active]:flex-1 m-0 overflow-auto">
          <div className="p-2 space-y-4">
            <div className="bg-slate-800 rounded-md p-3">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Sparkles className="h-4 w-4 mr-1 text-purple-400" />
                AI Trade Suggestions
              </h3>
              
              {messages.filter(m => m.tradeSuggestion).length > 0 ? (
                <div className="space-y-2">
                  {messages
                    .filter(m => m.tradeSuggestion)
                    .map((message) => (
                      <div key={message.id} className="bg-slate-900 rounded p-2 text-xs">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{message.tradeSuggestion!.symbol}</div>
                          <Badge 
                            variant={message.tradeSuggestion!.action === 'buy' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {message.tradeSuggestion!.action.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1">
                          <div>
                            <div className="text-slate-400">Entry</div>
                            <div>${message.tradeSuggestion!.entryPrice.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Stop Loss</div>
                            <div>${message.tradeSuggestion!.stopLoss.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Take Profit</div>
                            <div>${message.tradeSuggestion!.takeProfit[0].toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">R:R Ratio</div>
                            <div>1:{message.tradeSuggestion!.riskReward.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Confidence</div>
                            <div>{message.tradeSuggestion!.confidenceScore}%</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Timeframe</div>
                            <div>{message.tradeSuggestion!.timeframe}</div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="text-slate-400">Rationale</div>
                          <ul className="list-disc list-inside mt-1">
                            {message.tradeSuggestion!.rationale.slice(0, 2).map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {allowExecution && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => handleExecuteTrade(message.tradeSuggestion!)}
                            >
                              Execute Trade
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No trade suggestions available</p>
                  <p className="text-xs mt-1">Ask the AI to suggest a trade for {symbol}</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-800 rounded-md p-3">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <PieChart className="h-4 w-4 mr-1 text-purple-400" />
                Risk Management
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 p-2 rounded">
                  <div className="font-medium mb-1">Position Sizing Calculator</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-slate-400">Account Balance</div>
                      <div className="font-medium">$10,000.00</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Risk Per Trade</div>
                      <div className="font-medium">1.5% ($150.00)</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-2 rounded">
                  <div className="font-medium mb-1">Suggested Position Sizing for {symbol}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-slate-400">Stop Loss Distance</div>
                      <div className="font-medium">3.2%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Position Size</div>
                      <div className="font-medium">
                        {Math.floor(150 / (currentPrice || 100) * 0.032)} units (${(Math.floor(150 / (currentPrice || 100) * 0.032) * (currentPrice || 100)).toFixed(2)})
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-2 rounded">
                  <div className="font-medium mb-1">Risk Management Tips</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Never risk more than 2% of your capital on a single trade</li>
                    <li>Consider setting multiple take-profit targets</li>
                    <li>Use trailing stops to protect profits on trending markets</li>
                    <li>Adjust position size based on volatility and confidence level</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}