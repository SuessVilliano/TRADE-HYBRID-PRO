import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ExternalLink, Monitor, Activity, TrendingUp, Globe } from 'lucide-react';

interface TradingPlatform {
  id: string;
  name: string;
  loginUrl: string;
  features: string[];
  status: 'active' | 'featured' | 'standard';
  description: string;
  logo?: string;
}

const tradingPlatforms: TradingPlatform[] = [
  {
    id: 'ctrader',
    name: 'cTrader',
    loginUrl: 'https://app.gooeytrade.com/',
    features: ['Advanced Charting', 'Algorithmic Trading', 'Level II Pricing', 'Copy Trading'],
    status: 'featured',
    description: 'Professional ECN trading platform with advanced analytics'
  },
  {
    id: 'dxtrade', 
    name: 'DX Trade',
    loginUrl: 'https://trade.gooeytrade.com/',
    features: ['Multi-Asset Trading', 'Risk Management', 'Real-time Data', 'Mobile Trading'],
    status: 'active',
    description: 'Multi-asset trading platform for forex, commodities, and indices'
  },
  {
    id: 'matchtrader',
    name: 'Match Trader',
    loginUrl: 'https://mtr.gooeytrade.com/dashboard',
    features: ['Social Trading', 'Expert Advisors', 'Market Analysis', 'Strategy Testing'],
    status: 'active', 
    description: 'Social trading platform with copy trading capabilities'
  },
  {
    id: 'rithmic',
    name: 'Rithmic',
    loginUrl: 'https://rtraderpro.rithmic.com/rtraderpro-web/',
    features: ['Futures Trading', 'Low Latency', 'Advanced Orders', 'Market Data'],
    status: 'standard',
    description: 'Professional futures trading platform with ultra-low latency'
  }
];

export function TradingPlatformPanel() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const handlePlatformAccess = (platform: TradingPlatform) => {
    window.open(platform.loginUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'featured': return 'bg-gradient-to-r from-blue-500 to-purple-600';
      case 'active': return 'bg-gradient-to-r from-green-500 to-blue-500';
      case 'standard': return 'bg-gradient-to-r from-slate-500 to-slate-600';
      default: return 'bg-slate-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'featured': return <Badge className="bg-blue-600 text-white">Featured</Badge>;
      case 'active': return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'standard': return <Badge className="bg-slate-600 text-white">Standard</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-400" />
            Trading Platforms
          </CardTitle>
          <Badge variant="outline" className="text-slate-300 border-slate-600">
            4 Platforms Available
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tradingPlatforms.map((platform) => (
          <div
            key={platform.id}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedPlatform === platform.id
                ? 'border-blue-500 bg-blue-950/30'
                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700/70'
            }`}
            onClick={() => setSelectedPlatform(platform.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(platform.status)}`} />
                <div>
                  <h3 className="font-semibold text-white text-sm">{platform.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{platform.description}</p>
                </div>
              </div>
              {getStatusBadge(platform.status)}
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {platform.features.slice(0, 2).map((feature, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-slate-600 text-slate-300 border-0"
                >
                  {feature}
                </Badge>
              ))}
              {platform.features.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-slate-600 text-slate-300 border-0"
                >
                  +{platform.features.length - 2} more
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlatformAccess(platform);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Login to WebTrader
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlatformAccess(platform);
                }}
                className="px-3 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs h-8"
              >
                <Globe className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Professional Trading Access</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access professional-grade trading platforms with advanced features, real-time data, 
                and institutional-quality execution. Each platform offers unique advantages for different trading styles.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TradingPlatformPanel;