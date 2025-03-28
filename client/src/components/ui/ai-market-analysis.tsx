import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, AlertTriangle, TrendingUp, CheckCircle, XCircle, BarChart2, ArrowUpCircle, ArrowDownCircle, MinusCircle } from "lucide-react";

// Types for AI Market Analysis API
interface MarketAnalysisResponse {
  symbol: string;
  timeframe: string;
  timestamp: number;
  hybridScore: {
    value: number;         // 0-100 score representing overall trade quality
    sentiment: number;     // 0-100 representing market sentiment
    momentum: number;      // 0-100 representing price momentum
    volatility: number;    // 0-100 representing current volatility level
    timing: number;        // 0-100 representing entry timing quality
    riskReward: number;    // 0-100 representing risk-reward ratio quality
    strength: 'very weak' | 'weak' | 'neutral' | 'strong' | 'very strong'; // Verbal representation of score
    direction: 'bullish' | 'bearish' | 'neutral'; // Market direction
    confidence: number;    // 0-100 representing AI confidence in the score
    components: string[];  // Factors that influenced the score
  };
  analysis: {
    summary: string;
    technicalAnalysis?: {
      shortTerm: string;
      mediumTerm: string;
      longTerm: string;
      keyIndicators: {
        name: string;
        value: string;
        interpretation: string;
      }[];
    };
    fundamentalAnalysis?: {
      outlook: string;
      keyFactors: {
        factor: string;
        impact: string;
      }[];
    };
    sentimentAnalysis?: {
      overall: string;
      socialMedia: string;
      newsFlow: string;
    };
    tradingSuggestions: {
      direction: 'buy' | 'sell' | 'hold';
      confidence: number;
      reasoning: string;
      riskLevel: 'low' | 'medium' | 'high';
      targetPrice?: number;
      stopLoss?: number;
    };
    riskAssessment: {
      overallRisk: 'low' | 'medium' | 'high';
      keyRisks: string[];
    };
  };
}

interface TradingSuggestion {
  direction: 'buy' | 'sell' | 'hold';
  entryPrice: string | number;
  stopLoss: number | null;
  takeProfit: (number | null)[];
  positionSize: string;
  riskRewardRatio: number;
  reasoning: string;
  invalidation: string;
  timeframe: string;
}

interface TradingSuggestionsResponse {
  symbol: string;
  timestamp: number;
  suggestions: TradingSuggestion[];
}

const timeframeOptions = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
];

