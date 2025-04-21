import React from 'react';
import { useMarketMood } from '../../lib/context/MarketMoodContext';
import { Badge } from './badge';
import { Button } from './button';
import { Switch } from './switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { ArrowDown, ArrowUp, BarChart2, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export function MarketMoodIndicator() {
  const { 
    marketMood, 
    refreshMood, 
    adaptiveColorSchemeEnabled,
    toggleAdaptiveColorScheme
  } = useMarketMood();

  const getBadgeVariant = () => {
    if (marketMood.mood === 'bullish') return 'success';
    if (marketMood.mood === 'bearish') return 'destructive';
    return 'secondary';
  };

  const getIcon = () => {
    if (marketMood.mood === 'bullish') return <ArrowUp className="w-4 h-4" />;
    if (marketMood.mood === 'bearish') return <ArrowDown className="w-4 h-4" />;
    return <BarChart2 className="w-4 h-4" />;
  };

  const getIntensityLabel = () => {
    switch (marketMood.intensity) {
      case 'high': return 'Strong';
      case 'medium': return 'Moderate';
      case 'low': return 'Mild';
      default: return 'Neutral';
    }
  };

  const getMoodLabel = () => {
    return marketMood.mood.charAt(0).toUpperCase() + marketMood.mood.slice(1);
  };

  const handleRefresh = async () => {
    await refreshMood();
  };

  return (
    <Card className="market-mood-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Market Mood</CardTitle>
          <Badge variant={getBadgeVariant()}>
            {getIcon()}
            <span className="ml-1">{getMoodLabel()}</span>
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Sentiment for {marketMood.symbol}
          {marketMood.lastUpdated && (
            <span className="ml-1">• Updated {new Date(marketMood.lastUpdated).toLocaleTimeString()}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm pb-2">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-muted-foreground">Intensity:</span>{' '}
            <span className="font-medium">{getIntensityLabel()}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={handleRefresh}
                  disabled={marketMood.isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${marketMood.isLoading ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh market sentiment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Adaptive Colors</span>
        <Switch
          checked={adaptiveColorSchemeEnabled}
          onCheckedChange={toggleAdaptiveColorScheme}
          aria-label="Toggle adaptive color scheme"
        />
      </CardFooter>
    </Card>
  );
}

export function MarketMoodBadge() {
  const { marketMood } = useMarketMood();

  const getBadgeVariant = () => {
    if (marketMood.mood === 'bullish') return 'success';
    if (marketMood.mood === 'bearish') return 'destructive';
    return 'secondary';
  };

  const getIcon = () => {
    if (marketMood.mood === 'bullish') return <ArrowUp className="w-3 h-3" />;
    if (marketMood.mood === 'bearish') return <ArrowDown className="w-3 h-3" />;
    return <BarChart2 className="w-3 h-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getBadgeVariant()} className="text-xs">
            {getIcon()}
            <span className="ml-1">{marketMood.symbol}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Market mood for {marketMood.symbol} is{' '}
            <span className="font-semibold">
              {marketMood.mood.charAt(0).toUpperCase() + marketMood.mood.slice(1)}
            </span>{' '}
            with {marketMood.intensity} intensity
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}