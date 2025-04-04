import React, { useState, useEffect } from 'react';
import { Wallet, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { CryptoWalletOnboardingModal } from './crypto-wallet-onboarding-modal';

// Import Solana wallet adapter components
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface SimpleWalletStatusProps {
  className?: string;
}

export function SimpleWalletStatus({ className }: SimpleWalletStatusProps) {
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Get Solana wallet from the wallet adapter
  const { connected, publicKey, disconnect } = useWallet();
  
  // Format public key for display
  const formattedAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` 
    : '';

  const handleConnect = () => {
    setShowWalletModal(true);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <>
      {connected ? (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center justify-between w-full border-slate-700 bg-slate-800/40 hover:bg-slate-800",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Wallet className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-left">
              <span className="text-xs font-mono">{formattedAddress}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-2 text-slate-400 hover:text-red-400 hover:bg-slate-700"
            onClick={handleDisconnect}
          >
            <ExternalLink size={12} />
          </Button>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full border-slate-700 hover:bg-slate-800 flex items-center gap-2",
            className
          )}
          onClick={handleConnect}
        >
          <Wallet size={16} className="mr-1" />
          <span>Connect Wallet</span>
        </Button>
      )}
      
      <CryptoWalletOnboardingModal 
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}