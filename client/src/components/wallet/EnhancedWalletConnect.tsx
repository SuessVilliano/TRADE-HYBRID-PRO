import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wallet, Key, Loader2, ExternalLink, ChevronRight, Copy, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConnectWalletButton } from './ConnectWalletButton';
import { useUserData } from '@/lib/contexts/UserDataContext';
import { useToast } from '@/components/ui/use-toast';
import { formatShortAddress } from '@/lib/utils/formatters';

// Alias formatShortAddress as truncateString for compatibility
const truncateString = formatShortAddress;

/**
 * Enhanced Wallet Connect component that supports both Phantom and Web3Auth
 */
export function EnhancedWalletConnect() {
  const { user, refreshWallet } = useUserData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('phantom');
  const [isWeb3Loading, setIsWeb3Loading] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Wallet address copied to clipboard',
    });
  };
  
  const openInExplorer = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank');
  };
  
  const handleConnectWeb3Auth = async () => {
    try {
      setIsWeb3Loading(true);
      
      // Simulating Web3Auth connection while we implement the actual service
      setTimeout(() => {
        toast({
          title: 'Web3Auth Connection',
          description: 'Web3Auth connection coming soon. Please use Phantom for now.',
        });
        setIsWeb3Loading(false);
      }, 1000);
      
      // TODO: Replace with actual Web3Auth integration
      // This would connect to the backend service we've implemented
    } catch (error) {
      console.error('Web3Auth connection error:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect with Web3Auth. Please try again.',
        variant: 'destructive',
      });
      setIsWeb3Loading(false);
    }
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your Solana wallet to access Trade Hybrid features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {user.wallet.walletConnected ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-medium text-green-800 dark:text-green-300">Wallet Connected</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your {user.wallet.provider} wallet is connected to Trade Hybrid.
              </p>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Wallet Address</div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(user.wallet.address || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openInExplorer(user.wallet.address || '')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="font-mono text-sm mt-1">{truncateString(user.wallet.address || '', 16, 8)}</div>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={refreshWallet}
            >
              Refresh Wallet Data
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="warning" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Wallet Required</AlertTitle>
              <AlertDescription>
                A connected wallet is required to access Trade Hybrid's features.
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="phantom" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phantom">Phantom</TabsTrigger>
                <TabsTrigger value="web3auth">Web3Auth</TabsTrigger>
              </TabsList>
              
              <TabsContent value="phantom" className="space-y-4 py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with Phantom, the popular Solana wallet extension.
                  </p>
                  
                  <ConnectWalletButton
                    variant="default"
                    size="lg"
                    text="Connect Phantom Wallet"
                    onSuccess={() => refreshWallet()}
                    className="mx-auto"
                  />
                  
                  <div className="mt-4 text-xs text-muted-foreground">
                    <a
                      href="https://phantom.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center hover:underline"
                    >
                      Don't have Phantom? Install it
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="web3auth" className="space-y-4 py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with Web3Auth using your email, social media, or other accounts.
                  </p>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={isWeb3Loading}
                    onClick={handleConnectWeb3Auth}
                    className="w-full"
                  >
                    {isWeb3Loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Connect with Web3Auth
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 text-xs text-muted-foreground">
                    <a
                      href="https://web3auth.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center hover:underline"
                    >
                      Learn more about Web3Auth
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-stretch">
        <p className="text-xs text-muted-foreground mb-3">
          Your wallet is used to interact with the Solana blockchain and manage your THC tokens.
        </p>
        
        {user.wallet.walletConnected && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => window.location.href = '/profile'}
          >
            Go to Profile
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default EnhancedWalletConnect;