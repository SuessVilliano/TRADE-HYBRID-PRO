import React from 'react';

// Simple placeholder implementation until we can properly install echarts

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
  colors?: string[];
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
  height = 300
}) => {
  // Calculate some basic stats for the placeholder
  const chartData = data.map(series => ({
    name: series.name,
    min: Math.min(...series.data.map(d => d.y)),
    max: Math.max(...series.data.map(d => d.y)),
    last: series.data[series.data.length - 1]?.y
  }));

  return (
    <div style={{ width: '100%', height: `${height}px`, 
                 border: '1px solid #e2e8f0', 
                 borderRadius: '6px', 
                 padding: '16px',
                 background: '#f8fafc',
                 position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        color: '#64748b',
        padding: '16px',
        textAlign: 'center'
      }}>
        Chart visualization will be available after echarts is installed
      </div>
      
      {/* Show data summary */}
      <div style={{ 
        position: 'absolute', 
        bottom: '16px', 
        left: '16px', 
        right: '16px', 
        zIndex: 10,
        borderTop: '1px solid #e2e8f0',
        paddingTop: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {chartData.map((series, i) => (
          <div key={i} style={{ 
            background: colors[i % colors.length] + '20', 
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem'
          }}>
            <span style={{ fontWeight: 'bold', marginRight: '4px' }}>{series.name}:</span>
            <span>Last: {series.last.toFixed(2)}</span>
            <span style={{ margin: '0 4px' }}>|</span>
            <span>Min: {series.min.toFixed(2)}</span>
            <span style={{ margin: '0 4px' }}>|</span>
            <span>Max: {series.max.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};