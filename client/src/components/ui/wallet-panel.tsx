import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './card';
import { WalletConnectWeb3Auth } from './wallet-connect-web3auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Button } from './button';
import { MoralisService, StakingPosition } from '../../lib/services/moralis-service';
import { Coins, Wallet, Gift, Sparkles, ArrowUpRight, ShoppingCart, ArrowDown } from 'lucide-react';
import { Badge } from './badge';
import { Switch } from './switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Label } from './label';
import { Input } from './input';
import { Slider } from './slider';
import { toast } from 'sonner';

// Token interface
interface TokenBalance {
  balance: string;
  token?: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logo?: string;
  };
}

// NFT interface
interface NFT {
  mint: string;
  name: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

// Staking Option interface
interface StakingOption {
  id: string;
  name: string;
  apy: number;
  lockupPeriod: number; // in days
  minAmount: number;
  token: string;
  logo: string;
}

export function WalletPanel() {
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState('tokens');
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [stakingOptions, setStakingOptions] = useState<StakingOption[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [selectedStakingOption, setSelectedStakingOption] = useState<StakingOption | null>(null);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(10);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const moralisService = new MoralisService();

  // Initialize default staking options
  useEffect(() => {
    setStakingOptions([
      {
        id: 'thc-staking-30',
        name: 'THC Flex Staking',
        apy: 8.5,
        lockupPeriod: 30,
        minAmount: 100,
        token: 'THC',
        logo: '/images/crypto/thc.png'
      },
      {
        id: 'thc-staking-90',
        name: 'THC Premium Staking',
        apy: 12.5,
        lockupPeriod: 90,
        minAmount: 500,
        token: 'THC',
        logo: '/images/crypto/thc.png'
      },
      {
        id: 'sol-staking-30',
        name: 'SOL Staking',
        apy: 5.8,
        lockupPeriod: 30,
        minAmount: 0.5,
        token: 'SOL',
        logo: '/images/crypto/sol.png'
      }
    ]);
  }, []);

  // Load wallet data when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletData(publicKey.toString());
    } else {
      setTokens([]);
      setNfts([]);
    }
  }, [connected, publicKey, activeTab]);

  // Fetch wallet data from Moralis service
  const fetchWalletData = async (address: string) => {
    try {
      setLoadingWallet(true);
      
      // Initialize Moralis service
      await moralisService.initialize();
      
      if (activeTab === 'tokens' || activeTab === 'staking') {
        // Get SOL balance
        const solBalance = await moralisService.getSOLBalance(address);
        
        // Get THC balance
        const thcBalance = await moralisService.getTHCBalance(address);
        
        // Set tokens array
        setTokens([solBalance, thcBalance]);
      }
      
      if (activeTab === 'nfts') {
        // Get NFTs
        const walletNfts = await moralisService.getNFTs(address);
        setNfts(walletNfts);
      }
      
      // Get staking positions for staking tab
      if (activeTab === 'staking') {
        const positions = await moralisService.getStakingPositions(address);
        setStakingPositions(positions);
        
        // Get transaction history
        const txs = await moralisService.getUserTransactions(address);
        setUserTransactions(txs);
      }
      
      setLoadingWallet(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setLoadingWallet(false);
      
      toast.error('Failed to load wallet data', {
        description: 'Could not retrieve wallet information. Please try again later.'
      });
    }
  };

  // Format number with commas
  const formatNumber = (num: number | string, decimals = 2): string => {
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  };

  // Handle staking
  const handleStake = (option: StakingOption) => {
    setSelectedStakingOption(option);
    setStakeAmount(option.minAmount);
  };

  // Execute staking
  const executeStake = () => {
    if (!selectedStakingOption || !stakeAmount) return;
    
    try {
      toast.success('Staking transaction initiated', {
        description: `Staking ${stakeAmount} ${selectedStakingOption.token} for ${selectedStakingOption.lockupPeriod} days at ${selectedStakingOption.apy}% APY`
      });
      
      // Reset form
      setSelectedStakingOption(null);
      setStakeAmount(0);
      
      // Reload wallet data after short delay to simulate transaction
      setTimeout(() => {
        if (publicKey) {
          fetchWalletData(publicKey.toString());
        }
      }, 1500);
    } catch (error) {
      console.error('Error during staking:', error);
      toast.error('Staking failed', {
        description: 'There was an error processing your staking request. Please try again.'
      });
    }
  };

  // Handle THC purchase
  const handlePurchase = () => {
    if (purchaseAmount <= 0) return;
    
    try {
      toast.success('Purchase initiated', {
        description: `Purchasing ${purchaseAmount} THC tokens. Follow the payment instructions to complete your order.`
      });
      
      setPurchaseMessage(`Thank you for your purchase of ${purchaseAmount} THC tokens. Your tokens will be delivered to your wallet once payment is confirmed.`);
      
      // Reset form after delay
      setTimeout(() => {
        setPurchaseAmount(10);
        setPurchaseMessage('');
        
        // Reload wallet data
        if (publicKey) {
          fetchWalletData(publicKey.toString());
        }
      }, 3000);
    } catch (error) {
      console.error('Error during purchase:', error);
      toast.error('Purchase failed', {
        description: 'There was an error processing your purchase. Please try again.'
      });
    }
  };

  // Calculate estimated earnings for staking
  const calculateEarnings = (amount: number, apy: number, days: number): string => {
    const yearlyEarnings = amount * (apy / 100);
    const periodEarnings = yearlyEarnings * (days / 365);
    return periodEarnings.toFixed(2);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" /> 
          Your Wallet
        </CardTitle>
        <CardDescription>
          Manage your assets and participate in staking
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Wallet Connection Button */}
        <div className="mb-4">
          <WalletConnectWeb3Auth />
        </div>
        
        {connected && publicKey && (
          <Tabs defaultValue="tokens" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="tokens">
                <Coins className="h-4 w-4 mr-2" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="nfts">
                <Gift className="h-4 w-4 mr-2" />
                NFTs
              </TabsTrigger>
              <TabsTrigger value="staking">
                <Sparkles className="h-4 w-4 mr-2" />
                Staking
              </TabsTrigger>
            </TabsList>
            
            {/* Assets Tab */}
            <TabsContent value="tokens" className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Your Tokens</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Buy THC</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Purchase THC Tokens</DialogTitle>
                      <DialogDescription>
                        Trade Hybrid Coin (THC) is used for platform services including trading signals, premium features, and staking rewards.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Amount to purchase</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(parseFloat(e.target.value) || 0)}
                            min={1}
                          />
                          <span className="font-bold">THC</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cost: ${(purchaseAmount * 0.10).toFixed(2)} USD
                        </p>
                      </div>
                      
                      {purchaseMessage && (
                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md text-green-600 dark:text-green-400 text-sm">
                          {purchaseMessage}
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPurchaseAmount(10)}>Reset</Button>
                      <Button onClick={handlePurchase}>Purchase Tokens</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {loadingWallet ? (
                <div className="space-y-2">
                  <div className="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"></div>
                  <div className="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {tokens.map((token, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        {token.token?.logo && (
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img 
                              src={token.token.logo} 
                              alt={token.token?.symbol} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{token.token?.name}</div>
                          <div className="text-sm text-muted-foreground">{token.token?.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {formatNumber(token.balance, token.token?.symbol === 'SOL' ? 2 : 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {token.token?.symbol === 'SOL' 
                            ? `≈ $${formatNumber(parseFloat(token.balance) * 138.45, 2)}` 
                            : `≈ $${formatNumber(parseFloat(token.balance) * 0.10, 2)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {tokens.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No tokens found in your wallet</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* NFTs Tab */}
            <TabsContent value="nfts">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Your NFT Collection</h3>
              </div>
              
              {loadingWallet ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"></div>
                  <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nfts.map((nft, index) => (
                    <div 
                      key={index} 
                      className="border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={nft.image} 
                          alt={nft.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium">{nft.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {nft.attributes.map((attr, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {attr.trait_type}: {attr.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {nfts.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground col-span-2">
                      <p>No NFTs found in your wallet</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Staking Tab */}
            <TabsContent value="staking">
              <div className="mb-4">
                <h3 className="font-medium">Staking Options</h3>
                <p className="text-sm text-muted-foreground">
                  Stake your THC and SOL tokens to earn passive income
                </p>
              </div>
              
              {/* Staking Options */}
              <div className="space-y-3">
                {stakingOptions.map((option) => (
                  <div 
                    key={option.id} 
                    className="border p-4 rounded-md bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img 
                            src={option.logo} 
                            alt={option.token} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{option.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.lockupPeriod} day lock • Min {option.minAmount} {option.token}
                          </div>
                        </div>
                      </div>
                      <Badge className="ml-auto bg-green-600">
                        {option.apy}% APY
                      </Badge>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => handleStake(option)}
                          >
                            Stake {option.token}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Stake your {option.token}</DialogTitle>
                            <DialogDescription>
                              Stake {option.token} for {option.lockupPeriod} days at {option.apy}% APY
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label>Amount to stake</Label>
                                <span className="text-sm text-muted-foreground">
                                  Min: {option.minAmount} {option.token}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={stakeAmount}
                                  onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                                  min={option.minAmount}
                                />
                                <span className="font-bold">{option.token}</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Lockup period</Label>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm">30 days</span>
                                <span className="text-sm">{option.lockupPeriod} days</span>
                              </div>
                              <Slider
                                defaultValue={[option.lockupPeriod]}
                                max={option.lockupPeriod}
                                min={30}
                                step={30}
                                disabled
                              />
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md">
                              <div className="flex justify-between text-sm">
                                <span>Estimated earnings:</span>
                                <span className="font-medium">
                                  {calculateEarnings(stakeAmount, option.apy, option.lockupPeriod)} {option.token}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span>Annual percentage yield:</span>
                                <span className="font-medium text-green-600">{option.apy}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedStakingOption(null)}>Cancel</Button>
                            <Button 
                              onClick={executeStake}
                              disabled={stakeAmount < option.minAmount}
                            >
                              Stake {option.token}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Active Staking */}
              <div className="mt-6">
                <h3 className="font-medium mb-2">Your Active Stakes</h3>
                <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                  <p className="text-muted-foreground">You have no active staking positions</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {connected && publicKey && (
        <CardFooter className="text-xs text-muted-foreground border-t pt-4">
          <p>
            All transactions occur on-chain. Rewards are distributed automatically at the end of the staking period.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default WalletPanel;