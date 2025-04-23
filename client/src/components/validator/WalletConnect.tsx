import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { Wallet, ExternalLink } from 'lucide-react';

export default function WalletConnect() {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const [phantomInstalled, setPhantomInstalled] = useState(false);

  useEffect(() => {
    // Check if Phantom wallet is available
    const checkPhantomWallet = () => {
      try {
        const hasModernPhantom = !!(window as any).phantom?.solana;
        const hasLegacyPhantom = !!(window as any).solana?.isPhantom;
        
        if (hasModernPhantom || hasLegacyPhantom) {
          console.log("Phantom wallet is available");
          setPhantomInstalled(true);
        } else {
          console.log("Phantom wallet is not installed");
          setPhantomInstalled(false);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
        setPhantomInstalled(false);
      }
    };
    
    checkPhantomWallet();
  }, []);

  const handleInstallPhantom = () => {
    window.open('https://phantom.app/', '_blank');
    
    toast({
      title: "Install Phantom Wallet",
      description: "After installing Phantom, please refresh this page.",
      variant: "default",
    });
  };

  // If wallet is connected, show the public key
  if (connected && publicKey) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-700 dark:text-green-300 font-medium">Wallet Connected</span>
            </div>
            
            <div className="flex items-center bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs">
              <span className="font-mono">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </span>
            </div>
            
            <div className="ml-auto">
              <WalletMultiButton className="!bg-transparent !text-green-700 dark:!text-green-300 !border !border-green-200 dark:!border-green-700 hover:!bg-green-100 dark:hover:!bg-green-800/30 !h-8 !rounded-md !text-sm !py-0 !px-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If Phantom is not installed, show install button
  if (!phantomInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            To start staking, you need to install the Phantom wallet extension.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleInstallPhantom} className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Install Phantom Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default: Show connect button
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>
          Connect your Solana wallet to stake SOL and earn dual rewards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WalletMultiButton className="w-full !bg-primary !h-10 !rounded-md !text-sm !py-2 !px-4" />
      </CardContent>
    </Card>
  );
}