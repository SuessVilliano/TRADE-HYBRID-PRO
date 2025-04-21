import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface LineChartProps {
  data: {
    name: string;
    data: Array<{ x: string; y: number }>;
  }[];
  categories: string[];
  colors: string[];
  yAxisWidth?: number;
  showLegend?: boolean;
  showGridLines?: boolean;
  showGradient?: boolean;
  height?: number | string;
  title?: string;
  subtitle?: string;
}

export function LineChart({
  data,
  categories,
  colors,
  yAxisWidth = 40,
  showLegend = true,
  showGridLines = true,
  showGradient = false,
  height = 'auto',
  title,
  subtitle
}: LineChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate loading the chart
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleReload = () => {
    setLoading(true);
    setError(null);
    
    // Simulate reloading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className={`w-full ${typeof height === 'number' ? `h-[${height}px]` : `h-${height}`}`}>
      <Card className="w-full h-full">
        {title && (
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <CardContent className="p-4 relative h-full">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-card">
              <div className="flex flex-col items-center">
                <RefreshCcw className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-90 z-10">
              <div className="text-center p-6 max-w-md">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-sm text-red-400 mb-4">{error}</p>
                <Button onClick={handleReload} size="sm" variant="outline" className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Reload Chart
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Chart Placeholder</p>
                <p className="text-xs mt-2">Using Adaptive Market Mood Colors</p>
                <div className="flex gap-2 mt-4 justify-center">
                  {data.map((series, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[i % colors.length] }}
                      />
                      <span className="text-xs">{series.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}