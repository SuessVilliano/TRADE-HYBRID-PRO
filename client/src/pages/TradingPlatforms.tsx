import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { UniversalHeader } from '../components/ui/universal-header';
import { 
  ExternalLink, 
  DollarSign, 
  TrendingUp,
  Monitor,
  Zap,
  Globe,
  ShieldCheck,
  Trophy,
  Users,
  Target,
  Award
} from 'lucide-react';

interface PropFirm {
  id: string;
  name: string;
  description: string;
  website: string;
  dashboardUrl?: string;
  platforms: string[];
  maxCapital: string;
  profitSplit: string;
  challenge: boolean;
  features: string[];
  status: 'active' | 'featured' | 'popular';
}

const TradingPlatforms: React.FC = () => {
  const propFirms: PropFirm[] = [
    {
      id: 'hybrid-funding',
      name: 'Hybrid Funding',
      description: 'Premier prop trading firm with flexible funding options and competitive profit splits',
      website: 'https://hybridfunding.co',
      dashboardUrl: 'https://hybridfundingdashboard.propaccount.com/en/sign-in',
      platforms: ['DX Trade', 'Match Trader', 'cTrader', 'MT4', 'MT5'],
      maxCapital: '$2,000,000',
      profitSplit: '90%',
      challenge: true,
      features: ['Instant Funding', 'No Time Limits', '24/7 Support', 'AI Integration'],
      status: 'featured'
    },
    {
      id: 'ftmo',
      name: 'FTMO',
      description: 'Leading prop trading firm with proven track record and excellent support',
      website: 'https://ftmo.com',
      platforms: ['MT4', 'MT5', 'cTrader', 'DXTrade'],
      maxCapital: '$400,000',
      profitSplit: '80%',
      challenge: true,
      features: ['Free Trial', 'Educational Resources', 'Risk Management'],
      status: 'popular'
    },
    {
      id: 'the5ers',
      name: 'The5%ers',
      description: 'Unique funding model with no evaluation period for experienced traders',
      website: 'https://the5ers.com',
      platforms: ['MT4', 'MT5'],
      maxCapital: '$4,000,000',
      profitSplit: '50-80%',
      challenge: false,
      features: ['No Evaluation', 'Scaling Plan', 'High Leverage'],
      status: 'active'
    },
    {
      id: 'my-forex-funds',
      name: 'My Forex Funds',
      description: 'Fast-growing prop firm with competitive conditions and quick payouts',
      website: 'https://myforexfunds.com',
      platforms: ['MT4', 'MT5', 'cTrader'],
      maxCapital: '$300,000',
      profitSplit: '85%',
      challenge: true,
      features: ['Daily Payouts', 'No Restrictions', 'Swap Free'],
      status: 'active'
    }
  ];

  const tradingPlatforms = [
    {
      name: 'DX Trade',
      description: 'Advanced web-based trading platform with institutional-grade features',
      features: ['Advanced Charting', 'Risk Management', 'Multi-Asset Trading'],
      icon: <Monitor className="h-6 w-6" />
    },
    {
      name: 'Match Trader',
      description: 'Professional trading platform for forex and CFD trading',
      features: ['ECN Trading', 'Advanced Orders', 'Market Analysis'],
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      name: 'cTrader',
      description: 'Modern trading platform with advanced charting and automation',
      features: ['Algorithmic Trading', 'Level II Pricing', 'Advanced Charting'],
      icon: <Zap className="h-6 w-6" />
    },
    {
      name: 'Rithmic',
      description: 'High-performance futures trading platform',
      features: ['Low Latency', 'Direct Market Access', 'Professional Tools'],
      icon: <Target className="h-6 w-6" />
    }
  ];

  const handleVisitWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAccessDashboard = (dashboardUrl?: string, website?: string) => {
    const url = dashboardUrl || website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'featured':
        return 'bg-yellow-500';
      case 'popular':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'featured':
        return <Trophy className="h-4 w-4" />;
      case 'popular':
        return <Users className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader 
        title="Trading Platforms & Prop Firms"
        showBackButton={true}
        showHomeButton={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Professional Trading Platforms</h1>
          <p className="text-muted-foreground text-lg">
            Connect to leading prop trading firms and access professional trading platforms with institutional-grade tools.
          </p>
        </div>

        {/* Prop Firms Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Prop Trading Firms</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {propFirms.map((firm) => (
              <Card key={firm.id} className="relative hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {firm.name}
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(firm.status)} text-white`}
                        >
                          {getStatusIcon(firm.status)}
                          {firm.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {firm.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Max Capital:</span>
                      <div className="text-muted-foreground">{firm.maxCapital}</div>
                    </div>
                    <div>
                      <span className="font-semibold">Profit Split:</span>
                      <div className="text-muted-foreground">{firm.profitSplit}</div>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-sm">Platforms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {firm.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-sm">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {firm.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleVisitWebsite(firm.website)}
                      className="flex-1"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                    
                    {firm.dashboardUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAccessDashboard(firm.dashboardUrl, firm.website)}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trading Platforms Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Trading Platforms</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tradingPlatforms.map((platform) => (
              <Card key={platform.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {platform.icon}
                    </div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {platform.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <span className="font-semibold text-sm">Key Features:</span>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {platform.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <ShieldCheck className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Notice */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Zap className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">AI Voice Trading Integration</h3>
                <p className="text-muted-foreground">
                  All platforms support our AI Voice Trading Assistant. Use voice commands to generate 
                  trade signals that can be executed directly on these platforms or copied to your clipboard 
                  for manual entry.
                </p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/voice-trade'}>
                    <Zap className="h-4 w-4 mr-2" />
                    Try Voice Trading
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingPlatforms;