import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

interface THCPriceDisplayProps {
  className?: string;
  compact?: boolean;
}

export function THCPriceDisplay({ className = '', compact = false }: THCPriceDisplayProps) {
  // In a real app, this would fetch from an API
  const [price, setPrice] = useState(0.168);
  const [priceChange, setPriceChange] = useState(3.2);
  
  // Simulate a live price feed
  useEffect(() => {
    const interval = setInterval(() => {
      // Random small fluctuation
      const fluctuation = (Math.random() * 0.005) - 0.0025;
      const newPrice = price + fluctuation;
      setPrice(newPrice);
      
      // Update price change percentage based on new fluctuation
      const changePercentage = priceChange + (fluctuation / price) * 100;
      setPriceChange(changePercentage);
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [price, priceChange]);
  
  // Format to 4 decimal places for price, 1 for percentage
  const formattedPrice = price.toFixed(4);
  const formattedChange = priceChange.toFixed(1);
  const isPositive = priceChange >= 0;
  
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <Coins className="h-4 w-4 mr-1 text-yellow-500" />
        <span className="font-medium">${formattedPrice}</span>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center">
        <Coins className="h-5 w-5 mr-2 text-yellow-500" />
        <span className="font-bold">THC Token</span>
      </div>
      <div className="flex items-center mt-1">
        <span className="text-lg font-bold">${formattedPrice}</span>
        <span className={`ml-2 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{formattedChange}%
        </span>
      </div>
    </div>
  );
}