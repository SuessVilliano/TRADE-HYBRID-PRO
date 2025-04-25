import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TradeSignal } from '@/lib/services/trade-signal-service';
import { cn } from '@/lib/utils';

interface SignalPerformanceChartProps {
  signal: TradeSignal;
  className?: string;
}

export function SignalPerformanceChart({ signal, className }: SignalPerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  // Generate a somewhat realistic price path based on signal type and price levels
  const generatePricePath = () => {
    const points = 100; // Number of data points
    const volatility = 0.005; // Base volatility
    
    // Determine price range based on signal type and levels
    const entry = signal.entry;
    const stopLoss = signal.stopLoss;
    const takeProfit = signal.takeProfit;
    
    // Determine trend direction and strength
    const trendDirection = signal.type === 'buy' ? 1 : -1;
    
    // Calculate range between entry and target
    const entryToTarget = Math.abs(takeProfit - entry);
    
    // Create price path
    const path: number[] = [];
    let currentPrice = entry;
    
    // Initial point is the entry
    path.push(currentPrice);
    
    // Final price should be somewhere between entry and take profit, favoring success
    // but allowing for different outcomes
    const randomOutcome = Math.random();
    const targetPercentage = randomOutcome < 0.7 ? 0.8 : (randomOutcome < 0.9 ? 0.3 : -0.5);
    const targetPrice = entry + (trendDirection * entryToTarget * targetPercentage);
    
    // Generate points with random walk, but with a bias toward the target
    for (let i = 1; i < points; i++) {
      const progress = i / points;
      const trend = trendDirection * entryToTarget * progress * 0.6;
      
      // Random component - more volatile in the middle of the chart
      const randomComponent = 
        (Math.random() - 0.5) * 
        volatility * 
        entry * 
        (progress < 0.5 ? progress * 2 : (1 - progress) * 2) * 
        3;
      
      // Bias toward final target
      const targetBias = (targetPrice - currentPrice) * 0.05;
      
      // Update price with trend, randomness, and bias
      currentPrice = currentPrice + trend + randomComponent + targetBias;
      
      // Ensure price doesn't cross stop loss too early
      if ((signal.type === 'buy' && currentPrice < stopLoss) || 
          (signal.type === 'sell' && currentPrice > stopLoss)) {
        if (i < points * 0.8) { // Allow stop loss near the end
          currentPrice = signal.type === 'buy' ? stopLoss * 1.005 : stopLoss * 0.995;
        }
      }
      
      path.push(currentPrice);
    }
    
    return path;
  };
  
  // Draw chart animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 10, right: 10, bottom: 20, left: 40 };
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Generate price data
    const prices = generatePricePath();
    
    // Find min and max prices for scaling
    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;
    
    // Calculate price to y-coordinate conversion
    const priceToY = (price: number) => {
      return height - padding.bottom - (((price - minPrice) / (maxPrice - minPrice)) * (height - padding.top - padding.bottom));
    };
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const numHLines = 4;
    for (let i = 0; i <= numHLines; i++) {
      const y = padding.top + ((height - padding.top - padding.bottom) / numHLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - ((maxPrice - minPrice) / numHLines) * i;
      ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), padding.left - 5, y + 3);
    }
    
    // Vertical grid lines
    const numVLines = 5;
    for (let i = 0; i <= numVLines; i++) {
      const x = padding.left + ((width - padding.left - padding.right) / numVLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }
    
    // Draw entry, stop loss, and take profit lines
    const entryY = priceToY(signal.entry);
    const stopLossY = priceToY(signal.stopLoss);
    const takeProfitY = priceToY(signal.takeProfit);
    
    // Entry line
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, entryY);
    ctx.lineTo(width - padding.right, entryY);
    ctx.stroke();
    
    // Stop loss line
    ctx.strokeStyle = 'rgba(255, 80, 80, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, stopLossY);
    ctx.lineTo(width - padding.right, stopLossY);
    ctx.stroke();
    
    // Take profit line
    ctx.strokeStyle = 'rgba(80, 200, 120, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, takeProfitY);
    ctx.lineTo(width - padding.right, takeProfitY);
    ctx.stroke();
    
    // Labels for lines
    ctx.font = '10px sans-serif';
    
    // Entry label
    ctx.fillStyle = 'rgba(100, 100, 255, 0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('Entry', padding.left + 5, entryY - 5);
    
    // Stop loss label
    ctx.fillStyle = 'rgba(255, 80, 80, 0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('SL', padding.left + 5, stopLossY - 5);
    
    // Take profit label
    ctx.fillStyle = 'rgba(80, 200, 120, 0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('TP', padding.left + 5, takeProfitY - 5);
    
    // Animated drawing of price line
    let currentPoint = 0;
    const totalPoints = prices.length;
    
    // Set line style for price chart
    ctx.strokeStyle = signal.type === 'buy' ? 'rgba(80, 200, 120, 1)' : 'rgba(255, 80, 80, 1)';
    ctx.lineWidth = 2;
    
    // Animation frame function
    const animate = () => {
      if (currentPoint >= totalPoints - 1) {
        setAnimationCompleted(true);
        return;
      }
      
      // Draw line segment
      const x1 = padding.left + ((width - padding.left - padding.right) / (totalPoints - 1)) * currentPoint;
      const y1 = priceToY(prices[currentPoint]);
      const x2 = padding.left + ((width - padding.left - padding.right) / (totalPoints - 1)) * (currentPoint + 1);
      const y2 = priceToY(prices[currentPoint + 1]);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Draw a small dot at the current point
      ctx.fillStyle = signal.type === 'buy' ? 'rgba(80, 200, 120, 1)' : 'rgba(255, 80, 80, 1)';
      ctx.beginPath();
      ctx.arc(x2, y2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      currentPoint++;
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      setAnimationCompleted(false);
    };
  }, [signal]);
  
  return (
    <div className={cn("relative h-40 w-full", className)}>
      {/* Chart information overlay */}
      {animationCompleted && (
        <motion.div 
          className="absolute bottom-6 right-4 rounded bg-background/80 px-3 py-1 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className={cn(
              "h-2 w-2 rounded-full", 
              signal.type === 'buy' ? "bg-emerald-500" : "bg-rose-500"
            )}></span>
            <span>{signal.type === 'buy' ? 'Long' : 'Short'} Position</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{signal.timeframe} Chart</span>
          </div>
        </motion.div>
      )}
      
      {/* Canvas for drawing chart */}
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={160} 
        className="h-full w-full rounded-lg" 
      />
    </div>
  );
}