import React, { useRef, useEffect, useState } from 'react';
import { createChart, CrosshairMode, IChartApi, ISeriesApi, LineStyle, CandlestickData, UTCTimestamp, SeriesType } from 'lightweight-charts';
import { useTradeSimulator } from '../../lib/stores/useTradeSimulator';

interface TradingViewChartProps {
  assetId: string;
  symbol: string;
  className?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  assetId, 
  symbol,
  className = ''
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<'candles' | 'line'>('line');
  const [chart, setChart] = useState<IChartApi | null>(null);
  
  const selectedTimeframe = useTradeSimulator(state => state.selectedTimeframe);
  const setTimeframe = useTradeSimulator(state => state.setTimeframe);
  const selectedAsset = useTradeSimulator(state => state.selectedAsset);
  const showTooltip = useTradeSimulator(state => state.showEducationalTip);
  
  // Create chart on mount
  useEffect(() => {
    if (chartContainerRef.current) {
      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: {
          background: { type: 'solid', color: '#f3f4f6' },
          textColor: '#191919',
        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.4)',
            style: LineStyle.Dotted,
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.4)',
            style: LineStyle.Dotted,
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          timeVisible: true,
        },
      });
      
      setChart(newChart);
      
      // Clean up on unmount
      return () => {
        newChart.remove();
        setChart(null);
      };
    }
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chart]);
  
  // Generate simulation data
  useEffect(() => {
    if (!chart || !selectedAsset) return;
    
    // Clear previous series
    chart.removeSeries(chart.series());
    
    // Generate price data based on current asset price
    const basePrice = selectedAsset.price;
    const volatility = basePrice * 0.01; // 1% volatility
    
    const now = Math.floor(Date.now() / 1000);
    
    if (chartType === 'line') {
      // Create line series
      const areaSeries = chart.addAreaSeries({
        lineColor: '#2962FF',
        topColor: 'rgba(41, 98, 255, 0.3)',
        bottomColor: 'rgba(41, 98, 255, 0.0)',
        lineWidth: 2,
      });
      
      const lineData = [];
      
      // Generate simulated data points
      for (let i = 0; i < 100; i++) {
        const timeSeconds = now - (99 - i) * getTimeframeSeconds(selectedTimeframe);
        
        let value;
        if (i === 0) {
          value = basePrice - volatility * 10 * Math.random();
        } else {
          // Random walk
          const prevValue = lineData[i - 1].value;
          const change = (Math.random() - 0.5) * volatility;
          value = prevValue + change;
        }
        
        lineData.push({
          time: timeSeconds as UTCTimestamp,
          value,
        });
      }
      
      // Add current price point
      lineData.push({
        time: now as UTCTimestamp,
        value: basePrice,
      });
      
      // Set data to chart
      areaSeries.setData(lineData);
      
    } else { // candles
      // Create candlestick series
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      
      const candleData = [];
      
      // Generate simulated data points
      for (let i = 0; i < 100; i++) {
        const timeSeconds = now - (99 - i) * getTimeframeSeconds(selectedTimeframe);
        
        let close;
        if (i === 0) {
          close = basePrice - volatility * 10 * Math.random();
        } else {
          // Random walk
          const prevClose = candleData[i - 1].close;
          const change = (Math.random() - 0.5) * volatility;
          close = prevClose + change;
        }
        
        const open = i === 0 ? close * 0.996 : candleData[i - 1].close;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        candleData.push({
          time: timeSeconds as UTCTimestamp,
          open,
          high,
          low,
          close,
        });
      }
      
      // Add current price point
      candleData.push({
        time: now as UTCTimestamp,
        open: candleData[candleData.length - 1].close,
        high: basePrice + volatility * 0.2,
        low: basePrice - volatility * 0.2,
        close: basePrice,
      });
      
      // Set data to chart
      candleSeries.setData(candleData);
    }
    
    // Fit the visible range to show all data
    chart.timeScale().fitContent();
    
  }, [chart, selectedAsset, chartType, selectedTimeframe]);
  
  // Helper function to convert timeframe to seconds
  const getTimeframeSeconds = (timeframe: string): number => {
    switch (timeframe) {
      case '15sec': return 15;
      case '1min': return 60;
      case '5min': return 60 * 5;
      case '15min': return 60 * 15;
      case '1h': return 60 * 60;
      case '4h': return 60 * 60 * 4;
      case '1d': return 60 * 60 * 24;
      default: return 60;
    }
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center space-x-2">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="text-xs bg-gray-100 rounded px-1 py-0.5 border border-gray-300"
            onClick={() => showTooltip('timeframe')}
          >
            <option value="15sec">15 sec</option>
            <option value="1min">1 min</option>
            <option value="5min">5 min</option>
            <option value="15min">15 min</option>
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
            <option value="1d">1 day</option>
          </select>
          
          <div className="flex space-x-1">
            <button 
              onClick={() => setChartType('line')}
              className={`text-xs py-0.5 px-1.5 rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </button>
            <button 
              onClick={() => {
                setChartType('candles');
                showTooltip('candlestick');
              }}
              className={`text-xs py-0.5 px-1.5 rounded ${chartType === 'candles' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="w-full h-[300px] bg-gray-50 rounded-md"
      />
    </div>
  );
};

export default TradingViewChart;