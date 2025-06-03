import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Zap, 
  Wifi, 
  WifiOff,
  ChevronDown,
  ExternalLink,
  Monitor
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TradingPlatform {
  id: number;
  name: string;
  platformType: string;
  webTradeUrl: string;
  authType: string;
  isConnected: boolean;
  credentials?: any;
  lastUsed?: Date;
}

interface QuickPlatformSwitcherProps {
  onPlatformSelect: (platform: TradingPlatform) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const QuickPlatformSwitcher: React.FC<QuickPlatformSwitcherProps> = ({
  onPlatformSelect,
  className = '',
  size = 'default'
}) => {
  const [platforms, setPlatforms] = useState<TradingPlatform[]>([]);
  const [recentPlatforms, setRecentPlatforms] = useState<TradingPlatform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatforms();
    loadRecentPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/trading-platforms/platforms');
      const data = await response.json();
      const connectionsResponse = await fetch('/api/trading-platforms/connections');
      const connectionsData = await connectionsResponse.json();
      
      const platformsWithConnections = data.platforms?.map((platform: any) => {
        const connection = connectionsData.connections?.find((conn: any) => 
          conn.platform?.id === platform.id
        );
        return {
          ...platform,
          isConnected: connection?.connection?.isConnected || false,
          credentials: connection?.connection?.credentials
        };
      }) || [];
      
      setPlatforms(platformsWithConnections);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentPlatforms = () => {
    const recent = localStorage.getItem('recentTradingPlatforms');
    if (recent) {
      setRecentPlatforms(JSON.parse(recent));
    }
  };

  const saveRecentPlatform = (platform: TradingPlatform) => {
    const updated = [
      { ...platform, lastUsed: new Date() },
      ...recentPlatforms.filter(p => p.id !== platform.id)
    ].slice(0, 3); // Keep only 3 recent platforms
    
    setRecentPlatforms(updated);
    localStorage.setItem('recentTradingPlatforms', JSON.stringify(updated));
  };

  const handlePlatformSelect = (platform: TradingPlatform) => {
    saveRecentPlatform(platform);
    onPlatformSelect(platform);
  };

  const connectedPlatforms = platforms.filter(p => p.isConnected);
  const disconnectedPlatforms = platforms.filter(p => !p.isConnected);

  if (loading) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <Monitor className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={className}>
          <Zap className="h-4 w-4 mr-2" />
          Quick Launch
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {recentPlatforms.length > 0 && (
          <>
            <DropdownMenuLabel>Recent Platforms</DropdownMenuLabel>
            {recentPlatforms.map(platform => (
              <DropdownMenuItem
                key={`recent-${platform.id}`}
                onClick={() => handlePlatformSelect(platform)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>{platform.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Recent
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {connectedPlatforms.length > 0 && (
          <>
            <DropdownMenuLabel>Connected Platforms</DropdownMenuLabel>
            {connectedPlatforms.map(platform => (
              <DropdownMenuItem
                key={platform.id}
                onClick={() => handlePlatformSelect(platform)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>{platform.name}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </DropdownMenuItem>
            ))}
          </>
        )}

        {disconnectedPlatforms.length > 0 && (
          <>
            {connectedPlatforms.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>Available Platforms</DropdownMenuLabel>
            {disconnectedPlatforms.map(platform => (
              <DropdownMenuItem
                key={platform.id}
                disabled
                className="flex items-center justify-between opacity-50"
              >
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                  <span>{platform.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Not Connected
                </Badge>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {connectedPlatforms.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No connected platforms available.
            <br />
            Connect a platform first to use Quick Launch.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickPlatformSwitcher;