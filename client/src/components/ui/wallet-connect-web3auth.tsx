import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { useUserStore } from '../../lib/stores/useUserStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from './use-toast';
import { MoralisService } from '../../lib/services/moralis-service';

// Wallet connection component with Phantom and Web3Auth integration
export function WalletConnectWeb3Auth() {
  const { login, logout, updateUser } = useUserStore();
  const { toast } = useToast();
  
  // Use the Solana wallet adapter 
  const { publicKey, connected, disconnect, connect } = useWallet();
  
  // Local state for UI handling
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<string>('0.00');
  const [thcBalance, setThcBalance] = useState<string>('0');
  
  // Moralis service for getting wallet data
  const moralisService = new MoralisService();
  
  // Effect to fetch wallet balances when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletData(publicKey.toString());
    }
  }, [connected, publicKey]);
  
  // Fetch wallet data including SOL and THC balances
  const fetchWalletData = async (address: string) => {
    try {
      setLoading(true);
      console.log('Fetching wallet data for address:', address);
      
      // Initialize the Moralis service
      await moralisService.initialize();
      
      // Get wallet balances
      const solBalanceResult = await moralisService.getSOLBalance(address);
      const thcBalanceResult = await moralisService.getTHCBalance(address);
      
      // Update state with balances
      setSolBalance(parseFloat(solBalanceResult.balance).toFixed(2));
      setThcBalance(parseFloat(thcBalanceResult.balance).toFixed(0));
      
      console.log('Wallet data loaded:', {
        solBalance: solBalanceResult.balance,
        thcBalance: thcBalanceResult.balance
      });
      
      // Store wallet address in user store
      updateUser({
        walletAddress: address,
        walletAuthEnabled: true
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setLoading(false);
      
      toast({
        title: "Error Loading Wallet Data",
        description: "Could not load wallet balances. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  // Connect wallet 
  const connectWallet = async () => {
    try {
      setConnecting(true);
      
      // Check if phantom is available
      const hasModernPhantom = !!(window as any).phantom?.solana;
      const hasLegacyPhantom = !!(window as any).solana?.isPhantom;
      
      if (!hasModernPhantom && !hasLegacyPhantom) {
        toast({
          title: "Wallet Not Detected",
          description: "Please install the Phantom wallet extension and reload the page",
          variant: "destructive"
        });
        
        // Open Phantom website in a new tab for convenience
        window.open('https://phantom.app/', '_blank');
        setConnecting(false);
        return;
      }
      
      // Use wallet adapter connect method
      if (connect) {
        await connect();
        console.log('Connected to wallet:', publicKey?.toString());
        
        // Login the user - create an account based on wallet
        if (publicKey) {
          const walletAddress = publicKey.toString();
          login({
            id: `wallet-${walletAddress.slice(0, 8)}`,
            walletAddress,
            username: `user_${walletAddress.slice(0, 6)}`,
            role: 'user'
          });
        }
      }
      
      setConnecting(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnecting(false);
      
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    try {
      if (disconnect) {
        disconnect();
      }
      
      setSolBalance('0.00');
      setThcBalance('0');
      logout();
      
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };
  
  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Render wallet connection button or connected state
  return (
    <div className="relative">
      {connected && publicKey ? (
        // Connected state
        <div className="flex flex-col gap-2">
          <div 
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer border border-border"
            onClick={disconnectWallet}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1 truncate">
              <div className="font-medium">{formatAddress(publicKey.toString())}</div>
              <div className="flex flex-col text-xs text-muted-foreground">
                <span>{solBalance} SOL</span>
                <span>{thcBalance} THC</span>
              </div>
            </div>
            {loading && (
              <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
            )}
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