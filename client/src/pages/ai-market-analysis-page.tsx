import React from 'react';
import { PopupContainer } from '../components/ui/popup-container';
import { AIMarketAnalysis } from '../components/ui/ai-market-analysis';
import { TradeHybridAgentsIframe, TradeHybridAgentsModal } from '../components/ui/trade-hybrid-agents-iframe';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { TradingDashboardLayout } from '../components/ui/trading-dashboard-layout';
import { Helmet } from 'react-helmet-async';

export default function AIMarketAnalysisPage() {
  return (
    <TradingDashboardLayout>
      <Helmet>
        <title>AI Market Analysis | Trade Hybrid</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Agents</h1>
          <p className="text-lg text-slate-300 max-w-3xl">
            Get advanced AI-powered market analysis, trading suggestions, and chat with our AI agents.
          </p>
        </div>
        
        <Tabs defaultValue="analysis" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
            <TabsTrigger value="chat-agents">AI Chat Agents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="mt-0">
            <PopupContainer padding>
              <AIMarketAnalysis />
            </PopupContainer>
          </TabsContent>
          
          <TabsContent value="chat-agents" className="mt-0">
            <PopupContainer padding>
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Trade Hybrid AI Chat Agents</h2>
                  <p className="text-slate-300">
                    Our AI Chat Agents provide personalized trading assistance, market insights, and answer your questions in real-time.
                  </p>
                </div>
                
                <TradeHybridAgentsIframe />
                
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-2">
                    Want a better experience? Open in full screen mode:
                  </p>
                  <TradeHybridAgentsModal />
                </div>
                
                <p className="text-sm text-slate-400 mt-2">
                  Or <a href="https://tradehybridagents.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">visit the site directly</a> in a new tab
                </p>
              </div>
            </PopupContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">About AI Agents</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Our AI Market Analysis tool provides deep insights into market conditions using advanced machine learning algorithms trained on millions of historical price patterns and market events.
            </p>
            <p>
              Select any trading symbol, timeframe, and analysis depth to receive comprehensive technical, fundamental, and sentiment analysis to inform your trading decisions.
            </p>
            <p>
              The trading suggestions tab offers practical trade ideas based on your risk profile, complete with entry points, stop losses, take profits, and supporting rationale.
            </p>
            <div className="mt-6 bg-purple-900/30 border border-purple-400 p-4 rounded-md">
              <h3 className="font-bold text-purple-300 mb-2">About Hybrid Score™</h3>
              <p className="text-slate-300 mb-3">
                The Hybrid Score is an innovative proprietary trading metric that combines real-time market data with advanced AI intelligence to evaluate potential trades. This comprehensive score weighs multiple factors:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 mb-4">
                <li><span className="font-semibold">Sentiment Analysis</span> - Gauges market sentiment from news, social media, and trader positioning</li>
                <li><span className="font-semibold">Price Momentum</span> - Measures the strength and direction of price movement</li>
                <li><span className="font-semibold">Volatility Factor</span> - Evaluates current market volatility to identify potential opportunities</li>
                <li><span className="font-semibold">Entry Timing</span> - Determines optimal entry points based on technical indicators</li>
                <li><span className="font-semibold">Risk/Reward Ratio</span> - Calculates potential return compared to risk exposure</li>
              </ul>
              <p className="text-slate-300">
                The final score ranges from 0-100, with higher scores indicating more favorable trading conditions according to our AI analysis.
              </p>
            </div>
            
            <div className="mt-6 bg-purple-900/30 border border-purple-800 p-4 rounded-md">
              <h3 className="font-bold text-purple-300 mb-2">Important Disclaimer</h3>
              <p className="text-sm">
                The information provided by the AI Market Analysis tool is for educational and informational purposes only. It is not intended as financial advice, and should not be used as the sole basis for any investment decision. Always do your own research and consider consulting with a financial advisor before making trading decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TradingDashboardLayout>
  );
}