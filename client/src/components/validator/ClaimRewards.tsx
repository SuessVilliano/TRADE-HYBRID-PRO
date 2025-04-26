import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Sparkles, AlertTriangle, Coins } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

interface ClaimRewardsProps {
  pendingRewards?: number;
  thcRewards?: number;
}

export const ClaimRewards: React.FC<ClaimRewardsProps> = ({ 
  pendingRewards = 0.068, 
  thcRewards = 25
}) => {
  const { publicKey } = useWallet();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Claim SOL rewards
  const handleClaimSol = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      // Log the claim attempt
      console.log('Claiming SOL rewards:', {
        publicKey: publicKey.toString(),
        amount: pendingRewards
      });
      
      // In a real implementation, this would call the Solana staking program
      // to claim rewards from the validator stake account
      
      // Simulate loading and success
      setTimeout(() => {
        setIsLoading(false);
        setSuccess(true);
        
        // Reset success after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }, 2000);
      
    } catch (err) {
      console.error('Error claiming SOL rewards:', err);
      setError(`Failed to claim rewards: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };
  
  // Claim THC token rewards
  const handleClaimThc = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      // Log the claim attempt
      console.log('Claiming THC rewards:', {
        publicKey: publicKey.toString(),
        amount: thcRewards
      });
      
      // In a real implementation, this would call the THC token contract
      // to transfer tokens to the user's wallet
      
      // Simulate loading and success
      setTimeout(() => {
        setIsLoading(false);
        setSuccess(true);
        
        // Reset success after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }, 2000);
      
    } catch (err) {
      console.error('Error claiming THC rewards:', err);
      setError(`Failed to claim rewards: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
          Claim Your Rewards
        </CardTitle>
        <CardDescription>
          Claim your staking rewards earned from the Trade Hybrid validator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Your rewards have been claimed and transferred to your wallet.</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* SOL Rewards */}
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">SOL Staking Rewards</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Standard Solana validator staking rewards
                </p>
                <div className="text-2xl font-bold">{pendingRewards.toFixed(4)} SOL</div>
                <div className="text-xs text-slate-500">
                  ≈ ${(pendingRewards * 150).toFixed(2)} USD
                </div>
              </div>
              <Button 
                onClick={handleClaimSol} 
                disabled={isLoading || pendingRewards <= 0}
                variant="outline"
                className="border-blue-700 hover:bg-blue-900/50"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Claim SOL'
                )}
              </Button>
            </div>
          </div>
          
          {/* THC Rewards */}
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">THC Token Rewards</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Additional THC tokens for staking with our validator
                </p>
                <div className="text-2xl font-bold">{thcRewards.toFixed(2)} THC</div>
                <div className="text-xs text-slate-500">
                  5 THC per 100 SOL per month
                </div>
              </div>
              <Button 
                onClick={handleClaimThc} 
                disabled={isLoading || thcRewards <= 0}
                variant="outline"
                className="border-purple-700 hover:bg-purple-900/50"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Claim THC'
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm mt-4">
            <div className="flex items-center text-blue-800 dark:text-blue-300 font-medium mb-1">
              <Coins className="h-4 w-4 mr-2" />
              About Staking Rewards
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              SOL rewards are calculated based on network inflation and validator performance. 
              THC token rewards are a unique bonus offered by Trade Hybrid to incentivize 
              staking with our validator.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};