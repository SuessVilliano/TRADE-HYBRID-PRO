import React from 'react';
import { AITradingAssistant } from './ai-trading-assistant';

interface AITradeAssistantProps {
  selectedSymbol?: string;
}

const AITradeAssistant: React.FC<AITradeAssistantProps> = ({ 
  selectedSymbol = 'BINANCE:SOLUSDT'
}) => {
  return (
    <div className="h-full">
      <AITradingAssistant className="h-full" selectedSymbol={selectedSymbol} />
    </div>
  );
};

export default AITradeAssistant;