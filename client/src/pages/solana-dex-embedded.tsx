import React from 'react';
import { Card } from '../components/ui/card';

export default function SolanaDexEmbedded() {
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <Card className="p-4 mb-4">
        <h2 className="text-2xl font-bold mb-4">Solana DEX Trading with Drift Protocol</h2>
        <p className="text-muted-foreground mb-6">
          Access the full-featured Drift Protocol DEX for trading on Solana below. 
          Drift offers perpetual futures trading with up to 10x leverage, spot trading, and advanced features.
        </p>
        
        <div className="rounded-md overflow-hidden border h-[800px]">
          <iframe 
            src="https://app.drift.trade/SOL"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <h3 className="font-semibold mb-2">Trading with THC Token Benefits</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Trade with reduced fees (up to 50% discount)</li>
            <li>Earn staking rewards from your THC token holdings</li>
            <li>Participate in THC token governance decisions</li>
            <li>Access premium trading features and signals</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}