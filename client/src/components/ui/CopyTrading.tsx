import React, { useState, useEffect } from 'react';
import { Button } from './button';

interface Trader {
  id: string;
  name: string;
  avatar: string; 
  performance: {
    monthly: number;
    allTime: number;
  };
  winRate: number;
  trades: number;
  followers: number;
  status: 'copying' | 'not-copying';
  risk: 'low' | 'medium' | 'high';
}

interface CopyTradingProps {
  className?: string;
}

export default function CopyTrading({ className }: CopyTradingProps) {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');
  const [sortBy, setSortBy] = useState<'performance' | 'followers' | 'trades'>('performance');

  useEffect(() => {
    // Simulated trader data fetch
    setTimeout(() => {
      const mockTraders: Trader[] = [
        {
          id: '1',
          name: 'CryptoMaster',
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=1',
          performance: {
            monthly: 32.4,
            allTime: 187.3
          },
          winRate: 78,
          trades: 142,
          followers: 1432,
          status: 'copying',
          risk: 'high'
        },
        {
          id: '2',
          name: 'TechTrader',
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=2',
          performance: {
            monthly: 18.7,
            allTime: 95.2
          },
          winRate: 65,
          trades: 210,
          followers: 873,
          status: 'not-copying',
          risk: 'medium'
        },
        {
          id: '3',
          name: 'ForexQueen',
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=3',
          performance: {
            monthly: 8.5,
            allTime: 42.9
          },
          winRate: 62,
          trades: 87,
          followers: 531,
          status: 'not-copying',
          risk: 'low'
        },
        {
          id: '4',
          name: 'BullishBaron',
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=4',
          performance: {
            monthly: 21.3,
            allTime: 124.7
          },
          winRate: 71,
          trades: 156,
          followers: 982,
          status: 'copying',
          risk: 'high'
        },
        {
          id: '5',
          name: 'StableGains',
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=5',
          performance: {
            monthly: 5.8,
            allTime: 67.2
          },
          winRate: 58,
          trades: 312,
          followers: 645,
          status: 'not-copying',
          risk: 'low'
        }
      ];
      
      setTraders(mockTraders);
      setIsLoading(false);
    }, 1500);
  }, []);

  const toggleCopyStatus = (id: string) => {
    setTraders(traders.map(trader => {
      if (trader.id === id) {
        return {
          ...trader,
          status: trader.status === 'copying' ? 'not-copying' : 'copying'
        };
      }
      return trader;
    }));
  };

  const getSortedTraders = () => {
    const filteredTraders = traders.filter(trader => {
      if (activeTab === 'discover') return true;
      return trader.status === 'copying';
    });
    
    return [...filteredTraders].sort((a, b) => {
      if (sortBy === 'performance') {
        return b.performance.monthly - a.performance.monthly;
      } else if (sortBy === 'followers') {
        return b.followers - a.followers;
      } else {
        return b.trades - a.trades;
      }
    });
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div className="p-4 bg-slate-700">
        <h3 className="text-lg font-semibold text-white">Copy Trading</h3>
      </div>
      
      <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between">
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'discover' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </Button>
          <Button 
            variant={activeTab === 'following' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('following')}
          >
            Following
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-700 text-white text-xs border border-slate-600 rounded p-1"
          >
            <option value="performance">Performance</option>
            <option value="followers">Followers</option>
            <option value="trades">Trade Count</option>
          </select>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : getSortedTraders().length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {activeTab === 'following' ? 'You are not following any traders yet' : 'No traders found'}
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {getSortedTraders().map(trader => (
              <div key={trader.id} className="p-4 hover:bg-slate-750 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-600 rounded-full overflow-hidden">
                    <img 
                      src={trader.avatar} 
                      alt={trader.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // If avatar fails to load, show first letter of name
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = trader.name.charAt(0);
                        target.parentElement!.className += ' flex items-center justify-center text-lg font-bold text-white';
                      }}
                    />
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          {trader.name}
                          <span className={`ml-2 w-2 h-2 rounded-full ${getRiskColor(trader.risk)}`} title={`${trader.risk} risk`}></span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {trader.followers.toLocaleString()} followers · {trader.trades} trades
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${trader.performance.monthly >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.performance.monthly >= 0 ? '+' : ''}{trader.performance.monthly.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">
                          This month
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-xs text-slate-400 mr-2">Win rate:</div>
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              trader.winRate > 70 
                                ? 'bg-green-500' 
                                : trader.winRate > 50 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            }`}
                            style={{width: `${trader.winRate}%`}}
                          ></div>
                        </div>
                        <div className="ml-2 text-xs text-white">{trader.winRate}%</div>
                      </div>
                      
                      <Button 
                        variant={trader.status === 'copying' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => toggleCopyStatus(trader.id)}
                      >
                        {trader.status === 'copying' ? 'Copying' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <Button variant="outline" size="sm" className="w-full">
          {activeTab === 'following' ? 'Manage Copy Settings' : 'View All Traders'}
        </Button>
      </div>
    </div>
  );
}