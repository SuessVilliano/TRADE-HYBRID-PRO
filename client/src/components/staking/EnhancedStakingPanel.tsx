import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar, Clock, Gem, Coins, CoinsIcon, ArrowUp, Loader2,
  Lock, Unlock, Calculator, BarChart, AlertTriangle, Wallet, Link, ExternalLink
} from 'lucide-react';
import { useUserData } from '@/lib/contexts/UserDataContext';
import { formatNumber, formatDate } from '@/lib/utils/formatters';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';

// Validator constants
const VALIDATOR_ACCOUNT = '5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej';
const VALIDATOR_COMMISSION = 1; // 1%
const THC_TOKEN_ADDRESS = '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4';

export function EnhancedStakingPanel() {
  const { user, refreshWallet } = useUserData();
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [lockPeriod, setLockPeriod] = useState<number>(30);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isUnstaking, setIsUnstaking] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('stake');
  const [calculatedRewards, setCalculatedRewards] = useState<number>(0);

  // Initialize with user staking data if available
  useEffect(() => {
    if (user.wallet?.isStaking) {
      setActiveTab('active');
    }
  }, [user.wallet?.isStaking]);

  // Calculate rewards based on staking amount and period
  useEffect(() => {
    if (stakeAmount && !isNaN(parseFloat(stakeAmount))) {
      const amount = parseFloat(stakeAmount);
      const apy = getApy(lockPeriod);
      const yearFraction = lockPeriod / 365;
      const reward = amount * (apy / 100) * yearFraction;
      setCalculatedRewards(reward);
    } else {
      setCalculatedRewards(0);
    }
  }, [stakeAmount, lockPeriod]);

  // Get APY based on lock period
  const getApy = (periodDays: number): number => {
    // Higher APY for longer lock periods
    if (periodDays >= 365) return 14;
    if (periodDays >= 180) return 12;
    if (periodDays >= 90) return 10;
    if (periodDays >= 30) return 8;
    return 5; // Default APY for shorter periods
  };

  // Handle stake submission
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid staking amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsStaking(true);

    try {
      // Call the backend API to stake
      const response = await fetch('/api/wallet/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(stakeAmount),
          lockPeriod: lockPeriod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Staking Successful',
          description: `Successfully staked ${stakeAmount} THC for ${lockPeriod} days.`,
        });
        
        // Refresh wallet data to show updated staking status
        await refreshWallet();
        setActiveTab('active');
        setStakeAmount('');
      } else {
        throw new Error(data.message || 'Failed to stake tokens');
      }
    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: 'Staking Failed',
        description: error instanceof Error ? error.message : 'Failed to stake tokens. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsStaking(false);
    }
  };

  // Handle unstake submission
  const handleUnstake = async () => {
    setIsUnstaking(true);

    try {
      // Call the backend API to unstake
      const response = await fetch('/api/wallet/unstake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Unstaking Successful',
          description: 'Your THC tokens have been unstaked and returned to your wallet.',
        });
        
        // Refresh wallet data to show updated staking status
        await refreshWallet();
        setActiveTab('stake');
      } else {
        throw new Error(data.message || 'Failed to unstake tokens');
      }
    } catch (error) {
      console.error('Unstaking error:', error);
      toast({
        title: 'Unstaking Failed',
        description: error instanceof Error ? error.message : 'Failed to unstake tokens. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  // Handle claim rewards
  const handleClaimRewards = async () => {
    setIsClaiming(true);

    try {
      // Call the backend API to claim rewards
      const response = await fetch('/api/wallet/claim-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Rewards Claimed',
          description: `Successfully claimed ${formatNumber(data.amount)} THC rewards.`,
        });
        
        // Refresh wallet data to show updated rewards
        await refreshWallet();
      } else {
        throw new Error(data.message || 'Failed to claim rewards');
      }
    } catch (error) {
      console.error('Claiming rewards error:', error);
      toast({
        title: 'Claiming Failed',
        description: error instanceof Error ? error.message : 'Failed to claim rewards. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  // View validator on explorer
  const viewValidatorOnExplorer = () => {
    window.open(`https://solscan.io/account/${VALIDATOR_ACCOUNT}`, '_blank');
  };

  // View THC token on explorer
  const viewTokenOnExplorer = () => {
    window.open(`https://solscan.io/token/${THC_TOKEN_ADDRESS}`, '_blank');
  };

  return (
    <Card className="w-full border-t-4 border-t-purple-600 dark:border-t-purple-400 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-purple-500" />
          <span>THC Staking</span>
          {user.wallet.isStaking && (
            <Badge variant="outline" className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
              {formatNumber(user.wallet.stakedAmount || 0)} THC Staked
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Stake your THC tokens to earn rewards and boost your membership benefits. Higher lock periods offer better APY rates.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!user.wallet.walletConnected ? (
          <div className="text-center py-6">
            <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to start staking THC tokens and earning rewards.
            </p>
            <div className="flex justify-center">
              <ConnectWalletButton 
                onSuccess={() => refreshWallet()}
              />
            </div>
          </div>
        ) : (
          <>
            {user.wallet.thcBalance === 0 && !user.wallet.isStaking && (
              <Alert className="mb-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle>No THC Tokens</AlertTitle>
                <AlertDescription>
                  You don't have any THC tokens in your wallet. Purchase THC tokens to start staking.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="stake">Stake</TabsTrigger>
                <TabsTrigger value="active">Your Stakes</TabsTrigger>
                <TabsTrigger value="info">Validator Info</TabsTrigger>
              </TabsList>
              
              {/* Stake Tab */}
              <TabsContent value="stake" className="space-y-4">
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Your THC Balance</h3>
                    <Badge variant="outline">Available for staking</Badge>
                  </div>
                  <div className="text-2xl font-bold flex items-center">
                    <Gem className="h-5 w-5 mr-2 text-purple-500" />
                    {formatNumber(user.wallet.thcBalance || 0)} THC
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stakeAmount">Amount to Stake</Label>
                    <div className="relative mt-1">
                      <Input
                        id="stakeAmount"
                        type="number"
                        placeholder="0.00"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        disabled={isStaking || (user.wallet.thcBalance || 0) === 0}
                        min="0"
                        max={user.wallet.thcBalance?.toString()}
                        step="any"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-muted-foreground">THC</span>
                      </div>
                    </div>
                    
                    {user.wallet.thcBalance && user.wallet.thcBalance > 0 && (
                      <div className="flex justify-end mt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setStakeAmount(user.wallet.thcBalance?.toString() || '0')}
                        >
                          Max
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Lock Period</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                      {[30, 90, 180, 365].map((days) => (
                        <Button
                          key={days}
                          type="button"
                          variant={lockPeriod === days ? "default" : "outline"}
                          onClick={() => setLockPeriod(days)}
                          disabled={isStaking}
                          className={`flex flex-col h-auto py-2 ${lockPeriod === days ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                        >
                          <span className="text-xs">{days} Days</span>
                          <span className="font-bold">{getApy(days)}%</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-3 bg-muted/40">
                    <h4 className="font-medium mb-2 flex items-center text-sm">
                      <Calculator className="h-4 w-4 mr-1 text-purple-500" />
                      Projected Rewards
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Amount:</div>
                      <div>{stakeAmount ? formatNumber(parseFloat(stakeAmount)) : '0'} THC</div>
                      
                      <div className="text-muted-foreground">Lock Period:</div>
                      <div className="flex items-center">{lockPeriod} days <Lock className="h-3 w-3 ml-1 text-muted-foreground" /></div>
                      
                      <div className="text-muted-foreground">APY Rate:</div>
                      <div className="text-purple-600 dark:text-purple-400 font-medium">{getApy(lockPeriod)}%</div>
                      
                      <div className="text-muted-foreground">Unlock Date:</div>
                      <div>{stakeAmount ? formatDate(new Date(Date.now() + lockPeriod * 24 * 60 * 60 * 1000)) : 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Validator Commission:</div>
                      <div>{VALIDATOR_COMMISSION}%</div>
                      
                      <div className="text-muted-foreground">Projected Reward:</div>
                      <div className="font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(calculatedRewards)} THC
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={
                      isStaking || 
                      !stakeAmount || 
                      parseFloat(stakeAmount) <= 0 || 
                      (user.wallet.thcBalance !== undefined && parseFloat(stakeAmount) > user.wallet.thcBalance)
                    }
                    onClick={handleStake}
                  >
                    {isStaking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Coins className="mr-2 h-4 w-4" />
                        Stake THC
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              {/* Active Stakes Tab */}
              <TabsContent value="active" className="space-y-4">
                {user.wallet.isStaking ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="bg-muted/30">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Coins className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-muted-foreground text-sm">Staked Amount</div>
                            <div className="text-2xl font-bold">{formatNumber(user.wallet.stakedAmount || 0)} THC</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <BarChart className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-muted-foreground text-sm">APY Rate</div>
                            <div className="text-2xl font-bold">{getApy(90)}%</div>
                            {/* Using 90 days as a default since we don't have the exact lock period in the user data */}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/30">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-muted-foreground text-sm">Staking Since</div>
                            <div className="text-lg font-bold">{formatDate(user.wallet.stakedSince || new Date())}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-2">Available Rewards</h3>
                        <div className="flex items-end justify-between mb-2">
                          <div>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                              {formatNumber(user.wallet.stakingRewards || 0)} THC
                            </div>
                            <div className="text-muted-foreground text-sm">
                              Accumulated since {formatDate(user.wallet.stakedSince || new Date())}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            onClick={handleClaimRewards}
                            disabled={isClaiming || !(user.wallet.stakingRewards && user.wallet.stakingRewards > 0)}
                            className="flex items-center"
                          >
                            {isClaiming ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowUp className="mr-1 h-4 w-4" />
                            )}
                            Claim
                          </Button>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Accrued Rewards</span>
                            <span>{formatNumber(user.wallet.stakingRewards || 0)} THC</span>
                          </div>
                          <Progress 
                            value={user.wallet.stakingRewards ? Math.min(100, (user.wallet.stakingRewards / (user.wallet.stakedAmount || 1) * 100)) : 0} 
                            className="h-1 bg-muted" 
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="bg-muted/40 p-4 rounded-md border">
                      <h3 className="font-medium mb-2">Unstake THC</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        You can unstake your THC tokens at any time, but unstaking before the lock period ends may result in penalties.
                      </p>
                      
                      <Button
                        variant="destructive" 
                        onClick={handleUnstake}
                        disabled={isUnstaking}
                        className="w-full"
                      >
                        {isUnstaking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-2 h-4 w-4" />
                            Unstake THC
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: Unstaking will also claim any pending rewards automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gem className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Active Stakes</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      You don't have any active THC stakes. Head over to the Stake tab to start earning rewards on your THC tokens.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('stake')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Coins className="mr-2 h-4 w-4" />
                      Stake Now
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Validator Info Tab */}
              <TabsContent value="info" className="space-y-4">
                <div className="space-y-4">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Link className="h-4 w-4 mr-2 text-blue-500" />
                        Validator Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Validator Account</div>
                          <div className="font-mono text-sm flex items-center justify-between">
                            <span className="truncate">{VALIDATOR_ACCOUNT}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={viewValidatorOnExplorer}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Commission Rate</div>
                          <div className="font-medium">{VALIDATOR_COMMISSION}%</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">THC Token Address</div>
                          <div className="font-mono text-sm flex items-center justify-between">
                            <span className="truncate">{THC_TOKEN_ADDRESS}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={viewTokenOnExplorer}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">APY Rates</div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="border rounded-md p-2 text-center">
                              <div className="text-xs text-muted-foreground">30 Days</div>
                              <div className="font-bold text-purple-600 dark:text-purple-400">{getApy(30)}%</div>
                            </div>
                            <div className="border rounded-md p-2 text-center">
                              <div className="text-xs text-muted-foreground">90 Days</div>
                              <div className="font-bold text-purple-600 dark:text-purple-400">{getApy(90)}%</div>
                            </div>
                            <div className="border rounded-md p-2 text-center">
                              <div className="text-xs text-muted-foreground">180 Days</div>
                              <div className="font-bold text-purple-600 dark:text-purple-400">{getApy(180)}%</div>
                            </div>
                            <div className="border rounded-md p-2 text-center">
                              <div className="text-xs text-muted-foreground">365 Days</div>
                              <div className="font-bold text-purple-600 dark:text-purple-400">{getApy(365)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Gem className="h-4 w-4 mr-2 text-purple-500" />
                        About THC Staking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <p>
                          THC staking allows you to earn passive income on your THC tokens while supporting the Trade Hybrid platform.
                        </p>
                        <p>
                          When you stake THC tokens, they are locked for the selected period and earn rewards at the corresponding APY rate.
                        </p>
                        <p>
                          Rewards are calculated and accrued in real-time, and can be claimed at any point during the staking period.
                        </p>
                        <p>
                          The longer you stake, the higher the APY rate you'll receive, with rates ranging from 8% for 30-day staking to 14% for 365-day staking.
                        </p>
                        <p>
                          Early unstaking before the lock period ends may result in reduced rewards or penalties.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col text-xs text-muted-foreground pt-2">
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={refreshWallet}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default EnhancedStakingPanel;