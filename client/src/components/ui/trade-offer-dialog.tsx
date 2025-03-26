import { useState, useEffect } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { TRADING_SYMBOLS } from "../../lib/constants";
import { useBrokerAggregator } from "../../lib/stores/useBrokerAggregator";
import { cn } from "../../lib/utils";

interface TradeOfferDialogProps {
  className?: string;
}

export function TradeOfferDialog({ className }: TradeOfferDialogProps) {
  const { tradeOffers } = useMultiplayer();
  const { executeTrade } = useBrokerAggregator();
  const [showNotification, setShowNotification] = useState(false);
  
  // Show notification when new trade offers arrive
  useEffect(() => {
    if (tradeOffers.length > 0) {
      setShowNotification(true);
      
      // Play notification sound
      const notificationSound = new Audio("/sounds/notification.mp3");
      notificationSound.play().catch(err => console.error("Failed to play notification sound:", err));
    }
  }, [tradeOffers.length]);
  
  const handleAcceptOffer = async (offerId: string) => {
    // Find the offer
    const offer = tradeOffers.find(o => o.id === offerId);
    if (!offer) return;
    
    try {
      // Execute the trade using the broker aggregator
      const result = await executeTrade({
        symbol: offer.symbol,
        quantity: offer.quantity,
        action: offer.side,
        orderType: 'market'
      });
      
      if (result.success) {
        // Show success message
        alert(`Trade executed successfully! Order ID: ${result.orderId}`);
      } else {
        // Show error message
        alert(`Trade execution failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error executing trade:", error);
      alert(`Trade execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // If no offers, don't render anything
  if (tradeOffers.length === 0 && !showNotification) {
    return null;
  }
  
  return (
    <div className={cn(
      "fixed bottom-5 right-5 bg-gray-900/95 text-white rounded-lg shadow-lg p-4 w-80 z-50",
      className
    )}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Trade Offers</h3>
        <button 
          onClick={() => setShowNotification(false)}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {tradeOffers.length === 0 ? (
        <div className="text-center text-gray-400 py-4">
          No trade offers available at the moment.
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {tradeOffers.map((offer) => (
            <div 
              key={offer.id}
              className="bg-gray-800 rounded-lg p-3 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-blue-300">
                  From: {offer.senderUsername}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  offer.side === "buy" ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
                )}>
                  {offer.side.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="font-semibold">{offer.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span>{offer.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price:</span>
                  <span>${offer.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span>${(offer.price * offer.quantity).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAcceptOffer(offer.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowNotification(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}