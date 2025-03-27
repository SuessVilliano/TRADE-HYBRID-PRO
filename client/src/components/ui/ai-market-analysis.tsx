import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Sparkles, Loader2, ArrowRight, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, BarChart2, LineChart, BrainCircuit } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';

// Trading suggestion interface
interface TradingSuggestion {
  id: string;
  symbol: string;
  type: 'entry' | 'exit' | 'alert';
  direction: 'buy' | 'sell' | 'neutral';
  price: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
  signals: string[];
}

// Market analysis interface
interface MarketAnalysis {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  summary: string;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  indicators: {
    name: string;
    value: string;
    signal: 'buy' | 'sell' | 'neutral';
  }[];
  patterns: {
    name: string;
    probability: number;
    description: string;
  }[];
  newsImpact: {
    score: number;
    headlines: string[];
  };
  timestamp: Date;
}

// Mock data generators - would be replaced by real API calls
function getMockSuggestions(): TradingSuggestion[] {
  return [
    {
      id: '1',
      symbol: 'BTCUSD',
      type: 'entry',
      direction: 'buy',
      price: 78250,
      confidence: 0.78,
      timeframe: '4h',
      reasoning: 'Strong bullish pattern emerging with increasing volume and positive funding rates. Key resistance level broken with 4-hour RSI showing strength without being overbought.',
      stopLoss: 76200,
      takeProfit: 82500,
      timestamp: new Date(),
      signals: ['Price action breakout', 'Volume increase', 'Funding rate positive', 'Whale accumulation']
    },
    {
      id: '2',
      symbol: 'ETHUSD',
      type: 'entry',
      direction: 'buy',
      price: 3850,
      confidence: 0.72,
      timeframe: '1d',
      reasoning: 'Following BTC momentum with technical breakout above 3800 resistance. ETH is showing strength relative to BTC with improving on-chain metrics.',
      stopLoss: 3650,
      takeProfit: 4200,
      timestamp: new Date(),
      signals: ['BTC correlation', 'Technical breakout', 'Improving on-chain metrics']
    },
    {
      id: '3',
      symbol: 'EURUSD',
      type: 'alert',
      direction: 'neutral',
      price: 1.0845,
      confidence: 0.65,
      timeframe: '1d',
      reasoning: 'Approaching key decision point at 1.0850 with ECB and Fed diverging policy paths. Watch for break of range between 1.0820-1.0880.',
      timestamp: new Date(),
      signals: ['Central bank divergence', 'Range consolidation', 'Volume decreasing']
    }
  ];
}

function getMockAnalysis(symbol: string): MarketAnalysis {
  const isBTC = symbol.includes('BTC');
  
  return {
    symbol: symbol,
    sentiment: isBTC ? 'bullish' : 'neutral',
    strength: isBTC ? 0.75 : 0.55,
    summary: isBTC 
      ? 'Bitcoin showing strength with improving on-chain metrics and institutional inflows. Recent price consolidation above 75k suggests bullish continuation pattern.' 
      : 'Consolidating within recent range with mixed signals from technical indicators. Watch for breakout direction.',
    keyLevels: {
      support: isBTC ? [76200, 73500, 70000] : [3650, 3400, 3200],
      resistance: isBTC ? [80000, 83500, 85000] : [4000, 4200, 4500],
    },
    indicators: [
      {
        name: 'RSI (14)',
        value: isBTC ? '62' : '48',
        signal: isBTC ? 'buy' : 'neutral'
      },
      {
        name: 'MACD',
        value: isBTC ? 'Bullish crossover' : 'Neutral',
        signal: isBTC ? 'buy' : 'neutral'
      },
      {
        name: 'MA (200)',
        value: isBTC ? 'Price above' : 'Price above',
        signal: 'buy'
      },
      {
        name: 'Bollinger Bands',
        value: isBTC ? 'Upper band test' : 'Middle band',
        signal: isBTC ? 'buy' : 'neutral'
      }
    ],
    patterns: [
      {
        name: isBTC ? 'Bull Flag' : 'Rectangle',
        probability: isBTC ? 0.82 : 0.65,
        description: isBTC ? 'Consolidation after strong uptrend' : 'Trading range indicating indecision'
      }
    ],
    newsImpact: {
      score: isBTC ? 0.68 : 0.52,
      headlines: [
        isBTC ? 'Bitcoin ETF inflows continue to exceed expectations' : 'Ethereum developer activity increasing ahead of upgrade',
        isBTC ? 'Major financial institution launches Bitcoin custody service' : 'Regulatory clarity improves for altcoins'
      ]
    },
    timestamp: new Date()
  };
}

