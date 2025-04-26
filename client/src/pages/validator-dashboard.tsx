import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWallet } from '@solana/wallet-adapter-react';
import { BarChart3, Server, CpuIcon, Activity, Clock, Sparkles, Shield, Database, AlertTriangle } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StakeForm } from '@/components/validator/StakeForm';
import { ClaimRewards } from '@/components/validator/ClaimRewards';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Dynamically import the Chart component from recharts
const LineChart = React.lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = React.lazy(() => import('recharts').then(module => ({ default: module.Line })));
const XAxis = React.lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = React.lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = React.lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = React.lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = React.lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));

import '@solana/wallet-adapter-react-ui/styles.css';

// Generate some sample validator performance data
const generatePerformanceData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const skipSlots = Math.round(Math.random() * 5);
    const voteCredits = 400 + Math.round(Math.random() * 30);
    const rewards = 0.01 + (Math.random() * 0.02);
    
    data.push({
      date: date.toLocaleDateString(),
      skipSlots,
      voteCredits,
      rewards
    });
  }
  
  return data;
};

const ValidatorDashboardPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [error, setError] = useState<string | null>(null);
  const [validatorStatus, setValidatorStatus] = useState<'active' | 'inactive' | 'delinquent'>('active');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Sample validator stats - in production, these would come from the Solana RPC
  const [validatorStats, setValidatorStats] = useState({
    identity: 'ValidatorX1',
    commission: 5,
    activatedStake: 175420.65,
    creditsCurrent: 59826543,
    lastVote: new Date().getTime() - 15000, // 15 seconds ago
    rootSlot: 225467891,
    skipRate: 1.2,
    uptime: 99.98,
    version: '1.14.18',
    epochProgress: 78,
    currentEpoch: 452,
    lastEpochUptime: 99.94,
    delinquent: false
  });
  
  // Sample stake accounts
  const [stakeAccounts, setStakeAccounts] = useState([
    { address: 'Stake1...W8p2', amount: 25.5, status: 'active', activationEpoch: 450, rewards: 0.023 },
    { address: 'Stake2...K9q3', amount: 42.8, status: 'active', activationEpoch: 448, rewards: 0.045 },
    { address: 'Stake3...L7r5', amount: 10.0, status: 'activating', activationEpoch: 452, rewards: 0 }
  ]);
  
  // Generate performance data on mount
  useEffect(() => {
    if (connected) {
      setLoading(true);
      const data = generatePerformanceData();
      setPerformanceData(data);
      
      // Simulate loading validator data
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  }, [connected]);
  
  // Format SOL balance with 2 decimal places
  const formatSol = (amount: number): string => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Format time relative to now (e.g., "2 minutes ago")
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };
  
  // Calculate total stake and rewards
  const totalStake = stakeAccounts.reduce((sum, account) => sum + account.amount, 0);
  const totalRewards = stakeAccounts.reduce((sum, account) => sum + account.rewards, 0);
  
  const renderValidatorStatusBadge = () => {
    switch (validatorStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Inactive</Badge>;
      case 'delinquent':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Delinquent</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Validator Dashboard | Trade Hybrid</title>
      </Helmet>
      
      <PageHeader
        title="Validator Dashboard"
        description="Monitor your validator performance, stake SOL, and earn rewards"
      />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!connected ? (
        <Card className="mb-6">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Connect your Solana wallet to access validator functions, stake SOL, and earn dual rewards.
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Validator Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Server className="h-4 w-4 mr-2 text-green-500" />
                  Validator Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{validatorStats.identity}</div>
                    <div className="flex items-center mt-1">
                      {renderValidatorStatusBadge()}
                      <span className="text-xs text-muted-foreground ml-2">
                        Last vote: {formatTimeAgo(validatorStats.lastVote)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Commission</div>
                    <div className="text-xl font-bold">{validatorStats.commission}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <CpuIcon className="h-4 w-4 mr-2 text-purple-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Skip Rate</div>
                    <div className="font-medium">{validatorStats.skipRate}%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="font-medium">{validatorStats.uptime}%</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Version</div>
                    <div className="font-medium">{validatorStats.version}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-blue-500" />
                  Epoch Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Epoch: {validatorStats.currentEpoch}</span>
                    <span>{validatorStats.epochProgress}%</span>
                  </div>
                  <Progress value={validatorStats.epochProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Last Epoch Uptime: {validatorStats.lastEpochUptime}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                      Stake Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Stake</div>
                          <div className="text-2xl font-bold">{formatSol(totalStake)} SOL</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Validator's Stake</div>
                          <div className="text-2xl font-bold">{formatSol(validatorStats.activatedStake)} SOL</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Your Stake Accounts</div>
                        <div className="space-y-2">
                          {stakeAccounts.map((account, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="truncate max-w-[100px] font-mono text-xs">
                                  {account.address}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`ml-2 ${
                                    account.status === 'active' 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-amber-600 dark:text-amber-400'
                                  }`}
                                >
                                  {account.status}
                                </Badge>
                              </div>
                              <div className="font-medium">{formatSol(account.amount)} SOL</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="outline" onClick={() => setActiveTab('stake')}>
                          Manage Stake
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                      Rewards Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Total SOL Rewards</div>
                          <div className="text-2xl font-bold">{formatSol(totalRewards)} SOL</div>
                          <div className="text-xs text-muted-foreground">
                            ≈ ${(totalRewards * 150).toFixed(2)} USD
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">THC Bonus Rewards</div>
                          <div className="text-2xl font-bold">25.00 THC</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground mb-1">Recent Rewards</div>
                        
                        <div className="space-y-3">
                          {[1, 2, 3].map((_, index) => {
                            const amount = (Math.random() * 0.02).toFixed(4);
                            const days = Math.floor(Math.random() * 5) + 1;
                            
                            return (
                              <div key={index} className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">+{amount} SOL</div>
                                  <div className="text-xs text-muted-foreground">
                                    {days} {days === 1 ? 'day' : 'days'} ago
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-green-600 dark:text-green-400">
                                  Credited
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="outline" onClick={() => setActiveTab('rewards')}>
                          View All Rewards
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Vote transaction', time: '2 minutes ago', slot: 225467850 },
                      { action: 'Rewards distributed', time: '1 hour ago', slot: 225465432 },
                      { action: 'New stake activated', time: '2 days ago', slot: 225400123 },
                      { action: 'Vote transaction', time: '2 days ago', slot: 225400100 },
                      { action: 'Rewards distributed', time: '3 days ago', slot: 225350000 }
                    ].map((activity, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-xs text-muted-foreground">
                            {activity.time}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono">Slot {activity.slot}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Stake Tab */}
            <TabsContent value="stake" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StakeForm />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-purple-500" />
                      Your Stake Accounts
                    </CardTitle>
                    <CardDescription>
                      Manage your delegated stake to the Trade Hybrid validator
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stakeAccounts.length > 0 ? (
                      <div className="space-y-4">
                        {stakeAccounts.map((account, index) => (
                          <div key={index} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-mono text-xs mb-1">{account.address}</div>
                                <div className="text-lg font-bold">{formatSol(account.amount)} SOL</div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Activated Epoch: {account.activationEpoch}
                                </div>
                              </div>
                              <Badge 
                                className={`
                                  ${account.status === 'active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                  }
                                `}
                              >
                                {account.status}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              <Button variant="outline" size="sm" className="text-xs">
                                Details
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs text-red-600 dark:text-red-400">
                                Withdraw
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-medium mb-2">No Stake Accounts</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                          You don't have any stake accounts delegated to the Trade Hybrid validator yet.
                        </p>
                        <Button variant="default" onClick={() => setActiveTab('stake')}>
                          Stake SOL Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Rewards Tab */}
            <TabsContent value="rewards" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClaimRewards pendingRewards={totalRewards} thcRewards={25} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                      Rewards History
                    </CardTitle>
                    <CardDescription>
                      Track your staking rewards over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(5)].map((_, index) => {
                        const amount = (Math.random() * 0.05).toFixed(4);
                        const days = (index + 1) * 3;
                        
                        return (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                            <div>
                              <div className="font-medium text-green-600 dark:text-green-400">+{amount} SOL</div>
                              <div className="text-xs text-muted-foreground">
                                {days} days ago (Epoch {validatorStats.currentEpoch - Math.floor(days / 3)})
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">APY at time</div>
                              <div className="font-medium">{(5 + Math.random() * 2).toFixed(1)}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>THC Token Rewards</CardTitle>
                  <CardDescription>
                    Earn additional THC tokens for staking SOL with our validator
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                      <div className="flex items-center mb-2">
                        <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                        <h3 className="font-medium">THC Bonus Program</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Stake SOL with our validator and get THC tokens as additional rewards.
                        These tokens can be used in the Trade Hybrid ecosystem for premium features.
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span>Bonus Rate:</span>
                        <span className="font-medium">5 THC per 100 SOL per month</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                      <div className="flex items-center mb-2">
                        <Shield className="h-5 w-5 mr-2 text-blue-500" />
                        <h3 className="font-medium">Your THC Balance</h3>
                      </div>
                      <div className="text-2xl font-bold mb-2">25.00 THC</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Earned this epoch:</span>
                          <span>3.75 THC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending:</span>
                          <span>1.25 THC</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <a href="/thc-staking">Go to THC Staking</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-500" />
                    Validator Performance
                  </CardTitle>
                  <CardDescription>
                    Track skip rate, vote credits, and rewards over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <React.Suspense fallback={<div>Loading chart...</div>}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={performanceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="skipSlots" 
                            name="Skip Slots"
                            stroke="#ef4444" 
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="voteCredits" 
                            name="Vote Credits"
                            stroke="#3b82f6" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </React.Suspense>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                    Rewards Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <React.Suspense fallback={<div>Loading chart...</div>}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={performanceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`${value.toFixed(4)} SOL`, 'Rewards']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="rewards" 
                            name="SOL Rewards"
                            stroke="#10b981" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </React.Suspense>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Validator Stats Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Identity</span>
                        <span className="font-medium font-mono">{validatorStats.identity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commission</span>
                        <span className="font-medium">{validatorStats.commission}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Activated Stake</span>
                        <span className="font-medium">{formatSol(validatorStats.activatedStake)} SOL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credits (Current)</span>
                        <span className="font-medium">{validatorStats.creditsCurrent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Vote</span>
                        <span className="font-medium">{formatTimeAgo(validatorStats.lastVote)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Root Slot</span>
                        <span className="font-medium">{validatorStats.rootSlot.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skip Rate</span>
                        <span className="font-medium">{validatorStats.skipRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{validatorStats.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-medium">{validatorStats.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delinquent</span>
                        <span className="font-medium">{validatorStats.delinquent ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ValidatorDashboardPage;