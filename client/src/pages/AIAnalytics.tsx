import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Activity, 
  Zap, 
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  LineChart
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface MarketSentiment {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  analysis: string;
  signals: string[];
  timeframe: string;
}

interface AIInsight {
  id: string;
  type: 'pattern' | 'sentiment' | 'volume' | 'technical';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  symbol: string;
  timestamp: Date;
}

export default function AIAnalytics() {
  const [marketSentiments, setMarketSentiments] = useState<MarketSentiment[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  useEffect(() => {
    loadAIAnalytics();
  }, [selectedTimeframe]);

  const loadAIAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate AI analytics data - in production, this would call your AI service
      const sentiments: MarketSentiment[] = [
        {
          symbol: 'EURUSD',
          sentiment: 'bullish',
          confidence: 85,
          analysis: 'Strong bullish momentum detected with divergence patterns indicating potential upward movement.',
          signals: ['RSI Divergence', 'Volume Spike', 'Support Break'],
          timeframe: selectedTimeframe
        },
        {
          symbol: 'GBPUSD',
          sentiment: 'bearish',
          confidence: 72,
          analysis: 'Bearish trend continuation expected based on fundamental and technical analysis.',
          signals: ['Moving Average Cross', 'Resistance Level', 'Economic Data'],
          timeframe: selectedTimeframe
        },
        {
          symbol: 'BTCUSD',
          sentiment: 'bullish',
          confidence: 91,
          analysis: 'Cryptocurrency showing strong institutional buying pressure with bullish patterns.',
          signals: ['Institutional Flow', 'Technical Breakout', 'Volume Analysis'],
          timeframe: selectedTimeframe
        }
      ];

      const insights: AIInsight[] = [
        {
          id: '1',
          type: 'pattern',
          title: 'Double Bottom Pattern Detected',
          description: 'EURUSD showing classic double bottom formation at 1.0850 support level',
          confidence: 88,
          impact: 'high',
          symbol: 'EURUSD',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'sentiment',
          title: 'Market Sentiment Shift',
          description: 'Overall market sentiment turning bullish across major pairs',
          confidence: 76,
          impact: 'medium',
          symbol: 'MARKET',
          timestamp: new Date()
        },
        {
          id: '3',
          type: 'volume',
          title: 'Unusual Volume Activity',
          description: 'GBPUSD experiencing 300% above average volume in the last 4 hours',
          confidence: 94,
          impact: 'high',
          symbol: 'GBPUSD',
          timestamp: new Date()
        }
      ];

      setMarketSentiments(sentiments);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Helmet>
        <title>AI Platform Analytics - Trade Hybrid</title>
        <meta name="description" content="Advanced AI-powered market analysis and trading insights powered by machine learning algorithms." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="h-10 w-10 text-blue-400" />
              AI Platform Analytics
            </h1>
            <p className="text-slate-300 text-lg">
              Advanced AI-powered market analysis and trading insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded-lg"
            >
              <option value="1H">1 Hour</option>
              <option value="4H">4 Hours</option>
              <option value="1D">1 Day</option>
              <option value="1W">1 Week</option>
            </select>
            <Button 
              onClick={loadAIAnalytics} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-600">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
            <TabsTrigger value="patterns">Pattern Recognition</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            {/* AI Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {aiInsights.map((insight) => (
                <Card key={insight.id} className={`bg-slate-800/50 border ${getImpactColor(insight.impact)} backdrop-blur-sm`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {insight.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      {insight.type === 'pattern' && <Target className="h-5 w-5 text-blue-400" />}
                      {insight.type === 'sentiment' && <Activity className="h-5 w-5 text-green-400" />}
                      {insight.type === 'volume' && <BarChart3 className="h-5 w-5 text-purple-400" />}
                      {insight.type === 'technical' && <LineChart className="h-5 w-5 text-orange-400" />}
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300 text-sm">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Confidence</span>
                      <div className="flex items-center gap-2">
                        <Progress value={insight.confidence} className="w-16 h-2" />
                        <span className="text-sm font-medium text-white">{insight.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Symbol: {insight.symbol}</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {insight.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            {/* Market Sentiment Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {marketSentiments.map((sentiment, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white">{sentiment.symbol}</CardTitle>
                      <Badge className={getSentimentColor(sentiment.sentiment)}>
                        {sentiment.sentiment.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">AI Confidence</span>
                      <div className="flex items-center gap-2">
                        <Progress value={sentiment.confidence} className="w-20 h-2" />
                        <span className="text-white font-medium">{sentiment.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{sentiment.analysis}</p>
                    <div className="space-y-2">
                      <span className="text-sm text-slate-400">Key Signals:</span>
                      <div className="flex flex-wrap gap-2">
                        {sentiment.signals.map((signal, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {signal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  Pattern Recognition Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Head & Shoulders</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-sm text-slate-300 mb-2">EURUSD - 4H Chart</p>
                    <Progress value={87} className="h-2" />
                    <span className="text-xs text-slate-400">87% Match</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Cup & Handle</span>
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    </div>
                    <p className="text-sm text-slate-300 mb-2">BTCUSD - 1D Chart</p>
                    <Progress value={73} className="h-2" />
                    <span className="text-xs text-slate-400">73% Match</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Triangle</span>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-sm text-slate-300 mb-2">GBPUSD - 1H Chart</p>
                    <Progress value={91} className="h-2" />
                    <span className="text-xs text-slate-400">91% Match</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-600 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  AI Trading Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">EURUSD Bullish Breakout</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        HIGH PROBABILITY
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                      AI predicts 89% probability of bullish breakout above 1.0950 resistance within next 24 hours.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-400">Target</p>
                        <p className="text-green-400 font-medium">1.1050</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Stop Loss</p>
                        <p className="text-red-400 font-medium">1.0880</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Risk/Reward</p>
                        <p className="text-blue-400 font-medium">1:2.5</p>
                      </div>
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