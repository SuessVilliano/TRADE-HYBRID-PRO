import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ConnectionsSimplePage() {
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Connections | Trade Hybrid</title>
      </Helmet>
      
      <div>
        <h1 className="text-3xl font-bold">Trading Connections</h1>
        <p className="text-muted-foreground mt-1">
          Manage your connections to brokers, trading platforms, and advanced trading services.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Trading View</h2>
          <p className="mb-4">Connect your TradingView account to receive signals and alerts.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Connect TradingView
          </button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Alpaca</h2>
          <p className="mb-4">Commission-free stock trading API for algorithmic trading.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Connect Alpaca
          </button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Oanda</h2>
          <p className="mb-4">Forex trading platform with advanced API access.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Connect Oanda
          </button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">ABATEV System</h2>
          <p className="mb-4">Advanced Broker Aggregation Trade Execution Vertex</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status: Inactive</span>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}