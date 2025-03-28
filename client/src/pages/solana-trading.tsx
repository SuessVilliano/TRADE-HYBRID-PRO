import React from 'react';
import { SolanaWalletProvider } from '@/lib/context/SolanaWalletProvider';
import { SolanaWalletConnector } from '@/components/ui/solana-wallet-connector';
import SolanaDexTrading from '@/components/ui/solana-dex-trading';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { THC_TOKEN_CONFIG } from '@/lib/contracts/thc-token-info';

const SolanaTrading: React.FC = () => {
  return (
    <SolanaWalletProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">Trade with Low Fees</h1>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to trade directly from the DEX with THC fee reduction.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                <span className="font-semibold mr-1">50%</span> Lower Fees
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                <span className="font-semibold mr-1">Direct DEX</span> Trading
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                <span className="font-semibold mr-1">No</span> Intermediaries
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-primary/5">
                <span className="font-semibold mr-1">THC</span> Token Utility
              </Badge>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SolanaWalletConnector />
          </div>
        </div>

        <Tabs defaultValue="trading" className="mb-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="mt-6">
            <SolanaDexTrading />
          </TabsContent>

          <TabsContent value="staking" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="rounded-lg border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Stake THC Tokens</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Earn rewards by staking your THC tokens. The longer you stake, the higher the APY.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    {THC_TOKEN_CONFIG.stakingApyTiers.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-md border">
                        <div>
                          <div className="font-medium">{tier.minStakingPeriod} Days</div>
                          <div className="text-xs text-muted-foreground">Min. Staking Period</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{tier.apy}% APY</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full" disabled>Connect Wallet First</Button>
                </div>
              </div>
              
              <div>
                <div className="rounded-lg border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">THC Benefits</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Holding THC tokens reduces your trading fees on all pairs.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    {THC_TOKEN_CONFIG.feeReductionTiers.slice(1).map((tier, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-md border">
                        <div>
                          <div className="font-medium">{tier.minHolding.toLocaleString()} THC</div>
                          <div className="text-xs text-muted-foreground">Min. Token Holding</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{tier.reduction}% Off</div>
                          <div className="text-xs text-muted-foreground">Fee Reduction</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full">Buy THC Tokens</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bridge" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <div className="rounded-lg border p-6 shadow-sm text-center">
                <h2 className="text-xl font-semibold mb-4">Bridge Assets</h2>
                <p className="text-muted-foreground mb-8">
                  Bridge your assets between Solana and other networks. Coming soon!
                </p>
                <Button variant="outline" disabled>Bridge Coming Soon</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </SolanaWalletProvider>
  );
};

export default SolanaTrading;