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
import { motion, AnimatePresence } from 'framer-motion';

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
  const executeStake = async () => {
    if (!selectedStakingOption || !stakeAmount || !publicKey) return;
    
    try {
      // Show pending state
      toast.loading('Initiating staking transaction...', {
        id: 'stake-transaction',
      });
      
      // Call the moralis service to stake tokens
      const stakingResult = await moralisService.stakeTokens(
        publicKey.toString(),
        selectedStakingOption.token,
        stakeAmount,
        selectedStakingOption.lockupPeriod,
        selectedStakingOption.apy
      );
      
      // Update UI with successful transaction
      toast.success('Staking transaction successful', {
        id: 'stake-transaction',
        description: `You've staked ${stakeAmount} ${selectedStakingOption.token} for ${selectedStakingOption.lockupPeriod} days at ${selectedStakingOption.apy}% APY`
      });
      
      // Reset form
      setSelectedStakingOption(null);
      setStakeAmount(0);
      
      // Refresh wallet data to show updated balances and staking positions
      fetchWalletData(publicKey.toString());
      
      // Switch to staking tab to show the staking position
      setActiveTab('staking');
      
    } catch (error) {
      console.error('Error during staking:', error);
      toast.error('Staking failed', {
        id: 'stake-transaction',
        description: 'There was an error processing your staking request. Please try again.'
      });
    }
  };

  // Handle THC purchase
  const handlePurchase = async () => {
    if (purchaseAmount <= 0 || !publicKey) return;
    
    try {
      // Show pending toast
      toast.loading('Processing your purchase...', {
        id: 'purchase-transaction',
      });
      
      // Initiate purchase via Moralis service
      const purchaseResult = await moralisService.purchaseTHC(
        publicKey.toString(),
        purchaseAmount
      );
      
      if (purchaseResult) {
        // Show success toast
        toast.success('Purchase successful', {
          id: 'purchase-transaction',
          description: `${purchaseAmount} THC tokens have been added to your wallet.`
        });
        
        setPurchaseMessage(`Thank you for your purchase of ${purchaseAmount} THC tokens. The tokens have been delivered to your wallet.`);
        
        // Reload wallet data to show updated balance
        fetchWalletData(publicKey.toString());
        
        // Reset form after delay
        setTimeout(() => {
          setPurchaseAmount(10);
          setPurchaseMessage('');
        }, 3000);
      } else {
        throw new Error('Purchase transaction failed');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      toast.error('Purchase failed', {
        id: 'purchase-transaction',
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: {
                  delay: 0.2,
                  duration: 0.4
                }
              }}
              className="mb-4 p-3 rounded-md bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3"
            >
              <div className="h-10 w-10 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      delay: 0.4,
                      duration: 0.5,
                      type: "spring"
                    }
                  }}
                >
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              </div>
              <div>
                <motion.div 
                  className="font-medium text-emerald-700 dark:text-emerald-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: 0.6,
                      duration: 0.3
                    }
                  }}
                >
                  Wallet Connected!
                </motion.div>
                <motion.div 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      delay: 0.8,
                      duration: 0.3
                    }
                  }}
                >
                  {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
                </motion.div>
              </div>
            </motion.div>
          
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
                        <AnimatePresence mode="wait">
                          <motion.div 
                            key={`${token.token?.symbol}-${token.balance}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: { 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 20 
                              } 
                            }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative"
                          >
                            <motion.div 
                              className="font-bold"
                              initial={{ scale: 0.8 }}
                              animate={{ 
                                scale: 1,
                                transition: {
                                  delay: 0.2,
                                  duration: 0.5,
                                  ease: "easeOut"
                                }
                              }}
                            >
                              {formatNumber(token.balance, token.token?.symbol === 'SOL' ? 2 : 0)}
                            </motion.div>
                            <motion.div 
                              className="text-xs text-muted-foreground"
                              initial={{ opacity: 0 }}
                              animate={{ 
                                opacity: 1,
                                transition: {
                                  delay: 0.5,
                                  duration: 0.5
                                }
                              }}
                            >
                              {token.token?.symbol === 'SOL' 
                                ? `≈ $${formatNumber(parseFloat(token.balance) * 138.45, 2)}` 
                                : `≈ $${formatNumber(parseFloat(token.balance) * 0.10, 2)}`}
                            </motion.div>
                          </motion.div>
                        </AnimatePresence>
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
                  <AnimatePresence>
                    {nfts.map((nft, index) => (
                      <motion.div 
                        key={nft.mint}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          y: 0,
                          transition: {
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: [0.23, 1, 0.32, 1] // cubic-bezier
                          }
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="h-32 overflow-hidden">
                          <motion.img 
                            src={nft.image} 
                            alt={nft.name} 
                            className="w-full h-full object-cover"
                            initial={{ scale: 1.2 }}
                            animate={{ 
                              scale: 1,
                              transition: {
                                duration: 1,
                                delay: index * 0.1 + 0.3,
                              }
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <motion.h4 
                            className="font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: 1,
                              transition: {
                                duration: 0.5,
                                delay: index * 0.1 + 0.5
                              }
                            }}
                          >
                            {nft.name}
                          </motion.h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {nft.attributes.map((attr, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ 
                                  opacity: 1, 
                                  x: 0,
                                  transition: {
                                    duration: 0.3,
                                    delay: index * 0.1 + 0.7 + (i * 0.1)
                                  }
                                }}
                              >
                                <Badge variant="outline" className="text-xs">
                                  {attr.trait_type}: {attr.value}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
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
                {loadingWallet ? (
                  <div className="space-y-2">
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md"></div>
                  </div>
                ) : stakingPositions.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {stakingPositions.map((position, index) => (
                        <motion.div 
                          key={position.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                              delay: index * 0.15
                            }
                          }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <motion.div 
                                className="h-8 w-8 rounded-full overflow-hidden"
                                initial={{ scale: 0.5 }}
                                animate={{ 
                                  scale: 1,
                                  transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    delay: index * 0.15 + 0.1
                                  }
                                }}
                              >
                                <img 
                                  src={position.tokenSymbol === 'SOL' ? '/images/crypto/sol.png' : '/images/crypto/thc.png'} 
                                  alt={position.tokenSymbol} 
                                  className="h-full w-full object-cover"
                                />
                              </motion.div>
                              <div>
                                <motion.div 
                                  className="font-medium"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ 
                                    opacity: 1, 
                                    x: 0,
                                    transition: {
                                      delay: index * 0.15 + 0.2,
                                      duration: 0.3
                                    }
                                  }}
                                >
                                  {position.amount} {position.tokenSymbol}
                                </motion.div>
                                <motion.div 
                                  className="text-xs text-muted-foreground"
                                  initial={{ opacity: 0 }}
                                  animate={{ 
                                    opacity: 1,
                                    transition: {
                                      delay: index * 0.15 + 0.3,
                                      duration: 0.3
                                    }
                                  }}
                                >
                                  {new Date(position.startDate).toLocaleDateString()} - {new Date(position.endDate).toLocaleDateString()}
                                </motion.div>
                              </div>
                            </div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ 
                                opacity: 1, 
                                scale: 1,
                                transition: {
                                  delay: index * 0.15 + 0.4,
                                  duration: 0.3
                                }
                              }}
                            >
                              <Badge variant={position.status === 'active' ? 'default' : 'outline'} className="ml-auto">
                                {position.status === 'active' ? 'Active' : position.status === 'completed' ? 'Completed' : 'Cancelled'}
                              </Badge>
                            </motion.div>
                          </div>
                          
                          <motion.div 
                            className="grid grid-cols-2 gap-2 mt-3 text-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: {
                                delay: index * 0.15 + 0.5,
                                duration: 0.4
                              }
                            }}
                          >
                            <div>
                              <span className="text-muted-foreground">APY:</span> 
                              <span className="ml-1 font-medium text-green-600">{position.apy}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Est. Reward:</span> 
                              <span className="ml-1 font-medium">{position.estimatedReward.toFixed(2)} {position.tokenSymbol}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Staked:</span> 
                              <span className="ml-1 font-medium">{position.amount} {position.tokenSymbol}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Days remaining:</span> 
                              <span className="ml-1 font-medium">
                                {position.status === 'active' 
                                  ? Math.max(0, Math.floor((new Date(position.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) 
                                  : 0}
                              </span>
                            </div>
                          </motion.div>
                          
                          {position.status === 'active' && (
                            <motion.div 
                              className="mt-3 flex justify-end"
                              initial={{ opacity: 0 }}
                              animate={{ 
                                opacity: 1,
                                transition: {
                                  delay: index * 0.15 + 0.7,
                                  duration: 0.3
                                }
                              }}
                            >
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={async () => {
                                  if (!publicKey) return;
                                  
                                  toast.loading('Processing unstake request...', {
                                    id: 'unstake-transaction',
                                  });
                                  
                                  try {
                                    await moralisService.unstakeTokens(publicKey.toString(), position.id);
                                    
                                    toast.success('Unstaked successfully', {
                                      id: 'unstake-transaction',
                                      description: `Your ${position.amount} ${position.tokenSymbol} has been returned to your wallet`
                                    });
                                    
                                    // Reload wallet data
                                    fetchWalletData(publicKey.toString());
                                  } catch (error) {
                                    console.error('Error unstaking:', error);
                                    toast.error('Failed to unstake', {
                                      id: 'unstake-transaction',
                                      description: 'There was an error processing your unstake request'
                                    });
                                  }
                                }}
                              >
                                Unstake Early
                              </Button>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-muted-foreground">You have no active staking positions</p>
                  </div>
                )}
              </div>
              
              {/* Transaction History */}
              {userTransactions.length > 0 && (
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25, 
                      delay: 0.3
                    }
                  }}
                >
                  <h3 className="font-medium mb-2">Recent Transactions</h3>
                  <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {userTransactions.slice(0, 5).map((tx: any, index) => (
                          <motion.div 
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0,
                              transition: {
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                delay: 0.4 + (index * 0.1)
                              }
                            }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="capitalize font-medium">
                                {tx.type}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.amount} {tx.token}
                              </div>
                            </div>
                            <motion.div 
                              className="text-xs text-right"
                              initial={{ opacity: 0 }}
                              animate={{ 
                                opacity: 1,
                                transition: {
                                  delay: 0.4 + (index * 0.1) + 0.2,
                                  duration: 0.3
                                }
                              }}
                            >
                              <div className="text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                              </div>
                              <div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${tx.status === 'completed' ? 'bg-green-500/10 text-green-600' : ''}`}
                                >
                                  {tx.status}
                                </Badge>
                              </div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
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