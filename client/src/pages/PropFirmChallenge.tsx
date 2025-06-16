import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';

const PropFirmChallengePage: React.FC = () => {
  const handleChallengeAccess = () => {
    window.open('https://hybridfunding.co', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            HybridFunding Challenge
          </h1>
          <p className="text-lg text-gray-600">
            Apply for funded trading accounts
          </p>
        </div>

        {/* Main Action */}
        <div className="space-y-6">
          <Button 
            onClick={handleChallengeAccess}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-lg"
            size="lg"
          >
            Apply for Challenge
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">External Service Notice</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You will be redirected to HybridFunding.co to apply for prop trading challenges. 
              All challenge applications and evaluations are handled by HybridFunding under their terms of service.
            </p>
          </div>
          
          <p className="text-xs text-gray-500">
            Trade Hybrid is not responsible for challenge evaluations or funding decisions.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PropFirmChallengePage;