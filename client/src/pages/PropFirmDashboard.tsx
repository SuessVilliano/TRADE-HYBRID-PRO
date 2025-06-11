import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';

const PropFirmDashboardPage: React.FC = () => {
  const handleDashboardAccess = () => {
    window.open('https://hybridfundingdashboard.propaccount.com/en/signin', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Redirecting to HybridFunding
          </h1>
          <p className="text-lg text-gray-600">
            Access your prop trading dashboard
          </p>
        </div>

        {/* Main Action */}
        <div className="space-y-6">
          <Button 
            onClick={handleDashboardAccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg"
            size="lg"
          >
            Open Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">External Service Notice</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You will be redirected to HybridFunding.co, which operates independently from Trade Hybrid. 
              All trading activities and account management are handled by HybridFunding under their terms of service.
            </p>
          </div>
          
          <p className="text-xs text-gray-500">
            Trade Hybrid is not responsible for activities on external platforms.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PropFirmDashboardPage;