import React from 'react';
import { Card } from '../components/ui/card';

export default function LearnEmbedded() {
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <Card className="p-4 mb-4">
        <h2 className="text-2xl font-bold mb-4">Trade Hybrid Education Center</h2>
        <p className="text-muted-foreground mb-6">
          Access our comprehensive trading education resources below covering Futures, Crypto, Crypto futures, 
          Stocks, and Forex trading. Learn at your own pace with our structured curriculum.
        </p>
        
        <div className="rounded-md overflow-hidden border h-[800px]">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://elearning.builderall.com/course/52786/aaLZMM95/" 
            frameBorder="0" 
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      </Card>
    </div>
  );
}