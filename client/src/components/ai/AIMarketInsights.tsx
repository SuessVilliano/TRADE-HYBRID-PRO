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
        try {
          const response = await fetch('/api/ai/market-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              symbol, 
              timeframe: '1h',
              depth: 'advanced',
              includeTechnicals: true,
              includeSentiment: true
            })
          });
          
          if (!response.ok) {
            console.warn(`AI analysis service unavailable for ${symbol}, using fallback`);
            return {
              symbol,
              sentiment: 'neutral' as const,
              confidence: 0,
              recommendation: 'HOLD' as const,
              keyLevels: { support: 0, resistance: 0 },
              analysis: `AI analysis service is currently unavailable for ${symbol}. Please check your connection or try again later.`,
              riskLevel: 'medium' as const
            };
          }
          
          const data = await response.json();
          
          return {
            symbol,
            sentiment: data.sentiment || 'neutral',
            confidence: data.confidence || 0,
            recommendation: data.recommendation || 'HOLD',
            keyLevels: {
              support: data.support || 0,
              resistance: data.resistance || 0
            },
            analysis: data.analysis || `AI analysis for ${symbol} is being processed.`,
            riskLevel: data.riskLevel || 'medium'
          };
        } catch (error) {
          console.error(`Error fetching AI insights for ${symbol}:`, error);
          return {
            symbol,
            sentiment: 'neutral' as const,
            confidence: 0,
            recommendation: 'HOLD' as const,
            keyLevels: { support: 0, resistance: 0 },
            analysis: `Unable to fetch AI analysis for ${symbol}. Please verify your API connection.`,
            riskLevel: 'medium' as const
          };
        }
      });

      const results = await Promise.all(insightPromises);
      setInsights(results);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setInsights(symbols.map(symbol => ({
        symbol,
        sentiment: 'neutral' as const,
        confidence: 0,
        recommendation: 'HOLD' as const,
        keyLevels: { support: 0, resistance: 0 },
        analysis: `AI service temporarily unavailable for ${symbol}`,
        riskLevel: 'medium' as const
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
    const interval = setInterval(fetchAIInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbols]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'high': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Market Insights
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-slate-400">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={fetchAIInsights}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="text-slate-400 hover:text-white"
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
              <Brain className="h-8 w-8 animate-pulse text-purple-400 mx-auto mb-2" />
              <p className="text-slate-400">AI analyzing market conditions...</p>
            </div>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.symbol}
              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{insight.symbol}</h3>
                  {getSentimentIcon(insight.sentiment)}
                  <span className={`text-sm font-medium ${getSentimentColor(insight.sentiment)}`}>
                    {insight.sentiment.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{insight.recommendation}</div>
                  <div className="text-xs text-slate-400">Confidence: {Math.round(insight.confidence * 100)}%</div>
                </div>
              </div>

              {insight.keyLevels.support > 0 && insight.keyLevels.resistance > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-slate-400">Support: </span>
                    <span className="text-green-400 font-mono">{insight.keyLevels.support.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Resistance: </span>
                    <span className="text-red-400 font-mono">{insight.keyLevels.resistance.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Risk Level:</span>
                  <span className={`text-xs font-medium ${getRiskColor(insight.riskLevel)}`}>
                    {insight.riskLevel.toUpperCase()}
                  </span>
                  {insight.riskLevel === 'high' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">{insight.analysis}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}