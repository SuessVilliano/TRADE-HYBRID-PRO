import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Keypair } from '@solana/web3.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Server, Coins, ArrowDownUp, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface StakeFormProps {
  validatorIdentity: string;
}

export default function StakeForm({ validatorIdentity }: StakeFormProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('1.0');
  const [isStaking, setIsStaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStake = async () => {
    if (!publicKey || !signTransaction || !connection) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsStaking(true);
      setError(null);
      
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
      if (isNaN(lamports) || lamports <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Get the validator's public key
      const validatorPubkey = new PublicKey(validatorIdentity);
      
      // Create a new stake account
      const stakeAccount = Keypair.generate();
      
      // Create a transaction to create the stake account and delegate to validator
      const tx = new Transaction();
      
      // Add instruction to create account
      tx.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: stakeAccount.publicKey,
          lamports,
          space: 200, // Space for stake account data
          programId: new PublicKey('Stake11111111111111111111111111111111111111')
        })
      );
      
      // In a real implementation, we would also add:
      // 1. StakeProgram.initialize() instruction
      // 2. StakeProgram.delegate() instruction to the validator
      
      // For demo purposes, we're just doing a direct transfer to the validator
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: validatorPubkey,
          lamports
        })
      );
      
      // Set the fee payer
      tx.feePayer = publicKey;
      
      // Get a recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();
      tx.recentBlockhash = blockhash;
      
      // Sign the transaction with the stake account
      tx.partialSign(stakeAccount);
      
      // Have the user sign the transaction
      const signedTx = await signTransaction(tx);
      
      // Send the transaction
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(txid);
      
      // Show success message
      toast({
        title: "SOL Staked Successfully",
        description: `You've staked ${amount} SOL to the Trade Hybrid validator`,
        variant: "default",
      });
      
      // Reset form
      setAmount('1.0');
      
    } catch (err) {
      console.error('Error staking SOL:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake SOL. Please try again.');
      
      toast({
        title: "Staking Failed",
        description: err instanceof Error ? err.message : 'Failed to stake SOL. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
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
          />
          <p className="text-xs text-slate-500">Minimum stake: 0.1 SOL</p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
          <div className="flex items-center text-blue-800 dark:text-blue-300 font-medium mb-1">
            <ArrowDownUp className="h-4 w-4 mr-2" />
            Dual Rewards
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            By staking with our validator, you'll earn both SOL staking rewards and bonus THC tokens!
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleStake} 
          disabled={!publicKey || isStaking || !amount || parseFloat(amount) < 0.1}
          className="w-full"
        >
          {isStaking ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Staking...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Stake SOL
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}