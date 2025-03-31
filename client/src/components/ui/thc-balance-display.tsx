import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { formatCurrency, formatCompactNumber } from '../../lib/utils';

interface THCBalanceDisplayProps {
  className?: string;
}

export default function THCBalanceDisplay({ className }: THCBalanceDisplayProps) {
  const [thcBalance, setThcBalance] = useState<number>(1250);
  const [usdValue, setUsdValue] = useState<number>(125);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate fetching balance (would be connected to blockchain in production)
  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        // This would be a real API call in production
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setThcBalance(1250 + Math.floor(Math.random() * 100));
        setUsdValue(125 + Math.floor(Math.random() * 10));
      } catch (error) {
        console.error("Error fetching THC balance:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
    // Refresh every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format balance for display
  let formattedBalance = "0 THC";
  if (thcBalance > 0) {
    formattedBalance = formatCompactNumber(thcBalance) + ' THC';
  }
  
  return (
    <div className={cn(
      "flex items-center bg-slate-800 rounded-md px-3 py-1.5 text-sm border border-slate-700",
      className
    )}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{formattedBalance}</span>
          {isLoading && (
            <span className="inline-block h-3 w-3 rounded-full bg-blue-500/50 animate-pulse"></span>
          )}
        </div>
        <span className="text-xs text-slate-400">≈ {formatCurrency(usdValue)}</span>
      </div>
    </div>
  );
}