import React, { useState, ReactNode } from 'react';
import { CollapsibleTradingSidebar } from './collapsible-trading-sidebar';

interface TradingDashboardLayoutProps {
  children: ReactNode;
}

export function TradingDashboardLayout({ children }: TradingDashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <CollapsibleTradingSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'ml-[60px]' : 'ml-[240px]'}`}>
        {children}
      </main>
    </div>
  );
}