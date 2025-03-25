import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketData } from "@/lib/stores/useMarketData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MarketChartProps {
  className?: string;
  symbol?: string;
}

export function MarketChart({ 
  className, 
  symbol = "BTCUSD" 
}: MarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const { marketData, fetchMarketData, loading } = useMarketData();
  
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
      // Create a new series for the price data
      const mainSeries = chart.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      
      // Add the data
      mainSeries.setData(marketData);
      
      // Fit content to ensure all data is visible
      chart.current.timeScale().fitContent();
    }
  }, [marketData]);
  
  // Fetch data for the selected symbol
  useEffect(() => {
    fetchMarketData(symbol);
  }, [symbol, fetchMarketData]);
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>Market Data - {symbol}</span>
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
