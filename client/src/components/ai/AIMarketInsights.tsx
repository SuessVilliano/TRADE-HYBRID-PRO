import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, TrendingUp, TrendingDown, RefreshCw, Zap, Target, AlertTriangle } from 'lucide-react';

interface MarketInsight {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  keyLevels: {
    support: number;
    resistance: number;
  };
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AIMarketInsightsProps {
  symbols?: string[];
  className?: string;
}

export function AIMarketInsights({ symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'], className = '' }: AIMarketInsightsProps) {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const insightPromises = symbols.map(async (symbol) => {
        const response = await fetch('/api/ai/market-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, timeframe: '1h' })
        });
        const data = await response.json();
        return {
          symbol,
          sentiment: data.sentiment || 'bullish',
          confidence: data.confidence || 0.75,
          recommendation: data.recommendation || 'BUY',
          keyLevels: data.keyLevels || { support: 0, resistance: 0 },
          analysis: data.analysis || `AI analysis for ${symbol}`,
          riskLevel: data.confidence > 0.8 ? 'low' : data.confidence > 0.6 ? 'medium' : 'high' as 'low' | 'medium' | 'high'
        };
      });
      
      const results = await Promise.all(insightPromises);
      setInsights(results);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAIInsights();
    const interval = setInterval(fetchAIInsights, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [symbols]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg text-white">AI Market Insights</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-slate-400">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAIInsights}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && insights.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className="text-slate-400 text-sm">Analyzing markets with AI...</p>
            </div>
          </div>
        ) : (
          insights.map((insight) => (
            <div key={insight.symbol} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{insight.symbol}</h3>
                  <div className={`flex items-center gap-1 ${getSentimentColor(insight.sentiment)}`}>
                    {insight.sentiment === 'bullish' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : insight.sentiment === 'bearish' ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{insight.sentiment.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    insight.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    insight.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {insight.recommendation}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-2 text-xs">
                <div>
                  <span className="text-slate-400">Confidence:</span>
                  <div className="font-medium text-blue-400">{(insight.confidence * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-slate-400">Risk:</span>
                  <div className={`font-medium flex items-center gap-1 ${getRiskColor(insight.riskLevel)}`}>
                    {insight.riskLevel === 'high' && <AlertTriangle className="h-3 w-3" />}
                    {insight.riskLevel.toUpperCase()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Support:</span>
                  <div className="font-mono text-green-400">${insight.keyLevels.support}</div>
                </div>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">{insight.analysis}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}