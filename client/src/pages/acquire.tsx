import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Coins, AlertTriangle } from 'lucide-react';

import PageHeader from '@/components/layout/PageHeader';
import { AcquireThcContent } from '@/components/ui/acquire-thc-content';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import '@solana/wallet-adapter-react-ui/styles.css';

const AcquirePage: React.FC = () => {
  const { connected } = useWallet();
  
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Acquire THC | Trade Hybrid</title>
      </Helmet>
      
      <PageHeader
        title="Acquire THC Tokens"
        description="Purchase THC tokens to unlock premium features and participate in the Trade Hybrid ecosystem"
      />
      
      {!connected ? (
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Coins className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Connect your Solana wallet to purchase THC tokens and access premium features.
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <AcquireThcContent />
        </>
      )}
    </div>
  );
};

export default AcquirePage;