import React from 'react';
import { PopupContainer } from '../components/ui/popup-container';
import { AIMarketAnalysis } from '../components/ui/ai-market-analysis';

export default function AIMarketAnalysisPage() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Market Analysis</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Get advanced AI-powered market analysis and trading suggestions for any trading instrument.
        </p>
      </div>
      
      <PopupContainer padding>
        <AIMarketAnalysis />
      </PopupContainer>
      
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">About AI Market Analysis</h2>
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
          <div className="mt-6 bg-purple-900/30 border border-purple-800 p-4 rounded-md">
            <h3 className="font-bold text-purple-300 mb-2">Important Disclaimer</h3>
            <p className="text-sm">
              The information provided by the AI Market Analysis tool is for educational and informational purposes only. It is not intended as financial advice, and should not be used as the sole basis for any investment decision. Always do your own research and consider consulting with a financial advisor before making trading decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}