import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { WalletConnectWeb3Auth } from '../ui/wallet-connect-web3auth';
import { useSolanaAuth } from '../../lib/context/SolanaAuthProvider';
import { Shield, Wallet } from 'lucide-react';

/**
 * Enhanced wallet connection component for validators
 * Supports both Web3Auth and traditional wallet connections
 */
export function EnhancedWalletConnect() {
  const { walletConnected } = useSolanaAuth();
  const [activeTab, setActiveTab] = useState('web3auth');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to access validator functions and staking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="web3auth" onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="web3auth" className="flex-1">Web3Auth</TabsTrigger>
            <TabsTrigger value="phantom" className="flex-1">Phantom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="web3auth" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect with social login or email to access validator features
              </p>
              <WalletConnectWeb3Auth />
            </div>
          </TabsContent>
          
          <TabsContent value="phantom" className="mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect using the Phantom browser extension or mobile app
              </p>
              {/* This will use the original WalletConnect component from validator/ */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium mb-1">
                  <Shield className="h-4 w-4" />
                  <span>Validator Access</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Phantom wallet is required to run validator nodes and participate in consensus
                </p>
              </div>
              
              {/* Original WalletConnect would be imported and rendered here */}
              <Button variant="default" className="w-full gap-2">
                <img src="https://phantom.app/favicon.ico" className="w-4 h-4" alt="Phantom" />
                Connect Phantom Wallet
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {walletConnected && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
              <Shield className="h-4 w-4" />
              <span>Wallet Connected</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              You now have access to staking and validator functions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EnhancedWalletConnect;