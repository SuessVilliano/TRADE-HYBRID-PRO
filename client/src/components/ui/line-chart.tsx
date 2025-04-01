import React, { useEffect, useRef } from 'react';
// Temporarily commenting out until we can install the package
// import * as echarts from 'echarts';

interface DataPoint {
  x: string;
  y: number;
}

interface DataSeries {
  name: string;
  data: DataPoint[];
}

interface LineChartProps {
  data: DataSeries[];
  categories: string[];
  colors: string[];
  height?: number;
  yAxisWidth?: number;
  showLegend?: boolean;
  showGridLines?: boolean;
  showGradient?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  categories, 
  colors = ['#10b981', '#3b82f6', '#ef4444'],
  height = 300,
  yAxisWidth = 60,
  showLegend = true,
  showGridLines = true,
  showGradient = false
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    
    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Configure chart options
    const series = data.map((s, i) => ({
      name: s.name,
      type: 'line',
      data: s.data.map(point => point.y),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: colors[i % colors.length]
      },
      lineStyle: {
        width: 3,
        color: colors[i % colors.length]
      },
      areaStyle: showGradient ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: colors[i % colors.length] + 'CC' // Add transparency
          },
          {
            offset: 1,
            color: colors[i % colors.length] + '11' // Almost transparent
          }
        ])
      } : undefined
    }));
    
    const options: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderWidth: 0,
        textStyle: {
          color: '#fff'
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          const date = categories[param.dataIndex];
          let tooltip = `<div style="margin-bottom: 4px; font-weight: bold;">${date}</div>`;
          
          (Array.isArray(params) ? params : [params]).forEach((p: any) => {
            tooltip += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 2px 0;">
              <span style="display: inline-block; margin-right: 5px; width: 10px; height: 10px; background-color: ${p.color};"></span>
              <span style="margin-right: 15px;">${p.seriesName}:</span>
              <span style="font-weight: bold;">${p.value}</span>
            </div>`;
          });
          
          return tooltip;
        }
      },
      legend: {
        show: showLegend,
        bottom: 0
      },
      grid: {
        left: yAxisWidth,
        right: 20,
        top: 20,
        bottom: showLegend ? 40 : 20,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        },
        splitLine: {
          show: showGridLines,
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed'
          }
        }
      },
      series
    };
    
    chartInstance.current.setOption(options);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [data, categories, colors, yAxisWidth, showLegend, showGridLines, showGradient]);
  
  return (
    <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />
  );
};