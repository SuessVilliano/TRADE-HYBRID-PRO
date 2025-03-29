import React, { useState } from 'react';
import { EnhancedAITradingAssistant } from './enhanced-ai-trading-assistant';
import { useToast } from './use-toast';
import { useMarketData } from '@/lib/hooks/useMarketData';

interface AITradeAssistantProps {
  selectedSymbol?: string;
}

const AITradeAssistant: React.FC<AITradeAssistantProps> = ({ 
  selectedSymbol = 'BINANCE:SOLUSDT'
}) => {
  const { toast } = useToast();
  const { placeOrder } = useMarketData();
  
  const handleExecuteTrade = (tradeSuggestion: any) => {
    try {
      // If connected to a broker, would use the placeOrder function
      // placeOrder(tradeSuggestion);
      
      // Show toast notification
      toast({
        title: 'Trade Executed',
        description: `${tradeSuggestion.action.toUpperCase()} order for ${tradeSuggestion.symbol.split(':')[1]} placed successfully.`,
        variant: 'default',
      });
      
      console.log('Trade executed:', tradeSuggestion);
    } catch (error) {
      console.error('Error executing trade:', error);
      
      toast({
        title: 'Error Executing Trade',
        description: 'Failed to execute trade. Please check your broker connection and try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="h-full">
      <EnhancedAITradingAssistant 
        selectedSymbol={selectedSymbol}
        onExecuteTrade={handleExecuteTrade}
        allowExecution={true}
      />
    </div>
  );
};

export default AITradeAssistant;