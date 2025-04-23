import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent } from "../ui/card";
import { Sparkles, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function NftBoostIndicator() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [hasBoost, setHasBoost] = useState(false);
  const [boostPercentage, setBoostPercentage] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkForBoostNft = async () => {
      if (!publicKey || !connection) return;
      
      try {
        setIsLoading(true);
        
        // In a production environment, we'd fetch the user's NFTs and check if they own the boost NFT
        // For demo purposes, we're simulating this check
        
        // Simulating a network request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Randomly determine if the user has the boost NFT (for demo purposes)
        // In production, this would be a real check against the blockchain
        const mockHasBoost = Math.random() > 0.5;
        
        setHasBoost(mockHasBoost);
        
        // If they have a boost, determine what tier (for tiered NFTs)
        if (mockHasBoost) {
          // Randomly assign a boost percentage (Gold = 30%, Silver = 20%, Bronze = 10%)
          const boostTiers = [10, 20, 30];
          const randomTier = Math.floor(Math.random() * boostTiers.length);
          setBoostPercentage(boostTiers[randomTier]);
        }
      } catch (error) {
        console.error("Error checking for boost NFT:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (publicKey) {
      checkForBoostNft();
    } else {
      // Reset state when wallet disconnects
      setHasBoost(false);
    }
  }, [publicKey, connection]);

  if (!publicKey) {
    return null; // Don't show anything if wallet not connected
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-slate-400">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Checking for NFT boost...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasBoost) {
    return (
      <Card className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <Sparkles className="h-5 w-5 mr-2 text-slate-400" />
              No APR boost NFT detected
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Info className="h-4 w-4 text-slate-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Purchase a Trade Hybrid NFT to boost your staking rewards by up to 30%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            🔥 NFT Boost Active: +{boostPercentage}% APR
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Info className="h-4 w-4 text-green-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Your Trade Hybrid NFT is boosting your staking rewards by {boostPercentage}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}