const depthOptions = [
  { value: 'basic', label: 'Basic' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const riskProfileOptions = [
  { value: 'low', label: 'Conservative' },
  { value: 'medium', label: 'Moderate' },
  { value: 'high', label: 'Aggressive' },
];

export function AIMarketAnalysis() {
  const [symbol, setSymbol] = useState("SOL/USDT");
  const [timeframe, setTimeframe] = useState(timeframeOptions[5].value);
  const [depth, setDepth] = useState(depthOptions[1].value);
  const [riskProfile, setRiskProfile] = useState(riskProfileOptions[1].value);
  
  const [analysis, setAnalysis] = useState<MarketAnalysisResponse | null>(null);
  const [suggestions, setSuggestions] = useState<TradingSuggestionsResponse | null>(null);
  
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [availableSymbols, setAvailableSymbols] = useState<{label: string, value: string}[]>([]);
  const [activeTab, setActiveTab] = useState('analysis');

  // Fetch available symbols on component mount
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await axios.get('/api/market/symbols');
        const allSymbols = response.data.all || [];
        
        // Map symbols to options format
        const symbolOptions = allSymbols.map((s: string) => ({
          value: s,
          label: s
        }));
        
        setAvailableSymbols(symbolOptions);
      } catch (err) {
        console.error('Failed to fetch symbols:', err);
        setError('Failed to load available trading symbols');
      }
    };
    
    fetchSymbols();
  }, []);

  // Fetch market analysis
  const fetchMarketAnalysis = async () => {
    setLoadingAnalysis(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/ai/market-analysis', {
        params: {
          symbol,
          timeframe,
          depth,
          includeTechnicals: true,
          includeFundamentals: true,
          includeSentiment: true
        }
      });
      
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error fetching market analysis:', err);
      setError('Failed to fetch AI market analysis. Please try again later.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Fetch trading suggestions
  const fetchTradingSuggestions = async () => {
    setLoadingSuggestions(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/ai/trading-suggestions', {
        params: {
          symbol,
          riskProfile
        }
      });
      
      setSuggestions(response.data);
    } catch (err) {
      console.error('Error fetching trading suggestions:', err);
      setError('Failed to fetch AI trading suggestions. Please try again later.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Format relative time from timestamp
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  // Get direction icon
  const getDirectionIcon = (direction: 'buy' | 'sell' | 'hold') => {
    switch (direction) {
      case 'buy':
        return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
      case 'sell':
        return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
      case 'hold':
        return <MinusCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  // Get risk color
  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get confidence bar color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Get hybrid score color
  const getHybridScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 65) return 'text-emerald-500';
    if (score >= 50) return 'text-blue-500';
    if (score >= 35) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Get hybrid score background color
  const getHybridScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 65) return 'bg-emerald-500';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 35) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Get hybrid score direction color
  const getDirectionColor = (direction: 'bullish' | 'bearish' | 'neutral') => {
    switch (direction) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      case 'neutral':
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-purple-200 bg-purple-50/30 dark:border-purple-800 dark:bg-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-purple-800 dark:text-purple-300">
            <BookOpen className="mr-2 h-6 w-6" />
            AI Market Analysis & Trading Intelligence
          </CardTitle>
          <CardDescription>
            Advanced market analysis powered by AI. Get comprehensive insights on market trends, technical analysis, and trading suggestions.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
              <TabsTrigger value="suggestions">Trading Suggestions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium">Symbol</label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSymbols.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Timeframe</label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeframeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Analysis Depth</label>
                  <Select value={depth} onValueChange={setDepth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Depth" />
                    </SelectTrigger>
                    <SelectContent>
                      {depthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={fetchMarketAnalysis} 
                    disabled={loadingAnalysis}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loadingAnalysis ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Generate Analysis'
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loadingAnalysis ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ) : analysis ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>{analysis.symbol} Analysis</CardTitle>
                        <Badge variant="outline">{formatRelativeTime(analysis.timestamp)}</Badge>
                      </div>
                      <CardDescription>
                        {analysis.timeframe} timeframe analysis summary
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium mb-4">{analysis.analysis.summary}</p>
                      
                      {/* Hybrid Score Component */}
                      <div className="mb-6 border-2 border-purple-500 rounded-lg p-4 bg-purple-50/30 dark:bg-purple-900/20">
                        <h3 className="text-xl font-bold flex items-center mb-4">
                          <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
                          Hybrid Score™
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left column: Main score and components */}
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="relative w-28 h-28">
                                <div className={`absolute inset-0 rounded-full flex items-center justify-center ${getHybridScoreBgColor(analysis.hybridScore.value)}`}>
                                  <span className="text-white text-3xl font-bold">{analysis.hybridScore.value}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold capitalize">
                                  <span className={getHybridScoreColor(analysis.hybridScore.value)}>
                                    {analysis.hybridScore.strength}
                                  </span>
                                </div>
                                <div className="text-lg capitalize">
                                  <span className={getDirectionColor(analysis.hybridScore.direction)}>
                                    {analysis.hybridScore.direction} signal
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  AI Confidence: {Math.round(analysis.hybridScore.confidence * 100)}%
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-700 dark:text-gray-300">Score Components:</h4>
                              <ul className="space-y-1 text-sm">
                                {analysis.hybridScore.components.map((component, i) => (
                                  <li key={i} className="flex items-center">
                                    <span className="mr-2">•</span>
                                    {component}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {/* Right column: Detailed factors */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Sentiment</span>
                                <span className="text-sm font-medium">{analysis.hybridScore.sentiment}%</span>
                              </div>
                              <Progress value={analysis.hybridScore.sentiment} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Momentum</span>
                                <span className="text-sm font-medium">{analysis.hybridScore.momentum}%</span>
                              </div>
                              <Progress value={analysis.hybridScore.momentum} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Volatility</span>
                                <span className="text-sm font-medium">{analysis.hybridScore.volatility}%</span>
                              </div>
                              <Progress value={analysis.hybridScore.volatility} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Entry Timing</span>
                                <span className="text-sm font-medium">{analysis.hybridScore.timing}%</span>
                              </div>
                              <Progress value={analysis.hybridScore.timing} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Risk/Reward</span>
                                <span className="text-sm font-medium">{analysis.hybridScore.riskReward}%</span>
                              </div>
                              <Progress value={analysis.hybridScore.riskReward} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.analysis.technicalAnalysis && (
                          <div className="space-y-2">
                            <h3 className="text-md font-bold flex items-center">
                              <BarChart2 className="mr-2 h-5 w-5" />
                              Technical Analysis
                            </h3>
                            <div className="space-y-2 pl-7">
                              <div>
                                <span className="font-semibold">Short-term:</span> {analysis.analysis.technicalAnalysis.shortTerm}
                              </div>
                              <div>
                                <span className="font-semibold">Medium-term:</span> {analysis.analysis.technicalAnalysis.mediumTerm}
                              </div>
                              <div>
                                <span className="font-semibold">Long-term:</span> {analysis.analysis.technicalAnalysis.longTerm}
                              </div>
                            </div>
                            
                            <div className="mt-2 space-y-2">
                              <h4 className="font-semibold">Key Indicators:</h4>
                              <div className="grid grid-cols-1 gap-2 pl-4">
                                {analysis.analysis.technicalAnalysis.keyIndicators.map((indicator, i) => (
                                  <div key={i} className="border-l-2 border-purple-300 pl-2">
                                    <div className="font-medium">{indicator.name}: {indicator.value}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{indicator.interpretation}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {analysis.analysis.fundamentalAnalysis && (
                          <div className="space-y-2">
                            <h3 className="text-md font-bold">Fundamental Analysis</h3>
                            <p>{analysis.analysis.fundamentalAnalysis.outlook}</p>
                            
                            <div className="mt-2">
                              <h4 className="font-semibold">Key Factors:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {analysis.analysis.fundamentalAnalysis.keyFactors.map((factor, i) => (
                                  <li key={i}>
                                    <span className="font-medium">{factor.factor}:</span> {factor.impact}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {analysis.analysis.sentimentAnalysis && (
                        <div className="mt-6">
                          <h3 className="text-md font-bold mb-2">Sentiment Analysis</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="font-semibold">Overall Sentiment</div>
                              <div>{analysis.analysis.sentimentAnalysis.overall}</div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="font-semibold">Social Media</div>
                              <div>{analysis.analysis.sentimentAnalysis.socialMedia}</div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="font-semibold">News Flow</div>
                              <div>{analysis.analysis.sentimentAnalysis.newsFlow}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Separator className="my-6" />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center">
                          <TrendingUp className="mr-2 h-5 w-5" />
                          Trading Suggestion
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">Direction</div>
                              <div className="flex items-center">
                                {getDirectionIcon(analysis.analysis.tradingSuggestions.direction)}
                                <span className="ml-1 font-bold capitalize">
                                  {analysis.analysis.tradingSuggestions.direction}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4">
                            <div className="font-semibold mb-1">Confidence</div>
                            <div className="flex items-center justify-between">
                              <Progress 
                                value={analysis.analysis.tradingSuggestions.confidence * 100} 
                                className={`${getConfidenceColor(analysis.analysis.tradingSuggestions.confidence)}`}
                              />
                              <span className="ml-2 font-bold">
                                {Math.round(analysis.analysis.tradingSuggestions.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4">
                            <div className="font-semibold">Risk Level</div>
                            <div>
                              <Badge className={`${getRiskColor(analysis.analysis.tradingSuggestions.riskLevel)}`}>
                                {analysis.analysis.tradingSuggestions.riskLevel.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.analysis.tradingSuggestions.targetPrice && (
                            <div className="border rounded-lg p-4">
                              <div className="font-semibold">Target Price</div>
                              <div className="text-lg font-bold text-green-600">
                                ${analysis.analysis.tradingSuggestions.targetPrice}
                              </div>
                            </div>
                          )}
                          
                          {analysis.analysis.tradingSuggestions.stopLoss && (
                            <div className="border rounded-lg p-4">
                              <div className="font-semibold">Stop Loss</div>
                              <div className="text-lg font-bold text-red-600">
                                ${analysis.analysis.tradingSuggestions.stopLoss}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="font-semibold mb-2">Reasoning</div>
                          <p>{analysis.analysis.tradingSuggestions.reasoning}</p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="font-semibold mb-2">Risk Assessment</div>
                          <div className="mb-2">
                            <span className="font-medium">Overall Risk: </span>
                            <Badge className={`${getRiskColor(analysis.analysis.riskAssessment.overallRisk)}`}>
                              {analysis.analysis.riskAssessment.overallRisk.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Key Risks:</span>
                            <ul className="list-disc pl-5 mt-1">
                              {analysis.analysis.riskAssessment.keyRisks.map((risk, i) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-gray-500">
                        AI-generated analysis for educational purposes only.
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={fetchMarketAnalysis}
                        disabled={loadingAnalysis}
                      >
                        Refresh
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                      <h3 className="text-lg font-medium">AI Market Analysis</h3>
                      <p className="text-gray-500 text-sm">
                        Generate an in-depth AI-powered analysis for any market. Configure your parameters and click Generate Analysis.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="suggestions" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Symbol</label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSymbols.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Risk Profile</label>
                  <Select value={riskProfile} onValueChange={setRiskProfile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Risk Profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskProfileOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={fetchTradingSuggestions} 
                    disabled={loadingSuggestions}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loadingSuggestions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Get Trading Ideas'
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loadingSuggestions ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : suggestions ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">
                      Trading Ideas for {suggestions.symbol}
                    </h3>
                    <Badge variant="outline">
                      {formatRelativeTime(suggestions.timestamp)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {suggestions.suggestions.map((suggestion, i) => (
                      <Card key={i} className={`
                        ${suggestion.direction === 'buy' ? 'border-green-300 dark:border-green-800' : ''}
                        ${suggestion.direction === 'sell' ? 'border-red-300 dark:border-red-800' : ''}
                        ${suggestion.direction === 'hold' ? 'border-yellow-300 dark:border-yellow-800' : ''}
                      `}>
                        <CardHeader className={`
                          ${suggestion.direction === 'buy' ? 'bg-green-50 dark:bg-green-900/20' : ''}
                          ${suggestion.direction === 'sell' ? 'bg-red-50 dark:bg-red-900/20' : ''}
                          ${suggestion.direction === 'hold' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
                        `}>
                          <CardTitle className="flex items-center text-lg">
                            {getDirectionIcon(suggestion.direction)}
                            <span className="ml-2 capitalize">{suggestion.direction} {suggestions.symbol}</span>
                          </CardTitle>
                          <CardDescription>
                            Trading Idea #{i + 1} - {suggestion.timeframe} timeframe
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">Entry</div>
                              <div className="font-bold">{suggestion.entryPrice}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-500">Stop Loss</div>
                              <div className="font-bold text-red-600">
                                {suggestion.stopLoss ? `$${suggestion.stopLoss}` : 'N/A'}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-500">Take Profit</div>
                              <div className="font-bold text-green-600">
                                {suggestion.takeProfit && suggestion.takeProfit.length > 0 && suggestion.takeProfit[0] 
                                  ? suggestion.takeProfit.map(tp => tp ? `$${tp}` : 'N/A').join(', ')
                                  : 'N/A'}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-gray-500">Risk/Reward</div>
                              <div className="font-bold">{suggestion.riskRewardRatio}:1</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500">Position Size</div>
                            <div>{suggestion.positionSize}</div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Reasoning</div>
                            <p className="text-sm">{suggestion.reasoning}</p>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Invalidation</div>
                            <p className="text-sm">{suggestion.invalidation}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button 
                            size="sm"
                            variant={suggestion.direction === 'buy' ? 'default' : 'destructive'}
                            className={suggestion.direction === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {suggestion.direction === 'buy' ? (
                              <CheckCircle className="mr-1 h-4 w-4" />
                            ) : (
                              <XCircle className="mr-1 h-4 w-4" />
                            )}
                            Place {suggestion.direction.toUpperCase()} Order
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <AlertTriangle className="inline h-4 w-4 mr-1" />
                    These suggestions are for educational purposes only. Always do your own research.
                  </div>
                </div>
              ) : (
                <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <TrendingUp className="h-12 w-12 text-gray-400" />
                      <h3 className="text-lg font-medium">AI Trading Suggestions</h3>
                      <p className="text-gray-500 text-sm">
                        Get AI-powered trading ideas tailored to your risk profile. Select your preferences and click Get Trading Ideas.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}