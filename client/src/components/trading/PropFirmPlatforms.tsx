import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ExternalLink, Shield, Zap, TrendingUp, BarChart3 } from 'lucide-react';

export function PropFirmPlatforms() {
  const platforms = [
    {
      id: 'ctrader',
      name: 'cTrader',
      description: 'Professional ECN trading platform with advanced analytics',
      url: 'https://ctrader.com/ctrader-web/login',
      status: 'Active',
      features: ['ECN Trading', 'Advanced Charts', 'Copy Trading', 'Algorithmic Trading'],
      color: 'bg-blue-500'
    },
    {
      id: 'dxtrade',
      name: 'DX Trade',
      description: 'Multi-asset trading platform for forex, commodities, and indices',
      url: 'https://webtrader.dxtrade.com/login',
      status: 'Active',
      features: ['Multi-Asset', 'Web-Based', 'Risk Management', 'Real-Time Data'],
      color: 'bg-green-500'
    },
    {
      id: 'matchtrader',
      name: 'Match Trader',
      description: 'Social trading platform with copy trading capabilities',
      url: 'https://webtrader.matchtrader.com/login',
      status: 'Active',
      features: ['Social Trading', 'Copy Trading', 'Signal Providers', 'Portfolio Management'],
      color: 'bg-purple-500'
    },
    {
      id: 'rithmic',
      name: 'Rithmic',
      description: 'Professional futures trading platform with ultra-low latency',
      url: 'https://rithmic.com/webtrader/login',
      status: 'Active',
      features: ['Futures Trading', 'Ultra-Low Latency', 'Professional Tools', 'Market Data'],
      color: 'bg-orange-500'
    }
  ];

  const handlePlatformAccess = (platform: typeof platforms[0]) => {
    window.open(platform.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Prop Firm Trading Platforms</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card key={platform.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                  {platform.name}
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {platform.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-400">{platform.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {platform.features.map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handlePlatformAccess(platform)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Login to WebTrader
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-slate-800 border-slate-700 mt-4">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Platform Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-400">4</div>
              <div className="text-xs text-slate-400">Active Platforms</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-400">100%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-400">
                <BarChart3 className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-xs text-slate-400">Live Data</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-400">
                <Zap className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-xs text-slate-400">Fast Execution</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}