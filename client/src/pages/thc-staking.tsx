import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PopupContainer } from '@/components/ui/popup-container';
import { 
  Coins, 
  ArrowDownUp, 
  Wallet, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCcw,
  Trophy,
  Network,
  ChevronsUpDown,
  Sparkles,
  Copy
} from 'lucide-react';
import { THC_TOKEN_CONFIG, calculateStakingRewards, calculateStakingApy } from '@/lib/contracts/thc-token-info';

export default function THCStaking() {
  const [activeTab, setActiveTab] = useState('staking');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [stakeDuration, setStakeDuration] = useState('90');
  const [autoCompound, setAutoCompound] = useState(true);
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [thcBalance, setThcBalance] = useState(156.75);
  const [stakedAmount, setStakedAmount] = useState(325.5);
  const [referralCount, setReferralCount] = useState(5);
  const [referralAddress, setReferralAddress] = useState('');
  const [matrixTier, setMatrixTier] = useState(1);
  const [referralLink, setReferralLink] = useState('https://tradehybrid.app/?ref=th89d726');
  const [linkCopied, setLinkCopied] = useState(false);
  const [hasCreatedMatrix, setHasCreatedMatrix] = useState(false);
  
  // For the matrix visualization
  const [matrixData, setMatrixData] = useState<any[]>([
    { id: 'you', level: 0, position: 0, filled: true, username: 'You', earnings: 0 },
    // Level 1 (2 positions)
    { id: 'L1P1', level: 1, position: 0, filled: true, username: 'trader92', earnings: 12.5 },
    { id: 'L1P2', level: 1, position: 1, filled: true, username: 'cryptomaster', earnings: 12.5 },
    // Level 2 (3 positions)
    { id: 'L2P1', level: 2, position: 0, filled: true, username: 'hodlgang', earnings: 6.25 },
    { id: 'L2P2', level: 2, position: 1, filled: true, username: 'moonshot', earnings: 6.25 },
    { id: 'L2P3', level: 2, position: 2, filled: false, username: '', earnings: 0 },
  ]);
  
  useEffect(() => {
    // Simulate connected wallet after 2 seconds
    const timer = setTimeout(() => {
      setConnectedWallet(true);
    }, 2000);
    
    // Generate random referral address
    setReferralAddress('TH' + Math.random().toString(36).substring(2, 10).toUpperCase());
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate estimated rewards
  const estimatedRewards = calculateStakingRewards(
    parseFloat(stakeAmount) || 0, 
    parseInt(stakeDuration) || 0
  );
  
  // Calculate APY based on staking period
  const currentApy = calculateStakingApy(parseInt(stakeDuration) || 0);
  
  // Handle staking action
  const handleStake = () => {
    if (!connectedWallet) return;
    
    // Update UI with staked amount
    setStakedAmount(prev => prev + parseFloat(stakeAmount));
    setThcBalance(prev => prev - parseFloat(stakeAmount));
    setStakeAmount('');
    
    // Show success message or notification (would be implemented in the UI)
    console.log('Staked successfully');
  };
  
  // Handle matrix creation
  const handleCreateMatrix = () => {
    setHasCreatedMatrix(true);
    // In a real implementation, this would make a contract call to initialize the matrix
  };

  // Handle copying of referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  return (
    <PopupContainer className="min-h-screen container mx-auto py-8 px-4" padding>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">THC Token Staking & 2x3 Matrix</h1>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">
          Stake your THC tokens to earn rewards and build your affiliate network through our 2x3 matrix system.
        </p>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="staking" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="staking" className="text-lg py-3">
              <Coins className="mr-2 h-5 w-5" />
              THC Staking
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-lg py-3">
              <Network className="mr-2 h-5 w-5" />
              2x3 Affiliate Matrix
            </TabsTrigger>
          </TabsList>
          
          {/* Staking Tab */}
          <TabsContent value="staking">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Coins className="mr-2 h-5 w-5 text-blue-500" />
                      Stake THC Tokens
                    </CardTitle>
                    <CardDescription>
                      Earn rewards by staking your THC tokens. The longer you stake, the higher the APY.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stakeAmount">Amount to Stake</Label>
                        <div className="flex mt-2">
                          <Input 
                            id="stakeAmount" 
                            type="number" 
                            value={stakeAmount} 
                            onChange={(e) => setStakeAmount(e.target.value)} 
                            placeholder="Enter THC amount" 
                            className="flex-1" 
                          />
                          <Button 
                            variant="outline" 
                            className="ml-2"
                            onClick={() => setStakeAmount(thcBalance.toString())}
                          >
                            Max
                          </Button>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Available: {thcBalance.toFixed(2)} THC
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="stakeDuration">Staking Period</Label>
                        <Select value={stakeDuration} onValueChange={setStakeDuration}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select staking period" />
                          </SelectTrigger>
                          <SelectContent>
                            {THC_TOKEN_CONFIG.stakingApyTiers.map((tier, index) => (
                              <SelectItem key={index} value={tier.minStakingPeriod.toString()}>
                                {tier.minStakingPeriod} Days - {tier.apy}% APY
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-compound" checked={autoCompound} onCheckedChange={setAutoCompound} />
                        <Label htmlFor="auto-compound">Auto-compound rewards (90+ day periods)</Label>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <RefreshCcw size={16} className="text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium">Estimated Rewards</span>
                        </div>
                        <Badge className="bg-green-600">{currentApy}% APY</Badge>
                      </div>
                      <div className="mt-2">
                        <div className="text-xl font-bold">
                          +{estimatedRewards.toFixed(2)} THC
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          After {stakeDuration} days
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      disabled={!connectedWallet || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > thcBalance}
                      onClick={handleStake}
                    >
                      {!connectedWallet ? 'Connect Wallet to Stake' : 'Stake THC Tokens'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShieldCheck className="mr-2 h-5 w-5 text-purple-500" />
                      Your Staking Stats
                    </CardTitle>
                    <CardDescription>
                      Overview of your current staking positions and rewards.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total Staked</div>
                        <div className="text-2xl font-bold mt-1">{stakedAmount.toFixed(2)} THC</div>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Est. Monthly Yield</div>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                          +{(stakedAmount * currentApy / 100 / 12).toFixed(2)} THC
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Staking Positions</div>
                      <div className="space-y-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">90-Day Stake</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                Ends in 47 days
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">125.5 THC</div>
                              <div className="text-xs text-green-600">+4.2 THC earned</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>48%</span>
                            </div>
                            <Progress value={48} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">180-Day Stake</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                Ends in 162 days
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">200.0 THC</div>
                              <div className="text-xs text-green-600">+2.8 THC earned</div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>10%</span>
                            </div>
                            <Progress value={10} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium">Staking Benefits</span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center">
                          <ArrowRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                          <span>Trading fee reduction: 25%</span>
                        </div>
                        <div className="flex items-center">
                          <ArrowRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                          <span>Premium market data access</span>
                        </div>
                        <div className="flex items-center">
                          <ArrowRight size={14} className="text-blue-500 mr-1 flex-shrink-0" />
                          <span>THC governance voting rights</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* 2x3 Matrix Tab */}
          <TabsContent value="matrix">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Network className="mr-2 h-5 w-5 text-indigo-500" />
                      2x3 Matrix System
                    </CardTitle>
                    <CardDescription>
                      Build your affiliate network and earn passive income through our 2x3 matrix structure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!hasCreatedMatrix ? (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
                          <p className="text-sm">
                            Create your 2x3 matrix to start earning affiliate commissions. This requires a one-time 
                            activation fee of 0.1 SOL, which covers the smart contract initialization.
                          </p>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">How It Works</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>You occupy the top position in your personal 2x3 matrix</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Earn 2.5% commission on all trades made by your direct referrals</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Earn 1.25% commission on all trades made by your level 2 referrals</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Matrix automatically allocates referrals in a spillover system</span>
                            </li>
                          </ul>
                        </div>
                        
                        <Button 
                          onClick={handleCreateMatrix}
                          disabled={!connectedWallet}
                          className="w-full"
                        >
                          {!connectedWallet ? 'Connect Wallet to Create Matrix' : 'Create Your 2x3 Matrix (0.1 SOL)'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-yellow-600" size={16} />
                            <span className="font-medium">Matrix Active</span>
                          </div>
                          <p className="text-sm mt-2">
                            Your 2x3 matrix is active and ready to receive referrals. Share your referral link to start building your network!
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="referralLink">Your Referral Link</Label>
                          <div className="flex mt-2">
                            <Input 
                              id="referralLink" 
                              value={referralLink} 
                              readOnly 
                              className="flex-1" 
                            />
                            <Button 
                              variant="outline" 
                              className="ml-2"
                              onClick={handleCopyLink}
                            >
                              {linkCopied ? 'Copied!' : <Copy size={16} />}
                            </Button>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            Share this link to invite new users to Trade Hybrid
                          </p>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-blue-500" />
                              <span className="font-medium">Your Referrals</span>
                            </div>
                            <Badge>{referralCount} users</Badge>
                          </div>
                          <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Direct (Level 1)</span>
                              <span className="font-medium">2 users</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Indirect (Level 2)</span>
                              <span className="font-medium">3 users</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <Coins size={16} className="text-green-500" />
                              <span className="font-medium">Earnings</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">This Month</span>
                              <span className="font-medium text-green-600">+25.0 THC</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Earned</span>
                              <span className="font-medium text-green-600">+37.5 THC</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ChevronsUpDown className="mr-2 h-5 w-5 text-emerald-500" />
                      Your Matrix Visualization
                    </CardTitle>
                    <CardDescription>
                      Visual representation of your 2x3 matrix structure and positions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!hasCreatedMatrix ? (
                      <div className="flex flex-col items-center justify-center h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Network size={48} className="text-slate-400 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs">
                          Create your 2x3 matrix to view your network structure and track referral earnings.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="relative">
                          {/* Level 0 - You */}
                          <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-blue-700 dark:text-blue-300 text-sm">YOU</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">Top</div>
                            </div>
                          </div>
                          
                          {/* Level 1 - Direct Referrals (2 positions) */}
                          <div className="flex justify-center gap-16 mb-8 relative">
                            <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 w-[200px] h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-1 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-green-700 dark:text-green-300 text-xs">trader92</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">+12.5 THC</div>
                            </div>
                            
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-green-700 dark:text-green-300 text-xs">cryptom...</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">+12.5 THC</div>
                            </div>
                          </div>
                          
                          {/* Level 2 - Indirect Referrals (3 positions) */}
                          <div className="flex justify-center gap-8 relative">
                            <div className="absolute top-[-40px] left-1/4 transform -translate-x-1/2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-40px] left-2/4 transform -translate-x-1/2 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-1/4 transform -translate-x-1/2 w-[280px] h-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-3 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-4 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            <div className="absolute top-[-30px] left-calc-5 h-10 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                            
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-purple-700 dark:text-purple-300 text-xs">hodlgang</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">+6.25 THC</div>
                            </div>
                            
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 rounded-full flex flex-col items-center justify-center">
                              <div className="font-bold text-purple-700 dark:text-purple-300 text-xs">moonshot</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300">+6.25 THC</div>
                            </div>
                            
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-full flex items-center justify-center">
                              <div className="text-xs text-slate-400 dark:text-slate-500">Empty</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy size={16} className="text-yellow-600" />
                            <span className="font-medium">Matrix Benefits</span>
                          </div>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center">
                              <ArrowRight size={14} className="text-indigo-500 mr-1 flex-shrink-0" />
                              <span>2.5% commission on all direct referral trades</span>
                            </li>
                            <li className="flex items-center">
                              <ArrowRight size={14} className="text-indigo-500 mr-1 flex-shrink-0" />
                              <span>1.25% commission on all level 2 referral trades</span>
                            </li>
                            <li className="flex items-center">
                              <ArrowRight size={14} className="text-indigo-500 mr-1 flex-shrink-0" />
                              <span>Automatic matrix filling from team spillover</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PopupContainer>
  );
}

// Add custom CSS for visualization 
const styles = `
.left-calc-1 {
  left: calc(50% - 100px);
}
.left-calc-2 {
  left: calc(50% + 100px);
}
.left-calc-3 {
  left: calc(25% - 65px);
}
.left-calc-4 {
  left: calc(50% - 0px);
}
.left-calc-5 {
  left: calc(75% + 65px);
}
`;

// Adding the styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}