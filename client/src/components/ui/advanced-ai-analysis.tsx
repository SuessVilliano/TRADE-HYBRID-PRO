import React, { useState, useEffect, useCallback } from 'react';
import { useAIAnalysis } from '@/lib/stores/useAIAnalysis';
import { useMarketData } from '@/lib/stores/useMarketData';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Progress } from './progress';
import { Separator } from './separator';
import { AIMarketAnalysis, AITradeSuggestion, MarketPattern } from '@/lib/services/ai-market-analysis-service';
import { openAIService } from '@/lib/services/openai-service';
import { 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart2, 
  LineChart, 
  BrainCircuit,
  ArrowUp,
  ArrowDown,
  BarChart,
  Activity,
  RefreshCw,
  Info,
  Globe
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export function AdvancedAIAnalysis() {
  const isMobile = useIsMobile();
  const { 
    currentAnalysis, 
    suggestions, 
    loadingAnalysis, 
    loadingSuggestions, 
    analyzeMarket, 
    getSuggestions,
    historicalPerformance,
    selectedTimeframe,
    setTimeframe,
    error
  } = useAIAnalysis();
  
  const { marketData, symbol: activeSymbol, currentPrice } = useMarketData();
  // Default timeframe and available symbols
  const defaultTimeframe = "1h";
  const availableSymbols = ["BTCUSD", "ETHUSD", "EURUSD", "AAPL", "MSFT", "AMZN"];
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);

  // Fetch analysis when symbol or timeframe changes
  useEffect(() => {
    if (activeSymbol && marketData && marketData.length > 0) {
      analyzeMarket(activeSymbol, marketData, defaultTimeframe);
      getSuggestions(activeSymbol, 5);
    }
  }, [activeSymbol, defaultTimeframe, analyzeMarket, getSuggestions, marketData]);

  // Function to refresh analysis
  const refreshAnalysis = useCallback(() => {
    if (activeSymbol && marketData && marketData.length > 0) {
      analyzeMarket(activeSymbol, marketData, defaultTimeframe);
      getSuggestions(activeSymbol, 5);
    }
  }, [activeSymbol, defaultTimeframe, analyzeMarket, getSuggestions, marketData]);

  // Handle AI query submission
  const handleSubmitQuery = async () => {
    if (!userQuery.trim()) return;
    
    setAiResponse('');
    setIsProcessingQuery(true);
    
    try {
      // Build context from current market data and analysis
      const marketContext = currentAnalysis ? 
        `Symbol: ${activeSymbol}
        Current Price: ${latestPrice.toFixed(2)}
        Market Direction: ${currentAnalysis.prediction.direction} with ${Math.round(currentAnalysis.prediction.confidence)}% confidence
        Key Insights: ${currentAnalysis.insights.join('. ')}
        Risk Level: ${currentAnalysis.riskAssessment.level}
        Risk Factors: ${currentAnalysis.riskAssessment.factors.join(', ')}
        ${currentAnalysis.patterns.length > 0 ? 
          `Identified Patterns: ${currentAnalysis.patterns.map(p => p.name).join(', ')}` : 
          'No clear patterns identified'
        }` :
        `Symbol: ${activeSymbol}, Current Price: ${latestPrice.toFixed(2)}`;

      // Use OpenAI service to get real AI-powered response
      const response = await openAIService.getTradingAssistantResponse({
        query: userQuery,
        symbol: activeSymbol,
        marketConditions: marketContext
      });
      
      setAiResponse(response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse('Sorry, I encountered an error while processing your question. Please try again or refresh the analysis.');
    } finally {
      setIsProcessingQuery(false);
    }
  };

  // Render confidence score with appropriate color and visual indicator
  const renderConfidence = (confidence: number) => {
    let color = 'text-yellow-500';
    let bgColor = 'bg-yellow-100 dark:bg-yellow-900/30';
    if (confidence >= 0.7) {
      color = 'text-green-500';
      bgColor = 'bg-green-100 dark:bg-green-900/30';
    } else if (confidence < 0.5) {
      color = 'text-red-500';
      bgColor = 'bg-red-100 dark:bg-red-900/30';
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className={`${bgColor} p-1 rounded-md`}>
          <span className={`font-semibold ${color}`}>
            {Math.round(confidence * 100)}%
          </span>
        </div>
        <Progress value={confidence * 100} className="h-2 w-16" />
      </div>
    );
  };

  // Render last updated time in a readable format
  const renderLastUpdated = (date: Date) => {
    return format(date, 'MMM d, h:mm a');
  };

  // Extract latest price from market data
  const latestPrice = marketData && marketData.length > 0 
    ? marketData[marketData.length - 1].close 
    : 0;

  return (
    <div className={`w-full max-w-[1200px] p-4 ${isMobile ? 'h-[calc(100vh-120px)]' : 'h-auto'}`}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold">Advanced AI Market Analysis</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAnalysis}
              disabled={loadingAnalysis}
              className="gap-1"
            >
              {loadingAnalysis ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        
        {error && (
          <Card className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suggestions">Trading Signals</TabsTrigger>
            <TabsTrigger value="patterns">Chart Patterns</TabsTrigger>
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Overview Content */}
          <TabsContent value="overview" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart className="h-5 w-5 text-blue-500 mr-2" />
                  AI Market Insights: {activeSymbol}
                </CardTitle>
                <CardDescription>
                  Advanced analysis and key market indicators
                  {currentAnalysis && (
                    <span className="text-xs ml-2 text-muted-foreground">
                      Updated: {renderLastUpdated(currentAnalysis.lastUpdated)}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalysis ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                ) : !currentAnalysis ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <p className="text-gray-500 max-w-md">
                      No analysis available for {activeSymbol}. Try selecting a different asset or refreshing the analysis.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={refreshAnalysis}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Analysis
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Price Action</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {currentAnalysis.prediction.direction === 'bullish' ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                              ) : currentAnalysis.prediction.direction === 'bearish' ? (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                              ) : (
                                <Activity className="h-5 w-5 text-yellow-500" />
                              )}
                              <span className="font-semibold">
                                {currentAnalysis.prediction.direction.charAt(0).toUpperCase() + currentAnalysis.prediction.direction.slice(1)}
                              </span>
                            </div>
                            <div className="text-2xl font-bold">
                              ${latestPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between">
                            <span className="text-sm text-muted-foreground">Confidence</span>
                            {renderConfidence(currentAnalysis.prediction.confidence / 100)}
                          </div>
                          {currentAnalysis.prediction.priceTarget && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Target</span>
                                <span className={`font-medium ${currentAnalysis.prediction.direction === 'bullish' ? 'text-green-500' : currentAnalysis.prediction.direction === 'bearish' ? 'text-red-500' : ''}`}>
                                  ${currentAnalysis.prediction.priceTarget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card className="border-l-4 border-l-amber-500">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Risk Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant={
                              currentAnalysis.riskAssessment.level === 'low' ? 'outline' :
                              currentAnalysis.riskAssessment.level === 'medium' ? 'default' : 'destructive'
                            }>
                              {currentAnalysis.riskAssessment.level.toUpperCase()} RISK
                            </Badge>
                          </div>
                          <ul className="text-sm space-y-1">
                            {currentAnalysis.riskAssessment.factors.map((factor, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="mt-1 shrink-0">
                                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                </div>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">AI Timeframe Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-1">
                              <Button 
                                variant={selectedTimeframe === "short-term" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTimeframe("short-term")}
                                className="text-xs h-8"
                              >
                                Short Term
                              </Button>
                              <Button 
                                variant={selectedTimeframe === "medium-term" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTimeframe("medium-term")}
                                className="text-xs h-8"
                              >
                                Medium Term
                              </Button>
                              <Button 
                                variant={selectedTimeframe === "long-term" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTimeframe("long-term")}
                                className="text-xs h-8"
                              >
                                Long Term
                              </Button>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-[200px]">
                                      These timeframes represent prediction horizons:
                                      <br />
                                      • Short: 1-3 days
                                      <br />
                                      • Medium: 1-2 weeks
                                      <br />
                                      • Long: 1-3 months
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-sm text-muted-foreground">
                                Current: <span className="font-medium">{currentAnalysis.prediction.timeframe}</span>
                              </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="text-sm">
                                <div className="text-muted-foreground mb-1">Historical Accuracy</div>
                                <div className="flex items-center gap-2">
                                  <Progress value={historicalPerformance.accuracy} className="h-2 w-full" />
                                  <span className="font-medium text-sm">{historicalPerformance.accuracy}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Key Insights</h3>
                      <div className="bg-secondary/20 rounded-lg p-4">
                        <ul className="space-y-2">
                          {currentAnalysis.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="bg-primary/10 rounded-full p-1 mt-0.5 shrink-0">
                                <Sparkles className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Suggestions Content */}
          <TabsContent value="suggestions" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                  AI Trading Signals
                </CardTitle>
                <CardDescription>
                  Smart trading suggestions with automated analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSuggestions ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <p className="text-gray-500 max-w-md">
                      No trading suggestions available at the moment. Try refreshing or changing the symbol.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => getSuggestions(activeSymbol, 5)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Suggestions
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className={`${isMobile ? 'h-[calc(100vh-400px)]' : 'h-[500px]'} pr-4`}>
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className={`border-l-4 ${
                          suggestion.operation === 'buy' ? 'border-l-green-500' :
                          suggestion.operation === 'sell' ? 'border-l-red-500' :
                          'border-l-yellow-500'
                        }`}>
                          <CardHeader className="pb-2 pt-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="text-lg font-bold mr-2">{suggestion.symbol}</span>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                                  suggestion.operation === 'buy'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : suggestion.operation === 'sell'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {suggestion.operation.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Confidence: {renderConfidence(suggestion.confidence / 100)}
                              </div>
                            </div>
                            <CardDescription className="mt-1">
                              {suggestion.timeframe} • {suggestion.status === 'active' ? 'Active Signal' : suggestion.status}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-sm mb-3">
                              {suggestion.reasoning.map((reason, idx) => (
                                <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                                  {reason}
                                </p>
                              ))}
                            </div>
                            
                            {suggestion.entryPrice && (
                              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">Entry</span>
                                  <span className="font-medium">
                                    ${suggestion.entryPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                  </span>
                                </div>
                                {suggestion.stopLoss && (
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">Stop Loss</span>
                                    <span className="font-medium text-red-500">
                                      ${suggestion.stopLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                  </div>
                                )}
                                {suggestion.targetPrice && (
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground">Target</span>
                                    <span className="font-medium text-green-500">
                                      ${suggestion.targetPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="py-2 flex justify-between">
                            <div className="text-xs text-muted-foreground">
                              Generated {format(new Date(suggestion.timestamp), 'MMM d, h:mm a')}
                              {suggestion.expiresAt && (
                                <span className="ml-2">
                                  • Expires: {format(new Date(suggestion.expiresAt), 'MMM d')}
                                </span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
                              <span className="text-xs">Place Trade</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chart Patterns Content */}
          <TabsContent value="patterns" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                  Technical Pattern Analysis
                </CardTitle>
                <CardDescription>
                  AI-detected patterns and formations in price action
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalysis ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                ) : !currentAnalysis || currentAnalysis.patterns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                    <p className="text-gray-500 max-w-md">
                      No recognizable patterns detected for {activeSymbol} at this time. The market may be in a transitional or non-trending state.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={refreshAnalysis}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Analysis
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className={`${isMobile ? 'h-[calc(100vh-400px)]' : 'h-[500px]'} pr-4`}>
                    <div className="space-y-4">
                      {currentAnalysis.patterns.map((pattern, index) => (
                        <Card key={index} className={`border-l-4 ${
                          pattern.type === 'bullish' ? 'border-l-green-500' :
                          pattern.type === 'bearish' ? 'border-l-red-500' :
                          'border-l-blue-500'
                        }`}>
                          <CardHeader className="py-3 px-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="font-semibold">{pattern.name}</span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                  pattern.type === 'bullish'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : pattern.type === 'bearish'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  {pattern.type.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm">
                                Confidence: {renderConfidence(pattern.confidence / 100)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-0 px-4">
                            <p className="text-sm">{pattern.description}</p>
                            
                            {pattern.visualRange && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <div className="flex items-center">
                                  <span className="text-xs text-muted-foreground">Pattern visible from candle {pattern.visualRange[0]} to {pattern.visualRange[1]}</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="py-3 px-4">
                            <div className="flex justify-between w-full items-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => {
                                  // In a real implementation, this would highlight the pattern on the chart
                                  // or navigate to a detailed view
                                }}
                              >
                                View on Chart
                              </Button>
                              
                              <div className="text-xs text-muted-foreground">
                                Typical target: {
                                  pattern.type === 'bullish' ? '+5-15%' :
                                  pattern.type === 'bearish' ? '-5-15%' :
                                  'Variable'
                                }
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Content */}
          <TabsContent value="assistant" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                  AI Trading Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about market conditions and trading strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="query">Your Question</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="query"
                        placeholder="Example: What's your analysis on Bitcoin's current trend?"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmitQuery();
                        }}
                      />
                      <Button 
                        onClick={handleSubmitQuery}
                        disabled={isProcessingQuery || !userQuery.trim()}
                      >
                        {isProcessingQuery ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {aiResponse && (
                    <div className="mt-4">
                      <Card className="overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-secondary/30">
                          <div className="flex items-center">
                            <BrainCircuit className="h-5 w-5 text-primary mr-2" />
                            <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3 px-4">
                          <p className="text-sm whitespace-pre-line">{aiResponse}</p>
                        </CardContent>
                      </Card>
                      
                      <div className="mt-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            // In a real implementation, this would save the response
                            // to a trading journal or notes
                          }}
                        >
                          Save to Journal
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => setAiResponse('')}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Suggested Questions:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        `What's your analysis on ${activeSymbol}?`,
                        `Should I buy or sell ${activeSymbol} right now?`,
                        `What risk factors should I consider for ${activeSymbol}?`,
                        `Are there any chart patterns forming in ${activeSymbol}?`
                      ].map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-auto py-2"
                          onClick={() => {
                            setUserQuery(question);
                            handleSubmitQuery();
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}