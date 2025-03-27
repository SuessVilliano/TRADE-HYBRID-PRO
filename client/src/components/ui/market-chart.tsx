import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, SeriesType } from 'lightweight-charts';
// Using type assertion to work around the TypeScript definition limitations in the library
type ExtendedChartApi = IChartApi & {
  addCandlestickSeries: (options?: any) => any;
};
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketData } from "@/lib/stores/useMarketData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

interface MarketChartProps {
  className?: string;
  symbol?: string;
}

export function MarketChart({ 
  className, 
  symbol = "BTCUSD" 
}: MarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const candleSeries = useRef<any>(null);
  const { 
    marketData, 
    fetchMarketData, 
    subscribeToRealTimeData,
    unsubscribeFromRealTimeData,
    currentPrice,
    loading,
    connected
  } = useMarketData();
  
  // Track if the chart is already initialized with data
  const [isChartInitialized, setIsChartInitialized] = useState(false);
  
  // Initialize chart
  useEffect(() => {
    if (chartContainerRef.current) {
      // Clear existing chart if it exists
      if (chart.current) {
        chart.current.remove();
      }
      
      // Create a new chart
      const newChart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#D9D9D9',
        },
        grid: {
          vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
          horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        }
      });
      
      // Adjust chart size on window resize
      const handleResize = () => {
        if (chartContainerRef.current && newChart) {
          newChart.applyOptions({ 
            width: chartContainerRef.current.clientWidth 
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      chart.current = newChart;
      
      // Clean up on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart.current) {
          chart.current.remove();
        }
      };
    }
  }, []);
  
  // Update data when marketData changes
  useEffect(() => {
    if (chart.current && marketData.length > 0) {
      try {
        // If we haven't initialized the chart with data yet
        if (!isChartInitialized) {
          // Create a new series for the price data
          // Use type assertion to cast to our extended interface type
          const mainSeries = (chart.current as any).addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });
          
          // Store the series reference for later updates
          candleSeries.current = mainSeries;
          
          // Format the market data for the chart
          const formattedData = marketData.map(candle => ({
            time: candle.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
          }));
          
          // Add the initial data
          mainSeries.setData(formattedData);
          
          // Fit content to ensure all data is visible
          chart.current.timeScale().fitContent();
          
          // Mark chart as initialized
          setIsChartInitialized(true);
          console.log('Chart initialized with data:', formattedData.length, 'candles');
        } 
        // If we already have a chart with data, just update the last candle
        else if (candleSeries.current) {
          // Get the latest data point
          const latestPoint = marketData[marketData.length - 1];
          
          // Update the last candle with the latest data
          candleSeries.current.update({
            time: latestPoint.time,
            open: latestPoint.open,
            high: latestPoint.high,
            low: latestPoint.low,
            close: latestPoint.close
          });
        }
      } catch (error) {
        console.error('Error updating chart:', error);
        
        // If there's an error with the chart, try to recreate it
        if (chartContainerRef.current && chart.current) {
          chart.current.remove();
          
          const newChart = createChart(chartContainerRef.current, {
            layout: {
              background: { type: ColorType.Solid, color: 'transparent' },
              textColor: '#D9D9D9',
            },
            grid: {
              vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
              horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            timeScale: {
              timeVisible: true,
              secondsVisible: false,
            }
          });
          
          chart.current = newChart;
          setIsChartInitialized(false);
        }
      }
    }
  }, [marketData, isChartInitialized]);
  
  // Fetch data for the selected symbol and manage real-time subscriptions
  useEffect(() => {
    console.log(`Setting up data for symbol: ${symbol}`);
    
    // Initial fetch of historical data
    fetchMarketData(symbol);
    
    // When the component unmounts or symbol changes, unsubscribe from updates
    return () => {
      if (connected) {
        console.log(`Unsubscribing from ${symbol} updates`);
        unsubscribeFromRealTimeData(mapSymbolToIronBeam(symbol));
      }
    };
  }, [symbol, fetchMarketData, unsubscribeFromRealTimeData, connected]);
  
  // Helper function to map symbols to IronBeam format
  function mapSymbolToIronBeam(symbol: string): string {
    switch (symbol) {
      case "BTCUSD": return "BTC/USD";
      case "ETHUSD": return "ETH/USD";
      case "EURUSD": return "EUR/USD";
      default: return symbol;
    }
  }
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <div className="flex flex-col">
            <span>Market Data - {symbol}</span>
            {currentPrice > 0 && (
              <span className="text-xl font-bold mt-1">
                {formatCurrency(currentPrice)}
                {connected && (
                  <span className="ml-2 text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded-full">
                    Live
                  </span>
                )}
              </span>
            )}
          </div>
          {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
        </CardTitle>
        <Tabs defaultValue="1d">
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="1h">1H</TabsTrigger>
            <TabsTrigger value="4h">4H</TabsTrigger>
            <TabsTrigger value="1d">1D</TabsTrigger>
            <TabsTrigger value="1w">1W</TabsTrigger>
            <TabsTrigger value="1m">1M</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full h-[300px]" />
      </CardContent>
    </Card>
  );
}
