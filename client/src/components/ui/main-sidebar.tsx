import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  BookOpen, 
  DollarSign, 
  Home, 
  LayoutDashboard, 
  LineChart, 
  MessageSquare, 
  Newspaper, 
  PenTool, 
  Settings, 
  Signal, 
  Trophy, 
  Users, 
  Wallet, 
  Zap,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { useAuth } from '@/lib/context/AuthContext';
import { useSolanaAuth } from '@/lib/context/SolanaAuthProvider';
import { Separator } from './separator';

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  expanded?: boolean;
  onExpand?: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ 
  href, 
  icon, 
  label, 
  active, 
  onClick,
  children,
  expanded,
  onExpand
}) => {
  const hasChildren = !!children;

  return (
    <div className="relative">
      {hasChildren ? (
        <div className="flex flex-col w-full">
          <button
            onClick={onExpand}
            className={cn(
              "flex items-center gap-3 py-2 px-3 rounded-md w-full text-left",
              active 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </button>
          {expanded && (
            <div className="ml-10 mt-1 border-l border-border pl-2 space-y-1">
              {children}
            </div>
          )}
        </div>
      ) : (
        <Link
          to={href}
          className={cn(
            "flex items-center gap-3 py-2 px-3 rounded-md",
            active 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
          )}
          onClick={onClick}
        >
          {icon}
          <span>{label}</span>
        </Link>
      )}
    </div>
  );
};

export const MainSidebar: React.FC<{ onClose?: () => void, mobile?: boolean }> = ({ 
  onClose, 
  mobile = false 
}) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const solanaAuth = useSolanaAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    trading: false,
    learning: false,
    tools: false
  });

  const isLoggedIn = isAuthenticated || solanaAuth.walletConnected;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r border-border",
      mobile ? "w-full" : "w-64"
    )}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="TradeHybrid" className="h-8 w-8" />
          <span className="font-bold text-xl">TradeHybrid</span>
        </Link>
        {mobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <Separator />

      {/* Navigation Links */}
      <div className="flex-1 overflow-auto py-2 px-2 space-y-1">
        {/* Home/Dashboard */}
        <NavItem 
          href={isLoggedIn ? "/dashboard" : "/"} 
          icon={<Home className="h-5 w-5" />} 
          label={isLoggedIn ? "Dashboard" : "Home"} 
          active={isActive(isLoggedIn ? "/dashboard" : "/")} 
          onClick={mobile ? onClose : undefined}
        />

        {/* Trading Section */}
        <NavItem 
          href="#" 
          icon={<BarChart2 className="h-5 w-5" />} 
          label="Trading" 
          active={isActive("/trading") || isActive("/trade") || isActive("/trading-dashboard")}
          expanded={expandedSections.trading}
          onExpand={() => toggleSection('trading')}
        >
          <NavItem 
            href="/trading-dashboard" 
            icon={<LayoutDashboard className="h-4 w-4" />} 
            label="Trading Dashboard" 
            active={isActive("/trading-dashboard")} 
            onClick={mobile ? onClose : undefined}
          />
          <NavItem 
            href="/trade" 
            icon={<LineChart className="h-4 w-4" />} 
            label="Chart Trading" 
            active={isActive("/trade")} 
            onClick={mobile ? onClose : undefined}
          />
          <NavItem 
            href="/signals" 
            icon={<Signal className="h-4 w-4" />} 
            label="Signals" 
            active={isActive("/signals")} 
            onClick={mobile ? onClose : undefined}
          />
          <NavItem 
            href="/broker-connections" 
            icon={<Zap className="h-4 w-4" />} 
            label="Broker Connections" 
            active={isActive("/broker-connections")} 
            onClick={mobile ? onClose : undefined}
          />
        </NavItem>

        {/* Learning/Education */}
        <NavItem 
          href="#" 
          icon={<BookOpen className="h-5 w-5" />} 
          label="Education" 
          active={isActive("/learn") || isActive("/learning") || isActive("/learning-center")}
          expanded={expandedSections.learning}
          onExpand={() => toggleSection('learning')}
        >
          <NavItem 
            href="/learning-center/courses" 
            icon={<BookOpen className="h-4 w-4" />} 
            label="Learning Center" 
            active={isActive("/learning-center")} 
            onClick={mobile ? onClose : undefined}
          />
          <NavItem 
            href="/educational-games" 
            icon={<Trophy className="h-4 w-4" />} 
            label="Trading Games" 
            active={isActive("/educational-games")} 
            onClick={mobile ? onClose : undefined}
          />
        </NavItem>

        {/* News */}
        <NavItem 
          href="/news" 
          icon={<Newspaper className="h-5 w-5" />} 
          label="Market News" 
          active={isActive("/news")} 
          onClick={mobile ? onClose : undefined}
        />

        {/* Tools */}
        <NavItem 
          href="#" 
          icon={<PenTool className="h-5 w-5" />} 
          label="Tools" 
          active={isActive("/trading-tools") || isActive("/signals-analyzer")}
          expanded={expandedSections.tools}
          onExpand={() => toggleSection('tools')}
        >
          <NavItem 
            href="/trading-tools" 
            icon={<PenTool className="h-4 w-4" />} 
            label="Trading Tools" 
            active={isActive("/trading-tools")} 
            onClick={mobile ? onClose : undefined}
          />
          <NavItem 
            href="/signals-analyzer" 
            icon={<Signal className="h-4 w-4" />} 
            label="Signal Analyzer" 
            active={isActive("/signals-analyzer")} 
            onClick={mobile ? onClose : undefined}
          />
          <NavItem 
            href="/ai-market-analysis" 
            icon={<Zap className="h-4 w-4" />} 
            label="AI Analysis" 
            active={isActive("/ai-market-analysis")} 
            onClick={mobile ? onClose : undefined}
          />
        </NavItem>

        {/* Journal */}
        <NavItem 
          href="/journal" 
          icon={<MessageSquare className="h-5 w-5" />} 
          label="Trading Journal" 
          active={isActive("/journal")} 
          onClick={mobile ? onClose : undefined}
        />

        {/* Prop Firm */}
        <NavItem 
          href="/prop-firm" 
          icon={<DollarSign className="h-5 w-5" />} 
          label="Prop Firm" 
          active={isActive("/prop-firm")} 
          onClick={mobile ? onClose : undefined}
        />
        
        {/* Leaderboard */}
        <NavItem 
          href="/leaderboard" 
          icon={<Trophy className="h-5 w-5" />} 
          label="Leaderboard" 
          active={isActive("/leaderboard")} 
          onClick={mobile ? onClose : undefined}
        />

        {/* Social Network */}
        <NavItem 
          href="/social-network" 
          icon={<Users className="h-5 w-5" />} 
          label="Community" 
          active={isActive("/social-network")} 
          onClick={mobile ? onClose : undefined}
        />
      </div>

      <Separator />

      {/* Footer section */}
      <div className="p-4 space-y-2">
        {isLoggedIn ? (
          <>
            <NavItem 
              href="/wallet" 
              icon={<Wallet className="h-5 w-5" />} 
              label="Connect Wallet" 
              active={isActive("/wallet")} 
              onClick={mobile ? onClose : undefined}
            />
            <NavItem 
              href="/settings" 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              active={isActive("/settings")} 
              onClick={mobile ? onClose : undefined}
            />
          </>
        ) : (
          <div className="space-y-2">
            <Link to="/login" className="w-full">
              <Button 
                variant="outline" 
                className="w-full justify-center"
                onClick={mobile ? onClose : undefined}
              >
                Login
              </Button>
            </Link>
            <Link to="/register" className="w-full">
              <Button 
                className="w-full justify-center"
                onClick={mobile ? onClose : undefined}
              >
                Register
              </Button>
            </Link>
            <Link to="/wallet" className="w-full">
              <Button 
                variant="outline"
                className="w-full justify-center"
                onClick={mobile ? onClose : undefined}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export const MobileSidebarToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-3/4 max-w-xs">
        <MainSidebar onClose={onClose} mobile={true} />
      </div>
    </div>
  );
};