import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PopupContainer } from '@/components/ui/popup-container';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Coins, 
  ArrowDownUp, 
  Wallet, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCcw,
  Link as LinkIcon, 
  Copy as CopyIcon,
  Info as InfoIcon,
  Trophy,
  Network,
  ChevronsUpDown,
  Sparkles,
  Copy,
  CheckCircle2,
  Rocket,
  ExternalLink,
  Layers
} from 'lucide-react';
import { THC_TOKEN_CONFIG, calculateStakingRewards, calculateStakingApy } from '@/lib/contracts/thc-token-info';
import { useAffiliateTracking, AffiliateService } from '@/lib/services/affiliate-service';
import { THC_TOKEN } from '@/lib/constants';
import { THCMembershipCard } from '@/components/ui/thc-membership-display';
import { useSolanaAuth, MembershipTier } from '@/lib/context/SolanaAuthProvider';
import { Lock } from 'lucide-react';

export default function StakeAndBake() {
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
  const [referralLink, setReferralLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [hasCreatedMatrix, setHasCreatedMatrix] = useState(false);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);
  
  // Get the Solana wallet auth context
  const solanaAuth = useSolanaAuth();
  const [membershipTier, setMembershipTier] = useState<MembershipTier | null>(null);
  
  // Get the toast function for notifications
  const { toast } = useToast();
  
  // Use the affiliate tracking hook
  const { trackReferral, currentReferralCode, generateReferralLink, trackAction } = useAffiliateTracking();
  
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
    const generatedAddress = 'TH' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setReferralAddress(generatedAddress);
    
    // Generate and set referral link based on address
    setReferralLink(generateReferralLink(generatedAddress));
    
    // Check if the user was referred by someone
    const storedReferralCode = AffiliateService.getStoredReferralCode();
    if (storedReferralCode) {
      setReferrerCode(storedReferralCode);
      console.log(`User was referred by: ${storedReferralCode}`);
    }
    
    // Check user's THC token membership tier if wallet is connected
    if (solanaAuth.isWalletAuthenticated) {
      const checkMembership = async () => {
        try {
          const membership = await solanaAuth.checkTHCTokenMembership();
          setMembershipTier(membership.tier);
          console.log('User membership tier:', membership.tier);
        } catch (error) {
          console.error('Error checking THC token membership:', error);
        }
      };
      
      checkMembership();
    }
    
    return () => clearTimeout(timer);
  }, [generateReferralLink, solanaAuth.isWalletAuthenticated, solanaAuth.checkTHCTokenMembership]);
  
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
    
    const amount = parseFloat(stakeAmount);
    
    // Update UI with staked amount
    setStakedAmount(prev => prev + amount);
    setThcBalance(prev => prev - amount);
    setStakeAmount('');
    
    // Track staking action for affiliate rewards
    trackAction('stake', amount);
    
    // Log referrer if exists
    if (referrerCode) {
      console.log(`Staking ${amount} THC with referral from: ${referrerCode}`);
    }
    
    // Show success message via toast notification
    toast({
      title: "Staking Successful",
      description: `You've staked ${amount} THC tokens for ${stakeDuration} days`,
      variant: "default",
    });
  };
  
  // Handle matrix creation
  const handleCreateMatrix = () => {
    setHasCreatedMatrix(true);
    
    // Generate a realistic referral link
    const host = window.location.host;
    const newReferralLink = `https://${host}/?ref=${referralAddress}`;
    setReferralLink(newReferralLink);
    
    // Update matrix with realistic data
    updateMatrixData();
    
    // Track matrix creation for affiliate rewards (matrix activation fee would be 0.1 SOL)
    trackAction('registration');
    
    // Log referrer if exists for matrix creation
    if (referrerCode) {
      console.log(`Matrix created with referral from: ${referrerCode}`);
    }
    
    // In a real implementation, this would make a contract call to initialize the matrix
    
    // Show success notification
    toast({
      title: "Matrix Created!",
      description: "Your 2x3 affiliate matrix has been activated",
      variant: "default",
    });
  };
  
  // Function to update matrix data (would be connected to blockchain in real implementation)
  const updateMatrixData = () => {
    // This simulates getting updated matrix data from a blockchain or database
    const updatedMatrix = [
      { id: 'you', level: 0, position: 0, filled: true, username: 'You', earnings: 0 },
      // Level 1 (2 positions)
      { id: 'L1P1', level: 1, position: 0, filled: true, username: 'trader92', earnings: 12.5 },
      { id: 'L1P2', level: 1, position: 1, filled: true, username: 'cryptomaster', earnings: 12.5 },
      // Level 2 (3 positions)
      { id: 'L2P1', level: 2, position: 0, filled: true, username: 'hodlgang', earnings: 6.25 },
      { id: 'L2P2', level: 2, position: 1, filled: true, username: 'moonshot', earnings: 6.25 },
      { id: 'L2P3', level: 2, position: 2, filled: false, username: '', earnings: 0 },
    ];
    
    setMatrixData(updatedMatrix);
  };

  // Handle copying of referral link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    
    // Show toast notification
    toast({
      title: "Copied!",
      description: "Affiliate link copied to clipboard",
    });
  };
  
  return (
    <PopupContainer className="min-h-screen container mx-auto py-8 px-4" padding>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">THC Token - Platform Currency</h1>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">
          Stake your THC tokens to earn rewards, build your affiliate network, and access platform benefits with reduced fees.
        </p>
        
        {referrerCode && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300">
            <LinkIcon size={16} className="mr-2" />
            <span className="text-sm">You were referred by: {referrerCode}</span>
          </div>
        )}
      </div>
      
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="staking" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="staking" className="text-lg py-3">
              <Coins className="mr-2 h-5 w-5" />
              THC
            </TabsTrigger>
            <TabsTrigger value="matrix" className="text-lg py-3">
              <Network className="mr-2 h-5 w-5" />
              Infinite Spillover Matrix
            </TabsTrigger>
            <TabsTrigger value="acquire" className="text-lg py-3">
              <Rocket className="mr-2 h-5 w-5" />
              Acquire THC
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
                        <input 
                          type="checkbox" 
                          id="auto-compound" 
                          checked={autoCompound} 
                          onChange={(e) => setAutoCompound(e.target.checked)} 
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
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
                      Infinite Spillover Matrix System
                    </CardTitle>
                    <CardDescription>
                      Build your affiliate network and earn passive income through our infinite spillover matrix structure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!hasCreatedMatrix ? (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
                          <p className="text-sm">
                            Create your infinite spillover matrix to start earning affiliate commissions. This requires a one-time 
                            activation fee of 0.1 SOL, which covers the smart contract initialization.
                          </p>
                        </div>
                        
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">How It Works</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>You occupy the top position in your personal infinite spillover matrix</span>
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
                          {!connectedWallet ? 'Connect Wallet to Create Matrix' : 'Create Your Infinite Spillover Matrix (0.1 SOL)'}
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
                            Your infinite spillover matrix is active and ready to receive referrals. Share your referral link to start building your network!
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
                      Visual representation of your infinite spillover matrix structure and positions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!hasCreatedMatrix ? (
                      <div className="flex flex-col items-center justify-center h-[400px] bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Network size={48} className="text-slate-400 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs">
                          Create your infinite spillover matrix to view your network structure and track referral earnings.
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
            
            {/* Add a new row for the advanced affiliate tools */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
                Advanced Affiliate Tools
              </h3>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LinkIcon className="mr-2 h-5 w-5 text-blue-500" />
                    Affiliate Link Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="affiliate-link">Your Affiliate Link</Label>
                      <div className="flex">
                        <Input 
                          id="affiliate-link" 
                          value={`${window.location.origin}?ref=${referralAddress || 'THC' + Math.random().toString(36).substring(2, 8)}`} 
                          readOnly 
                          className="flex-1 rounded-r-none"
                        />
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}?ref=${referralAddress || 'THC' + Math.random().toString(36).substring(2, 8)}`);
                            toast({
                              title: "Copied!",
                              description: "Affiliate link copied to clipboard",
                            });
                          }}
                          className="rounded-l-none"
                        >
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Share on Social Media</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?text=Join%20Trade%20Hybrid%20and%20earn%20with%20me!&url=${encodeURIComponent(`${window.location.origin}?ref=${referralAddress || 'default'}`)}`, '_blank');
                          }}
                        >
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Twitter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}?ref=${referralAddress || 'default'}`)}`, '_blank');
                          }}
                        >
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}?ref=${referralAddress || 'default'}`)}&text=Join%20Trade%20Hybrid%20and%20earn%20with%20me!`, '_blank');
                          }}
                        >
                          <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                          Telegram
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <h4 className="text-sm font-medium">Affiliate Stats</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">Total Referrals</div>
                          <div className="text-xl font-bold">
                            {Math.floor(Math.random() * 10)}
                          </div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg">
                          <div className="text-xs text-slate-400">Earnings (THC)</div>
                          <div className="text-xl font-bold">
                            {(Math.random() * 1000).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-900/30 border-blue-800">
                      <InfoIcon className="h-4 w-4" />
                      <AlertTitle>Affiliate Tips</AlertTitle>
                      <AlertDescription className="text-sm">
                        Share your link on social media, in trading communities, or with friends to maximize your matrix filling and earn THC tokens.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Acquire THC Tab */}
          <TabsContent value="acquire">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="mr-2 h-5 w-5 text-blue-500" />
                    Acquire THC Tokens
                  </CardTitle>
                  <CardDescription>
                    Get your THC tokens via pump.fun and join our ecosystem with multiple benefits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 
                    border border-blue-200 dark:border-blue-800 p-6 rounded-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
                        <Layers className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">THC Token on pump.fun</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">The official Trade Hybrid platform token</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-md">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Current Price</div>
                        <div className="text-2xl font-bold mt-1">${THC_TOKEN.price.toFixed(6)} USD</div>
                        <div className="text-xs text-green-600 mt-1">+{THC_TOKEN.priceChange24h}% (24h)</div>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-md">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Contract Address</div>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">
                            {THC_TOKEN.contractAddress.substring(0, 8)}...{THC_TOKEN.contractAddress.substring(THC_TOKEN.contractAddress.length - 8)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              navigator.clipboard.writeText(THC_TOKEN.contractAddress);
                              toast({
                                title: "Copied!",
                                description: "Contract address copied to clipboard",
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <a
                            href={`${THC_TOKEN.explorerUrl}${THC_TOKEN.contractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center"
                          >
                            View on Solscan
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-md relative overflow-hidden mb-6">
                      <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Why Buy THC Tokens?</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Reduced platform fees (up to 50% discount)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Stake to earn passive income (up to 20% APY)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Participate in platform governance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Access to exclusive premium features</span>
                          </li>
                        </ul>
                      </div>
                      <div className="absolute top-0 right-0 opacity-10">
                        <Coins className="h-32 w-32" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <a 
                        href={THC_TOKEN.pumpFunUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
                      >
                        <Rocket className="mr-2 h-5 w-5" />
                        Buy THC on pump.fun
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        pump.fun is the premier Solana token platform. Make sure you're connected to your Solana wallet before purchasing.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-md">
                    <h3 className="font-medium mb-3">THC Token Membership Benefits</h3>
                    <p className="text-sm mb-4">
                      Holding THC tokens automatically qualifies you for premium membership benefits on the Trade Hybrid platform. 
                      Your membership tier depends on the amount of THC tokens in your wallet:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-slate-500">Basic</Badge>
                            <span className="font-medium">0-999 THC</span>
                          </div>
                          <span className="text-sm text-slate-500">5% fee discount</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-blue-500">Advanced</Badge>
                            <span className="font-medium">1,000-9,999 THC</span>
                          </div>
                          <span className="text-sm text-slate-500">25% fee discount</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-purple-500">Premium</Badge>
                            <span className="font-medium">10,000-49,999 THC</span>
                          </div>
                          <span className="text-sm text-slate-500">35% fee discount</span>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Badge className="mr-2 bg-amber-500">Elite</Badge>
                            <span className="font-medium">50,000+ THC</span>
                          </div>
                          <span className="text-sm text-slate-500">50% fee discount</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                      <h3 className="font-medium mb-4 flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-blue-500" />
                        Your Current Membership Status
                      </h3>
                      
                      {solanaAuth.isWalletAuthenticated ? (
                        <div>
                          <THCMembershipCard />
                          <p className="text-sm mt-3 text-slate-600 dark:text-slate-400">
                            Your THC token balance determines your membership tier and platform benefits.
                            {membershipTier === MembershipTier.BASIC && "Upgrade to Advanced tier by acquiring more THC tokens!"}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                          <p className="text-sm mb-3">Connect your Solana wallet to check your membership status</p>
                          <Button 
                            variant="outline" 
                            onClick={() => solanaAuth.loginWithSolana()}
                            disabled={solanaAuth.isAuthenticatingWithSolana}
                            className="text-sm"
                          >
                            {solanaAuth.isAuthenticatingWithSolana ? 'Connecting...' : 'Connect Wallet'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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