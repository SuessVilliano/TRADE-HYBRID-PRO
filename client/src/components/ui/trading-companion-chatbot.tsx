import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Clock, Trash, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Separator } from './separator';
import { ScrollArea } from './scroll-area';
import { Avatar } from './avatar';
import { AvatarFallback } from './avatar';
import { AvatarImage } from './avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

interface TradingCompanionChatbotProps {
  selectedSymbol?: string;
}

export function TradingCompanionChatbot({ selectedSymbol = 'BITSTAMP:BTCUSD' }: TradingCompanionChatbotProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `Hi there! I'm your personal trading assistant. I can help with market analysis, trading strategies, and answer questions about ${selectedSymbol.split(':')[1] || 'cryptocurrencies'}. How can I assist you today?`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Update initial message when selected symbol changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([
        {
          id: '1',
          content: `Hi there! I'm your personal trading assistant. I can help with market analysis, trading strategies, and answer questions about ${selectedSymbol.split(':')[1] || 'cryptocurrencies'}. How can I assist you today?`,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [selectedSymbol]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateOpenAIResponse = async (userMessage: string, symbol: string) => {
    setIsThinking(true);
    
    try {
      // Generate a simulated response based on the message content and symbol
      const topics = {
        'analysis': [
          `Looking at ${symbol}, the current market structure shows support at recent lows. Volume has been increasing on up moves, which is typically bullish.`,
          `${symbol} is currently in a consolidation phase after the recent volatility. Key resistance levels to watch are at previous highs.`,
          `The technical indicators for ${symbol} are mixed. RSI shows potential oversold conditions, while MACD is still in bearish territory.`
        ],
        'strategy': [
          `For ${symbol}, a trend-following strategy might work well in the current market. Consider using the 20/50 EMA crossover system with proper risk management.`,
          `Given the current volatility in ${symbol}, you might want to consider a breakout strategy with confirmation from volume indicators.`,
          `For ${symbol} trading, consider using a scaled entry approach, buying partial positions at key support levels.`
        ],
        'risk': [
          `When trading ${symbol}, always limit your risk to 1-2% of your portfolio per trade. The current volatility suggests using wider stops than normal.`,
          `For ${symbol}, consider using options strategies to limit downside risk while maintaining upside potential.`,
          `Given the current market conditions for ${symbol}, you might want to reduce position sizes by 25-50% and focus on capital preservation.`
        ],
        'general': [
          `${symbol} has been following the broader market trends lately. Consider monitoring sector rotation and overall market sentiment for clues.`,
          `The trading volume for ${symbol} has been increasing, which often precedes significant price movements in either direction.`,
          `Historical patterns suggest ${symbol} often experiences increased volatility during this time of year. Prepare your trading plan accordingly.`
        ]
      };
      
      // Determine which topic the message is most related to
      let topicResponses = topics.general;
      
      if (userMessage.toLowerCase().includes('analysis') || 
          userMessage.toLowerCase().includes('chart') || 
          userMessage.toLowerCase().includes('indicators')) {
        topicResponses = topics.analysis;
      } else if (userMessage.toLowerCase().includes('strategy') || 
                userMessage.toLowerCase().includes('trading plan') || 
                userMessage.toLowerCase().includes('approach')) {
        topicResponses = topics.strategy;
      } else if (userMessage.toLowerCase().includes('risk') || 
                userMessage.toLowerCase().includes('stop loss') || 
                userMessage.toLowerCase().includes('position size')) {
        topicResponses = topics.risk;
      }
      
      // Randomly select a response from the appropriate topic
      const responseIndex = Math.floor(Math.random() * topicResponses.length);
      
      // Additional information based on symbols
      let additionalInfo = '';
      if (symbol.includes('BTC')) {
        additionalInfo = ' Bitcoin has been showing interesting correlation with traditional markets lately, particularly with tech stocks.';
      } else if (symbol.includes('ETH')) {
        additionalInfo = ' Ethereum\'s recent performance has been influenced by the broader DeFi ecosystem developments.';
      } else if (symbol.includes('SOL')) {
        additionalInfo = ' Solana\'s ecosystem growth and transaction metrics are important factors to monitor beyond price action.';
      } else if (symbol.includes('XAU') || symbol.includes('GC1')) {
        additionalInfo = ' Gold prices are typically influenced by inflation expectations and real interest rates.';
      } else if (symbol.includes('NQ') || symbol.includes('MNQ')) {
        additionalInfo = ' The Nasdaq futures are heavily weighted toward technology stocks, making them sensitive to tech sector news.';
      }
      
      const response = topicResponses[responseIndex] + additionalInfo;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Sorry, I encountered an error while generating a response. Please try again later.';
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || isThinking) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Generate AI response
    const aiResponse = await generateOpenAIResponse(input, selectedSymbol);
    
    // Add AI message
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        content: `Hi there! I'm your personal trading assistant. I can help with market analysis, trading strategies, and answer questions about ${selectedSymbol.split(':')[1] || 'cryptocurrencies'}. How can I assist you today?`,
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
  };

  const downloadConversation = () => {
    const conversationText = messages
      .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-hybrid-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const suggestedQuestions = [
    `What's your analysis on ${selectedSymbol.split(':')[1] || 'BTC/USD'}?`,
    `What trading strategy would you recommend for ${selectedSymbol.split(':')[1] || 'BTC/USD'}?`,
    `What are the key support and resistance levels for ${selectedSymbol.split(':')[1] || 'BTC/USD'}?`,
    `How should I manage risk when trading ${selectedSymbol.split(':')[1] || 'BTC/USD'}?`
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-md overflow-hidden">
      {/* Chat header */}
      <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/assistant-avatar.png" alt="AI Trading Assistant" />
            <AvatarFallback className="bg-blue-600">
              <Bot size={16} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">Trading Companion</h3>
            <p className="text-xs text-slate-400">Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={clearConversation} className="h-7 w-7">
                  <Trash size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={downloadConversation} className="h-7 w-7">
                  <Download size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Chat messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.role === 'user' 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-800 border border-slate-700"
                )}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'assistant' ? (
                    <Bot size={14} className="mr-1" />
                  ) : (
                    <User size={14} className="mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {message.role === 'assistant' ? 'Assistant' : 'You'}
                  </span>
                  <span className="ml-2 text-xs opacity-70 flex items-center">
                    <Clock size={10} className="mr-1" />
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-slate-800 border border-slate-700">
                <div className="flex items-center mb-1">
                  <Bot size={14} className="mr-1" />
                  <span className="text-xs font-medium">Assistant</span>
                </div>
                <div className="flex space-x-1 items-center h-6">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Suggested questions */}
      <div className="px-3 py-2 bg-slate-800/50 border-t border-slate-700">
        <div 
          className="flex justify-between items-center cursor-pointer mb-2" 
          onClick={() => setExpandedOptions(!expandedOptions)}
        >
          <span className="text-xs font-medium text-slate-400">Suggested Questions</span>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
            {expandedOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>
        
        {expandedOptions && (
          <div className="grid grid-cols-1 gap-2 mb-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start h-auto py-1.5 text-xs text-left bg-slate-800 border-slate-700"
                onClick={() => {
                  setInput(question);
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                {question}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="flex items-end space-x-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about trading..."
            className="min-h-[60px] max-h-[150px] bg-slate-900 border-slate-700 resize-none"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={input.trim() === '' || isThinking}
            size="icon"
            className="h-[36px] w-[36px] rounded-full flex-shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TradingCompanionChatbot;