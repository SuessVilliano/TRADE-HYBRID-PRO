import React, { ReactNode } from 'react';
import { CollapsibleTradingSidebar } from './collapsible-trading-sidebar';

interface TradingDashboardLayoutProps {
  children: ReactNode;
  className?: string;
  sidebarVisible?: boolean;
}

export function TradingDashboardLayout({ 
  children, 
  className = "",
  sidebarVisible = true
}: TradingDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Collapsible Trading Sidebar */}
      {sidebarVisible && <CollapsibleTradingSidebar />}
      
      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${sidebarVisible ? 'pl-16' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}