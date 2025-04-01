import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { Bot, Send, User } from 'lucide-react';

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m the Trade Hybrid AI Assistant. How can I help you with your trading today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response (in a real app, we'd call an API here)
    setTimeout(() => {
      const responses = [
        "I've analyzed the current market conditions and see some interesting opportunities in the tech sector.",
        "Based on recent price action, there's strong support at the current levels. Consider a long position with tight stop loss.",
        "The chart is showing a potential double top pattern. This could indicate a reversal soon.",
        "Market sentiment is mixed right now. It might be best to wait for clearer signals before entering a new trade.",
        "I notice high volume on this breakout, which typically confirms the move. This strengthens the bullish case."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat messages */}
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg pl-3 pr-2'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-lg rounded-tl-sm rounded-br-lg pl-2 pr-3'
                } py-2 relative`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <Bot className="h-4 w-4 text-blue-500" />
                  </div>
                )}
                <div className="text-sm break-words">
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 ml-2 mt-0.5">
                    <User className="h-4 w-4 text-blue-200" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-lg rounded-tl-sm rounded-br-lg py-2 px-3 relative">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="border-t p-3">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Ask a trading question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}