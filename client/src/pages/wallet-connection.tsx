import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Shield, Coins, ExternalLink, Zap } from 'lucide-react';
// Import from UI components since we've moved them there
import { PageHeader } from '../components/layout/page-header';
import { PageContainer } from '../components/layout/page-container';
import { WalletConnectWeb3Auth } from '../components/ui/wallet-connect-web3auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useSolanaAuth } from '../lib/context/SolanaAuthProvider';

export default function WalletConnectionPage() {
  const { walletConnected } = useSolanaAuth();
  const [activeTab, setActiveTab] = useState('web3auth');

  return (
    <>
      <PageHeader title="Wallet Connection" icon={<Wallet className="h-6 w-6" />}>
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </PageHeader>

      <PageContainer>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Wallet Connection Card */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Connection
                </CardTitle>
                <CardDescription>
                  Connect your wallet to access trading features, THC tokens, and staking options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="web3auth" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="web3auth" className="flex-1">Web3Auth</TabsTrigger>
                    <TabsTrigger value="phantom" className="flex-1">Phantom</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="web3auth" className="mt-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        The easiest way to connect - use your social login or email to access Solana wallet features
                      </p>
                      <WalletConnectWeb3Auth />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="phantom" className="mt-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Connect using Phantom browser extension or mobile app
                      </p>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Make sure you have the Phantom extension installed or scan the QR code with your Phantom mobile app.
                        </p>
                      </div>
                      <Button
                        variant="default"
                        className="w-full gap-2"
                        disabled={activeTab !== 'phantom'}
                      >
                        <img src="https://phantom.app/favicon.ico" className="w-4 h-4" alt="Phantom" />
                        Connect Phantom Wallet
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Information Cards */}
          <div className="md:col-span-1 lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Validator Functions
                </CardTitle>
                <CardDescription>
                  Becoming a Trade Hybrid validator allows you to participate in network security and earn rewards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  When you connect your Solana wallet, you can:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Stake SOL to the Trade Hybrid validator</li>
                  <li>Earn dual rewards (SOL staking rewards + THC token rewards)</li>
                  <li>View your validator statistics and performance</li>
                  <li>Participate in governance decisions</li>
                </ul>
                <Separator />
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    disabled={!walletConnected}
                    asChild
                  >
                    <Link to="/thc-staking">
                      <Shield className="h-4 w-4 mr-2" />
                      Go to Validator Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  THC Token Staking
                </CardTitle>
                <CardDescription>
                  Stake your THC tokens and earn additional rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  TradeHybrid Coin (THC) is the native token of the Trade Hybrid platform. By staking THC, you can:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Earn passive income through staking rewards</li>
                  <li>Gain access to premium features and elevated membership tiers</li>
                  <li>Participate in governance and voting</li>
                  <li>Receive trading fee discounts</li>
                </ul>
                <Separator />
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    disabled={!walletConnected}
                    asChild
                  >
                    <Link to="/thc-staking">
                      <Coins className="h-4 w-4 mr-2" />
                      Stake THC Tokens
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://pump.fun/coin/2tQXeJtmzEqMvvMYwb6ZKJ2RXWfrbnzg3fUX1e8GuAUD', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View THC on Pump.fun
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Trade Hybrid Coin (THC)
                </CardTitle>
                <CardDescription>
                  The native token of the Trade Hybrid ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current Price</p>
                    <p className="text-2xl font-bold">$0.15</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md px-3 py-1">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">+5.2% (24h)</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="font-medium">$1.5M</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Circulating Supply</p>
                    <p className="font-medium">10M THC</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Supply</p>
                    <p className="font-medium">100M THC</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full" disabled={!walletConnected}>
                  <Coins className="h-4 w-4 mr-2" />
                  Buy THC Tokens
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}