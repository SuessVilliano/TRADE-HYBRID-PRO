import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Cpu, BarChart3, AreaChart, BrainCircuit, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';

const SmartTradeExplainer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Smart Trade Panel</h1>
            <p className="text-xl text-gray-300">Advanced trading with AI-powered assistance</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-10">
            <div className="flex items-center justify-center mb-8">
              <Cpu className="h-16 w-16 text-blue-400" />
            </div>
            <p className="text-lg mb-6">
              The Smart Trade Panel is integrated directly into our Trade Dashboard, providing you 
              with advanced trading capabilities enhanced by artificial intelligence. This 
              revolutionary tool helps you make more informed trading decisions with real-time 
              analysis and intelligent suggestions.
            </p>
            
            <div className="text-center mt-8">
              <Link to="/trading-dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Go to Trade Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BrainCircuit className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">AI Analysis</h3>
              </div>
              <p>Receive real-time market analysis powered by our advanced AI models, highlighting potential entry and exit points.</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">Risk Management</h3>
              </div>
              <p>Automatically calculate optimal position sizes and risk levels based on your account size and risk tolerance.</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AreaChart className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">Multi-Timeframe Analysis</h3>
              </div>
              <p>View and analyze multiple timeframes simultaneously to identify the strongest trading opportunities.</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">Voice Commands</h3>
              </div>
              <p>Execute trades, check indicators, and control the platform using simple voice commands for hands-free trading.</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Bot className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">Trading Signals</h3>
              </div>
              <p>Receive real-time trading signals based on popular indicators and our proprietary algorithms.</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">Pattern Recognition</h3>
              </div>
              <p>Automatically identify chart patterns and candlestick formations with our advanced pattern recognition technology.</p>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-10">
            <h2 className="text-2xl font-bold mb-4">Ready to experience Smart Trading?</h2>
            <p className="text-lg mb-6">
              Access all these powerful features directly in our Trade Dashboard. No separate setup required – just log in and start using the Smart Trade Panel right away.
            </p>
            
            <div className="text-center">
              <Link to="/trading-dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Open Trade Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTradeExplainer;