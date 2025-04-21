import React, { useState, useEffect } from 'react';
import { Wallet, ExternalLink, Copy, CheckCircle2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useSolanaAuth } from '../../lib/context/SolanaAuthProvider';
import { ConnectWalletButton } from './ConnectWalletButton';
import { useToast } from '../ui/use-toast';

interface WalletConnectionPanelProps {
  className?: string;
}

export function WalletConnectionPanel({ className = '' }: WalletConnectionPanelProps) {
  const [copied, setCopied] = useState(false);
  const { walletConnected, walletAddress, logoutFromSolana } = useSolanaAuth();
  const { toast } = useToast();

  // Truncate wallet address for display
  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open Solana Explorer
  const openExplorer = () => {
    if (walletAddress) {
      window.open(`https://explorer.solana.com/address/${walletAddress}`, '_blank');
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    try {
      await logoutFromSolana();
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
        variant: "default",
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      
      toast({
        title: "Disconnection Error",
        description: "There was an error disconnecting your wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`${className} w-full max-w-md`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Solana Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your Solana wallet to access staking and validator functions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {walletConnected ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Wallet Connected</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {truncateAddress(walletAddress)}
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={copyAddress}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={openExplorer}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium mb-1">
                <Shield className="h-4 w-4" />
                <span>Validator Functions</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can now access the validator dashboard and validator staking functions.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Connect your Phantom wallet to access validator functions, stake SOL, and earn dual rewards.
              </p>
            </div>
            
            <ConnectWalletButton
              className="w-full"
              variant="default"
              text="Connect Phantom Wallet"
            />
          </div>
        )}
      </CardContent>
      
      {walletConnected && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDisconnect}
          >
            Disconnect Wallet
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default WalletConnectionPanel;