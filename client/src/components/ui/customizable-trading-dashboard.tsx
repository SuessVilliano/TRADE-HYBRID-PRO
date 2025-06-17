import React from 'react';
import { TradingDashboardLayout } from './trading-dashboard-layout';
import { EnhancedDraggableDashboard } from './enhanced-draggable-dashboard';

interface CustomizableTradingDashboardProps {
  defaultSymbol?: string;
}

export function CustomizableTradingDashboard({ defaultSymbol = 'BTCUSDT' }: CustomizableTradingDashboardProps) {
  return (
    <TradingDashboardLayout>
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">Custom Trading Dashboard</h1>
          <p className="text-slate-400">Drag, resize, and customize your trading widgets. Use snap-to-grid for clean layouts.</p>
        </div>
        
        <div className="h-[calc(100vh-10rem)] relative">
          <EnhancedDraggableDashboard defaultSymbol={defaultSymbol} />
        </div>
      </div>
    </TradingDashboardLayout>
  );
}