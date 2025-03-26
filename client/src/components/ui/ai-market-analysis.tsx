import React, { useEffect, useState } from 'react';
import { useAIAnalysis } from '@/lib/stores/useAIAnalysis';
import { useMarketData } from '@/lib/stores/useMarketData';
import { useTrader } from '@/lib/stores/useTrader';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { AITradeSuggestion, MarketPattern } from '@/lib/services/ai-market-analysis-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { Skeleton } from './skeleton';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  LineChart, 
  BarChart4, 
  Zap, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Star,
  Eye,
  EyeOff, 
  Lightbulb,
  CornerRightDown,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-is-mobile';

interface AIMarketAnalysisProps {
  className?: string;
}

export function AIMarketAnalysis({ className }: AIMarketAnalysisProps) {
  const { 
    currentAnalysis, 
    suggestions, 
    favoritePatterns,
    loadingAnalysis,
    loadingSuggestions,
    error,
    analyzeMarket,
    getSuggestions,
    favoritePattern,
    unfavoritePattern 
  } = useAIAnalysis();
  
  const { marketData, symbol } = useMarketData();
  const { placeTrade } = useTrader();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState<'insights' | 'suggestions' | 'patterns'>('insights');
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [expandedInsights, setExpandedInsights] = useState(false);
  const [executingSuggestion, setExecutingSuggestion] = useState<string | null>(null);
  
  // Fetch analysis when symbol changes
  useEffect(() => {
    if (marketData.length > 0) {
      analyzeMarket(symbol, marketData);
      getSuggestions(symbol);
    }
  }, [symbol, marketData, analyzeMarket, getSuggestions]);
  
  // Helper to toggle suggestion expansion
  const toggleSuggestion = (id: string) => {
    if (expandedSuggestion === id) {
      setExpandedSuggestion(null);
    } else {
      setExpandedSuggestion(id);
    }
  };
  
  // Execute a trade suggestion
  const executeSuggestion = async (suggestion: AITradeSuggestion) => {
    if (suggestion.operation === 'hold') {
      toast("Hold Position", {
        description: "This is a hold recommendation. No trade needed."
      });
      return;
    }
    
    setExecutingSuggestion(suggestion.id);
    
    try {
      await placeTrade({
        symbol: suggestion.symbol,
        side: suggestion.operation,
        quantity: 1, // Default to 1, user can adjust
        type: 'market'
      });
      
      toast.success(`Successfully Executed AI ${suggestion.operation.toUpperCase()} Trade`, {
        description: `${suggestion.operation.toUpperCase()} 1 ${suggestion.symbol} at market price`
      });
    } catch (error) {
      console.error("Error executing trade suggestion:", error);
      toast.error("Failed to Execute Trade", {
        description: "There was an error executing the suggested trade."
      });
    } finally {
      setExecutingSuggestion(null);
    }
  };
  
  // Helper to check if a pattern is in favorites
  const isPatternFavorited = (patternName: string) => {
    return favoritePatterns.some(p => p.name === patternName);
  };
  
  // Toggle a pattern favorite status
  const toggleFavoritePattern = (pattern: MarketPattern) => {
    if (isPatternFavorited(pattern.name)) {
      unfavoritePattern(pattern.name);
      toast(`Removed from Favorites`, {
        description: `${pattern.name} pattern removed from favorites`
      });
    } else {
      favoritePattern(pattern);
      toast(`Added to Favorites`, {
        description: `${pattern.name} pattern added to favorites`
      });
    }
  };
  
  // Mobile-optimized view
  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        <Card className="bg-background/95 backdrop-blur-sm">
          <CardHeader className="py-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <BrainCircuit size={16} className="text-primary" />
              AI Market Analysis
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-3 py-2">
            {loadingAnalysis ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : error ? (
              <div className="text-xs text-muted-foreground">
                <AlertTriangle size={14} className="inline mr-1 text-destructive" />
                Failed to analyze market: {error}
              </div>
            ) : !currentAnalysis ? (
              <div className="text-xs text-muted-foreground">No analysis available</div>
            ) : (
              <div className="space-y-3">
                {/* Market Direction */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {currentAnalysis.prediction.direction === 'bullish' ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : currentAnalysis.prediction.direction === 'bearish' ? (
                      <TrendingDown size={14} className="text-red-500" />
                    ) : (
                      <LineChart size={14} className="text-yellow-500" />
                    )}
                    <span className="text-xs font-medium">
                      {currentAnalysis.prediction.direction.charAt(0).toUpperCase() + 
                       currentAnalysis.prediction.direction.slice(1)} ({currentAnalysis.prediction.confidence.toFixed(0)}% confidence)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1">
                    {currentAnalysis.prediction.timeframe}
                  </Badge>
                </div>
                
                {/* Price Target */}
                {currentAnalysis.prediction.priceTarget && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Target:</span>{' '}
                    <span className="font-medium">{formatCurrency(currentAnalysis.prediction.priceTarget)}</span>
                  </div>
                )}
                
                {/* Risk Level */}
                <div className="flex items-center gap-1">
                  <AlertTriangle 
                    size={14} 
                    className={cn(
                      "text-yellow-500",
                      currentAnalysis.riskAssessment.level === 'high' && "text-red-500",
                      currentAnalysis.riskAssessment.level === 'low' && "text-green-500"
                    )} 
                  />
                  <span className="text-xs font-medium">
                    {currentAnalysis.riskAssessment.level.charAt(0).toUpperCase() + 
                     currentAnalysis.riskAssessment.level.slice(1)} Risk
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-auto" 
                    onClick={() => setExpandedInsights(!expandedInsights)}
                  >
                    {expandedInsights ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>
                </div>
                
                {/* Expand insights */}
                {expandedInsights && (
                  <div className="space-y-2 mt-2 text-xs">
                    <h4 className="font-medium">Key Insights:</h4>
                    <ul className="space-y-1.5">
                      {currentAnalysis.insights.map((insight, i) => (
                        <li key={i} className="flex">
                          <Lightbulb size={12} className="mr-1 mt-0.5 shrink-0 text-yellow-500" />
                          <span className="text-muted-foreground">{insight}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {currentAnalysis.patterns.length > 0 && (
                      <>
                        <h4 className="font-medium mt-2">Detected Patterns:</h4>
                        <div className="flex flex-wrap gap-1">
                          {currentAnalysis.patterns.map((pattern, i) => (
                            <Badge 
                              key={i}
                              variant={pattern.type === 'bullish' ? 'default' : pattern.type === 'bearish' ? 'destructive' : 'secondary'}
                              className="text-[10px]"
                            >
                              {pattern.name}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="px-3 py-2">
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid grid-cols-2 h-7">
                <TabsTrigger value="suggestions" className="text-xs">Trade Ideas</TabsTrigger>
                <TabsTrigger value="patterns" className="text-xs">Patterns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggestions" className="pt-2 pb-0">
                {loadingSuggestions ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No trading suggestions available
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <div 
                        key={suggestion.id}
                        className={cn(
                          "border rounded-md p-2 text-xs",
                          suggestion.operation === 'buy' && "border-green-500/20",
                          suggestion.operation === 'sell' && "border-red-500/20",
                          suggestion.operation === 'hold' && "border-yellow-500/20"
                        )}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={suggestion.operation === 'buy' ? 'default' : 
                                      suggestion.operation === 'sell' ? 'destructive' : 'outline'}
                              className="text-[10px] h-5"
                            >
                              {suggestion.operation.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{suggestion.symbol}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => toggleSuggestion(suggestion.id)}
                          >
                            {expandedSuggestion === suggestion.id ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </Button>
                        </div>
                        
                        {/* Basic info */}
                        <div className="mt-1 flex gap-2 text-muted-foreground">
                          <div>
                            <span className="text-muted-foreground">Entry:</span>{' '}
                            {suggestion.entryPrice ? formatCurrency(suggestion.entryPrice) : 'Market'}
                          </div>
                          <div className="ml-auto">
                            <span className="text-muted-foreground">Conf:</span>{' '}
                            {suggestion.confidence.toFixed(0)}%
                          </div>
                        </div>
                        
                        {/* Expanded content */}
                        {expandedSuggestion === suggestion.id && (
                          <div className="mt-2 space-y-2">
                            {suggestion.targetPrice && (
                              <div className="flex gap-2">
                                <div>
                                  <span className="text-muted-foreground">Target:</span>{' '}
                                  {formatCurrency(suggestion.targetPrice)}
                                </div>
                                {suggestion.stopLoss && (
                                  <div className="ml-auto">
                                    <span className="text-muted-foreground">Stop:</span>{' '}
                                    {formatCurrency(suggestion.stopLoss)}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div>
                              <h5 className="font-medium text-[11px]">AI Reasoning:</h5>
                              <ul className="mt-1 space-y-1 text-[10px]">
                                {suggestion.reasoning.map((reason, i) => (
                                  <li key={i} className="flex gap-1">
                                    <CornerRightDown size={10} className="shrink-0 mt-0.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <Button 
                              variant="default"
                              size="sm"
                              className={cn(
                                "w-full h-7 mt-1",
                                suggestion.operation === 'buy' && "bg-green-600 hover:bg-green-700",
                                suggestion.operation === 'sell' && "bg-red-600 hover:bg-red-700",
                                suggestion.operation === 'hold' && "bg-yellow-600 hover:bg-yellow-700",
                                executingSuggestion === suggestion.id && "opacity-80"
                              )}
                              disabled={executingSuggestion === suggestion.id}
                              onClick={() => executeSuggestion(suggestion)}
                            >
                              {executingSuggestion === suggestion.id ? (
                                <>
                                  <Loader2 size={14} className="mr-1 animate-spin" />
                                  Executing...
                                </>
                              ) : (
                                <>
                                  Execute {suggestion.operation.toUpperCase()}
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="patterns" className="pt-2 pb-0">
                {!currentAnalysis || currentAnalysis.patterns.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No patterns detected for {symbol}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {currentAnalysis.patterns.map((pattern, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "border rounded-md p-2 text-xs",
                          pattern.type === 'bullish' && "border-green-500/20",
                          pattern.type === 'bearish' && "border-red-500/20",
                          pattern.type === 'neutral' && "border-yellow-500/20"
                        )}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={pattern.type === 'bullish' ? 'default' : 
                                      pattern.type === 'bearish' ? 'destructive' : 'secondary'}
                              className="text-[10px] h-5"
                            >
                              {pattern.type.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{pattern.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-yellow-500"
                            onClick={() => toggleFavoritePattern(pattern)}
                          >
                            <Star 
                              size={14}
                              className={cn(
                                isPatternFavorited(pattern.name) ? "fill-yellow-500" : "fill-none"
                              )}
                            />
                          </Button>
                        </div>
                        
                        <div className="mt-1">
                          <div className="text-[10px] text-muted-foreground">
                            {pattern.description}
                          </div>
                          <div className="mt-1">
                            <span className="text-muted-foreground text-[10px]">Confidence:</span>{' '}
                            <span className="text-[10px]">{pattern.confidence.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Desktop view
  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit size={20} className="text-primary" />
            AI Market Analysis
            {loadingAnalysis && (
              <Loader2 size={16} className="animate-spin ml-2 text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            Advanced trading insights powered by artificial intelligence
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle size={16} className="inline mr-2" />
              Failed to analyze market: {error}
            </div>
          ) : !currentAnalysis ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Market sentiment overview */}
              <div className="flex gap-4 items-start border rounded-lg p-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    {currentAnalysis.prediction.direction === 'bullish' ? (
                      <>
                        <TrendingUp className="text-green-500" />
                        <span>Bullish Outlook</span>
                      </>
                    ) : currentAnalysis.prediction.direction === 'bearish' ? (
                      <>
                        <TrendingDown className="text-red-500" />
                        <span>Bearish Outlook</span>
                      </>
                    ) : (
                      <>
                        <LineChart className="text-yellow-500" />
                        <span>Neutral Outlook</span>
                      </>
                    )}
                    <Badge className="ml-2">
                      {currentAnalysis.prediction.confidence.toFixed(0)}% Confidence
                    </Badge>
                  </h3>
                  
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Timeframe</div>
                      <div className="font-medium">{currentAnalysis.prediction.timeframe}</div>
                    </div>
                    
                    {currentAnalysis.prediction.priceTarget && (
                      <div>
                        <div className="text-sm text-muted-foreground">Target Price</div>
                        <div className="font-medium">{formatCurrency(currentAnalysis.prediction.priceTarget)}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Risk Level</div>
                      <div className="font-medium flex items-center gap-1">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          currentAnalysis.riskAssessment.level === 'low' && "bg-green-500",
                          currentAnalysis.riskAssessment.level === 'medium' && "bg-yellow-500",
                          currentAnalysis.riskAssessment.level === 'high' && "bg-red-500",
                        )} />
                        {currentAnalysis.riskAssessment.level.charAt(0).toUpperCase() + 
                        currentAnalysis.riskAssessment.level.slice(1)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk factors */}
                  {currentAnalysis.riskAssessment.factors.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-1">Risk Factors:</div>
                      <div className="flex flex-wrap gap-1">
                        {currentAnalysis.riskAssessment.factors.map((factor, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Tabs defaultValue="insights" className="w-full mt-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="insights" onClick={() => setActiveTab('insights')}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    AI Insights
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" onClick={() => setActiveTab('suggestions')}>
                    <Zap className="mr-2 h-4 w-4" />
                    Trade Ideas
                  </TabsTrigger>
                  <TabsTrigger value="patterns" onClick={() => setActiveTab('patterns')}>
                    <BarChart4 className="mr-2 h-4 w-4" />
                    Patterns
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="insights" className="space-y-4 pt-4">
                  {currentAnalysis.insights.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {currentAnalysis.insights.map((insight, i) => (
                          <div key={i} className="flex border rounded-md p-3">
                            <Lightbulb className="h-5 w-5 mr-3 mt-0.5 text-yellow-500 shrink-0" />
                            <div className="text-sm">{insight}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-xs text-center text-muted-foreground">
                        <Info size={12} className="inline mr-1" />
                        Insights are generated based on pattern recognition and technical indicators
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      No insights available for {symbol}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="suggestions" className="pt-4">
                  {loadingSuggestions ? (
                    <div className="space-y-4">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="text-muted-foreground text-center py-8">
                      No trading suggestions available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <div 
                          key={suggestion.id}
                          className={cn(
                            "border rounded-lg p-4",
                            suggestion.operation === 'buy' && "border-green-500/20",
                            suggestion.operation === 'sell' && "border-red-500/20",
                            suggestion.operation === 'hold' && "border-yellow-500/20",
                            expandedSuggestion === suggestion.id && "shadow-sm"
                          )}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={suggestion.operation === 'buy' ? 'default' : 
                                        suggestion.operation === 'sell' ? 'destructive' : 'outline'}
                                className="text-xs px-2"
                              >
                                {suggestion.operation.toUpperCase()}
                              </Badge>
                              <h3 className="text-lg font-medium">{suggestion.symbol}</h3>
                              <Badge variant="outline" className="ml-1">
                                {suggestion.confidence.toFixed(0)}% Confidence
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 gap-1"
                              onClick={() => toggleSuggestion(suggestion.id)}
                            >
                              {expandedSuggestion === suggestion.id ? (
                                <>
                                  <EyeOff size={14} />
                                  <span className="text-xs">Hide Details</span>
                                </>
                              ) : (
                                <>
                                  <Eye size={14} />
                                  <span className="text-xs">Show Details</span>
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Entry Price</div>
                              <div className="font-medium">
                                {suggestion.entryPrice ? formatCurrency(suggestion.entryPrice) : 'Market'}
                              </div>
                            </div>
                            
                            {suggestion.targetPrice && (
                              <div>
                                <div className="text-sm text-muted-foreground">Target Price</div>
                                <div className="font-medium">{formatCurrency(suggestion.targetPrice)}</div>
                              </div>
                            )}
                            
                            {suggestion.stopLoss && (
                              <div>
                                <div className="text-sm text-muted-foreground">Stop Loss</div>
                                <div className="font-medium">{formatCurrency(suggestion.stopLoss)}</div>
                              </div>
                            )}
                            
                            <div>
                              <div className="text-sm text-muted-foreground">Timeframe</div>
                              <div className="font-medium">{suggestion.timeframe}</div>
                            </div>
                          </div>
                          
                          {/* Expanded content */}
                          {expandedSuggestion === suggestion.id && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-medium mb-2">AI Reasoning:</h4>
                              <ul className="space-y-2 text-sm">
                                {suggestion.reasoning.map((reason, i) => (
                                  <li key={i} className="flex gap-2">
                                    <CornerRightDown className="shrink-0 mt-0.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">{reason}</span>
                                  </li>
                                ))}
                              </ul>
                              
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  variant="default"
                                  className={cn(
                                    suggestion.operation === 'buy' && "bg-green-600 hover:bg-green-700",
                                    suggestion.operation === 'sell' && "bg-red-600 hover:bg-red-700",
                                    suggestion.operation === 'hold' && "bg-yellow-600 hover:bg-yellow-700",
                                    executingSuggestion === suggestion.id && "opacity-80"
                                  )}
                                  disabled={executingSuggestion === suggestion.id}
                                  onClick={() => executeSuggestion(suggestion)}
                                >
                                  {executingSuggestion === suggestion.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Executing...
                                    </>
                                  ) : (
                                    <>
                                      Execute {suggestion.operation.toUpperCase()} Trade
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="patterns" className="pt-4">
                  {!currentAnalysis || currentAnalysis.patterns.length === 0 ? (
                    <div className="text-muted-foreground text-center py-8">
                      No patterns detected for {symbol}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {currentAnalysis.patterns.map((pattern, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "border rounded-lg p-4",
                            pattern.type === 'bullish' && "border-green-500/20",
                            pattern.type === 'bearish' && "border-red-500/20",
                            pattern.type === 'neutral' && "border-yellow-500/20"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={pattern.type === 'bullish' ? 'default' : 
                                        pattern.type === 'bearish' ? 'destructive' : 'secondary'}
                              >
                                {pattern.type.toUpperCase()}
                              </Badge>
                              <h3 className="text-lg font-medium">{pattern.name}</h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 text-yellow-500"
                              onClick={() => toggleFavoritePattern(pattern)}
                            >
                              <Star 
                                size={16}
                                className={cn(
                                  isPatternFavorited(pattern.name) ? "fill-yellow-500" : "fill-none"
                                )}
                              />
                            </Button>
                          </div>
                          
                          <p className="mt-2 text-sm text-muted-foreground">
                            {pattern.description}
                          </p>
                          
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Confidence:</span>{' '}
                            <span className="font-medium">{pattern.confidence.toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}