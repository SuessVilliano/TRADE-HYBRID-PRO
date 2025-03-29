import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaAuth } from '@/lib/context/SolanaAuthProvider';
import { Wallet } from 'lucide-react';

/**
 * Simple wallet status indicator component
 * Enhances the standard WalletMultiButton with auth integration
 */
export function WalletStatusIndicator() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const { isWalletAuthenticated, loginWithSolana } = useSolanaAuth();
  const [isPhantomDetected, setIsPhantomDetected] = useState(false);
  
  // Check if Phantom wallet is available in browser
  useEffect(() => {
    // Safe check for window.solana with TypeScript
    const solanaObj = window as any;
    const checkPhantomWallet = () => {
      const isPhantomAvailable = 
        solanaObj.solana && 
        solanaObj.solana.isPhantom;
      
      setIsPhantomDetected(!!isPhantomAvailable);
      
      // Log for debugging
      console.log("Phantom wallet availability check:", {
        exists: !!isPhantomAvailable,
        connectMethod: typeof solanaObj.solana?.connect
      });
    };
    
    checkPhantomWallet();
    // Check periodically in case wallet is injected after page load
    const interval = setInterval(checkPhantomWallet, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle wallet authentication
  useEffect(() => {
    if (connected && publicKey && !isWalletAuthenticated) {
      // If wallet connected but not authenticated in our app, try to log in
      loginWithSolana()
        .catch(error => {
          console.error("Auto wallet login failed:", error);
        });
    }
  }, [connected, publicKey, isWalletAuthenticated, loginWithSolana]);
  
  // Get shortened address display for connected wallet
  const getShortAddress = () => {
    if (!publicKey) return "";
    const address = publicKey.toString();
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // Simple visual indicator for authenticated status
  const AuthStatus = () => {
    if (!connected || !publicKey) return null;
    
    return (
      <div className="ml-2 flex items-center">
        <div 
          className={`h-2 w-2 rounded-full ${isWalletAuthenticated ? 'bg-green-500' : 'bg-amber-500'}`} 
          title={isWalletAuthenticated ? "Authenticated" : "Authentication pending"}
        />
      </div>
    );
  };
  
  return (
    <div className="flex items-center">
      <WalletMultiButton className="wallet-adapter-button-custom max-w-[180px] text-sm px-3 py-1">
        {connected && publicKey ? getShortAddress() : "Connect Wallet"}
      </WalletMultiButton>
      <AuthStatus />
    </div>
  );
}