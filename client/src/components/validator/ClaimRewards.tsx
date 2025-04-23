import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { Medal, AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Progress } from "../ui/progress";

interface ClaimRewardsProps {
  validatorIdentity: string;
}

export default function ClaimRewards({ validatorIdentity }: ClaimRewardsProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRewards, setAvailableRewards] = useState(0);
  const [nextRewardsIn, setNextRewardsIn] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Simulate loading rewards data when component mounts and wallet changes
  useEffect(() => {
    if (!publicKey) return;
    
    const fetchRewards = async () => {
      try {
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real implementation, this would fetch the user's rewards from the program
        // For this demo, we're just using mock data
        
        // Set available rewards (0.5 THC)
        setAvailableRewards(0.5);
        
        // Set time until next rewards (3 days)
        setNextRewardsIn(3 * 24 * 60 * 60); // 3 days in seconds
        
        // Set progress toward next reward (0-100%)
        setProgress(65);
        
      } catch (error) {
        console.error("Error fetching rewards:", error);
        setError("Failed to fetch rewards data");
      }
    };
    
    fetchRewards();
    
    // Set up an interval to update the progress and time remaining
    const interval = setInterval(() => {
      setProgress(prev => (prev + 0.01) % 100);
      setNextRewardsIn(prev => prev ? Math.max(0, prev - 1) : null);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!nextRewardsIn) return "Unknown";
    
    const days = Math.floor(nextRewardsIn / (24 * 60 * 60));
    const hours = Math.floor((nextRewardsIn % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((nextRewardsIn % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    if (!publicKey || !signTransaction || !connection) {
      setError('Wallet not connected');
      return;
    }

    if (availableRewards <= 0) {
      setError('No rewards available to claim');
      return;
    }

    try {
      setIsClaiming(true);
      setError(null);
      
      // In a real implementation, we would:
      // 1. Create a transaction to claim rewards from the dual rewards program
      // 2. Have the user sign the transaction
      // 3. Send the transaction to the blockchain
      
      // For demo purposes, we're simulating the claiming process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      toast({
        title: "THC Rewards Claimed",
        description: `Successfully claimed ${availableRewards.toFixed(2)} THC rewards`,
        variant: "default",
      });
      
      // Reset rewards after claiming
      setAvailableRewards(0);
      
    } catch (err) {
      console.error('Error claiming rewards:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim rewards. Please try again.');
      
      toast({
        title: "Claiming Failed",
        description: err instanceof Error ? err.message : 'Failed to claim rewards. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Medal className="mr-2 h-5 w-5 text-purple-500" />
          THC Dual Rewards
        </CardTitle>
        <CardDescription>
          Claim your THC token rewards for staking SOL with our validator
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
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Available Rewards</p>
            <p className="text-2xl font-bold">{availableRewards.toFixed(2)} THC</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Next Rewards</p>
            <p className="text-sm font-medium flex items-center justify-end">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeRemaining()}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progress to next reward</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleClaimRewards} 
          disabled={!publicKey || isClaiming || availableRewards <= 0}
          className="w-full"
          variant={availableRewards > 0 ? "default" : "outline"}
        >
          {isClaiming ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Claiming...
            </>
          ) : (
            <>
              <Medal className="mr-2 h-4 w-4" />
              {availableRewards > 0 ? `Claim ${availableRewards.toFixed(2)} THC` : 'No Rewards Available'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}