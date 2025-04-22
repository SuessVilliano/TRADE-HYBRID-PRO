import React from 'react';
import { TradingDashboardLayout } from './trading-dashboard-layout';
import { DraggableTradingDashboard } from './draggable-trading-dashboard';

interface CustomizableTradingDashboardProps {
  defaultSymbol?: string;
}

export function CustomizableTradingDashboard({ defaultSymbol = 'BTCUSDT' }: CustomizableTradingDashboardProps) {
  return (
    <TradingDashboardLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Custom Trading Dashboard</h1>
        <p className="text-slate-400">Drag, resize, and customize your trading widgets</p>
      </div>
      
      <div className="h-[calc(100vh-8rem)] overflow-auto scrollable-dashboard trading-dashboard-container">
        <div className="min-h-[1800px]"> {/* Ensure minimum height to accommodate all widgets including TradeHybrid app */}
          <DraggableTradingDashboard defaultSymbol={defaultSymbol} />
        </div>
      </div>
    </TradingDashboardLayout>
  );
}