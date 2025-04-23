import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Sparkles, ExternalLink, ImageIcon, Lock, Trophy } from 'lucide-react';
// Solana auth will be passed as props

type NftBoostTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

interface NftBoostIndicatorProps {
  solanaAuth?: any; // Optional prop for Solana auth
}

export default function NftBoostIndicator({ solanaAuth }: NftBoostIndicatorProps) {
  // If no solanaAuth is provided, assume not connected
  const isWalletConnected = solanaAuth?.walletConnected || false;
  
  // In a real app, this would come from the user's wallet/account
  const [nftBoostTier, setNftBoostTier] = useState<NftBoostTier>('silver');
  const [boostMultiplier, setBoostMultiplier] = useState(1.25); // 25% boost
  
  // NFT tiers and their multipliers
  const nftTiers = {
    none: { name: 'None', multiplier: 1.0, color: 'gray' },
    bronze: { name: 'Bronze', multiplier: 1.1, color: 'amber' },
    silver: { name: 'Silver', multiplier: 1.25, color: 'blue' },
    gold: { name: 'Gold', multiplier: 1.5, color: 'yellow' },
    platinum: { name: 'Platinum', multiplier: 2.0, color: 'purple' }
  };
  
  const currentTier = nftTiers[nftBoostTier];
  const progressValue = (currentTier.multiplier - 1) * 100; // 0-100% scale
  
  return (
    <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl text-white">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
            NFT Boost
          </CardTitle>
          {nftBoostTier !== 'none' && (
            <Badge 
              className={`bg-${currentTier.color}-600 hover:bg-${currentTier.color}-700`}
            >
              {currentTier.name} Tier
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-300">
          Your NFT collection increases validator rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-black/40 border border-purple-500/20 rounded-md p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-14 w-14 rounded-md bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                {nftBoostTier !== 'none' ? (
                  <Trophy className="h-8 w-8 text-yellow-300" />
                ) : (
                  <Lock className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">
                  {nftBoostTier !== 'none' ? 'THC Validator NFT' : 'No Active NFT Boost'}
                </h3>
                <div className="text-xs text-gray-400">
                  {nftBoostTier !== 'none' ? (
                    <>Collection: Trade Hybrid Champions</>
                  ) : (
                    <>Purchase an NFT to multiply your rewards</>
                  )}
                </div>
              </div>
            </div>
            
            {nftBoostTier !== 'none' && (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {(currentTier.multiplier * 100 - 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Reward Boost</div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>Boost Multiplier</span>
              <span>{currentTier.multiplier.toFixed(2)}x</span>
            </div>
            <Progress value={progressValue} max={100} className="h-2 bg-gray-700" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Base (1.0x)</span>
              <span className="text-gray-400">Max (2.0x)</span>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-400 flex items-center justify-center">
            <a href="#" className="inline-flex items-center text-blue-400 hover:text-blue-300">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>View NFT Collection</span>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}