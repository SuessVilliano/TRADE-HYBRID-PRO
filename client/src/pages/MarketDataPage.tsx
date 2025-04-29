import React, { useState } from 'react';
import RapidAPIMarketDashboard from '../components/RapidAPIMarketDashboard';

const MarketDataPage: React.FC = () => {
  // State for the RapidAPI key, if stored in user settings
  const [rapidApiKey, setRapidApiKey] = useState<string>('');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Market Data Platform</h1>
        <p className="text-gray-500">
          Access real-time market data from various providers through RapidAPI
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">About RapidAPI Integration</h2>
          <p className="mb-2">
            This feature allows you to access market data from multiple premium API providers 
            through the RapidAPI platform.
          </p>
          <p className="mb-2">
            To use these features, you'll need a RapidAPI account and subscribe to one or more 
            of the supported data providers:
          </p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Twelve Data (stocks, forex, crypto)</li>
            <li>Binance (cryptocurrency data)</li>
            <li>Alpha Vantage (stocks, forex)</li>
            <li>Yahoo Finance (stocks, news)</li>
            <li>TradingView (market movers, technical indicators)</li>
          </ul>
          <p>
            <a 
              href="https://rapidapi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Sign up for RapidAPI
            </a> and subscribe to these providers to get your API key.
          </p>
        </div>
      </div>

      {/* RapidAPI Market Dashboard */}
      <div className="mb-12">
        <RapidAPIMarketDashboard rapidApiKey={rapidApiKey} />
      </div>

      {/* Information about supported providers */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold mb-4">Supported Data Providers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Twelve Data */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">Twelve Data</h3>
            <p className="text-gray-400 mb-2">
              Financial data provider with extensive coverage of stocks, forex, and cryptocurrencies.
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-400 text-sm">
              <li>Real-time and historical market data</li>
              <li>Technical indicators</li>
              <li>Global exchange coverage</li>
            </ul>
            <a 
              href="https://rapidapi.com/twelvedata/api/twelve-data1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300"
            >
              RapidAPI Subscription
            </a>
          </div>
          
          {/* Binance */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">Binance</h3>
            <p className="text-gray-400 mb-2">
              Cryptocurrency exchange data provider with real-time market data.
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-400 text-sm">
              <li>Real-time crypto prices</li>
              <li>Market depth and order book</li>
              <li>24-hour statistics</li>
            </ul>
            <a 
              href="https://rapidapi.com/Coinranking/api/binance43" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300"
            >
              RapidAPI Subscription
            </a>
          </div>
          
          {/* Alpha Vantage */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">Alpha Vantage</h3>
            <p className="text-gray-400 mb-2">
              Realtime and historical stock data APIs.
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-400 text-sm">
              <li>Time series data</li>
              <li>Technical indicators</li>
              <li>Fundamental data</li>
            </ul>
            <a 
              href="https://rapidapi.com/alphavantage/api/alpha-vantage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300"
            >
              RapidAPI Subscription
            </a>
          </div>
          
          {/* Yahoo Finance */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">Yahoo Finance</h3>
            <p className="text-gray-400 mb-2">
              Comprehensive stock market data and news.
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-400 text-sm">
              <li>Stock quotes and summaries</li>
              <li>Company financials</li>
              <li>ESG scores and market news</li>
            </ul>
            <a 
              href="https://rapidapi.com/apidojo/api/yh-finance" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300"
            >
              RapidAPI Subscription
            </a>
          </div>
          
          {/* TradingView */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">TradingView</h3>
            <p className="text-gray-400 mb-2">
              Market movers and trading data.
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-400 text-sm">
              <li>Market movers</li>
              <li>Popular symbols</li>
              <li>Technical analysis</li>
            </ul>
            <a 
              href="https://rapidapi.com/Compagnie/api/trading-view" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300"
            >
              RapidAPI Subscription
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataPage;