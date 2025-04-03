import React, { useState } from 'react';
import { Gauge, TrendingUp, TrendingDown, MessageCircle, Activity, Clock } from 'lucide-react';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

interface MarketSentimentProps {
  symbol: string;
  className?: string;
}

export function MarketSentiment({ symbol, className }: MarketSentimentProps) {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  
  // Demo data
  const sentimentData = {
    '1h': {
      bullish: 42,
      bearish: 58,
      comments: [
        { user: 'crypto_whale', text: 'Short-term correction before next leg up', time: '5 min ago', sentiment: 'neutral' },
        { user: 'trader_2099', text: 'Bearish pattern forming on the 15min chart', time: '12 min ago', sentiment: 'bearish' },
        { user: 'hodl4life', text: 'Just another dip, buying more', time: '24 min ago', sentiment: 'bullish' },
      ]
    },
    '24h': {
      bullish: 65,
      bearish: 35,
      comments: [
        { user: 'crypto_analyst', text: 'Strong support at current levels, looking for a bounce', time: '2 hours ago', sentiment: 'bullish' },
        { user: 'blockchain_dev', text: 'On-chain metrics showing accumulation', time: '5 hours ago', sentiment: 'bullish' },
        { user: 'risk_manager', text: 'Taking profits at resistance level', time: '8 hours ago', sentiment: 'bearish' },
      ]
    },
    '7d': {
      bullish: 72,
      bearish: 28,
      comments: [
        { user: 'institutional_trader', text: 'ETF inflows remain strong, bullish long-term', time: '3 days ago', sentiment: 'bullish' },
        { user: 'market_maker', text: 'Reducing exposure due to macro uncertainty', time: '4 days ago', sentiment: 'bearish' },
        { user: 'chart_master', text: 'Weekly close above key level, very bullish', time: '6 days ago', sentiment: 'bullish' },
      ]
    }
  };
  
  const currentData = sentimentData[timeframe];
  
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Gauge className="h-4 w-4 text-blue-500 mr-2" />
            <div className="font-medium">Market Sentiment</div>
          </div>
          <div className="text-xs text-slate-400">{symbol}</div>
        </div>
      </div>
      
      <div className="p-4 flex-grow overflow-auto">
        <div className="mb-6">
          <div className="flex justify-center items-center mb-2">
            <div 
              className="flex items-center justify-center text-2xl font-semibold w-16 h-16 rounded-full border-4 border-blue-500/20"
              style={{ 
                color: currentData.bullish > 50 ? '#10b981' : '#ef4444',
                borderColor: currentData.bullish > 50 ? '#10b98133' : '#ef444433'
              }}
            >
              {currentData.bullish > 50 ? (
                <TrendingUp className="h-8 w-8" />
              ) : (
                <TrendingDown className="h-8 w-8" />
              )}
            </div>
          </div>
          
          <div className="text-center mb-1">
            <span 
              className="text-xl font-semibold"
              style={{ color: currentData.bullish > 50 ? '#10b981' : '#ef4444' }}
            >
              {currentData.bullish > 50 ? 'Bullish' : 'Bearish'}
            </span>
            <span className="text-slate-400 text-sm ml-2">
              Overall market sentiment
            </span>
          </div>
        </div>
        
        <div className="flex justify-center space-x-2 mb-6">
          <button 
            className={`px-3 py-1 text-xs rounded ${timeframe === '1h' ? 'bg-slate-700' : 'bg-slate-800 text-slate-400'}`} 
            onClick={() => setTimeframe('1h')}
          >
            1H
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded ${timeframe === '24h' ? 'bg-slate-700' : 'bg-slate-800 text-slate-400'}`} 
            onClick={() => setTimeframe('24h')}
          >
            24H
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded ${timeframe === '7d' ? 'bg-slate-700' : 'bg-slate-800 text-slate-400'}`} 
            onClick={() => setTimeframe('7d')}
          >
            7D
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Bearish</span>
            <span>Bullish</span>
          </div>
          <div className="relative h-6 bg-slate-700 rounded overflow-hidden">
            <div 
              className="absolute top-0 bottom-0 left-0 rounded bg-green-500/70"
              style={{ width: `${currentData.bullish}%` }}
            ></div>
            <div className="absolute inset-0 flex justify-center items-center text-xs font-medium">
              {currentData.bullish}% Bullish
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
            Recent Market Comments
          </h3>
          <div className="space-y-3">
            {currentData.comments.map((comment, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-md p-3 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">@{comment.user}</span>
                  <span 
                    className={`px-2 py-0.5 rounded-full text-[10px] 
                      ${comment.sentiment === 'bullish' ? 'bg-green-900/30 text-green-400' : 
                        comment.sentiment === 'bearish' ? 'bg-red-900/30 text-red-400' : 
                        'bg-slate-700 text-slate-300'}`}
                  >
                    {comment.sentiment}
                  </span>
                </div>
                <p className="text-slate-300 mb-1">{comment.text}</p>
                <div className="flex items-center text-slate-400 text-[10px]">
                  <Clock className="h-3 w-3 mr-1" />
                  {comment.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}