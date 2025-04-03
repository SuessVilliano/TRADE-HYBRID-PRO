import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '../components/ui/card';
import { AdvancedTradeLayout } from '../components/ui/advanced-trade-layout';

export default function SimpleChartingDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      <Helmet>
        <title>Advanced Charting | Trade Hybrid</title>
      </Helmet>
      
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Advanced Charting Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Professional-grade trading interface with advanced panels and tools
          </p>
        </div>
        
        <Card className="bg-slate-800 border-slate-700 rounded-lg overflow-hidden">
          <div className="h-[calc(100vh-230px)] md:h-[calc(100vh-260px)] w-full">
            <AdvancedTradeLayout defaultSymbol="BTCUSDT" />
          </div>
        </Card>
      </div>
    </div>
  );
}