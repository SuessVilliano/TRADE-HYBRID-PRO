import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard, 
  LineChart, 
  BrainCircuit, 
  Bot, 
  Book, 
  Wallet, 
  Settings, 
  HelpCircle,
  LineChartIcon,
  MessageCircle,
  LogOut,
  User,
  Globe,
  Sparkles,
  Link as LinkIcon,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from './button';
import { useTheme } from '../../lib/hooks/useTheme';
import { SimpleWalletStatus } from './simple-wallet-status';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
}

interface CollapsibleTradingSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavItem({ icon, label, path, collapsed, active, onClick }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-${collapsed ? 'center' : 'start'} gap-3 px-3 transition-all duration-300 mb-1
        ${active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
      onClick={onClick}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Button>
  );
}

export function CollapsibleTradingSidebar({ collapsed, onToggle }: CollapsibleTradingSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  
  const navItems = [
    {
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
      path: '/trading-dashboard/custom'
    },
    {
      icon: <LineChart size={18} />,
      label: 'Trade',
      path: '/trading-dashboard/custom'
    },
    {
      icon: <BrainCircuit size={18} />,
      label: 'AI Analysis',
      path: '/ai-analysis'
    },
    {
      icon: <Bot size={18} />,
      label: 'Trading Bots',
      path: '/trading-bots'
    },
    {
      icon: <MessageCircle size={18} />,
      label: 'AI Chat',
      path: '/ai-assistant'
    },
    {
      icon: <LineChartIcon size={18} />,
      label: 'Market Data',
      path: '/market-overview'
    },
    {
      icon: <Wallet size={18} />,
      label: 'Portfolio',
      path: '/portfolio-dashboard'
    },
    {
      icon: <Book size={18} />,
      label: 'Learning',
      path: '/learning-center'
    },
    {
      icon: <Globe size={18} />,
      label: 'News',
      path: '/news'
    }
  ];
  
  return (
    <div
      className={`fixed h-full transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 py-4 z-10
        ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}
    >
      <div className="flex items-center justify-between px-4 mb-6">
        {!collapsed && (
          <div className="flex items-center">
            <span className="font-bold text-xl">Trade<span className="text-blue-400">Hybrid</span></span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 ml-auto text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      {/* Main Navigation */}
      <div className="space-y-1 px-2">
        {navItems.map((item, index) => (
          <NavItem
            key={index}
            icon={item.icon}
            label={item.label}
            path={item.path}
            collapsed={collapsed}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-slate-800">
        <div className="space-y-1">
          {/* Quick Action Buttons - Smart Trade and Connect Broker */}
          <div className={`grid ${collapsed ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-3 mt-2`}>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 w-full"
              onClick={() => navigate('/trading-dashboard/custom')}
            >
              <Sparkles size={16} className="mr-1" />
              {!collapsed && <span>Smart Trade</span>}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-700"
              onClick={() => navigate('/broker-connections')}
            >
              <LinkIcon size={16} className="mr-1" />
              {!collapsed && <span>Connect Broker</span>}
            </Button>
          </div>
          
          {/* Settings and Help */}
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            path="/user-settings"
            collapsed={collapsed}
            active={location.pathname.startsWith('/user-settings')}
            onClick={() => navigate('/user-settings')}
          />
          
          <NavItem
            icon={<HelpCircle size={18} />}
            label="Help & Support"
            path="/help-center"
            collapsed={collapsed}
            active={location.pathname.startsWith('/help-center')}
            onClick={() => navigate('/help-center')}
          />
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className={`w-full justify-${collapsed ? 'center' : 'start'} gap-3 px-3 transition-all duration-300 mb-1
              text-slate-400 hover:text-white hover:bg-slate-800/60`}
            onClick={toggleTheme}
          >
            {resolvedTheme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </Button>
          
          {/* User Profile */}
          {collapsed ? (
            <NavItem
              icon={<User size={18} />}
              label="Profile"
              path="/user-profile"
              collapsed={collapsed}
              active={location.pathname.startsWith('/user-profile')}
              onClick={() => navigate('/user-profile')}
            />
          ) : (
            <div 
              className="flex items-center gap-3 px-3 py-2 mt-2 rounded-md bg-slate-800/40 cursor-pointer"
              onClick={() => navigate('/user-profile')}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                TH
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Trader</p>
                <p className="text-xs text-slate-400 truncate">Pro Member</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Wallet Status/Connect Button */}
      <div className="px-2 mt-2">
        <SimpleWalletStatus 
          className={collapsed ? "w-full p-0" : "w-full"}
        />
      </div>
    </div>
  );
}