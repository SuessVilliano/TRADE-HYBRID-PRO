import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWallet } from '@solana/wallet-adapter-react';
// Using the kebab-case component which has 'description' prop
import PageHeader from '@/components/layout/PageHeader';
import { StakePanel } from '@/components/staking/StakePanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gem, Clock, Shield, Zap, AlertCircle, Server, Users, Coins, Info as InfoIcon } from 'lucide-react';
import { StakeForm } from '@/components/validator/StakeForm';
import { ClaimRewards } from '@/components/validator/ClaimRewards';
import { ForsageMatrixVisualization } from '@/components/affiliate/forsage-matrix-visualization';
import { AcquireThcContent } from '@/components/ui/acquire-thc-content';

import '@solana/wallet-adapter-react-ui/styles.css';

const ThcStakingPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [error, setError] = useState<string | null>(null);
  
  // Debugging info
  useEffect(() => {
    console.log("ThcStakingPage mounted, wallet status:", { connected, publicKey: publicKey?.toString() });
    
    return () => {
      console.log("ThcStakingPage unmounted");
    };
  }, [connected, publicKey]);
  
  const [activeTab, setActiveTab] = useState<string>('thc-staking');

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>THC Staking | Trade Hybrid</title>
      </Helmet>
      
      <PageHeader
        title="Trade Hybrid Ecosystem"
        description="Stake your THC tokens, validate SOL, participate in the matrix program, or acquire new tokens."
      />
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6 text-red-700 dark:text-red-400">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="thc-staking" className="flex items-center gap-2">
            <Gem className="h-4 w-4" />
            <span className="hidden sm:inline">THC Staking</span>
            <span className="sm:hidden">THC</span>
          </TabsTrigger>
          <TabsTrigger value="validator" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Validator</span>
            <span className="sm:hidden">SOL</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Matrix</span>
            <span className="sm:hidden">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="acquire" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Acquire THC</span>
            <span className="sm:hidden">Buy</span>
          </TabsTrigger>
        </TabsList>

        {/* THC Staking Tab */}
        <TabsContent value="thc-staking" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StakePanel />
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-purple-500" />
                    About THC Staking
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>
                    Staking THC tokens allows you to earn passive rewards while supporting the Trade Hybrid ecosystem. 
                    The longer you lock your tokens, the higher rewards you'll earn.
                  </p>
                  
                  <h4 className="flex items-center mt-4">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    Lock Periods
                  </h4>
                  <p>
                    Choose from flexible lock periods ranging from 30 days to 1 year. 
                    Longer lock periods offer higher APY rates, up to 15%.
                  </p>
                  
                  <h4 className="flex items-center mt-4">
                    <Shield className="h-4 w-4 mr-2 text-purple-500" />
                    Security
                  </h4>
                  <p>
                    Your staked tokens are secured by the Solana blockchain using our audited staking contract. 
                    All operations can be verified on-chain.
                  </p>
                  
                  <h4 className="flex items-center mt-4">
                    <Zap className="h-4 w-4 mr-2 text-purple-500" />
                    Benefits
                  </h4>
                  <ul>
                    <li>Earn passive rewards on your THC tokens</li>
                    <li>Get premium access to trading signals</li>
                    <li>Participate in governance decisions</li>
                    <li>Unlock premium features on the platform</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Staking FAQ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium">How do rewards work?</h4>
                    <p className="text-muted-foreground">
                      Rewards accrue continuously based on your staked amount, APY rate, and lock period. 
                      You can claim rewards anytime without unstaking your THC.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Can I unstake early?</h4>
                    <p className="text-muted-foreground">
                      Yes, but early unstaking before your lock period ends may result in reduced rewards 
                      or penalties depending on how early you unstake.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">What happens after the lock period?</h4>
                    <p className="text-muted-foreground">
                      After your lock period ends, you can choose to unstake your THC and claim all rewards, 
                      or you can leave them staked to continue earning at the base rate.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Is there a minimum staking amount?</h4>
                    <p className="text-muted-foreground">
                      The minimum staking amount is 10 THC tokens. There is no maximum limit.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Validator Tab */}
        <TabsContent value="validator" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StakeForm />
            <ClaimRewards />
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-500" />
                Trade Hybrid Validator
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Earn SOL staking rewards and THC token bonuses by staking with the Trade Hybrid validator node.
                Our validator provides reliable operation with high uptime and competitive APY rates.
              </p>
              
              <h4 className="flex items-center mt-4">
                <Shield className="h-4 w-4 mr-2 text-blue-500" />
                Dual Rewards Program
              </h4>
              <p>
                When you stake SOL with our validator, you earn both standard SOL staking rewards
                (~7.5% APY) and bonus THC tokens (5 THC per 100 SOL staked per month).
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
                <div className="font-medium mb-1 flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2 text-blue-500" />
                  How It Works:
                </div>
                <ol className="list-decimal list-inside pl-2">
                  <li>Stake SOL with our validator using the form above</li>
                  <li>Your stake activates after 1-2 epochs (2-4 days)</li>
                  <li>Earn standard SOL rewards from the Solana network</li>
                  <li>Receive additional THC tokens as bonus rewards</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matrix Tab */}
        <TabsContent value="matrix" className="mt-6">
          <ForsageMatrixVisualization userWalletAddress={publicKey?.toString()} />
        </TabsContent>

        {/* Acquire Tab */}
        <TabsContent value="acquire" className="mt-6">
          <AcquireThcContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThcStakingPage;