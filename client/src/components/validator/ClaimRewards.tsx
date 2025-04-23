import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import { GiftIcon, CoinsIcon, RefreshCwIcon, CheckCircleIcon } from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface ClaimRewardsProps {
  validatorIdentity: string;
  solanaAuth: any; // Using any for simplicity
}

export default function ClaimRewards({ validatorIdentity, solanaAuth }: ClaimRewardsProps) {
  const { toast } = useToast();
  const [pendingRewards, setPendingRewards] = useState(0.38); // SOL
  const [thcRewards, setThcRewards] = useState(15.7); // THC
  const [isLoading, setIsLoading] = useState(false);
  const [lastClaimed, setLastClaimed] = useState('3 days ago');
  const [nextEpoch, setNextEpoch] = useState(2.8); // days
  const [epochProgress, setEpochProgress] = useState(68); // percentage

  // Simulated claim rewards function
  const handleClaimRewards = async () => {
    if (!solanaAuth.walletConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real application, this would make a contract call to claim rewards
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate blockchain transaction time
      
      // Show success toast
      toast({
        title: "Rewards Claimed",
        description: `Successfully claimed ${pendingRewards} SOL and ${thcRewards} THC tokens`,
        variant: "default",
      });
      
      // Reset rewards after claiming
      setPendingRewards(0);
      setThcRewards(0);
      setLastClaimed('just now');
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "There was an error claiming your rewards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl text-white">
          <GiftIcon className="mr-2 h-5 w-5 text-purple-400" />
          Validator Rewards
        </CardTitle>
        <CardDescription className="text-gray-300">
          Claim your SOL staking rewards and THC bonuses
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-300 flex items-center">
                <CoinsIcon className="inline mr-1 h-3 w-3 text-yellow-400" />
                Pending SOL Rewards
              </p>
              <p className="text-2xl font-bold text-white">
                {pendingRewards.toFixed(4)} SOL
              </p>
              <p className="text-xs text-gray-400">
                ≈ ${(pendingRewards * 150).toFixed(2)} USD
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-gray-300 flex items-center justify-end">
                <CoinsIcon className="inline mr-1 h-3 w-3 text-purple-400" />
                THC Bonus Rewards
              </p>
              <p className="text-2xl font-bold text-white">
                {thcRewards.toFixed(2)} THC
              </p>
              <p className="text-xs text-gray-400">
                Last claimed: {lastClaimed}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Current Epoch Progress</span>
              <span>{epochProgress}%</span>
            </div>
            <Progress value={epochProgress} className="h-2 bg-gray-700" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                <RefreshCwIcon className="inline h-3 w-3 mr-1" />
                {nextEpoch.toFixed(1)} days until next epoch
              </span>
              {pendingRewards > 0 && (
                <span className="text-green-400 flex items-center">
                  <CheckCircleIcon className="inline h-3 w-3 mr-1" />
                  Rewards available
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={pendingRewards <= 0 || isLoading || !solanaAuth.walletConnected}
          onClick={handleClaimRewards}
        >
          {isLoading ? "Processing..." : `Claim ${(pendingRewards + thcRewards).toFixed(2)} Rewards`}
        </Button>
      </CardFooter>
    </Card>
  );
}