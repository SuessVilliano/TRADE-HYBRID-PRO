// This component is deprecated and has been replaced by the EnhancedAIAssistant component.
// It is kept for backwards compatibility but should not be used in new code.

import React from 'react';
import { EnhancedAIAssistant } from './enhanced-ai-assistant';

interface AITradeAssistantProps {
  selectedSymbol?: string;
}

const AITradeAssistant: React.FC<AITradeAssistantProps> = ({ 
  selectedSymbol = 'BINANCE:SOLUSDT'
}) => {
  // Display a console warning about deprecation
  React.useEffect(() => {
    console.warn('AITradeAssistant is deprecated. Please use EnhancedAIAssistant instead.');
  }, []);
  
  return (
    <div className="h-full">
      <EnhancedAIAssistant className="h-full" />
    </div>
  );
};

export default AITradeAssistant;