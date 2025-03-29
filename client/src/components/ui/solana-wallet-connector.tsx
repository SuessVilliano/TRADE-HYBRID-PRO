import { FC, useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SolanaWalletConnector: FC = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format wallet address for display
  const formatWalletAddress = (address: PublicKey | null): string => {
    if (!address) return '';
    const addressStr = address.toString();
    return `${addressStr.substring(0, 4)}...${addressStr.substring(addressStr.length - 4)}`;
  };

  // Log the current wallet connection state for debugging
  useEffect(() => {
    // Check both detection methods for Phantom wallet
    const phantomNewExists = typeof window !== 'undefined' && 
      'phantom' in window && 
      !!(window as any).phantom?.solana;
      
    const phantomChromeExists = typeof window !== 'undefined' && 
      'solana' in window && 
      !!(window as any).solana?.isPhantom;
    
    const isPhantomAvailable = phantomNewExists || phantomChromeExists;

    console.log('Wallet connection state:', { 
      connected, 
      publicKey: publicKey?.toString(),
      isPhantomAvailable,
      phantomNewExists,
      phantomChromeExists
    });
  }, [connected, publicKey]);

  // Fetch SOL balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !connection) {
        setBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get actual SOL balance from the blockchain
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
        
        console.log('Fetched SOL balance:', balance / LAMPORTS_PER_SOL);
        
        // Token data - in a real application, you would fetch this from the chain
        // For now, we'll use placeholder data that clearly indicates it will be replaced
        // with real token data in production
        setTokens([
          { symbol: "THC", name: "Trade Hybrid Coin", balance: 0, value: 0 },
          { symbol: "USDC", name: "USD Coin", balance: 0, value: 0 },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setIsLoading(false);
      }
    };

    if (connected && publicKey) {
      fetchBalance();
    }
  }, [publicKey, connected, connection]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Solana Wallet
          {connected && publicKey && (
            <Badge variant="outline" className="ml-2">
              {formatWalletAddress(publicKey)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your Solana wallet to trade directly from the DEX
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {connected ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">SOL Balance</div>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : balance === null ? "Unknown" : `${balance.toFixed(4)}`}
                </div>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <div className="text-sm text-muted-foreground">THC Balance</div>
                <div className="text-2xl font-bold">
                  {isLoading ? "Loading..." : tokens.find(t => t.symbol === "THC")?.balance || 0}
                </div>
              </div>
            </div>
            
            {tokens.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Tokens</h3>
                <div className="border rounded-lg divide-y">
                  {tokens.map((token, i) => (
                    <div key={i} className="p-2 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                      <div className="text-right">
                        <div>{token.balance.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          ${token.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-4">
            <p className="mb-4 text-muted-foreground">
              Connect your wallet to view your balances and start trading with low fees.
            </p>
            {(typeof window !== 'undefined' && 
              (('phantom' in window && !!(window as any).phantom?.solana) || 
               ('solana' in window && !!(window as any).solana?.isPhantom))) ? (
              <p className="text-sm text-green-500">Phantom wallet detected!</p>
            ) : (
              <p className="text-sm text-yellow-500">No Phantom wallet detected. Please install the browser extension.</p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {connected ? (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => disconnect()}>Disconnect</Button>
            <Button>Trade Now</Button>
          </div>
        ) : (
          <WalletMultiButton />
        )}
      </CardFooter>
    </Card>
  );
};