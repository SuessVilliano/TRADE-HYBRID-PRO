import React, { useState } from 'react';
import { Button } from './button';
import { useUserStore } from '../../lib/stores/useUserStore';

// Simple wallet connect component (simulating Web3Auth functionality)
export function WalletConnectWeb3Auth() {
  const { login, logout } = useUserStore();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.00');

  // Connect wallet (simulated)
  const connectWallet = async () => {
    try {
      setConnecting(true);
      
      // Simulate connection delay
      setTimeout(() => {
        setConnected(true);
        setConnecting(false);
        
        // Simulate a wallet address
        const simulatedAddress = '8xFH2PF5MKQAmUW2q91fdPBKwGKdCdGhYqNhVmLrgiWz';
        setAddress(simulatedAddress);
        setBalance('15.75');
        
        // Login the user
        login(`wallet_${Date.now()}@example.com`, 'password123');
        
        console.log('Web3Auth wallet connected (simulated)');
      }, 1500);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnecting(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setConnected(false);
    setAddress('');
    setBalance('0.00');
    logout();
    console.log('Wallet disconnected');
  };
  
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Render wallet connection button or connected state
  return (
    <div className="relative">
      {connected && address ? (
        // Connected state
        <div className="flex flex-col gap-2">
          <div 
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer border border-border"
            onClick={disconnectWallet}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1 truncate">
              <div className="font-medium">{formatAddress(address)}</div>
              <div className="text-xs text-muted-foreground">
                {balance} SOL
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Not connected state
        <Button
          variant="outline"
          className="w-full"
          onClick={connectWallet}
          disabled={connecting}
        >
          {connecting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Connect Wallet</span>
            </div>
          )}
        </Button>
      )}
    </div>
  );
}