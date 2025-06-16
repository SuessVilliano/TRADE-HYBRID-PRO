import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Signal, Bot, BookOpen, Users, FileText, 
  Settings, Cpu, Calendar, MessageSquare, Podcast, Zap, Activity, BrainCircuit, Wallet } from 'lucide-react';
import { LineChart } from 'lucide-react';
import { Button } from '../ui/button';
import { CryptoWalletOnboardingModal } from '../ui/crypto-wallet-onboarding-modal';

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
    id: 'dex',
    name: 'DEX Dashboard',
    icon: <Activity className="h-5 w-5" />,
    path: '/dex',
    description: 'Decentralized exchange for crypto trading',
    category: 'Trading & Markets'
  },
  {
    id: 'trading-platforms',
    name: 'Trading Platforms',
    icon: <Zap className="h-5 w-5" />,
    path: '/trading-platforms',
    description: 'Connect to DX Trade, Match Trader, cTrader, and Rithmic',
    category: 'Trading & Markets'
  },
  
  // Trading Tools Category
  {
    id: 'signals',
    name: 'Trading Signals (Beta)',
    icon: <Signal className="h-5 w-5" />,
    path: '/signals',
    description: 'Real-time market signals and alerts - Beta version',
    category: 'Trading Tools'
  },
  {
    id: 'indicators',
    name: 'Trading Indicators (Beta)',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/trading/indicators',
    description: 'Library of technical indicators - Beta version',
    category: 'Trading Tools'
  },
  {
    id: 'smart-trade',
    name: 'Smart Trade Panel (Beta)',
    icon: <Cpu className="h-5 w-5" />,
    path: '/smart-trade-explainer',
    description: 'Advanced trading with AI assistance - Beta version',
    category: 'Trading Tools'
  },
  {
    id: 'journal',
    name: 'Trading Journal (Beta)',
    icon: <FileText className="h-5 w-5" />,
    path: '/journal',
    description: 'Complete trading journal with analytics - Beta version',
    category: 'Trading Tools'
  },
  {
    id: 'bots',
    name: 'Trading Bots (Beta)',
    icon: <Bot className="h-5 w-5" />,
    path: '/trading-bots',
    description: 'Automated trading strategies - Beta version',
    category: 'Trading Tools'
  },
  {
    id: 'ai-insights',
    name: 'AI Market Analysis',
    icon: <BrainCircuit className="h-5 w-5" />,
    path: '/ai-market-analysis',
    description: 'AI-powered market insights',
    category: 'Trading Tools'
  },
  {
    id: 'signals-analyzer',
    name: 'Signals Analyzer',
    icon: <Signal className="h-5 w-5" />,
    path: '/signals-analyzer',
    description: 'Analyze and backtest trading signals',
    category: 'Trading Tools'
  },
  {
    id: 'voice-trade',
    name: 'Voice Trade Assistant',
    icon: <MessageSquare className="h-5 w-5" />,
    path: '/voice-trade',
    description: 'Trade using voice commands',
    category: 'Trading Tools'
  },
  
  // News & Education
  {
    id: 'news',
    name: 'Market News',
    icon: <BookOpen className="h-5 w-5" />,
    path: '/news',
    description: 'Latest market news and analysis',
    category: 'News & Education'
  },
  {
    id: 'economic-calendar',
    name: 'Events',
    icon: <Calendar className="h-5 w-5" />,
    path: '/events',
    description: 'Important economic events and data releases',
    category: 'News & Education'
  },
  // HIDDEN: Incomplete learning center
  // {
  //   id: 'learn',
  //   name: 'Learning Center',
  //   icon: <BookOpen className="h-5 w-5" />,
  //   path: '/learn',
  //   description: 'Educational resources and structured learning paths for traders',
  //   category: 'News & Education'
  // },
  
  // Immersive Experiences - Only keep metaverse
  {
    id: 'metaverse',
    name: 'Trading Metaverse',
    icon: <Activity className="h-5 w-5" />,
    path: '/metaverse',
    description: 'Enter the immersive trading experience',
    category: 'Immersive Experiences'
  },
  // HIDDEN: Incomplete games
  // {
  //   id: 'trade-runner',
  //   name: 'Trade Runner Game',
  //   icon: <Zap className="h-5 w-5" />,
  //   path: '/game/trade-runner',
  //   description: 'Fast-paced trading game',
  //   category: 'Immersive Experiences'
  // },
  // {
  //   id: 'bulls-vs-bears',
  //   name: 'Bulls vs Bears Game',
  //   icon: <Zap className="h-5 w-5" />,
  //   path: '/game/bulls-vs-bears',
  //   description: 'Multiplayer trading competition',
  //   category: 'Immersive Experiences'
  // },
  // {
  //   id: 'educational-games',
  //   name: 'Educational Games',
  //   icon: <Zap className="h-5 w-5" />,
  //   path: '/educational-games',
  //   description: 'Learn trading through games',
  //   category: 'Immersive Experiences'
  // },
  
  // Crypto & NFTs
  {
    id: 'nft-marketplace',
    name: 'NFT Marketplace',
    icon: <Activity className="h-5 w-5" />,
    path: '/nft-marketplace',
    description: 'Trade unique digital collectibles',
    category: 'Crypto & NFTs'
  },
  {
    id: 'thc-staking',
    name: 'THC Staking',
    icon: <Activity className="h-5 w-5" />,
    path: '/thc-staking',
    description: 'Stake your THC tokens for rewards',
    category: 'Crypto & NFTs'
  },
  
  // Services
  {
    id: 'prop-firm',
    name: 'Prop Firm Dashboard',
    icon: <Users className="h-5 w-5" />,
    path: '/prop-firm',
    description: 'Access HybridFunding.co dashboard',
    category: 'Services'
  },
  {
    id: 'prop-firm-challenge',
    name: 'Prop Firm Challenge',
    icon: <Users className="h-5 w-5" />,
    path: '/prop-firm/challenge',
    description: 'Apply for HybridFunding.co funded trading accounts',
    category: 'Services'
  },
  // HIDDEN: Investor dashboards - keeping in codebase but removing from navigation
  // {
  //   id: 'investor-dashboard',
  //   name: 'Investor Dashboard',
  //   icon: <LineChart className="h-5 w-5" />,
  //   path: '/investors',
  //   description: 'Manage your investments and track performance',
  //   category: 'Services'
  // },
  // {
  //   id: 'investor-admin',
  //   name: 'Investor Admin',
  //   icon: <Users className="h-5 w-5" />,
  //   path: '/investors/admin',
  //   description: 'Administrative dashboard for managing investors',
  //   category: 'Services'
  // },
  {
    id: 'affiliate',
    name: 'Affiliate Program',
    icon: <Users className="h-5 w-5" />,
    path: '/affiliate',
    description: 'Partner with us and earn commissions',
    category: 'Services'
  },
  
  // User & Settings
  {
    id: 'profile',
    name: 'Profile',
    icon: <Users className="h-5 w-5" />,
    path: '/profile',
    description: 'View and edit your profile',
    category: 'User & Settings'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings',
    description: 'Configure your trading environment',
    category: 'User & Settings'
  }
];

