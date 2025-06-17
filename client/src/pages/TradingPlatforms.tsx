import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { UniversalHeader } from '../components/ui/universal-header';
import { 
  ExternalLink, 
  Monitor,
  TrendingUp,
  Zap,
  Target,
  Globe,
  LogIn,
  ShieldCheck
} from 'lucide-react';

interface TradingPlatform {
  id: string;
  name: string;
  description: string;
  webtraderUrl: string;
  loginUrl: string;
  features: string[];
  icon: React.ReactNode;
  status: 'active' | 'featured';
  supported: boolean;
}

const TradingPlatforms: React.FC = () => {
  const tradingPlatforms: TradingPlatform[] = [
    {
      id: 'dx-trade',
      name: 'DX Trade',
      description: 'Advanced web-based trading platform with institutional-grade features and real-time execution',
      webtraderUrl: 'https://webtrader.dxtrade.com',
      loginUrl: 'https://webtrader.dxtrade.com/login',
      features: ['Advanced Charting', 'Risk Management', 'Multi-Asset Trading', 'Real-time Data'],
      icon: <Monitor className="h-6 w-6" />,
      status: 'featured',
      supported: true
    },
    {
      id: 'match-trader',
      name: 'Match Trader',
      description: 'Professional ECN trading platform optimized for forex and CFD trading',
      webtraderUrl: 'https://webtrader.matchtrader.com',
      loginUrl: 'https://webtrader.matchtrader.com/login',
      features: ['ECN Trading', 'Advanced Orders', 'Market Analysis', 'Low Spreads'],
      icon: <TrendingUp className="h-6 w-6" />,
      status: 'active',
      supported: true
    },
    {
      id: 'ctrader',
      name: 'cTrader',
      description: 'Modern trading platform with advanced charting, automation, and algorithmic trading',
      webtraderUrl: 'https://ctrader.com/ctrader-web',
      loginUrl: 'https://ctrader.com/ctrader-web/login',
      features: ['Algorithmic Trading', 'Level II Pricing', 'Advanced Charting', 'Copy Trading'],
      icon: <Zap className="h-6 w-6" />,
      status: 'featured',
      supported: true
    },
    {
      id: 'rithmic',
      name: 'Rithmic',
      description: 'High-performance futures trading platform with ultra-low latency execution',
      webtraderUrl: 'https://rithmic.com/webtrader',
      loginUrl: 'https://rithmic.com/webtrader/login',
      features: ['Ultra-Low Latency', 'Direct Market Access', 'Professional Tools', 'Futures Trading'],
      icon: <Target className="h-6 w-6" />,
      status: 'active',
      supported: true
    }
  ];

  const handleWebtraderLogin = (loginUrl: string) => {
    window.open(loginUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWebtraderAccess = (webtraderUrl: string) => {
    window.open(webtraderUrl, '_blank', 'noopener,noreferrer');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'featured':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-blue-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'featured':
        return 'Featured';
      case 'active':
        return 'Active';
      default:
        return 'Available';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader 
        title="Trading Platforms"
        showBackButton={true}
        showHomeButton={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {tradingPlatforms.map((platform) => (
            <Card key={platform.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`p-2 sm:p-3 rounded-xl ${getStatusColor(platform.status)} text-white shadow-lg flex-shrink-0`}>
                      {platform.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl truncate">{platform.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 sm:mt-2 text-xs">
                        {getStatusBadge(platform.status)}
                      </Badge>
                    </div>
                  </div>
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                </div>
                <CardDescription className="text-sm sm:text-base leading-relaxed mt-2 sm:mt-3">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 sm:mb-3">Platform Features:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {platform.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="justify-center py-1 text-xs sm:text-sm">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    onClick={() => handleWebtraderLogin(platform.loginUrl)}
                    className="flex-1 h-12 text-base sm:text-lg font-semibold"
                    size="lg"
                  >
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="truncate">Login to WebTrader</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleWebtraderAccess(platform.webtraderUrl)}
                    className="flex-1 h-12 text-base sm:text-lg font-semibold"
                    size="lg"
                  >
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="truncate">Access Platform</span>
                  </Button>
                </div>
                
                <div className="text-center text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <span className="font-medium">Status:</span> Ready for trading • 
                  <span className="font-medium ml-1">Connection:</span> Secure
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Professional Trading Access
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Each platform provides direct access to professional trading environments with 
                real-time market data, advanced charting tools, and institutional-grade execution.
              </p>
              <div className="flex justify-center gap-6 text-sm text-gray-500">
                <span>✓ Real-time Market Data</span>
                <span>✓ Advanced Charting</span>
                <span>✓ Professional Execution</span>
                <span>✓ Risk Management Tools</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingPlatforms;