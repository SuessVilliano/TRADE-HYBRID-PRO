import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { WalletConnectWeb3Auth } from './wallet-connect-web3auth';

export function WalletPanel() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Wallet</CardTitle>
        <CardDescription>
          Connect your wallet to access advanced features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WalletConnectWeb3Auth />
      </CardContent>
    </Card>
  );
}

export default WalletPanel;