import React, { useState, useEffect } from 'react';
import { Wallet, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useSolanaAuth } from '../../lib/context/SolanaAuthProvider';
import { useToast } from '../ui/use-toast';

interface ConnectWalletButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: string;
  loadingText?: string;
  icon?: boolean;
}

export function ConnectWalletButton({
  className = '',
  variant = 'default',
  size = 'default',
  onSuccess,
  onError,
  text = 'Connect Wallet',
  loadingText = 'Connecting...',
  icon = true
}: ConnectWalletButtonProps) {
  const [isAttemptingConnection, setIsAttemptingConnection] = useState(false);
  const [isPhantomDetected, setIsPhantomDetected] = useState(false);
  const { walletConnected, isAuthenticating, error, connectAndAuthenticate } = useSolanaAuth();
  const { toast } = useToast();

  // Check if Phantom is available
  useEffect(() => {
    const checkPhantomAvailability = () => {
      const isPhantomAvailable = !!(window as any).phantom?.solana || !!(window as any).solana?.isPhantom;
      setIsPhantomDetected(isPhantomAvailable);
    };

    checkPhantomAvailability();
    
    // Re-check if phantom becomes available (e.g., after extension install)
    const interval = setInterval(checkPhantomAvailability, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsAttemptingConnection(true);
    
    if (!isPhantomDetected) {
      const errorMessage = "Phantom wallet is not installed";
      toast({
        title: "Wallet Not Found",
        description: "Please install the Phantom wallet browser extension and refresh the page",
        variant: "destructive"
      });
      
      if (onError) {
        onError(errorMessage);
      }
      
      // Open Phantom website in a new tab
      window.open('https://phantom.app/', '_blank');
      setIsAttemptingConnection(false);
      return;
    }
    
    try {
      const success = await connectAndAuthenticate();
      
      if (success) {
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to your wallet",
          variant: "default"
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorMessage = error || "Failed to connect wallet";
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error connecting wallet";
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsAttemptingConnection(false);
    }
  };

  // If wallet is already connected, show a connected state
  if (walletConnected) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 ${className}`}
        disabled
      >
        {icon && <Wallet className="mr-2 h-4 w-4" />}
        Wallet Connected
      </Button>
    );
  }

  // Show connecting state
  const isLoading = isAttemptingConnection || isAuthenticating;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleConnect}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <Wallet className="mr-2 h-4 w-4" />}
          {text}
        </>
      )}
    </Button>
  );
}

export default ConnectWalletButton;