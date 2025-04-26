import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { Server, AlertTriangle, ArrowDownUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export const StakeForm: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [amount, setAmount] = useState<string>('1.0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Simulate staking - in real implementation, this would create a staking transaction
  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      // Create a validator public key (this would be your actual validator identity in production)
      const validatorPubkey = new PublicKey('DHpYC8LRnpNfkpTjwsP1caq9CBYa1qSt2Yv9N3Qw8Swv');
      
      // Create a simple transfer transaction (this is a simplified example)
      // In a real implementation, this would create a stake account and delegate to validator
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: validatorPubkey,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL
        })
      );
      
      // Simulate transaction sending
      // For testing purposes, we'll just simulate success without sending
      console.log('Preparing staking transaction:', {
        fromPublicKey: publicKey.toString(),
        toValidatorPublicKey: validatorPubkey.toString(),
        amountSOL: amount
      });
      
      // In a real implementation, you would uncomment the following
      // const signature = await sendTransaction(transaction, connection);
      // await connection.confirmTransaction(signature, 'confirmed');
      
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
      console.error('Error staking SOL:', err);
      setError(`Failed to stake SOL: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5 text-blue-500" />
          Stake SOL to Trade Hybrid Validator
        </CardTitle>
        <CardDescription>
          Earn SOL staking rewards (current APR: ~7.5%) plus THC token rewards
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
            <AlertDescription>Your SOL has been staked successfully. It may take up to one epoch (2-3 days) for rewards to begin accruing.</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleStake}>
          <div className="space-y-2">
            <Label htmlFor="stakeAmount">Amount to Stake (SOL)</Label>
            <Input
              id="stakeAmount"
              type="number"
              step="0.01"
              min="0.1"
              placeholder="1.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">Minimum stake: 0.1 SOL</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm mt-4 mb-4">
            <div className="flex items-center text-blue-800 dark:text-blue-300 font-medium mb-1">
              <ArrowDownUp className="h-4 w-4 mr-2" />
              Dual Rewards
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              By staking with the Trade Hybrid validator, you'll earn both standard SOL staking rewards
              (~7.5% APY) and bonus THC tokens (5 THC per 100 SOL staked per month).
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Processing...
              </>
            ) : (
              'Stake SOL'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};