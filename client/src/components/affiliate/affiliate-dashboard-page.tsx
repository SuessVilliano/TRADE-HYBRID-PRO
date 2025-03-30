import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Copy, Users, DollarSign, CreditCard, Award, PieChart, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { AffiliateService } from '@/lib/services/affiliate-service';
import { MatrixVisualization } from './matrix-visualization';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Combined Affiliate Dashboard Page
 * - Shows referral links, stats, and earnings
 * - Includes the matrix visualization
 * - Provides a sales component to explain the affiliate program
 */
export function AffiliateDashboardPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [referralCode, setReferralCode] = useState<string>('THC29CH8AF');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    directReferrals: 0,
    indirectReferrals: 0, 
    earnings: 0,
    thisMonth: 0
  });
  
  useEffect(() => {
    if (connected && publicKey) {
      // In a real implementation, we would fetch the user's referral code
      // from the backend or blockchain
      setReferralCode(publicKey.toString().substring(0, 10));
      
      // Fetch stats - in a real implementation, this would come from your API
      setStats({
        totalReferrals: 8,
        directReferrals: 2,
        indirectReferrals: 6,
        earnings: 37.5,
        thisMonth: 25.0
      });
    }
  }, [connected, publicKey]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };
  
  const referralLink = AffiliateService.generateReferralLink(referralCode);
  
  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        {/* Referral Link Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link to invite new users to Trade Hybrid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <Input 
                value={referralLink}
                readOnly
                className="bg-slate-900 border-slate-700 text-sm font-mono flex-1"
              />
              <Button 
                variant={copySuccess ? "success" : "outline"} 
                onClick={() => copyToClipboard(referralLink)}
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
              Share this link to start building your network!
            </p>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-500/20 mr-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Your Referrals</p>
                  <p className="text-2xl font-bold">{stats.totalReferrals} users</p>
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
                  <p className="text-2xl font-bold">{stats.earnings} THC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-purple-500/20 mr-4">
                  <CreditCard className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">This Month</p>
                  <p className="text-2xl font-bold">{stats.thisMonth} THC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-amber-500/20 mr-4">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Commission Rate</p>
                  <p className="text-2xl font-bold">2.5<span className="text-lg">%</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <span className="font-bold">{stats.directReferrals} users</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <div className="flex items-center">
                    <Badge className="bg-indigo-600 mr-2">L2</Badge>
                    <span>Indirect (Level 2)</span>
                  </div>
                  <span className="font-bold">{stats.indirectReferrals} users</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <div className="flex items-center">
                    <Badge className="bg-green-600 mr-2">All</Badge>
                    <span>Total Network</span>
                  </div>
                  <span className="font-bold">{stats.totalReferrals} users</span>
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
                  <span className="font-bold text-green-500">+{stats.thisMonth} THC</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                  <span>Total Earned</span>
                  <span className="font-bold text-green-500">{stats.earnings} THC</span>
                </div>
                
                <div className="mt-4">
                  <Button className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Withdraw Earnings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Matrix Benefits */}
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
                <div className="bg-blue-500/20 p-3 rounded-full mb-3">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-bold mb-2">2.5% Commission</h3>
                <p className="text-sm text-slate-400">
                  Earn 2.5% on all direct referral trades
                </p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                <div className="bg-purple-500/20 p-3 rounded-full mb-3">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-bold mb-2">Spillover Matrix</h3>
                <p className="text-sm text-slate-400">
                  Benefit from automated team spillover
                </p>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg flex flex-col items-center text-center">
                <div className="bg-amber-500/20 p-3 rounded-full mb-3">
                  <Award className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-bold mb-2">Instant Payments</h3>
                <p className="text-sm text-slate-400">
                  Commissions paid directly to your wallet
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={() => setActiveTab('matrix')} className="flex items-center">
              <span>View Matrix</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  const renderMatrix = () => {
    return <MatrixVisualization />;
  };
  
  const renderSales = () => {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Trade Hybrid Affiliate Program</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Earn passive income through trading commissions and our powerful matrix structure
          </p>
        </div>
        
        <Alert className="bg-blue-900/20 border-blue-800">
          <AlertTitle className="text-blue-400">Limited Time Offer</AlertTitle>
          <AlertDescription>
            Join now and get a 50% bonus on your first matrix position purchase!
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="bg-blue-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <PieChart className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>2.5% Commissions</CardTitle>
              <CardDescription>
                Earn from every trade your referrals make
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>2.5% on all direct referral trades</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>1.25% on all level 2 referral trades</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Unlimited earning potential</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="bg-purple-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>Matrix Structure</CardTitle>
              <CardDescription>
                Benefit from our powerful 2×3 matrix system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Automated team spillover</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>12 matrix levels from $25 to $51,200</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Position recycling for continuous income</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="bg-amber-500/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <CardTitle>Crypto Payments</CardTitle>
              <CardDescription>
                All commissions paid directly in cryptocurrency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Instant payments to your wallet</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>No minimum withdrawal amount</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 h-5 w-5 mt-0.5 shrink-0" />
                  <span>Multiple cryptocurrencies supported</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-8" />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Follow these simple steps to start earning with the Trade Hybrid affiliate program:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-blue-900 text-blue-300 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">1</div>
              <h3 className="font-bold text-lg mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-slate-400">
                Connect your Solana wallet to get started with Trade Hybrid
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-900 text-blue-300 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">2</div>
              <h3 className="font-bold text-lg mb-2">Share Your Link</h3>
              <p className="text-sm text-slate-400">
                Share your unique affiliate link with potential traders
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-blue-900 text-blue-300 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">3</div>
              <h3 className="font-bold text-lg mb-2">Earn Commissions</h3>
              <p className="text-sm text-slate-400">
                Earn from every trade your referrals make and matrix positions
              </p>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
            <CardContent className="pt-6 pb-8">
              <div className="relative z-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
                <p className="text-slate-400 max-w-lg mx-auto mb-6">
                  Join the Trade Hybrid affiliate program today and start earning passive income through trading commissions and our powerful matrix structure.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Get Your Affiliate Link
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setActiveTab('matrix')}>
                    <PieChart className="h-4 w-4 mr-2" />
                    View Matrix Structure
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  };
  
  if (!connected) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Affiliate Dashboard</CardTitle>
            <CardDescription>
              Connect your wallet to access the Trade Hybrid affiliate program
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-slate-900 p-8 rounded-full mb-6">
              <Users className="h-12 w-12 text-slate-400" />
            </div>
            <p className="text-center text-slate-400 mb-6">
              You need to connect your wallet to view your affiliate stats, generate your referral link, and access the matrix structure.
            </p>
            <Button disabled className="mb-2">Connect Wallet</Button>
            <p className="text-xs text-slate-500">
              Use the Connect Wallet button in the top-right corner of the page
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Affiliate Program</h1>
        <p className="text-slate-400">Manage your referrals and matrix structure</p>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="matrix">Matrix Visualization</TabsTrigger>
          <TabsTrigger value="sales">Affiliate Program</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>
        
        <TabsContent value="matrix">
          {renderMatrix()}
        </TabsContent>
        
        <TabsContent value="sales">
          {renderSales()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AffiliateDashboardPage;