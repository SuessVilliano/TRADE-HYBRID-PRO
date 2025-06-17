import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Signal, Bot, BookOpen, Users, FileText, 
  Settings, Cpu, Calendar, MessageSquare, Podcast, Zap, Activity, BrainCircuit, Wallet } from 'lucide-react';
import { LineChart } from 'lucide-react';
import { Button } from '../ui/button';
import { CryptoWalletOnboardingModal } from '../ui/crypto-wallet-onboarding-modal';
import { TradingDashboardImage } from '../ui/trading-dashboard-image';

// Define dashboard item type
interface DashboardItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  description: string;
  category: string;
}

// Define the panel types for our original dashboard
const dashboardItems: DashboardItem[] = [
  // Trading & Markets Category - Restructured as requested
  {
    id: 'trading-dashboard',
    name: 'Trade Dashboard',
    icon: <LineChart className="h-5 w-5" />,
    path: '/trading-dashboard',
    description: 'Professional trading tools with prop firm platform integration',
    category: 'Trading & Markets'
  },
  {
    id: 'prop-firm-platforms',
    name: 'Prop Firm Platforms',
    icon: <Activity className="h-5 w-5" />,
    path: '/trading-platforms',
    description: 'Access cTrader, DXTrade, MatchTrader, and Rithmic platforms via GooeyTrade',
    category: 'Trading & Markets'
  },
  {
    id: 'signals',
    name: 'Trading Signals',
    icon: <Signal className="h-5 w-5" />,
    path: '/signals',
    description: 'Live trading signals from Paradox, Solaris, and Hybrid providers',
    category: 'Trading & Markets'
  },
  {
    id: 'voice-trade',
    name: 'AI Voice Trader',
    icon: <Podcast className="h-5 w-5" />,
    path: '/voice-trade',
    description: 'Execute trades using voice commands with prop firm integration',
    category: 'Trading & Markets'
  },
  {
    id: 'ai-analytics',
    name: 'AI Platform Analytics',
    icon: <Activity className="h-5 w-5" />,
    path: '/ai-analytics',
    description: 'Advanced AI-powered market analysis and trading insights',
    category: 'AI & Analytics'
  },
  
  // Trading Tools & Analysis
  {
    id: 'trade-bots',
    name: 'Trade Bots',
    icon: <Bot className="h-5 w-5" />,
    path: '/trading-bots',
    description: 'Automated trading strategies for all trading accounts',
    category: 'Trading Tools'
  },
  {
    id: 'copy-trading',
    name: 'Copy Trading',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/copy-trading',
    description: 'Copy trades from successful traders',
    category: 'Trading Tools'
  },
  {
    id: 'ultimate-journal',
    name: 'Ultimate Trade Journal',
    icon: <FileText className="h-5 w-5" />,
    path: '/journal',
    description: 'Comprehensive trading journal with advanced analytics, prop firm sync, and performance tracking',
    category: 'Trading Tools'
  },

  // Crypto & NFTs
  {
    id: 'portfolio',
    name: 'Portfolio Tracker',
    icon: <Activity className="h-5 w-5" />,
    path: '/portfolio',
    description: 'Track your crypto and traditional asset portfolio',
    category: 'Crypto & NFTs'
  },
  {
    id: 'thc-staking',
    name: 'THC Staking',
    icon: <Zap className="h-5 w-5" />,
    path: '/staking',
    description: 'Stake THC tokens and earn rewards from the Trade Hybrid ecosystem',
    category: 'Crypto & NFTs'
  },
  {
    id: 'nft-marketplace',
    name: 'NFT Marketplace',
    icon: <Activity className="h-5 w-5" />,
    path: '/nft-marketplace',
    description: 'Buy, sell, and trade NFTs in the Trade Hybrid ecosystem',
    category: 'Crypto & NFTs'
  },

  // Immersive & Social
  {
    id: 'metaverse',
    name: 'Trading Metaverse',
    icon: <Activity className="h-5 w-5" />,
    path: '/metaverse',
    description: 'Immersive 3D trading environment and social hub',
    category: 'Immersive & Social'
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    icon: <Signal className="h-5 w-5" />,
    path: '/leaderboard',
    description: 'Compete with other traders and climb the ranks',
    category: 'Immersive & Social'
  },


  // Learning & Resources
  {
    id: 'learning-center',
    name: 'Learning Center',
    icon: <Activity className="h-5 w-5" />,
    path: '/learn',
    description: 'Comprehensive trading education and tutorials',
    category: 'Learning & Resources'
  },
  {
    id: 'news',
    name: 'Market News',
    icon: <Signal className="h-5 w-5" />,
    path: '/news',
    description: 'Latest market news and analysis',
    category: 'Learning & Resources'
  },


  // Account & Settings
  {
    id: 'profile',
    name: 'Profile',
    icon: <Activity className="h-5 w-5" />,
    path: '/profile',
    description: 'Manage your trading profile and preferences',
    category: 'Account & Settings'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Activity className="h-5 w-5" />,
    path: '/settings',
    description: 'Configure platform settings and preferences',
    category: 'Account & Settings'
  }
];

export default function OriginalDashboard() {
  const [showWalletOnboarding, setShowWalletOnboarding] = useState(false);

  // Group items by category for display
  const groupedItems = dashboardItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, DashboardItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Next Generation <span className="text-blue-300">Trading Platform</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              A revolutionary trading experience that combines prop firm infrastructure, 
              real-time market data, advanced AI tools, and immersive learning environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
                onClick={() => setShowWalletOnboarding(true)}
              >
                Start Trading Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-blue-300 text-blue-300 hover:bg-blue-300 hover:text-blue-900 px-8 py-3 rounded-lg font-semibold"
              >
                Explore Features
              </Button>
            </div>
          </div>
          

        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-blue-500/30 pb-3">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group block p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                  {/* Special image for trading dashboard */}
                  {item.id === 'trading-dashboard' && (
                    <div className="mt-4">
                      <TradingDashboardImage className="w-full h-48" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Wallet Onboarding Modal */}
      {showWalletOnboarding && (
        <CryptoWalletOnboardingModal
          isOpen={showWalletOnboarding}
          onClose={() => setShowWalletOnboarding(false)}
        />
      )}
    </div>
  );
}