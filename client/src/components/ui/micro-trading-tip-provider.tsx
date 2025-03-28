import { ReactNode, useEffect } from 'react';
import { MicroTradingTip } from './micro-trading-tip';
import { useTradingTips } from '../../lib/stores/useTradingTips';

interface MicroTradingTipProviderProps {
  children: ReactNode;
}

export function MicroTradingTipProvider({ children }: MicroTradingTipProviderProps) {
  const { fetchTips, tips } = useTradingTips();
  
  // Load tips on mount
  useEffect(() => {
    if (tips.length === 0) {
      fetchTips();
    }
  }, [fetchTips, tips.length]);
  
  return (
    <>
      {children}
      <MicroTradingTip />
    </>
  );
}