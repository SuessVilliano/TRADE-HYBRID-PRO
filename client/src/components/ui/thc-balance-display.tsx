import React from 'react';
import { useUserStore } from '../../lib/stores/useUserStore';
import { formatCurrency } from '../../lib/utils';
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
  const { user } = useUserStore();
  
  if (!user) return null;
  
  // For display purposes, format the balance with the appropriate currency symbol
  const formattedBalance = formatCurrency(user.balance.THC, { 
    currency: 'THC',
    notation: compact ? 'compact' : 'standard',
  });
  
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