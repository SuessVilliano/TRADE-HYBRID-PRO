import React from 'react';
import { useUserStore } from '../../lib/stores/useUserStore';
import { formatCurrency, formatCompactNumber } from '../../lib/utils';
import { NFT_CONFIG } from '../../lib/constants';

interface THCBalanceDisplayProps {
  showIcon?: boolean;
  showLabel?: boolean;
  compact?: boolean;
  className?: string;
}

export default function THCBalanceDisplay({
  showIcon = true,
  showLabel = true,
  compact = false,
  className = '',
}: THCBalanceDisplayProps) {
  const { user, demoBalances } = useUserStore();
  
  // Ensure user exists before rendering
  if (!user) return null;
  
  // Find THC balance in demo balances array, this replaces the direct user.balance property access
  const thcAsset = demoBalances.find(asset => asset.asset === 'THC');
  const thcBalance = thcAsset?.total || 0;
  
  // For display purposes, format the balance with the appropriate currency symbol
  let formattedBalance: string;
  if (compact) {
    formattedBalance = formatCompactNumber(thcBalance) + ' THC';
  } else {
    formattedBalance = formatCurrency(thcBalance, 'THC');
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
          ₮
        </div>
      )}
      <div>
        {showLabel && (
          <div className="text-xs text-slate-400">
            {NFT_CONFIG.TOKEN_NAME}
          </div>
        )}
        <div className="font-bold">
          {formattedBalance}
        </div>
      </div>
    </div>
  );
}