interface OriginalDashboardProps {
  className?: string;
}

const OriginalDashboard: React.FC<OriginalDashboardProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Filter dashboard items based on search term
  const filteredItems = dashboardItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get unique categories from dashboard items
  const categories = Array.from(new Set(dashboardItems.map(item => item.category || 'Uncategorized')));
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">TradeHybrid Dashboard</h1>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search features..."
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {searchTerm ? (
            // Show flat list when searching
            <div>
              <h2 className="text-xl font-bold mb-4">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Link to={item.path} key={item.id} className="block">
                    <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 transition-all duration-200 h-full">
                      <div className="flex items-center mb-2">
                        <div className="mr-3 p-2 bg-blue-600 rounded-md">
                          {item.icon}
                        </div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                      </div>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            // Show categorized layout when not searching
            <div className="space-y-8">
              {categories.map(category => {
                const categoryItems = dashboardItems.filter(item => (item.category || 'Uncategorized') === category);
                return (
                  <div key={category}>
                    <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryItems.map((item) => (
                        <Link to={item.path} key={item.id} className="block">
                          <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 transition-all duration-200 h-full">
                            <div className="flex items-center mb-2">
                              <div className="mr-3 p-2 bg-blue-600 rounded-md">
                                {item.icon}
                              </div>
                              <h3 className="text-lg font-semibold">{item.name}</h3>
                            </div>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/investors">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Investor Dashboard
                </Button>
              </Link>
              <Link to="/broker-connections">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Connect Broker
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-gray-600 flex items-center gap-2"
                onClick={() => setShowWalletModal(true)}
              >
                <Wallet size={16} />
                Connect Wallet
              </Button>
              <Button variant="outline" className="border-gray-600">
                View Tutorial
              </Button>
              <Button variant="outline" className="border-gray-600">
                Import Trades
              </Button>
              <Link to="/smart-trade-explainer">
                <Button variant="outline" className="border-gray-600">
                  Smart Trade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Crypto Wallet Connection Modal */}
      <CryptoWalletOnboardingModal 
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
};

export default OriginalDashboard;