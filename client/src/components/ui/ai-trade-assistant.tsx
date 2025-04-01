import React from 'react';
import { AITradingAssistant } from './ai-trading-assistant';

interface AITradeAssistantProps {
  apiKeyStatus?: boolean;
  selectedSymbol?: string;
}

export const AiTradeAssistant: React.FC<AITradeAssistantProps> = ({ 
  apiKeyStatus,
  selectedSymbol = 'BINANCE:SOLUSDT'
}) => {
  return (
    <div className="h-full">
      <AITradingAssistant className="h-full" selectedSymbol={selectedSymbol} />
    </div>
  );
};

// Also export as default for backward compatibility
export default AiTradeAssistant;