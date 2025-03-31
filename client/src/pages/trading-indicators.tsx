import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { PopupContainer } from '../components/ui/popup-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

interface IndicatorInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  features: string[];
  price: string;
  timeframes: string[];
  assetClasses: string[];
}

const indicators: IndicatorInfo[] = [
  {
    id: 'hybrid-ai',
    name: 'Hybrid AI Indicator',
    description: 'An advanced indicator combining machine learning and technical analysis to identify high-probability trade setups with precision entry and exit points.',
    url: 'https://sqr.co/HybridAiIndicator/',
    imageUrl: '/images/indicators/hybrid-ai.svg',
    features: [
      'AI-powered trend analysis',
      'Multi-timeframe signal confirmation',
      'Advanced filtering of false signals',
      'Real-time trade recommendations',
      'Smart volatility adaptation',
    ],
    price: '$149',
    timeframes: ['All timeframes', 'Optimized for 1H, 4H, and Daily'],
    assetClasses: ['Forex', 'Crypto', 'Stocks', 'Futures', 'Commodities']
  },
  {
    id: 'supercator',
    name: 'Supercator',
    description: 'A powerful indicator that combines multiple strategies in one, providing clear entry and exit signals with confirmation across momentum, volume, and trend analysis.',
    url: 'https://sqr.co/Supercator/',
    imageUrl: '/images/indicators/supercator.svg',
    features: [
      'High-precision entry/exit signals',
      'Visual trend strength meter',
      'Early trend reversal detection',
      'Integrated stop-loss guidelines',
      'Professional volume analysis',
    ],
    price: '$129',
    timeframes: ['All timeframes', 'Best for 15m, 1H, and 4H'],
    assetClasses: ['Forex', 'Crypto', 'Stocks', 'Indices']
  },
  {
    id: 'ichi-adx',
    name: 'Ichi ADX SV Combo',
    description: 'Combines Ichimoku Cloud with ADX and volume analysis to provide a comprehensive view of market trends, momentum, and potential reversal points.',
    url: 'https://www.tradingview.com/script/Xf9lgHVV-Ichi-ADX-SV-Combo/',
    imageUrl: '/images/indicators/ichi-adx.jpg',
    features: [
      'Enhanced Ichimoku Cloud signals',
      'ADX trend strength integration',
      'Smart volume analysis',
      'Visual alert system',
      'Multi-factor confirmation',
    ],
    price: '$89',
    timeframes: ['15m', '30m', '1H', '4H', 'Daily'],
    assetClasses: ['Forex', 'Crypto', 'Futures', 'Stocks']
  },
  {
    id: 'yuppies-tail',
    name: "Yuppie's Tail",
    description: 'A unique candlestick pattern recognition indicator that specifically identifies high-probability reversal setups with confirmation from multiple technical factors.',
    url: 'https://www.tradingview.com/script/RJOgNzKU-Yuppie-s-Tail/',
    imageUrl: '/images/indicators/yuppies-tail.jpg',
    features: [
      'Advanced candlestick pattern recognition',
      'Institutional order flow analysis',
      'Automated support/resistance detection',
      'Clear visual entry and exit signals',
      'Configurable risk parameters',
    ],
    price: '$79',
    timeframes: ['5m', '15m', '30m', '1H', '4H'],
    assetClasses: ['Forex', 'Crypto', 'Stocks', 'Commodities']
  },
  {
    id: 'smart-money',
    name: 'Smart Money SV',
    description: 'Tracks institutional order flow and smart money movements to help retail traders align their positions with professional market participants.',
    url: 'https://www.tradingview.com/script/uBWN2BKN-Smart-Money-SV/',
    imageUrl: '/images/indicators/smart-money.jpg',
    features: [
      'Institutional order flow detection',
      'Liquidity sweep identification',
      'Market structure analysis',
      'Accumulation/distribution patterns',
      'Smart money entry/exit zones',
    ],
    price: '$99',
    timeframes: ['1H', '4H', 'Daily', 'Weekly'],
    assetClasses: ['Forex', 'Crypto', 'Futures', 'Stocks', 'Indices']
  }
];

export default function TradingIndicatorsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PopupContainer padding>
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Trading Indicators</h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Premium TradingView indicators designed to enhance your trading experience with advanced analysis, 
            clear signals, and professional-grade tools used by successful traders.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full mb-8">
          <TabsList className="mb-6 mx-auto flex justify-center">
            <TabsTrigger value="all">All Indicators</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {indicators.map(indicator => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {indicators
                .filter(indicator => indicator.assetClasses.includes('Crypto'))
                .map(indicator => (
                  <IndicatorCard key={indicator.id} indicator={indicator} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="forex" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {indicators
                .filter(indicator => indicator.assetClasses.includes('Forex'))
                .map(indicator => (
                  <IndicatorCard key={indicator.id} indicator={indicator} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="stocks" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {indicators
                .filter(indicator => indicator.assetClasses.includes('Stocks'))
                .map(indicator => (
                  <IndicatorCard key={indicator.id} indicator={indicator} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="max-w-3xl mx-auto bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">How Our Indicators Can Transform Your Trading</h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div className="bg-blue-500/20 text-blue-400 rounded-full p-1 h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <span className="font-medium">Higher Win Rate</span> - Our indicators are designed to identify high-probability setups while filtering out false signals
              </div>
            </li>
            <li className="flex gap-3">
              <div className="bg-blue-500/20 text-blue-400 rounded-full p-1 h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <span className="font-medium">Better Entries & Exits</span> - Clear visual signals help you time your entries and exits with greater precision
              </div>
            </li>
            <li className="flex gap-3">
              <div className="bg-blue-500/20 text-blue-400 rounded-full p-1 h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <span className="font-medium">Reduced Emotional Trading</span> - Systematic signals reduce the impact of emotions on your trading decisions
              </div>
            </li>
            <li className="flex gap-3">
              <div className="bg-blue-500/20 text-blue-400 rounded-full p-1 h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <span className="font-medium">Advanced Analysis</span> - Get access to institutional-grade analysis methods typically only available to professional traders
              </div>
            </li>
          </ul>
        </div>
      </PopupContainer>
    </div>
  );
}

function IndicatorCard({ indicator }: { indicator: IndicatorInfo }) {
  return (
    <Card className="border border-slate-700 bg-slate-800/50 overflow-hidden flex flex-col">
      <div className="aspect-video relative overflow-hidden bg-slate-900">
        <img 
          src={indicator.imageUrl} 
          alt={indicator.name}
          className="object-cover w-full h-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder-chart.svg';
          }}
        />
      </div>
      <CardHeader>
        <CardTitle>{indicator.name}</CardTitle>
        <CardDescription>{indicator.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium mb-1.5">Key Features:</h4>
            <ul className="text-sm space-y-1 text-slate-300">
              {indicator.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {indicator.timeframes.slice(0, 3).map((timeframe, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                {timeframe}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-700 bg-slate-800/80 flex justify-between items-center">
        <div className="font-bold text-lg">{indicator.price}</div>
        <a href={indicator.url} target="_blank" rel="noopener noreferrer">
          <Button>View on TradingView</Button>
        </a>
      </CardFooter>
    </Card>
  );
}