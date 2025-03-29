import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';
import { useBullsVsBearsStore } from '@/lib/stores/useBullsVsBearsStore';

export function MarketChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const gameState = useBullsVsBearsStore(state => state.gameState);
  
  // Initialize the chart
  useEffect(() => {
    if (chartContainerRef.current && !chart.current) {
      const chartOptions = {
        layout: {
          background: { color: '#1e293b' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#334155' },
          horzLines: { color: '#334155' },
        },
        timeScale: {
          borderColor: '#475569',
          timeVisible: true,
        },
        crosshair: {
          vertLine: {
            color: '#64748b',
            width: 1,
            style: 0,
            visible: true,
            labelVisible: true,
          },
          horzLine: {
            color: '#64748b',
            width: 1,
            style: 0,
            visible: true,
            labelVisible: true,
          },
          mode: 1,
        },
      };
      
      chart.current = createChart(chartContainerRef.current, chartOptions);
      
      // Add candlestick series
      candleSeries.current = chart.current.addCandlestickSeries({
        upColor: '#4ade80',
        downColor: '#ef4444',
        borderUpColor: '#4ade80',
        borderDownColor: '#ef4444',
        wickUpColor: '#4ade80',
        wickDownColor: '#ef4444',
      });
      
      // Add volume series
      volumeSeries.current = chart.current.addHistogramSeries({
        color: '#60a5fa',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      
      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chart.current) {
          chart.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      handleResize();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart.current) {
          chart.current.remove();
          chart.current = null;
        }
      };
    }
  }, []);
  
  // Update chart data when game state changes
  useEffect(() => {
    if (candleSeries.current && volumeSeries.current && gameState.priceHistory.length > 0) {
      // Convert price history to candlestick data
      const candleData: CandlestickData[] = gameState.priceHistory.map(price => ({
        time: Math.floor(price.time / 1000) as any,
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
      }));
      
      // Convert price history to volume data
      const volumeData: LineData[] = gameState.priceHistory.map(price => ({
        time: Math.floor(price.time / 1000) as any,
        value: price.volume,
        color: price.close >= price.open ? '#4ade80' : '#ef4444',
      }));
      
      // Update chart data
      candleSeries.current.setData(candleData);
      volumeSeries.current.setData(volumeData);
      
      // Set visible range
      if (chart.current && gameState.priceHistory.length > 0) {
        const firstTime = Math.floor(gameState.priceHistory[0].time / 1000);
        const lastTime = Math.floor(gameState.priceHistory[gameState.priceHistory.length - 1].time / 1000);
        
        chart.current.timeScale().setVisibleRange({
          from: firstTime,
          to: lastTime,
        });
      }
    }
  }, [gameState.priceHistory]);
  
  return (
    <div ref={chartContainerRef} className="w-full h-full" />
  );
}