// AI Market Analysis Component
export function AIMarketAnalysis() {
  const isMobile = useIsMobile();
  const [activeSymbol, setActiveSymbol] = useState('BTCUSD');
  const [suggestions, setSuggestions] = useState<TradingSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  // Symbols list
  const availableSymbols = ['BTCUSD', 'ETHUSD', 'EURUSD', 'XAUUSD', 'USDJPY'];

  // Fetch trading suggestions and analysis on component mount or symbol change
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // For mock, we'd make API calls here
        setTimeout(() => {
          setSuggestions(getMockSuggestions());
          setAnalysis(getMockAnalysis(activeSymbol));
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching AI analysis:', error);
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [activeSymbol]);

  // Handle AI query submission
  const handleSubmitQuery = () => {
    if (!userQuery.trim()) return;
    
    setAiResponse('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate response based on query keywords for demo
      let response = '';
      
      if (userQuery.toLowerCase().includes('btc') || userQuery.toLowerCase().includes('bitcoin')) {
        response = "Bitcoin analysis: Currently in a bullish trend with strong support at $76,200. On-chain metrics show accumulation from large wallets and decreasing exchange reserves, which historically precedes price increases. The recent consolidation above $75,000 suggests a potential continuation of the uptrend. Key resistance levels to watch are $80,000 and $83,500.";
      } else if (userQuery.toLowerCase().includes('eth') || userQuery.toLowerCase().includes('ethereum')) {
        response = "Ethereum analysis: Currently following Bitcoin's momentum with recent strength. The ETH/BTC ratio is improving, suggesting potential outperformance in the coming weeks. Watch the $4,000 level as a key psychological resistance. The upcoming network upgrade could serve as a catalyst for price action.";
      } else if (userQuery.toLowerCase().includes('market') || userQuery.toLowerCase().includes('overview')) {
        response = "Market overview: Crypto markets showing resilience despite broader macro uncertainties. Bitcoin dominance at 52%, suggesting continued confidence in the leading cryptocurrency. Altcoins showing mixed performance with Layer-2 solutions and AI-related tokens outperforming. Overall market sentiment is cautiously bullish with improving institutional involvement.";
      } else {
        response = `Analysis for your query "${userQuery}": Based on current market conditions, we're seeing mixed signals across asset classes. Crypto markets remain correlated to risk assets but have shown increasing resilience to broader market pullbacks. Focus on assets with strong fundamentals and clear technical setups to manage risk effectively in the current environment.`;
      }
      
      setAiResponse(response);
      setIsLoading(false);
    }, 1500);
  };

  // Render confidence score with appropriate color
  const renderConfidence = (confidence: number) => {
    let color = 'text-yellow-500';
    if (confidence >= 0.7) color = 'text-green-500';
    else if (confidence < 0.5) color = 'text-red-500';
    
    return (
      <span className={`font-semibold ${color}`}>
        {Math.round(confidence * 100)}%
      </span>
    );
  };

  return (
    <div className={`w-full max-w-[1200px] p-4 ${isMobile ? 'h-[calc(100vh-120px)]' : 'h-auto'}`}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold">AI Market Analysis</h2>
          </div>
          <div className="flex gap-2">
            <select
              className="bg-background border border-input rounded-md p-2 text-sm"
              value={activeSymbol}
              onChange={(e) => setActiveSymbol(e.target.value)}
            >
              {availableSymbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="suggestions">Trading Suggestions</TabsTrigger>
            <TabsTrigger value="analysis">Technical Analysis</TabsTrigger>
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          </TabsList>

          {/* Trading Suggestions Content */}
          <TabsContent value="suggestions" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                  Smart Trading Suggestions
                </CardTitle>
                <CardDescription>
                  AI-generated trading ideas based on market analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className={`${isMobile ? 'h-[calc(100vh-400px)]' : 'h-[500px]'} pr-4`}>
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2 pt-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="text-lg font-bold mr-2">{suggestion.symbol}</span>
                                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                                  suggestion.direction === 'buy'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : suggestion.direction === 'sell'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {suggestion.direction === 'buy' 
                                    ? 'BUY' 
                                    : suggestion.direction === 'sell' 
                                    ? 'SELL' 
                                    : 'WATCH'}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Confidence: {renderConfidence(suggestion.confidence)}
                              </div>
                            </div>
                            <CardDescription className="mt-1">
                              {suggestion.type === 'entry' ? 'Entry opportunity' : suggestion.type === 'exit' ? 'Exit signal' : 'Price alert'} • {suggestion.timeframe} timeframe
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-sm mb-3">{suggestion.reasoning}</div>
                            
                            {suggestion.stopLoss && suggestion.takeProfit && (
                              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">Entry</span>
                                  <span className="font-medium">${suggestion.price.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">Stop Loss</span>
                                  <span className="font-medium text-red-500">${suggestion.stopLoss.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground">Take Profit</span>
                                  <span className="font-medium text-green-500">${suggestion.takeProfit.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {suggestion.signals.map((signal, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
                                >
                                  {signal}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="py-2 flex justify-between">
                            <div className="text-xs text-muted-foreground">
                              Generated {new Date(suggestion.timestamp).toLocaleTimeString()}
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
                              <span className="text-xs">Open Trade</span>
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

          {/* Technical Analysis Content */}
          <TabsContent value="analysis" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                  Advanced Technical Analysis
                </CardTitle>
                <CardDescription>
                  {activeSymbol} market analysis and key levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || !analysis ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className={`${isMobile ? 'h-[calc(100vh-400px)]' : 'h-[500px]'} pr-4`}>
                    <div className="space-y-6">
                      {/* Summary Section */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <span className={`h-4 w-4 rounded-full mr-2 ${
                            analysis.sentiment === 'bullish' 
                              ? 'bg-green-500' 
                              : analysis.sentiment === 'bearish' 
                              ? 'bg-red-500' 
                              : 'bg-yellow-500'
                          }`} />
                          Market Sentiment: {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                        </h3>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                      </div>

                      {/* Key Levels */}
                      <div>
                        <h3 className="text-md font-semibold mb-2">Key Price Levels</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-background rounded-lg p-3 border">
                            <h4 className="text-sm font-medium mb-2 text-green-600">Support Levels</h4>
                            <ul className="space-y-1">
                              {analysis.keyLevels.support.map((level, index) => (
                                <li key={index} className="flex items-center text-sm">
                                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                  ${level.toLocaleString()}
                                  {index === 0 && <span className="ml-1 text-xs text-green-600">(Strong)</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-background rounded-lg p-3 border">
                            <h4 className="text-sm font-medium mb-2 text-red-600">Resistance Levels</h4>
                            <ul className="space-y-1">
                              {analysis.keyLevels.resistance.map((level, index) => (
                                <li key={index} className="flex items-center text-sm">
                                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                                  ${level.toLocaleString()}
                                  {index === 0 && <span className="ml-1 text-xs text-red-600">(Strong)</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Technical Indicators */}
                      <div>
                        <h3 className="text-md font-semibold mb-2">Technical Indicators</h3>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="grid grid-cols-3 gap-2">
                            {analysis.indicators.map((indicator, index) => (
                              <div key={index} className="flex flex-col text-sm p-2">
                                <span className="text-muted-foreground">{indicator.name}</span>
                                <span className="font-medium">{indicator.value}</span>
                                <span className={`text-xs mt-1 ${
                                  indicator.signal === 'buy' 
                                    ? 'text-green-500' 
                                    : indicator.signal === 'sell' 
                                    ? 'text-red-500' 
                                    : 'text-yellow-500'
                                }`}>
                                  {indicator.signal === 'buy' 
                                    ? 'BUY' 
                                    : indicator.signal === 'sell' 
                                    ? 'SELL' 
                                    : 'NEUTRAL'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Chart Patterns */}
                      <div>
                        <h3 className="text-md font-semibold mb-2">Chart Patterns</h3>
                        <div className="space-y-3">
                          {analysis.patterns.map((pattern, index) => (
                            <div key={index} className="bg-background rounded-lg p-3 border">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium">{pattern.name}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  pattern.probability > 0.7 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : pattern.probability > 0.5 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {Math.round(pattern.probability * 100)}% probability
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{pattern.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* News Impact */}
                      <div>
                        <h3 className="text-md font-semibold mb-2">News & Sentiment Impact</h3>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="flex items-center mb-2">
                            <span className="text-sm mr-2">Sentiment Score:</span>
                            <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div 
                                className={`h-full rounded-full ${
                                  analysis.newsImpact.score > 0.6 
                                    ? 'bg-green-500' 
                                    : analysis.newsImpact.score > 0.4 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${analysis.newsImpact.score * 100}%` }}
                              />
                            </div>
                            <span className="text-sm ml-2">{Math.round(analysis.newsImpact.score * 100)}%</span>
                          </div>

                          <h4 className="text-sm font-medium mb-1">Recent Headlines:</h4>
                          <ul className="space-y-1">
                            {analysis.newsImpact.headlines.map((headline, index) => (
                              <li key={index} className="text-sm flex items-start">
                                <span className="mr-1 mt-0.5">•</span>
                                {headline}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
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
                        disabled={isLoading || !userQuery.trim()}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className={`${isMobile ? 'h-[calc(100vh-450px)]' : 'h-[380px]'} border rounded-md p-4`}>
                    {aiResponse ? (
                      <div className="space-y-4">
                        <div className="bg-accent/40 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Question</span>
                            <span className="text-sm font-medium">{userQuery}</span>
                          </div>
                        </div>
                        
                        <div className="bg-primary/10 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">AI Response</span>
                          </div>
                          <p className="text-sm whitespace-pre-line">{aiResponse}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                        <BrainCircuit className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <p className="text-lg font-medium">Ask me anything about trading</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            I can analyze market conditions, explain strategies, and provide trading insights
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-w-md mt-4">
                          <Button
                            variant="outline"
                            className="text-xs h-auto py-2 justify-start"
                            onClick={() => setUserQuery("What's your analysis on Bitcoin's current trend?")}
                          >
                            What's your analysis on Bitcoin's current trend?
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs h-auto py-2 justify-start"
                            onClick={() => setUserQuery("Should I be concerned about the current market conditions?")}
                          >
                            Should I be concerned about the current market conditions?
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs h-auto py-2 justify-start"
                            onClick={() => setUserQuery("What key levels should I watch for Ethereum?")}
                          >
                            What key levels should I watch for Ethereum?
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs h-auto py-2 justify-start"
                            onClick={() => setUserQuery("Explain the best risk management strategies for crypto trading")}
                          >
                            Explain the best risk management strategies for crypto trading
                          </Button>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}