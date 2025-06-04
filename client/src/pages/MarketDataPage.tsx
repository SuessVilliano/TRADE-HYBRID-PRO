import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import ContentContainer from '../components/common/ContentContainer';
import RapidAPIMarketDashboard from '../components/RapidAPIMarketDashboard';
import { Info } from 'lucide-react';

/**
 * Market Data Page
 * 
 * Displays a dashboard with market data from various providers
 */
const MarketDataPage: React.FC = () => {
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
  
  return (
    <div>
      <PageHeader 
        title="Market Data Explorer" 
        subtitle="Analyze real-time and historical market data from multiple providers"
        bgImageClass="bg-gradient-to-r from-blue-500 to-cyan-500"
      />
      
      <ContentContainer>
        <div className="flex flex-col space-y-4">
          {/* Info Panel */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Market Data</h2>
            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Info className="mr-1" /> {showInfoPanel ? 'Hide Info' : 'Show Info'}
            </button>
          </div>
          
          {showInfoPanel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">About Market Data Explorer</h3>
              <p className="mb-2">
                This tool allows you to access market data from multiple providers through a unified interface.
                We integrate with various market data APIs to provide comprehensive coverage across different asset classes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="border border-blue-200 rounded bg-white p-3">
                  <h4 className="font-semibold">Stocks</h4>
                  <p className="text-sm text-gray-600">
                    Major US and global exchanges, including NASDAQ, NYSE, and more.
                  </p>
                </div>
                <div className="border border-blue-200 rounded bg-white p-3">
                  <h4 className="font-semibold">Forex</h4>
                  <p className="text-sm text-gray-600">
                    Major and minor currency pairs from global forex markets.
                  </p>
                </div>
                <div className="border border-blue-200 rounded bg-white p-3">
                  <h4 className="font-semibold">Crypto</h4>
                  <p className="text-sm text-gray-600">
                    Bitcoin, Ethereum, and thousands of altcoins from major exchanges.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-1">Using RapidAPI</h4>
                <p className="text-sm text-gray-600">
                  For the best experience, you'll need a RapidAPI key. You can get a free key by signing up at 
                  <a 
                    href="https://rapidapi.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    RapidAPI.com
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Market Data Dashboard */}
          <RapidAPIMarketDashboard />
        </div>
      </ContentContainer>
    </div>
  );
};

export default MarketDataPage;