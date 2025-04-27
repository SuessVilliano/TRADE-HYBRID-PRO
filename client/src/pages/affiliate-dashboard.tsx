import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton';
import { EnhancedMatrixVisualization } from '@/components/affiliate/enhanced-matrix-visualization';
import { AffiliateService } from '@/lib/services/affiliate-service';
import { useState, useEffect } from 'react';
import { Copy, CheckCircle, AlertTriangle, Users, DollarSign, Wallet, Award, Info, Link as LinkIcon } from 'lucide-react';
import { useUserData } from '@/lib/contexts/UserDataContext';

/**
 * Affiliate Dashboard Page
 * Presents a complete affiliate dashboard with referral links, statistics,
 * and the enhanced matrix visualization system
 */
export default function AffiliateDashboardPage() {
  const { user } = useUserData();
  const { publicKey, connected } = useWallet();
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [referralCode, setReferralCode] = useState('');
  
  useEffect(() => {
    if (connected && publicKey) {
      // Generate a referral code from the wallet address
      setReferralCode(publicKey.toString().substring(0, 10));
    } else if (user?.username) {
      // If no wallet but user is logged in, use username
      setReferralCode(`THC${user.username.substring(0, 6)}`);
    } else {
      // Fallback
      setReferralCode('Connect wallet');
    }
  }, [connected, publicKey, user]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    
    // Reset copy success state after 3 seconds
    setTimeout(() => {
      setCopySuccess(false);
    }, 3000);
  };
  
  const referralLink = AffiliateService.generateReferralLink(referralCode);
  
  const renderConnectPrompt = () => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <div className="flex flex-col items-center text-center">
        <Wallet className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Connect your wallet to access the full Trade Hybrid matrix system, track your referrals,
          and earn commissions directly to your wallet.
        </p>
        <ConnectWalletButton variant="default" size="lg" />
      </div>
    </div>
  );
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Affiliate Program</h1>
        <p className="text-gray-400 mt-1">
          Earn commissions through our Forsage-style 100% direct crypto payments matrix
        </p>
      </div>
      
      <Tabs
        defaultValue="dashboard"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="matrix">Matrix</TabsTrigger>
          <TabsTrigger value="help">How It Works</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          {!connected && renderConnectPrompt()}
          
          <Card className="mb-6 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link to invite new users to Trade Hybrid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <Input
                  value={referralLink}
                  readOnly
                  disabled={!connected}
                  className="bg-slate-900 border-slate-700 text-sm font-mono flex-1"
                />
                <Button
                  variant={copySuccess ? "success" : "outline"}
                  onClick={() => copyToClipboard(referralLink)}
                  disabled={!connected}
                  className="flex items-center gap-2"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-slate-400">
                Share this link to start building your network! You'll receive commissions directly to your wallet.
              </p>
            </CardContent>
          </Card>
          
          {connected ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-500/20 mr-4">
                        <Users className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Your Referrals</p>
                        <p className="text-2xl font-bold">8 users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-500/20 mr-4">
                        <DollarSign className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Earned</p>
                        <p className="text-2xl font-bold">37.5 THC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-purple-500/20 mr-4">
                        <Award className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Matrix Levels</p>
                        <p className="text-2xl font-bold">3 active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-amber-500/20 mr-4">
                        <Wallet className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Auto-Payments</p>
                        <p className="text-2xl font-bold">100%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Your Referrals</CardTitle>
                    <CardDescription>
                      Breakdown of your direct and indirect referrals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center">
                          <Badge className="bg-blue-600 mr-2">L1</Badge>
                          <span>Direct (Level 1)</span>
                        </div>
                        <span className="font-bold">2 users</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center">
                          <Badge className="bg-indigo-600 mr-2">L2</Badge>
                          <span>Indirect (Level 2)</span>
                        </div>
                        <span className="font-bold">6 users</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center">
                          <Badge className="bg-green-600 mr-2">All</Badge>
                          <span>Total Network</span>
                        </div>
                        <span className="font-bold">8 users</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Earnings</CardTitle>
                    <CardDescription>
                      Summary of your affiliate earnings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                        <span>This Month</span>
                        <span className="font-bold text-green-500">+25.0 THC</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                        <span>Total Earned</span>
                        <span className="font-bold text-green-500">37.5 THC</span>
                      </div>
                      
                      <div className="mt-4">
                        <Alert className="bg-slate-900/80">
                          <Info className="h-4 w-4" />
                          <AlertTitle>Direct Payments</AlertTitle>
                          <AlertDescription>
                            All matrix commissions are paid directly to your wallet in real-time via smart contracts.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Matrix Benefits</CardTitle>
                  <CardDescription>
                    The Trade Hybrid affiliate matrix offers these amazing benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                      <div className="bg-yellow-500/20 p-3 rounded-full mb-3">
                        <DollarSign className="h-6 w-6 text-yellow-500" />
                      </div>
                      <h3 className="font-bold mb-2">100% Commission</h3>
                      <p className="text-sm text-slate-400">
                        Earn 100% of all matrix slot fees directly to your wallet
                      </p>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                      <div className="bg-purple-500/20 p-3 rounded-full mb-3">
                        <Users className="h-6 w-6 text-purple-500" />
                      </div>
                      <h3 className="font-bold mb-2">2×3 Spillover Matrix</h3>
                      <p className="text-sm text-slate-400">
                        Powerful structure with specific slots passing up to sponsors
                      </p>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                      <div className="bg-amber-500/20 p-3 rounded-full mb-3">
                        <Wallet className="h-6 w-6 text-amber-500" />
                      </div>
                      <h3 className="font-bold mb-2">Smart Contract Payments</h3>
                      <p className="text-sm text-slate-400">
                        Commissions paid automatically via blockchain smart contracts
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button variant="outline" onClick={() => setActiveTab('matrix')} className="flex items-center">
                    <span>View Matrix</span>
                    <LinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </>
          ) : (
            <Alert variant="warning" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Connect Your Wallet</AlertTitle>
              <AlertDescription>
                Please connect your wallet to view your affiliate statistics and access the full matrix system.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        {/* Matrix Tab */}
        <TabsContent value="matrix">
          {!connected && renderConnectPrompt()}
          <EnhancedMatrixVisualization walletAddress={publicKey?.toString()} />
        </TabsContent>
        
        {/* How It Works Tab */}
        <TabsContent value="help">
          <Card className="mb-6 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>How the Matrix System Works</CardTitle>
              <CardDescription>
                Understanding the Forsage-style direct payment matrix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                The Trade Hybrid matrix system uses a powerful Forsage-style matrix with 100% direct crypto payments
                to ensure maximum earnings potential for all participants. Here's how it works:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-5 rounded-lg">
                  <h3 className="text-lg font-bold mb-3">X3 Matrix Structure</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    The X3 matrix has a 2x3 structure with strategic pass-up positions:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
                    <li>Level 1: 2 positions (position 2 passes up to sponsor)</li>
                    <li>Level 2: 3 positions (position 3 passes up to sponsor)</li>
                    <li>Higher levels: 5 positions (positions 3 and 5 pass up)</li>
                    <li>Each level costs 2x the previous level's price</li>
                    <li>Starting at $25 for Level 1, going up to $51,200 for Level 12</li>
                  </ul>
                </div>
                
                <div className="bg-slate-900 p-5 rounded-lg">
                  <h3 className="text-lg font-bold mb-3">Smart Contract Payments</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    All payments are handled through secure blockchain smart contracts:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-slate-400">
                    <li>100% of payments go directly to affiliate wallets</li>
                    <li>No platform fees or delays in payment processing</li>
                    <li>Automatic pass-up system benefits both newcomers and established members</li>
                    <li>Complete transparency with all transactions on the blockchain</li>
                    <li>Automatic recycling creates infinite earning potential</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-5 bg-amber-900/20 border border-amber-800 rounded-lg">
                <h3 className="text-lg font-bold mb-3">Getting Started</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-300">
                  <li>
                    <span className="font-medium">Connect your wallet</span>
                    <p className="ml-6 text-sm text-slate-400 mt-1">
                      Use Phantom wallet or Web3Auth to connect securely to the platform.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Activate your first matrix position</span>
                    <p className="ml-6 text-sm text-slate-400 mt-1">
                      Start with Level 1 at $25 to join the matrix system.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Share your referral link</span>
                    <p className="ml-6 text-sm text-slate-400 mt-1">
                      Invite others to join under you to fill your matrix positions.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Upgrade to higher levels</span>
                    <p className="ml-6 text-sm text-slate-400 mt-1">
                      As you earn, activate higher levels to increase your earning potential.
                    </p>
                  </li>
                </ol>
                
                <div className="mt-6 text-center">
                  <Button 
                    variant="default" 
                    onClick={() => setActiveTab('matrix')}
                    className="px-8"
                  >
                    Get Started Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}