import { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SolanaWalletConnector: FC = () => {
  const { publicKey, connected, disconnect } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format wallet address for display
  const formatWalletAddress = (address: PublicKey | null): string => {
    if (!address) return '';
    const addressStr = address.toString();
    return `${addressStr.substring(0, 4)}...${addressStr.substring(addressStr.length - 4)}`;
  };

  // Fetch SOL balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(null);
        return;
      }

      try {
        setIsLoading(true);
        // This would normally use the connection from ConnectionProvider
        // For this example, we'll use mock data for now
        // In production, use:
        // const { connection } = useConnection();
        // const balance = await connection.getBalance(publicKey);
        
        // Mock data for now
        const mockBalance = 2.5 * LAMPORTS_PER_SOL;
        setBalance(mockBalance / LAMPORTS_PER_SOL);
        
        // Mock token data
        setTokens([
          { symbol: "THC", name: "Trade Hybrid Coin", balance: 1000, value: 2000 },
          { symbol: "USDC", name: "USD Coin", balance: 500, value: 500 },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [publicKey]);

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
                  {tokens.find(t => t.symbol === "THC")?.balance || 0}
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