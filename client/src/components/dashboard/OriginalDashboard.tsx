import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, BarChart3, Signal, Bot, BookOpen, Users, FileText, 
  Settings, Cpu, Calendar, MessageSquare, Podcast, Zap, Activity, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/button';

// Define the panel types for our original dashboard
const dashboardItems = [
  {
    id: 'chart',
    name: 'TradingView Chart',
    icon: <LineChart className="h-5 w-5" />,
    path: '/trade',
    description: 'Professional trading charts with indicators'
  },
  {
    id: 'smart-trade',
    name: 'Smart Trade Panel',
    icon: <Cpu className="h-5 w-5" />,
    path: '/trade',
    description: 'Advanced trading with AI assistance'
  },
  {
    id: 'signals',
    name: 'Trading Signals',
    icon: <Signal className="h-5 w-5" />,
    path: '/signals-analyzer',
    description: 'Real-time market signals and alerts'
  },
  {
    id: 'journal',
    name: 'Trading Journal',
    icon: <FileText className="h-5 w-5" />,
    path: '/journal',
    description: 'Record and analyze your trades'
  },
  {
    id: 'bots',
    name: 'Trading Bots',
    icon: <Bot className="h-5 w-5" />,
    path: '/bots',
    description: 'Automated trading strategies'
  },
  {
    id: 'news',
    name: 'Market News',
    icon: <BookOpen className="h-5 w-5" />,
    path: '/news',
    description: 'Latest market news and analysis'
  },
  {
    id: 'podcast',
    name: 'Trading Freedom Podcast',
    icon: <Podcast className="h-5 w-5" />,
    path: '/trading-freedom-podcast',
    description: 'Learn from professional traders'
  },
  {
    id: 'economic-calendar',
    name: 'Economic Calendar',
    icon: <Calendar className="h-5 w-5" />,
    path: '/news',
    description: 'Important economic events and data releases'
  },
  {
    id: 'metaverse',
    name: 'Trading Metaverse',
    icon: <Activity className="h-5 w-5" />,
    path: '/metaverse',
    description: 'Enter the immersive trading experience'
  },
  {
    id: 'copy-trading',
    name: 'Copy Trading',
    icon: <Users className="h-5 w-5" />,
    path: '/copy-trading',
    description: 'Copy successful traders automatically'
  },
  {
    id: 'ai-insights',
    name: 'AI Market Analysis',
    icon: <BrainCircuit className="h-5 w-5" />,
    path: '/ai-insights',
    description: 'AI-powered market insights'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/settings',
    description: 'Configure your trading environment'
  }
];

interface OriginalDashboardProps {
  className?: string;
}

const OriginalDashboard: React.FC<OriginalDashboardProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter dashboard items based on search term
  const filteredItems = dashboardItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
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
          
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Connect Broker
              </Button>
              <Button variant="outline" className="border-gray-600">
                View Tutorial
              </Button>
              <Button variant="outline" className="border-gray-600">
                Import Trades
              </Button>
              <Button variant="outline" className="border-gray-600">
                Join Discord
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalDashboard;