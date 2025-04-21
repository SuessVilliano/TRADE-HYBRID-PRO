import React from 'react';
import TestChart from '../components/ui/test-chart';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Page</h1>
        <p className="text-gray-300 mb-8">
          This is a simple test page to verify component rendering.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TestChart symbol="BTCUSDT" />
          <TestChart symbol="ETHUSDT" />
        </div>
      </div>
    </div>
  );
};

export default TestPage;