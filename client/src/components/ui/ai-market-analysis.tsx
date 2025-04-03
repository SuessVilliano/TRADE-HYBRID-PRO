import React, { useState } from 'react';
import { Button } from './button';
import { BrainCircuit, BarChart3, TrendingUp, Calculator, Clock, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

interface AIMarketAnalysisProps {
  className?: string;
}

export function AIMarketAnalysis({ className }: AIMarketAnalysisProps) {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeframe, setTimeframe] = useState('1d');
  
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };
  
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold">AI Market Analysis</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Get AI-powered insights and predictions for any market
        </p>
      </div>
      
      <div className="p-4 border-b border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1 text-slate-400">Select Asset</label>
            <select 
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            >
              <option value="BTCUSDT">Bitcoin (BTCUSDT)</option>
              <option value="ETHUSDT">Ethereum (ETHUSDT)</option>
              <option value="SOLUSDT">Solana (SOLUSDT)</option>
              <option value="BNBUSDT">Binance Coin (BNBUSDT)</option>
              <option value="ADAUSDT">Cardano (ADAUSDT)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-slate-400">Timeframe</label>
            <select 
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="summary" className="w-full">
        <div className="p-4 border-b border-slate-700">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
            <TabsTrigger value="technical" className="text-xs">Technical</TabsTrigger>
            <TabsTrigger value="sentiment" className="text-xs">Sentiment</TabsTrigger>
            <TabsTrigger value="prediction" className="text-xs">Prediction</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="summary" className="p-4 min-h-[400px]">
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <h3 className="font-medium">Market Overview</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Bitcoin (BTC) is currently in a consolidation phase after a recent rally. The asset is trading above its 50-day moving average, suggesting a bullish bias in the medium term. Volume profiles indicate accumulation by larger entities, while retail sentiment remains mixed.
              </p>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-green-400" />
                <h3 className="font-medium">Key Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="text-xs text-slate-400">Market Structure</div>
                  <div className="font-medium text-green-500">Bullish</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Trend Strength</div>
                  <div className="font-medium text-yellow-500">Moderate</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Volatility</div>
                  <div className="font-medium text-slate-300">Low</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Risk Assessment</div>
                  <div className="font-medium text-yellow-500">Medium</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-purple-400" />
                <h3 className="font-medium">Trading Recommendation</h3>
              </div>
              <p className="text-slate-300 text-sm mb-2">
                Based on current market conditions, a cautious approach is recommended with selective buying on dips. Consider the following strategy:
              </p>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                <li>Set limit buy orders at key support levels ($27,800 - $28,200)</li>
                <li>Maintain stop losses at the recent swing low ($26,500)</li>
                <li>Take profit at resistance zone ($32,400 - $33,000)</li>
                <li>Consider reducing position size due to current market uncertainty</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="p-4 min-h-[400px]">
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <h3 className="font-medium mb-3">Technical Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-400">RSI (14)</div>
                  <div className="font-medium text-slate-300">57.3</div>
                  <div className="text-xs text-yellow-500">Neutral</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">MACD</div>
                  <div className="font-medium text-slate-300">0.32</div>
                  <div className="text-xs text-green-500">Bullish</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Stochastic</div>
                  <div className="font-medium text-slate-300">78.5</div>
                  <div className="text-xs text-yellow-500">Overbought</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Bollinger Bands</div>
                  <div className="font-medium text-slate-300">Upper Band Test</div>
                  <div className="text-xs text-yellow-500">Neutral</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">MA Cross</div>
                  <div className="font-medium text-slate-300">50 &gt; 200</div>
                  <div className="text-xs text-green-500">Bullish</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Volume Profile</div>
                  <div className="font-medium text-slate-300">Increasing</div>
                  <div className="text-xs text-green-500">Bullish</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <h3 className="font-medium mb-3">Support & Resistance Levels</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Strong Resistance</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: '95%' }}></div>
                    </div>
                    <span className="ml-2 text-red-500 font-medium">$32,400</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Weak Resistance</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500/70" style={{ width: '80%' }}></div>
                    </div>
                    <span className="ml-2 text-red-400 font-medium">$30,800</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Current Price</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '65%' }}></div>
                    </div>
                    <span className="ml-2 text-blue-400 font-medium">$29,250</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Weak Support</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500/70" style={{ width: '40%' }}></div>
                    </div>
                    <span className="ml-2 text-green-400 font-medium">$27,800</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Strong Support</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '25%' }}></div>
                    </div>
                    <span className="ml-2 text-green-500 font-medium">$26,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="sentiment" className="p-4 min-h-[400px]">
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <h3 className="font-medium mb-3">Market Sentiment Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Social Media Sentiment</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: '70%' }}></div>
                    </div>
                    <span className="ml-2 text-green-400 font-medium">70%</span>
                  </div>
                  <div className="text-xs mt-1 text-green-500">Bullish</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">News Sentiment</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: '55%' }}></div>
                    </div>
                    <span className="ml-2 text-yellow-400 font-medium">55%</span>
                  </div>
                  <div className="text-xs mt-1 text-yellow-500">Neutral</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Exchange Flow</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: '45%' }}></div>
                    </div>
                    <span className="ml-2 text-yellow-400 font-medium">45%</span>
                  </div>
                  <div className="text-xs mt-1 text-yellow-500">Neutral</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Institutional Interest</div>
                  <div className="flex items-center">
                    <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: '65%' }}></div>
                    </div>
                    <span className="ml-2 text-green-400 font-medium">65%</span>
                  </div>
                  <div className="text-xs mt-1 text-green-500">Bullish</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <h3 className="font-medium mb-3">Recent Events Impact</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="h-5 w-5 bg-green-600/30 text-green-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 mr-2">+</div>
                  <div>
                    <div className="text-sm font-medium">ETF Approval Speculation</div>
                    <div className="text-xs text-slate-400">Increasing discussion around potential spot Bitcoin ETF approval</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 bg-green-600/30 text-green-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 mr-2">+</div>
                  <div>
                    <div className="text-sm font-medium">Institutional Adoption</div>
                    <div className="text-xs text-slate-400">Major financial institutions continue to increase crypto exposure</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 bg-red-600/30 text-red-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 mr-2">-</div>
                  <div>
                    <div className="text-sm font-medium">Regulatory Uncertainty</div>
                    <div className="text-xs text-slate-400">Ongoing concerns about potential regulation in key markets</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 bg-yellow-600/30 text-yellow-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 mr-2">~</div>
                  <div>
                    <div className="text-sm font-medium">Macroeconomic Factors</div>
                    <div className="text-xs text-slate-400">Mixed signals from global economy affecting risk asset sentiment</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="prediction" className="p-4 min-h-[400px]">
          <div className="space-y-4">
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-blue-400" />
                <h3 className="font-medium">Price Predictions</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">24 Hour Forecast</div>
                    <div className="text-sm font-medium text-green-500">$29,800 (+1.88%)</div>
                  </div>
                  <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '80%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-400">Confidence: 80%</span>
                    <span className="text-green-500">Bullish</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">7 Day Forecast</div>
                    <div className="text-sm font-medium text-green-500">$31,400 (+7.35%)</div>
                  </div>
                  <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-400">Confidence: 65%</span>
                    <span className="text-green-500">Bullish</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-sm font-medium">30 Day Forecast</div>
                    <div className="text-sm font-medium text-yellow-500">$28,900 (-1.20%)</div>
                  </div>
                  <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '45%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-400">Confidence: 45%</span>
                    <span className="text-yellow-500">Neutral</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
              <h3 className="font-medium mb-3">Model Insights</h3>
              <p className="text-slate-300 text-sm mb-3">
                Our AI model analyzes 200+ factors including on-chain metrics, market sentiment, technical patterns, and macroeconomic conditions to generate these forecasts.
              </p>
              
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-md p-3">
                <h4 className="text-sm font-medium text-blue-300 mb-2">Key Factors Influencing Prediction</h4>
                <ul className="list-disc list-inside text-xs text-blue-200 space-y-1">
                  <li>Positive exchange netflow (more coins leaving than entering exchanges)</li>
                  <li>Increasing accumulation by entities with 100-1000 BTC</li>
                  <li>Decreasing open interest in futures markets</li>
                  <li>Recent price action forming a bull flag pattern</li>
                  <li>Potential macroeconomic policy changes affecting risk assets</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}