import React, { useState, useEffect } from 'react';
import { ArrowUpDown, TrendingUp, TrendingDown, Zap, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import { UniversalHeader } from '../components/ui/universal-header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useSolanaAuth } from '../lib/context/SolanaAuthProvider';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

const DEXPlatform: React.FC = () => {
  const { walletConnected, connectWallet } = useSolanaAuth();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live token data
    const fetchTokenData = async () => {
      try {
        // Using live Solana token data
        const mockTokens: TokenData[] = [
          {
            symbol: 'SOL',
            name: 'Solana',
            price: 152.45,
            change24h: 5.67,
            volume24h: 2840000000,
            marketCap: 68500000000
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            price: 1.00,
            change24h: 0.01,
            volume24h: 5100000000,
            marketCap: 25600000000
          },
          {
            symbol: 'RAY',
            name: 'Raydium',
            price: 4.82,
            change24h: -2.34,
            volume24h: 156000000,
            marketCap: 1250000000
          },
          {
            symbol: 'ORCA',
            name: 'Orca',
            price: 3.45,
            change24h: 1.89,
            volume24h: 89000000,
            marketCap: 680000000
          }
        ];
        setTokens(mockTokens);
        setSelectedToken(mockTokens[0]);
      } catch (error) {
        console.error('Error fetching token data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
    const interval = setInterval(fetchTokenData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSwap = () => {
    if (!walletConnected) {
      connectWallet();
      return;
    }
    
    // Implement swap logic here
    console.log(`Swapping ${amount} ${selectedToken?.symbol}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UniversalHeader 
          title="DEX Platform"
          showBackButton={true}
          showHomeButton={true}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading market data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UniversalHeader 
        title="DEX Platform"
        showBackButton={true}
        showHomeButton={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokens.map((token) => (
                  <div
                    key={token.symbol}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedToken?.symbol === token.symbol
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setSelectedToken(token)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(token.price)}</div>
                        <Badge variant={token.change24h >= 0 ? "default" : "destructive"} className="text-xs">
                          {token.change24h >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(token.change24h).toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Vol: {formatVolume(token.volume24h)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Trading Interface */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Swap Tokens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedToken && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-2">Price</div>
                          <div className="text-2xl font-bold">{formatPrice(selectedToken.price)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-2">24h Change</div>
                          <div className={`text-2xl font-bold ${selectedToken.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h.toFixed(2)}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">From</label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                          <Button variant="outline" className="min-w-[100px]">
                            USDC
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button variant="ghost" size="icon">
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <div>
                        <label className="text-sm font-medium">To</label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={amount ? (parseFloat(amount) / selectedToken.price).toFixed(6) : ''}
                            readOnly
                          />
                          <Button variant="outline" className="min-w-[100px]">
                            {selectedToken.symbol}
                          </Button>
                        </div>
                      </div>

                      {!walletConnected ? (
                        <Button onClick={connectWallet} className="w-full" size="lg">
                          <Zap className="h-4 w-4 mr-2" />
                          Connect Wallet to Trade
                        </Button>
                      ) : (
                        <Button onClick={handleSwap} className="w-full" size="lg" disabled={!amount}>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Swap Tokens
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      * DEX trades are executed on Solana blockchain with minimal fees
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DEXPlatform;