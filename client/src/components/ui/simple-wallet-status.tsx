import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from './button';
import { CryptoWalletOnboardingModal } from './crypto-wallet-onboarding-modal';

interface SimpleWalletStatusProps {
  isConnected?: boolean;
  walletAddress?: string;
  className?: string;
}

export function SimpleWalletStatus({ 
  isConnected = false, 
  walletAddress, 
  className = ''
}: SimpleWalletStatusProps) {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connected, setConnected] = useState(isConnected);
  
  // Mock wallet address if not provided
  const displayAddress = walletAddress || (connected ? "0x7F5e...4C93" : undefined);
  
  // Function to truncate address for display
  const truncateAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const handleOpenModal = () => {
    setShowWalletModal(true);
  };
  
  const handleCloseModal = () => {
    setShowWalletModal(false);
    // Simulate successful connection when modal closes
    setConnected(true);
  };

  return (
    <div className={`${className}`}>
      {connected ? (
        <div className="flex items-center gap-2 bg-secondary/40 rounded-md p-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">{truncateAddress(displayAddress || '')}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-7 px-2"
            onClick={handleOpenModal}
          >
            Change
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center gap-2"
          onClick={handleOpenModal}
        >
          <Wallet size={14} />
          Connect Wallet
        </Button>
      )}
      
      <CryptoWalletOnboardingModal
        isOpen={showWalletModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}