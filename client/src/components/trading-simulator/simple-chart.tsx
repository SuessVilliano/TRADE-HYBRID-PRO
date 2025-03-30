import React, { useRef, useEffect, useState } from 'react';
import EducationalTooltip from './educational-tooltip';

interface SimpleChartProps {
  assetName: string | null;
  priceData: {
    timestamp: number;
    price: number;
  }[];
  activePosition: any | null;
  onShowTooltip: () => void;
  tooltipVisible: boolean;
  onCloseTooltip: () => void;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  assetName,
  priceData,
  activePosition,
  onShowTooltip,
  tooltipVisible,
  onCloseTooltip
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate price change and percentage
  const getPriceChange = (): { change: number; percentage: number } => {
    if (priceData.length < 2) return { change: 0, percentage: 0 };
    
    const firstPrice = priceData[0].price;
    const lastPrice = priceData[priceData.length - 1].price;
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    
    return { change, percentage };
  };
  
  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || priceData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get dimensions and set up scaling
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min and max prices
    const prices = priceData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.995; // Add a small buffer
    const maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice;
    
    // Last price
    const lastPrice = prices[prices.length - 1];
    setCurrentPrice(lastPrice);
    
    // Price scaling function
    const scaleY = (price: number): number => {
      return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };
    
    // Draw price axis
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines and labels
    const numGridLines = 5;
    for (let i = 0; i <= numGridLines; i++) {
      const price = minPrice + (priceRange * i) / numGridLines;
      const y = scaleY(price);
      
      // Grid line
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      
      // Price label
      ctx.fillStyle = 'rgb(148, 163, 184)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(formatCurrency(price), padding.left - 8, y + 4);
    }
    ctx.stroke();
    
    // Draw time axis (only add a couple of labels to avoid clutter)
    if (priceData.length > 0) {
      ctx.fillStyle = 'rgb(148, 163, 184)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      // First point
      const firstTime = new Date(priceData[0].timestamp);
      ctx.fillText(
        firstTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        padding.left,
        height - padding.bottom + 15
      );
      
      // Middle point
      const midIndex = Math.floor(priceData.length / 2);
      const midTime = new Date(priceData[midIndex].timestamp);
      ctx.fillText(
        midTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        padding.left + chartWidth / 2,
        height - padding.bottom + 15
      );
      
      // Last point
      const lastTime = new Date(priceData[priceData.length - 1].timestamp);
      ctx.fillText(
        lastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        padding.left + chartWidth,
        height - padding.bottom + 15
      );
    }
    
    // Draw chart line
    if (priceData.length > 1) {
      // Determine color based on price movement (green if up, red if down)
      const firstPrice = priceData[0].price;
      const lastPrice = priceData[priceData.length - 1].price;
      const lineColor = lastPrice >= firstPrice ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
      
      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      
      for (let i = 0; i < priceData.length; i++) {
        const x = padding.left + (i / (priceData.length - 1)) * chartWidth;
        const y = scaleY(priceData[i].price);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Fill area under line
      ctx.lineTo(padding.left + chartWidth, chartHeight + padding.top);
      ctx.lineTo(padding.left, chartHeight + padding.top);
      ctx.closePath();
      ctx.fillStyle = `${lineColor}20`; // Add transparency to fill color
      ctx.fill();
    }
    
    // Draw entry line for active position
    if (activePosition) {
      const entryY = scaleY(activePosition.entryPrice);
      
      ctx.beginPath();
      ctx.strokeStyle = activePosition.type === 'buy' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 3]);
      ctx.moveTo(padding.left, entryY);
      ctx.lineTo(width - padding.right, entryY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Entry label
      ctx.fillStyle = 'rgb(30, 41, 59)';
      ctx.beginPath();
      const labelX = width - padding.right + 5;
      ctx.rect(labelX, entryY - 10, 60, 20);
      ctx.fill();
      
      ctx.fillStyle = activePosition.type === 'buy' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('ENTRY', labelX + 5, entryY + 3);
    }
    
    // Draw current price indicator
    if (lastPrice && priceData.length > 0) {
      const lastY = scaleY(lastPrice);
      const firstDataPrice = priceData[0].price;
      
      // Circle at the end of the line
      ctx.beginPath();
      ctx.arc(padding.left + chartWidth, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = lastPrice >= firstDataPrice ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
      ctx.fill();
      
      // Current price label
      ctx.fillStyle = 'rgb(30, 41, 59)';
      ctx.beginPath();
      const labelX = padding.left + chartWidth + 10;
      ctx.rect(labelX, lastY - 10, 70, 20);
      ctx.fill();
      
      ctx.fillStyle = lastPrice >= firstDataPrice ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(formatCurrency(lastPrice), labelX + 5, lastY + 3);
    }
  }, [priceData, activePosition]);
  
  // Calculate price change
  const { change, percentage } = getPriceChange();
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center">
            <h2 className="text-lg font-bold mr-2">
              {assetName || 'Select an Asset'}
            </h2>
            <button 
              className="bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
              onClick={onShowTooltip}
            >
              i
            </button>
          </div>
          {currentPrice && (
            <div className="flex items-center mt-1">
              <span className="text-2xl font-bold mr-3">
                {formatCurrency(currentPrice)}
              </span>
              <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{formatCurrency(change)} ({percentage.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        
        {activePosition && (
          <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2">
            <div className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                activePosition.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm font-medium">
                {activePosition.type === 'buy' ? 'Long Position' : 'Short Position'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Entry: {formatCurrency(activePosition.entryPrice)}
            </p>
          </div>
        )}
      </div>
      
      {tooltipVisible && (
        <EducationalTooltip 
          title="Price Chart"
          content="This chart shows the price movement of the selected asset over time. The green line indicates an upward trend, while a red line shows a downward trend. The dotted line shows your position entry price."
          onClose={onCloseTooltip}
        />
      )}
      
      <div className="relative flex-grow border border-slate-700 rounded-md overflow-hidden bg-slate-800/50">
        {priceData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            {assetName 
              ? 'Loading chart data...' 
              : 'Select an asset to view price chart'}
          </div>
        ) : (
          <canvas 
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

export default SimpleChart;