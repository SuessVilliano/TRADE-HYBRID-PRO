import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useThcStakingService } from '@/lib/services/thc-staking-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Gem, Coins, CoinsIcon, ArrowUp, Loader2, Lock, Unlock, Calculator, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StakePanel: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [componentError, setComponentError] = useState<string | null>(null);
  
  // Debug wallet connection
  React.useEffect(() => {
    console.log("Wallet connection status:", { connected, publicKey: publicKey?.toString() });
  }, [connected, publicKey]);
  
  // Initialize staking service with error handling
  const stakingService = useThcStakingService();
  
  const {
    isLoading,
    error: serviceError,
    stakingStats,
    userStake,
    availableRewards,
    stakeTokens,
    unstakeTokens,
    claimRewards
  } = stakingService;
  
  // Combine errors
  const error = componentError || serviceError;

  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [lockPeriod, setLockPeriod] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<string>('stake');

  // Get APY based on lock period
  const getApy = (periodDays: number): number => {
    if (!stakingStats) return 5;
    
    const apyTier = stakingStats.apyTiers.find((tier: any) => tier.periodDays === periodDays);
    return apyTier ? apyTier.apyBps / 100 : 5;
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Format date
  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle stake submission
  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    await stakeTokens(parseFloat(stakeAmount), lockPeriod);
    setStakeAmount('');
  };

  // Calculate projected rewards
  const calculateProjectedRewards = (): number => {
    if (!stakeAmount) return 0;
    
    const amount = parseFloat(stakeAmount);
    const apy = getApy(lockPeriod) / 100;
    const yearFraction = lockPeriod / 365;
    
    return amount * apy * yearFraction;
  };

  return (
    <Card className="w-full border-t-4 border-t-purple-600 dark:border-t-purple-400 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-purple-500" />
          <span>THC Staking</span>
          {stakingStats && (
            <Badge variant="outline" className="ml-2 text-xs">
              {formatNumber(stakingStats.totalStaked)} THC Staked
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Stake your THC tokens to earn rewards. Higher lock periods offer better APY rates.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {!connected ? (
          <div className="text-center py-6">
            <Gem className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to start staking THC tokens and earning rewards.
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="active">Your Stakes</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            {/* Stake Tab */}
            <TabsContent value="stake" className="space-y-4">
              <form onSubmit={handleStake}>
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
                        disabled={isLoading}
                        min="0"
                        step="any"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-muted-foreground">THC</span>
                      </div>
                    </div>
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
                          disabled={isLoading}
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
                      
                      <div className="text-muted-foreground">Projected Reward:</div>
                      <div className="font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(calculateProjectedRewards())} THC
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  >
                    {isLoading ? (
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
              </form>
            </TabsContent>
            
            {/* Active Stakes Tab */}
            <TabsContent value="active" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : userStake?.isActive ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Coins className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-muted-foreground text-sm">Staked Amount</div>
                          <div className="text-2xl font-bold">{formatNumber(userStake.amount)} THC</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BarChart className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-muted-foreground text-sm">APY Rate</div>
                          <div className="text-2xl font-bold">{userStake.apy}%</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-muted-foreground text-sm">Unlock Date</div>
                          <div className="text-lg font-bold">{formatDate(userStake.end)}</div>
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
                            {formatNumber(availableRewards)} THC
                          </div>
                          <div className="text-muted-foreground text-sm">
                            Accumulated since {formatDate(userStake.start)}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={claimRewards}
                          disabled={isLoading || availableRewards <= 0}
                          className="flex items-center"
                        >
                          <ArrowUp className="mr-1 h-4 w-4" />
                          Claim
                        </Button>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accrued Rewards</span>
                          <span>{formatNumber(userStake.rewards + availableRewards)} THC</span>
                        </div>
                        <Progress value={100} className="h-1 bg-muted" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-muted/40 p-4 rounded-md border">
                    <h3 className="font-medium mb-2">Unstake THC</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {new Date() >= userStake.end ? 
                        "Your lock period has ended. You can now unstake your THC tokens and claim any remaining rewards." :
                        `Your tokens are locked until ${formatDate(userStake.end)}. Unstaking before this date may result in penalties.`
                      }
                    </p>
                    
                    <Button
                      variant="destructive" 
                      onClick={unstakeTokens}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
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
            
            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stakingStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Coins className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-muted-foreground text-sm">Total THC Staked</div>
                          <div className="text-2xl font-bold">{formatNumber(stakingStats.totalStaked)} THC</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <CoinsIcon className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-muted-foreground text-sm">Total Stakers</div>
                          <div className="text-2xl font-bold">{stakingStats.stakerCount}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-3">APY Rates</h3>
                      <div className="space-y-3">
                        {stakingStats.apyTiers.map((tier: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Lock className="h-4 w-4 mr-2 text-purple-500" />
                              <span>{tier.periodDays} Days</span>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                              {tier.apyBps / 100}% APY
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <p className="text-sm text-muted-foreground">
                        APY rates are determined by lock period. Longer lock periods provide higher returns on your staked THC.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-spin" />
                  <p className="text-muted-foreground">
                    Loading staking statistics...
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <Badge variant="outline" className="font-mono">THC-STAKE</Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StakePanel;