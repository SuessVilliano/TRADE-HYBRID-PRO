import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LineChart, BarChart3, Signal, Bot, BookOpen, Users, 
  FileText, Settings, Activity, BrainCircuit, Cpu, 
  BarChart, ArrowLeft, ArrowRight, LayoutDashboard,
  PanelLeft, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Define the navigation items for the trading sidebar
const tradingNavigationItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: 'Trade Dashboard',
    path: '/trading-dashboard/custom',
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    name: 'Trading Tools',
    path: '/trading-tools',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: 'Trading Bots',
    path: '/trading-bots',
    icon: <Bot className="h-5 w-5" />,
  },
  {
    name: 'AI Market Analysis',
    path: '/ai-market-analysis',
    icon: <BrainCircuit className="h-5 w-5" />,
  },
  {
    name: 'Trading Signals',
    path: '/signals',
    icon: <Signal className="h-5 w-5" />,
  },
  {
    name: 'Journal',
    path: '/journal',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: 'Learning Center',
    path: '/learn',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: 'News & Events',
    path: '/news',
    icon: <Activity className="h-5 w-5" />,
  },
];

interface CollapsibleTradingSidebarProps {
  className?: string;
}

export function CollapsibleTradingSidebar({ className }: CollapsibleTradingSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  
  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Determine if a navigation item is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full z-30 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        "bg-slate-900 border-r border-slate-800 flex flex-col",
        className
      )}
    >
      <div className="p-3 flex items-center justify-between border-b border-slate-800">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center space-x-2 overflow-hidden">
            <img 
              src="/images/trade_hybrid_logo.png" 
              alt="Trade Hybrid Logo" 
              className="h-8 w-auto object-contain" 
            />
            <span className="text-lg font-semibold truncate">Trade Hybrid</span>
          </Link>
        )}
        
        {isCollapsed && (
          <div className="mx-auto">
            <img 
              src="/images/trade_hybrid_icon.png" 
              alt="TH" 
              className="h-8 w-8 object-contain rounded-md" 
            />
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-3">
        <nav className="space-y-1">
          {tradingNavigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-md transition-colors",
                isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-2",
                isActive(item.path) 
                  ? "bg-blue-900/30 text-blue-300" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <div className={isCollapsed ? "" : "mr-3"}>
                {item.icon}
              </div>
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>
        
        <div className={cn(
          "mt-6 pt-4 border-t border-slate-800",
          isCollapsed ? "text-center" : ""
        )}>
          <Link
            to="/ai-market-analysis"
            className={cn(
              "flex items-center rounded-md bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-700/50 transition-colors",
              isCollapsed ? "p-2 mx-auto justify-center" : "px-3 py-2",
              "text-blue-300 hover:from-indigo-900/80 hover:to-purple-900/80 hover:text-white"
            )}
            title={isCollapsed ? "AI Tools" : undefined}
          >
            <Sparkles className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span className="truncate">AI Tools</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}