import React from 'react';
import { Badge } from './badge';
import { 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Info, 
  ChevronRight, 
  PercentCircle
} from 'lucide-react';
import { Button } from './button';

interface PersonalizedTradingInsightsProps {
  symbol?: string;
}

export function PersonalizedTradingInsights({ symbol = 'BTCUSDT' }: PersonalizedTradingInsightsProps) {
  const insights = {
    symbol: symbol,
    name: symbol === 'BTCUSDT' ? 'Bitcoin' : 
          symbol === 'ETHUSDT' ? 'Ethereum' : 
          symbol === 'BNBUSDT' ? 'Binance Coin' : 
          symbol.replace('USDT', ''),
    hybridScore: 78,
    marketType: 'Ranging with Bullish Bias',
    keyLevels: {
      resistance: [
        { price: symbol === 'BTCUSDT' ? '67,250' : '3,450', strength: 'Strong' },
        { price: symbol === 'BTCUSDT' ? '69,800' : '3,600', strength: 'Medium' }
      ],
      support: [
        { price: symbol === 'BTCUSDT' ? '65,700' : '3,300', strength: 'Medium' },
        { price: symbol === 'BTCUSDT' ? '64,200' : '3,180', strength: 'Strong' }
      ]
    },
    recommendations: [
      "Consider buying at support levels with tight stop losses",
      "Watch for breakout above $67,250 for potential long opportunity",
      "Current volatility suggests smaller position sizes"
    ],
    technicalInsights: [
      "RSI showing bullish divergence on 4h timeframe",
      "MACD crossing above signal line on daily chart",
      "Volume profile showing accumulation pattern"
    ],
    sentimentAnalysis: {
      overall: 'Moderately Bullish',
      socialMedia: 'Bullish',
      news: 'Neutral',
      whales: 'Accumulating'
    },
    riskLevel: 'Medium',
    timeframe: 'Medium-term'
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-400 mr-2" />
          <h3 className="font-medium">Personalized Trading Insights</h3>
        </div>
        <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900">
          AI Powered
        </Badge>
      </div>
      
      <div className="overflow-auto p-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">{insights.name}</h3>
            <p className="text-slate-400 text-sm">{symbol}</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end">
              <span className="mr-2 text-sm text-slate-300">Hybrid Score™</span>
              <div className="bg-slate-800 rounded-full h-7 w-7 flex items-center justify-center">
                <span className={`text-xs font-bold ${
                  insights.hybridScore >= 70 ? 'text-green-400' :
                  insights.hybridScore >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {insights.hybridScore}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Updated 15m ago</p>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-md p-3 mb-3">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400 mr-2" />
            <h4 className="font-medium text-blue-300">Market Structure</h4>
          </div>
          <p className="text-slate-300 mb-2">
            {insights.marketType}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Key Resistance</p>
              {insights.keyLevels.resistance.map((level, index) => (
                <div key={`r-${index}`} className="flex justify-between text-sm">
                  <span>${level.price}</span>
                  <Badge variant="outline" className="text-xs py-0 px-1 h-5">
                    {level.strength}
                  </Badge>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Key Support</p>
              {insights.keyLevels.support.map((level, index) => (
                <div key={`s-${index}`} className="flex justify-between text-sm">
                  <span>${level.price}</span>
                  <Badge variant="outline" className="text-xs py-0 px-1 h-5">
                    {level.strength}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-md p-3 mb-3">
          <div className="flex items-center mb-2">
            <BarChart3 className="h-4 w-4 text-purple-400 mr-2" />
            <h4 className="font-medium text-purple-300">Technical Analysis</h4>
          </div>
          
          <ul className="text-sm text-slate-300 space-y-2">
            {insights.technicalInsights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <ChevronRight className="h-4 w-4 text-purple-400 mr-1 mt-0.5 flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-teal-400 mr-2" />
              <h4 className="font-medium text-teal-300">Sentiment</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Overall:</span>
                <span className="text-teal-300">{insights.sentimentAnalysis.overall}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Social:</span>
                <span>{insights.sentimentAnalysis.socialMedia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">News:</span>
                <span>{insights.sentimentAnalysis.news}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Whales:</span>
                <span>{insights.sentimentAnalysis.whales}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-md p-3">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-amber-400 mr-2" />
              <h4 className="font-medium text-amber-300">Risk Profile</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Level:</span>
                <Badge variant="outline" className={
                  insights.riskLevel === 'High' ? 'text-red-400 border-red-400/30' :
                  insights.riskLevel === 'Medium' ? 'text-amber-400 border-amber-400/30' :
                  'text-green-400 border-green-400/30'
                }>
                  {insights.riskLevel}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timeframe:</span>
                <span>{insights.timeframe}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Position Size:</span>
                <PercentCircle className="h-4 w-4 text-amber-300" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-md p-3">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 text-blue-400 mr-2" />
            <h4 className="font-medium text-blue-300">Recommendations</h4>
          </div>
          
          <ul className="text-sm text-slate-300 space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <ChevronRight className="h-4 w-4 text-blue-400 mr-1 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-purple-900/20 border-purple-500/30 text-purple-400 hover:bg-purple-800/30"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Custom Strategy
          </Button>
          <p className="text-xs text-slate-500 mt-2">
            Insights are customized to your trading style and risk tolerance
          </p>
        </div>
      </div>
    </div>
  );
}