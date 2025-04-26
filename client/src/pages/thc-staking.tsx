import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWallet } from '@solana/wallet-adapter-react';
// Using the kebab-case component which has 'description' prop
import PageHeader from '@/components/layout/PageHeader';
import { StakePanel } from '@/components/staking/StakePanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gem, Clock, Shield, Zap, AlertCircle, Server, Users, Coins, 
  Info as InfoIcon, Cpu as CpuIcon, Activity, BarChart3, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Server className="h-4 w-4 mr-2 text-green-500" />
                  Validator Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">Trade Hybrid Validator</div>
                    <div className="flex items-center mt-1">
                      <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
                        Active
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        Last vote: 12 seconds ago
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Commission</div>
                    <div className="text-xl font-bold">1%</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3" 
                  onClick={() => window.open('https://solscan.io/account/5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej', '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Validator Online
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <CpuIcon className="h-4 w-4 mr-2 text-purple-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Skip Rate</div>
                    <div className="font-medium">1.2%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="font-medium">99.98%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Version</div>
                    <div className="font-medium">1.14.18</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-500" />
                  Epoch Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Epoch: 452</span>
                    <span>78%</span>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last Epoch Uptime: 99.94%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StakeForm />
            <ClaimRewards />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Stake Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Your Stake</div>
                      <div className="text-2xl font-bold">78.30 SOL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Validator's Stake</div>
                      <div className="text-2xl font-bold">175,420.65 SOL</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="text-sm text-muted-foreground mb-2">Your Stake Accounts</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="truncate max-w-[100px] font-mono text-xs">
                            Stake1...W8p2
                          </div>
                          <div className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                            active
                          </div>
                        </div>
                        <div className="font-medium">25.50 SOL</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="truncate max-w-[100px] font-mono text-xs">
                            Stake2...K9q3
                          </div>
                          <div className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                            active
                          </div>
                        </div>
                        <div className="font-medium">42.80 SOL</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="truncate max-w-[100px] font-mono text-xs">
                            Stake3...L7r5
                          </div>
                          <div className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                            activating
                          </div>
                        </div>
                        <div className="font-medium">10.00 SOL</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2 text-blue-500" />
                  Trade Hybrid Validator Details
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Earn SOL staking rewards and THC token bonuses by staking with the Trade Hybrid validator node.
                  Our validator is operated by an experienced team with 24/7 monitoring and 99.98% uptime.
                </p>
                
                <h4 className="flex items-center mt-4">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Dual Rewards Program
                </h4>
                <p>
                  When you stake SOL with our validator, you earn both standard SOL staking rewards
                  (~7.5% APY) and bonus THC tokens (5 THC per 100 SOL staked per month).
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <div className="text-sm font-medium">Validator Account</div>
                    <div className="text-sm font-mono">5Mp3EF1d...jEej</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">THC Token</div>
                    <div className="text-sm font-mono">4kXPBvQt...BLy4</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Root Slot</div>
                    <div className="text-sm">255783162</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Credits</div>
                    <div className="text-sm">72.45M</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://solscan.io/account/5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej', '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    View Validator
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://solscan.io/token/4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4', '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    View THC Token
                  </Button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm mt-4">
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
          </div>
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