import { TradeSignal } from "../../lib/stores/useMultiplayer";
import { cn } from "../../lib/utils";

interface TradeSignalMessageProps {
  signal: TradeSignal;
  className?: string;
}

export default function TradeSignalMessage({ signal, className }: TradeSignalMessageProps) {
  const { symbol, side, entryPrice, takeProfit, stopLoss, timeframe, description } = signal;
  
  const calculateRiskReward = () => {
    if (!entryPrice || !takeProfit || !stopLoss) return null;
    
    const priceDiffTP = Math.abs(takeProfit - entryPrice);
    const priceDiffSL = Math.abs(stopLoss - entryPrice);
    
    if (priceDiffSL === 0) return null;
    
    return (priceDiffTP / priceDiffSL).toFixed(2);
  };
  
  const riskReward = calculateRiskReward();
  
  return (
    <div className={cn("rounded text-sm", className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold">
          {symbol} ({timeframe})
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded text-xs font-semibold",
          side === "buy" ? "bg-green-600" : "bg-red-600"
        )}>
          {side.toUpperCase()}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2">
        {entryPrice !== undefined && (
          <div>
            <span className="text-xs text-gray-400">Entry</span>
            <div className="text-white">{entryPrice}</div>
          </div>
        )}
        
        {takeProfit !== undefined && (
          <div>
            <span className="text-xs text-gray-400">Take Profit</span>
            <div className="text-green-400">{takeProfit}</div>
          </div>
        )}
        
        {stopLoss !== undefined && (
          <div>
            <span className="text-xs text-gray-400">Stop Loss</span>
            <div className="text-red-400">{stopLoss}</div>
          </div>
        )}
      </div>
      
      {riskReward && (
        <div className="mb-2">
          <span className="text-xs text-gray-400">Risk/Reward</span>
          <div className="text-white">1:{riskReward}</div>
        </div>
      )}
      
      {description && (
        <div className="text-xs border-t border-gray-700 pt-1 mt-1">
          {description}
        </div>
      )}
    </div>
  );
}