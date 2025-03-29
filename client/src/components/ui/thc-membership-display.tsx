import React, { useEffect, useState } from 'react';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Coins, ShieldCheck, Star } from 'lucide-react';
import { useSolanaAuth, MembershipTier } from '@/lib/context/SolanaAuthProvider';
import { THC_TOKEN } from '@/lib/constants';

// Helper function to safely get features based on tier
function getTierFeatures(tier: MembershipTier): string[] {
  const tierKey = tier.toLowerCase();
  
  switch (tierKey) {
    case 'elite':
      return THC_TOKEN.membership.elite.features;
    case 'premium':
      return THC_TOKEN.membership.premium.features;
    case 'advanced':
      return THC_TOKEN.membership.advanced.features;
    case 'basic':
    default:
      return THC_TOKEN.membership.basic.features;
  }
}

export function THCMembershipDisplay() {
  const { isWalletAuthenticated, tokenMembership, checkTHCTokenMembership } = useSolanaAuth();
  const [isChecking, setIsChecking] = useState(false);

  // Check membership when component mounts and wallet is authenticated
  useEffect(() => {
    if (isWalletAuthenticated) {
      handleCheckMembership();
    }
  }, [isWalletAuthenticated]);

  const handleCheckMembership = async () => {
    setIsChecking(true);
    try {
      await checkTHCTokenMembership();
    } catch (error) {
      console.error('Error checking membership:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Return null if not authenticated or no membership
  if (!isWalletAuthenticated || !tokenMembership) {
    return null;
  }

  // Define tier-specific UI elements
  const getTierIcon = (tier: MembershipTier) => {
    switch (tier) {
      case MembershipTier.ELITE:
        return <Star className="h-5 w-5 text-yellow-500" />;
      case MembershipTier.PREMIUM:
        return <ShieldCheck className="h-5 w-5 text-purple-500" />;
      case MembershipTier.ADVANCED:
        return <ShieldCheck className="h-5 w-5 text-blue-500" />;
      default:
        return <Coins className="h-5 w-5 text-slate-400" />;
    }
  };

  const getTierColor = (tier: MembershipTier) => {
    switch (tier) {
      case MembershipTier.ELITE:
        return 'bg-yellow-950/30 text-yellow-500 border-yellow-900';
      case MembershipTier.PREMIUM:
        return 'bg-purple-950/30 text-purple-500 border-purple-900';
      case MembershipTier.ADVANCED:
        return 'bg-blue-950/30 text-blue-500 border-blue-900';
      default:
        return 'bg-slate-950/30 text-slate-400 border-slate-800';
    }
  };

  const getTierName = (tier: MembershipTier) => {
    switch (tier) {
      case MembershipTier.ELITE:
        return 'Elite';
      case MembershipTier.PREMIUM:
        return 'Premium';
      case MembershipTier.ADVANCED:
        return 'Advanced';
      default:
        return 'Basic';
    }
  };

  return (
    <div className="flex items-center">
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 px-2 py-1 ${getTierColor(tokenMembership.tier)}`}
      >
        {getTierIcon(tokenMembership.tier)}
        <span>{getTierName(tokenMembership.tier)}</span>
      </Badge>
      
      <div className="ml-2 text-xs text-slate-400">
        {tokenMembership.tokenBalance.toLocaleString()} THC
      </div>
    </div>
  );
}

export function THCMembershipCard() {
  const { tokenMembership, isWalletAuthenticated } = useSolanaAuth();

  if (!isWalletAuthenticated || !tokenMembership) {
    return null;
  }

  const tierName = tokenMembership.tier.charAt(0).toUpperCase() + tokenMembership.tier.slice(1).toLowerCase();
  const discountPercent = Math.round(tokenMembership.feeDiscount * 100);
  const tierFeatures = getTierFeatures(tokenMembership.tier);
  
  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden relative">
      <div className={`absolute top-0 right-0 h-24 w-24 opacity-10 transform translate-x-8 -translate-y-4`}>
        {tokenMembership.tier === MembershipTier.ELITE && (
          <Star className="h-full w-full text-yellow-500" />
        )}
        {tokenMembership.tier === MembershipTier.PREMIUM && (
          <ShieldCheck className="h-full w-full text-purple-500" />
        )}
        {tokenMembership.tier === MembershipTier.ADVANCED && (
          <ShieldCheck className="h-full w-full text-blue-500" />
        )}
        {tokenMembership.tier === MembershipTier.BASIC && (
          <Coins className="h-full w-full text-slate-500" />
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{tierName} Membership</span>
          <Badge variant="outline" className={`ml-2 ${
            tokenMembership.tier === MembershipTier.ELITE 
              ? 'bg-yellow-950/30 text-yellow-500 border-yellow-900'
              : tokenMembership.tier === MembershipTier.PREMIUM 
                ? 'bg-purple-950/30 text-purple-500 border-purple-900'
                : tokenMembership.tier === MembershipTier.ADVANCED
                  ? 'bg-blue-950/30 text-blue-500 border-blue-900'
                  : 'bg-slate-950/30 text-slate-400 border-slate-800'
          }`}>
            {discountPercent}% Fee Discount
          </Badge>
        </CardTitle>
        <CardDescription>
          Balance: {tokenMembership.tokenBalance.toLocaleString()} THC
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Membership Benefits:</h4>
          <ul className="text-sm space-y-1">
            {tierFeatures.map((feature: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                {feature}
              </li>
            ))}
          </ul>
          
          {tokenMembership.tier !== MembershipTier.ELITE && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Upgrade your membership by acquiring more THC tokens on{' '}
                <a 
                  href={THC_TOKEN.pumpFunUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  pump.fun
                </a>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}