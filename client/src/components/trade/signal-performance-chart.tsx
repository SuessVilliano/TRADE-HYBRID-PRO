import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';
import { TradeSignal } from '@/lib/services/trade-signal-service';
import { cn } from '@/lib/utils';

// Performance data point for chart
interface PricePoint {
  time: string;
  price: number;
}

// Props for the component
interface SignalPerformanceChartProps {
  signal: TradeSignal;
  className?: string;
  currentPrice?: number;
}

export function SignalPerformanceChart({ 
  signal, 
  className,
  currentPrice 
}: SignalPerformanceChartProps) {
  // State for price data and animation
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [performanceState, setPerformanceState] = useState<'profit' | 'loss' | 'neutral'>('neutral');
  const [percentChange, setPercentChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  
  // Refs for animation timing
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate the simulated current price based on entry or provided current price
  const simulateCurrentPrice = () => {
    if (currentPrice) return currentPrice;
    
    // Calculate a realistic price movement from entry based on timeframe
    const hoursElapsed = (new Date().getTime() - signal.timestamp.getTime()) / (1000 * 60 * 60);
    
    // Determine volatility based on symbol (BTC is more volatile than stocks)
    const isHighVolatility = signal.symbol.includes('BTC') || signal.symbol.includes('ETH');
    const volatilityFactor = isHighVolatility ? 0.02 : 0.005;
    
    // Random walk with trend bias based on trade direction
    const trendBias = signal.type === 'buy' ? 0.6 : 0.4; // Slight bias for success
    const randomWalk = (Math.random() > trendBias ? -1 : 1) * Math.random() * volatilityFactor * hoursElapsed;
    
    // Calculate simulated price
    return signal.entry * (1 + randomWalk);
  };
  
  // Generate price history data points
  const generatePriceHistory = () => {
    const now = new Date();
    const price = simulateCurrentPrice();
    const dataPoints: PricePoint[] = [];
    
    // Start from signal timestamp and create points up to now
    const startTime = signal.timestamp;
    const timePoints = 12; // Number of data points to show
    
    // Time between each point in milliseconds
    const timeInterval = (now.getTime() - startTime.getTime()) / timePoints;
    
    // Generate data points with some randomness for realistic price movement
    for (let i = 0; i <= timePoints; i++) {
      const pointTime = new Date(startTime.getTime() + timeInterval * i);
      const timeStr = pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Calculate a price with random movement and trend bias
      const progressRatio = i / timePoints;
      const volatility = signal.type === 'buy' ? 0.003 : 0.004;
      const trendFactor = signal.type === 'buy' ? 1 : -1;
      const randomFactor = (Math.random() - 0.5) * volatility * signal.entry;
      
      // Weighted average of entry price and final price with noise
      const pointPrice = signal.entry * (1 - progressRatio) + price * progressRatio + randomFactor;
      
      dataPoints.push({
        time: timeStr,
        price: Number(pointPrice.toFixed(2))
      });
    }
    
    return dataPoints;
  };
  
  // Calculate performance metrics
  const calculatePerformance = (price: number) => {
    // Calculate percent change from entry
    const pctChange = ((price - signal.entry) / signal.entry) * 100;
    
    // Determine if in profit/loss
    let state: 'profit' | 'loss' | 'neutral' = 'neutral';
    
    if (signal.type === 'buy') {
      state = price > signal.entry ? 'profit' : (price < signal.entry ? 'loss' : 'neutral');
    } else {
      state = price < signal.entry ? 'profit' : (price > signal.entry ? 'loss' : 'neutral');
    }
    
    return { pctChange, state };
  };
  
  // Initialize and load data
  useEffect(() => {
    setIsLoading(true);
    
    // Generate price history data
    const data = generatePriceHistory();
    setPriceData(data);
    
    // Calculate performance metrics based on latest price
    const latestPrice = data[data.length - 1].price;
    const { pctChange, state } = calculatePerformance(latestPrice);
    setPercentChange(pctChange);
    setPerformanceState(state);
    
    // Show loading state briefly for animation effect
    setTimeout(() => {
      setIsLoading(false);
      
      // Start the chart animation after loading
      setTimeout(() => {
        setShowAnimation(true);
      }, 300);
    }, 500);
    
    // Periodically refresh data
    const refreshInterval = setInterval(() => {
      // Generate new price data with updated current time and price
      const newData = generatePriceHistory();
      setPriceData(newData);
      
      // Recalculate performance metrics
      const newLatestPrice = newData[newData.length - 1].price;
      const { pctChange, state } = calculatePerformance(newLatestPrice);
      setPercentChange(pctChange);
      setPerformanceState(state);
    }, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshInterval);
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [signal, currentPrice]);
  
  // Get colors based on performance state
  const getPerformanceColors = () => {
    switch (performanceState) {
      case 'profit':
        return {
          text: 'text-green-500',
          line: '#22c55e',
          bg: 'bg-green-500/10',
          icon: <ArrowUpCircle className="h-4 w-4 text-green-500" />
        };
      case 'loss':
        return {
          text: 'text-red-500',
          line: '#ef4444',
          bg: 'bg-red-500/10',
          icon: <ArrowDownCircle className="h-4 w-4 text-red-500" />
        };
      default:
        return {
          text: 'text-orange-500',
          line: '#f97316',
          bg: 'bg-orange-500/10',
          icon: <Clock className="h-4 w-4 text-orange-500" />
        };
    }
  };
  
  const colors = getPerformanceColors();
  const latestPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : signal.entry;
  
  // Format currency with appropriate decimal places
  const formatCurrency = (value: number) => {
    if (value < 0.1) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    if (value < 10) return value.toFixed(3);
    if (value < 1000) return value.toFixed(2);
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  return (
    <div className={cn("relative rounded-md border p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col">
          <h4 className="text-sm font-medium">Signal Performance</h4>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {signal.type.toUpperCase()} {signal.symbol} @ {formatCurrency(signal.entry)}
            </span>
          </div>
        </div>
        
        <div className={cn("flex items-center gap-1 rounded-md px-2 py-1", colors.bg)}>
          {colors.icon}
          <span className={cn("text-sm font-medium", colors.text)}>
            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
          </span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex h-[150px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={priceData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                domain={['dataMin - 1%', 'dataMax + 1%']} 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
                width={50}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(time) => `Time: ${time}`}
              />
              <ReferenceLine 
                y={signal.entry} 
                stroke="#94a3b8" 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Entry', 
                  position: 'insideLeft',
                  fontSize: 10,
                  fill: '#94a3b8'
                }} 
              />
              {signal.stopLoss && (
                <ReferenceLine 
                  y={signal.stopLoss} 
                  stroke="#f43f5e" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Stop', 
                    position: 'insideLeft',
                    fontSize: 10,
                    fill: '#f43f5e'
                  }} 
                />
              )}
              {signal.takeProfit && (
                <ReferenceLine 
                  y={signal.takeProfit} 
                  stroke="#10b981" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'TP', 
                    position: 'insideLeft',
                    fontSize: 10,
                    fill: '#10b981'
                  }} 
                />
              )}
              <Line
                type="monotone"
                dataKey="price"
                stroke={colors.line}
                strokeWidth={2}
                dot={false}
                isAnimationActive={showAnimation}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Current:</span>
          <motion.span
            className={colors.text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={latestPrice}
          >
            {formatCurrency(latestPrice)}
          </motion.span>
        </div>
        
        {signal.status === 'active' && (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-emerald-500">ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}