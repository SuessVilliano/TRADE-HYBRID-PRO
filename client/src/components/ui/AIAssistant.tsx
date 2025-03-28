import React, { useState } from 'react';
import { Button } from './button';

interface AIAssistantProps {
  className?: string;
}

export default function AIAssistant({ className }: AIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI trading assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Add user message to conversation
    setConversation([...conversation, { role: 'user', content: userInput }]);
    
    // Clear input
    const query = userInput;
    setUserInput('');
    
    // Simulate AI processing
    setIsLoading(true);
    
    try {
      // Here we would actually call an AI API with the user's query
      // For now, let's simulate a response
      setTimeout(() => {
        let aiResponse = '';
        
        if (query.toLowerCase().includes('market') || query.toLowerCase().includes('trend')) {
          aiResponse = 'Based on current market analysis, we\'re seeing a bullish trend in tech stocks and cryptocurrency. Consider watching ETH and BTC for potential entry points.';
        } else if (query.toLowerCase().includes('risk') || query.toLowerCase().includes('manage')) {
          aiResponse = 'For risk management, I recommend setting stop losses at 2-5% below entry, depending on volatility. Consider position sizing of no more than 2% of your portfolio per trade.';
        } else if (query.toLowerCase().includes('signal') || query.toLowerCase().includes('alert')) {
          aiResponse = 'I\'ve set up alerts for BTC crossing the $65,000 threshold and ETH crossing $3,500. You\'ll be notified when these conditions are met.';
        } else {
          aiResponse = 'I understand you\'re asking about ' + query + '. To provide more specific advice, could you clarify what type of trading information you\'re looking for?';
        }
        
        // Add AI response to conversation
        setConversation(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      setConversation(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again.' }]);
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div className="p-4 bg-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">AI Trading Assistant</h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </Button>
      </div>
      
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'h-96' : 'h-64'} overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Conversation history */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-900">
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block p-3 rounded-lg bg-slate-700">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="flex">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about market analysis, trading ideas..."
                className="flex-1 bg-slate-700 text-white rounded-l-md px-3 py-2 focus:outline-none"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                className="rounded-l-none"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick action buttons */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setUserInput('What\'s the current market trend?');
            handleSendMessage();
          }}
          className="text-xs"
        >
          Market Analysis
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setUserInput('Suggest risk management for my trades');
            handleSendMessage();
          }}
          className="text-xs"
        >
          Risk Management
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setUserInput('Set price alerts for BTC and ETH');
            handleSendMessage();
          }}
          className="text-xs"
        >
          Set Alerts
        </Button>
      </div>
    </div>
  );
}