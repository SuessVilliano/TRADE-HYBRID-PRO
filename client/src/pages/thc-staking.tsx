import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/layout/PageHeader';
import StakePanel from '@/components/staking/StakePanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Clock, Shield, Zap } from 'lucide-react';

const ThcStakingPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>THC Staking | Trade Hybrid</title>
      </Helmet>
      
      <PageHeader
        title="THC Token Staking"
        description="Stake your THC tokens to earn passive rewards and participate in the Trade Hybrid ecosystem."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
    </div>
  );
};

export default ThcStakingPage;