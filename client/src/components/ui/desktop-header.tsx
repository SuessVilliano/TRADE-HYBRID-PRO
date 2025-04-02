import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LineChart, 
  BookOpen, 
  Users, 
  Settings, 
  User, 
  LogOut,
  Coins,
  BarChart3,
  Signal,
  Activity,
  FileText,
  MessageSquare,
  Bot,
  Moon,
  Sun,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
// Using direct URL for logo
// import logo from '../../assets/logo.svg';
// import logoFull from '../../assets/images/logo-full.jpeg';
// import logoStacked from '../../assets/images/logo-stacked.png';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaAuth, MembershipTier } from '../../lib/context/SolanaAuthProvider';
import { useAuth } from '../../lib/context/AuthContext';

// Include token membership display
interface TokenMembership {
  tier: MembershipTier;
  balance: number;
  expiry: Date | null;
}

interface DesktopHeaderProps {
  className?: string;
}

// Define navigation items for tabs
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    name: 'Trade Dashboard',
    path: '/trading-dashboard',
    icon: <LineChart className="h-4 w-4" />,
  },
  {
    name: 'Customizable Dashboard',
    path: '/trading-dashboard/custom',
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    name: 'DEX Dashboard',
    path: '/dex',
    icon: <Activity className="h-4 w-4" />,
  },
  {
    name: 'Trading Tools',
    path: '/trading-tools',
    icon: <LineChart className="h-4 w-4" />,
  },
  {
    name: 'Trading Bots',
    path: '/trading-bots',
    icon: <Bot className="h-4 w-4" />,
  },
  {
    name: 'Journal',
    path: '/journal',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    name: 'Learning Center',
    path: '/learn',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    name: 'Metaverse',
    path: '/metaverse',
    icon: <Activity className="h-4 w-4" />,
  },
  {
    name: 'News & Events',
    path: '/news',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    icon: <Users className="h-4 w-4" />,
  },
  {
    name: 'THC Tokens',
    path: '/trade?location=thc',
    icon: <Coins className="h-4 w-4" />,
  },
];

// User menu items
const userMenuItems = [
  {
    name: 'Profile',
    path: '/profile',
    icon: <User className="h-4 w-4" />,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

export function DesktopHeader({ className }: DesktopHeaderProps) {
  const location = useLocation();
  const [thcPrice, setThcPrice] = useState(0.1045);
  const [userTokens, setUserTokens] = useState(250);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const wallet = useWallet();
  const { walletConnected, isAuthenticated, tokenMembership, username, logout } = useSolanaAuth();
  const auth = useAuth();

  // Calculate THC value in USD
  const thcValue = thcPrice * userTokens;
  
  // Simulate random THC price changes
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 0.001;
      setThcPrice(prev => parseFloat((prev * (1 + randomChange)).toFixed(6)));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    auth.logout();
    setShowUserDropdown(false);
  };
  
  // Format a number to be more readable
  const formatBalance = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };
  
  // Get tier name and color
  const getTierInfo = (tier: MembershipTier) => {
    const tierNames = ['None', 'Basic', 'Advanced', 'Premium', 'Elite'];
    const tierColors = ['gray', 'green', 'blue', 'purple', 'yellow'];
    
    return {
      name: tierNames[tier],
      color: tierColors[tier]
    };
  };
  
  // Get membership tier info if available
  const tierInfo = tokenMembership ? getTierInfo(tokenMembership.tier) : { name: 'None', color: 'gray' };
  
  return (
    <header className={`w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white border-b border-slate-700 py-2 px-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Logo and Main Navigation */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Back Button - Only Visible on Mobile */}
          {location.pathname !== '/dashboard' && (
            <button 
              onClick={() => window.history.back()}
              className="lg:hidden flex items-center justify-center h-10 w-10 bg-slate-700 hover:bg-slate-600 rounded-md text-white"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          
          <Link to="/dashboard" className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-md">
            {/* Primary logo with fallback */}
            <img 
              src="https://assets.vbt.io/public/files/19952/trade_hybrid_logo.png" 
              alt="Trade Hybrid Logo" 
              className="h-8 w-auto min-w-[32px] object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/fallback-logo.png";
                // If that fails too, show text
                e.currentTarget.onerror = () => {
                  e.currentTarget.style.display = 'none';
                };
              }}
            />
            {/* Text fallback for logo */}
            <span className="text-white font-bold text-lg ml-1">Trade Hybrid</span>
          </Link>
          
          {/* Navigation Tabs */}
          <nav className="hidden lg:flex space-x-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path.includes('?') && location.pathname === item.path.split('?')[0]);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors
                    ${isActive
                      ? 'bg-blue-900/40 text-blue-200'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Right section: Theme Toggle, Wallet, THC info, User */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle 
            variant="ghost" 
            size="icon"
            className="hidden sm:flex hover:bg-slate-700" 
          />
          
          {/* THC Balance */}
          <div className="hidden md:flex items-center bg-slate-700/50 rounded-md px-3 py-1.5 text-sm border border-slate-600">
            <Coins className="h-4 w-4 mr-1.5 text-yellow-400" />
            <div>
              <div className="flex items-center">
                <span className="font-medium">{formatBalance(userTokens)} THC</span>
                <span className="mx-1 text-slate-400">•</span>
                <span className="text-green-400">${thcValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Wallet Connect Button */}
          <div className="hidden sm:block">
            <WalletMultiButton />
          </div>
          
          {/* User Account */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 rounded-md px-3 py-1.5 text-sm transition-colors"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">
                {username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="font-medium text-left">{username || 'User'}</div>
                <div className="text-xs flex items-center space-x-1">
                  <span className={`inline-block w-2 h-2 rounded-full bg-${tierInfo.color}-500`}></span>
                  <span>{tierInfo.name} Tier</span>
                </div>
              </div>
            </button>
            
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg border border-slate-700 z-50">
                <div className="p-2 border-b border-slate-700">
                  <div className="font-medium">{username || 'User'}</div>
                  <div className="text-xs text-slate-400">{walletConnected ? wallet.publicKey?.toString().slice(0, 6) + '...' + wallet.publicKey?.toString().slice(-4) : 'No wallet connected'}</div>
                </div>
                <div className="p-1">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-slate-700 rounded-md"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <button
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-md"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DesktopHeader;