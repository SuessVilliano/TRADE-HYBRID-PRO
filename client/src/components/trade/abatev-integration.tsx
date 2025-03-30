import { useEffect } from 'react';
import { tradeSignalService, TradeSignal } from '@/lib/services/trade-signal-service';

interface ABATEVIntegrationProps {
  onSignalReceived?: (signal: TradeSignal) => void;
}

export function ABATEVIntegration({ onSignalReceived }: ABATEVIntegrationProps) {
  useEffect(() => {
    // Listen for signals that were copied to ABATEV
    const handleCopiedToABATEV = (signalId: string) => {
      const signal = tradeSignalService.getSignalById(signalId);
      
      if (signal && onSignalReceived) {
        // Forward the signal to the parent component
        onSignalReceived(signal);
      }
    };
    
    // Subscribe to ABATEV copy events from the trade signal service
    tradeSignalService.subscribe('abatev_copy', handleCopiedToABATEV);
    
    return () => {
      // Clean up subscription when component unmounts
      tradeSignalService.unsubscribe('abatev_copy', handleCopiedToABATEV);
    };
  }, [onSignalReceived]);
  
  // This is a non-visual component, so it doesn't render anything
  return null;
}

export default ABATEVIntegration;