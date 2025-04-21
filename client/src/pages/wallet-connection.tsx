import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Shield, Coins, ExternalLink } from 'lucide-react';
// Import from UI components since we've moved them there
import { PageHeader } from '../components/layout/page-header';
import { PageContainer } from '../components/layout/page-container';
import { WalletConnectionPanel } from '../components/wallet/WalletConnectionPanel';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useSolanaAuth } from '../lib/context/SolanaAuthProvider';

export default function WalletConnectionPage() {
  const { walletConnected } = useSolanaAuth();

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
            <WalletConnectionPanel className="h-full" />
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
                    onClick={() => window.open('https://www.pump.fun/token/5FJeEJR8576YxXFdGRAu4NBBFcyfmtjsZtx99Rettgww', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View THC on Pump.fun
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}