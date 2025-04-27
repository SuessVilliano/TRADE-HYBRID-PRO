import { useEffect } from 'react';
import { tradeSignalService, TradeSignal } from '@/lib/services/trade-signal-service';

interface NexusIntegrationProps {
  onSignalReceived?: (signal: TradeSignal) => void;
}

export function NexusIntegration({ onSignalReceived }: NexusIntegrationProps) {
  useEffect(() => {
    // Listen for signals that were copied to Nexus
    const handleCopiedToNexus = (signalId: string) => {
      const signal = tradeSignalService.getSignalById(signalId);
      
      if (signal && onSignalReceived) {
        // Forward the signal to the parent component
        onSignalReceived(signal);
      }
    };
    
    // Subscribe to Nexus copy events from the trade signal service
    tradeSignalService.subscribe('nexus_copy', handleCopiedToNexus);
    
    return () => {
      // Clean up subscription when component unmounts
      tradeSignalService.unsubscribe('nexus_copy', handleCopiedToNexus);
    };
  }, [onSignalReceived]);
  
  // This is a non-visual component, so it doesn't render anything
  return null;
}