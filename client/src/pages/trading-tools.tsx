import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Signal, FileText, Bot, BrainCircuit, MessageSquare, BarChart3 } from 'lucide-react';

interface ToolItem {
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
}

const TradingToolsPage: React.FC = () => {
  const tools: ToolItem[] = [
    {
      name: 'Trading Signals',
      description: 'Real-time market signals and alerts from Google Sheets and our proprietary algorithms',
      path: '/signals',
      icon: <Signal className="h-8 w-8" />,
    },
    {
      name: 'Trading Indicators',
      description: 'Library of technical indicators to enhance your trading strategy',
      path: '/trading/indicators',
      icon: <BarChart3 className="h-8 w-8" />,
    },
    {
      name: 'Smart Trade Panel',
      description: 'Advanced trading with AI assistance - learn about our cutting-edge trading tools',
      path: '/smart-trade-explainer',
      icon: <Cpu className="h-8 w-8" />,
    },
    {
      name: 'Trading Journal',
      description: 'Complete trading journal with analytics, history, and psychology tracking',
      path: '/journal',
      icon: <FileText className="h-8 w-8" />,
    },
    {
      name: 'Trading Bots',
      description: 'Build and run automated trading strategies with our no-code bot builder',
      path: '/trading-bots',
      icon: <Bot className="h-8 w-8" />,
    },
    {
      name: 'AI Market Analysis',
      description: 'Get AI-powered insights on any financial instrument or market',
      path: '/ai-market-analysis',
      icon: <BrainCircuit className="h-8 w-8" />,
    },
    {
      name: 'Signals Analyzer',
      description: 'Analyze and backtest trading signals to improve performance',
      path: '/signals-analyzer',
      icon: <Signal className="h-8 w-8" />,
    },
    {
      name: 'Voice Trade Assistant',
      description: 'Trade using voice commands with our natural language processor',
      path: '/voice-trade',
      icon: <MessageSquare className="h-8 w-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Trading Tools</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive suite of trading tools designed to enhance your trading capabilities and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link 
              to={tool.path} 
              key={tool.path} 
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-600 rounded-md mr-4">
                    {tool.icon}
                  </div>
                  <h2 className="text-xl font-bold">{tool.name}</h2>
                </div>
                <p className="text-gray-300 mb-4 flex-grow">{tool.description}</p>
                <div className="mt-auto text-blue-400 font-medium">Explore Tool →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingToolsPage;