import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle, Clock, DollarSign, ChevronRight, TrendingUp, BarChart2, Settings } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { TradingDashboardLayout } from '@/components/ui/trading-dashboard-layout';

const PropFirmDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    // Check for auto-redirect preference
    const shouldAutoOpen = localStorage.getItem('hybridFundingAutoRedirect');
    const lastRedirect = localStorage.getItem('hybridFundingLastRedirect');
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Auto-redirect if enabled and hasn't been done recently
    if (shouldAutoOpen === 'true' && (!lastRedirect || (now - parseInt(lastRedirect)) > oneHour)) {
      setTimeout(() => {
        const hybridFundingUrl = 'https://hybridfundingdashboard.propaccount.com/en/signin';
        localStorage.setItem('hybridFundingLastRedirect', now.toString());
        window.open(hybridFundingUrl, '_blank', 'noopener,noreferrer');
      }, 2000); // 2 second delay to let page load
    }

    // Fetch mock data - this is a temporary solution until the API is working
    const fetchMockData = () => {
      try {
        // Mock accounts data
        const mockAccounts = [
          {
            id: 1,
            userId: 1,
            accountName: "Crypto Challenge Account",
            accountType: "challenge_phase1",
            status: "active",
            accountSize: 50000,
            currentBalance: 52300,
            profitTarget: 8,
            maxDailyDrawdown: 5,
            maxTotalDrawdown: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            userId: 1,
            accountName: "Forex Fund Account",
            accountType: "funded",
            status: "funded",
            accountSize: 100000,
            currentBalance: 112450,
            profitSplit: 75,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        setAccounts(mockAccounts);
        setChallenges([]); // Remove mock challenges - users access real challenges through HybridFunding.co
      } catch (error) {
        console.error('Error setting mock data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    // Try to fetch from API first, fall back to mock data
    const fetchFromAPI = async () => {
      try {
        // Accounts
        const accountsResponse = await fetch('/api/prop-firm/accounts');
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          setAccounts(accountsData);
        }
        
        // Challenges
        const challengesResponse = await fetch('/api/prop-firm/challenges');
        if (challengesResponse.ok) {
          const challengesData = await challengesResponse.json();
          setChallenges(challengesData);
        }
        
        // If both responses failed, use mock data
        if (!accountsResponse.ok || !challengesResponse.ok) {
          fetchMockData();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('API error, using mock data:', error);
        fetchMockData();
      }
    };

    fetchFromAPI();
  }, [toast]);

  // Function to determine the badge color based on account status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
      case 'funded':
        return <Badge className="bg-green-500 hover:bg-green-600">Funded</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Function to get account progress percentage
  const getAccountProgress = (account: any) => {
    if (account.accountType === 'funded') return 100;
    
    const currentProfit = account.currentBalance - account.accountSize;
    const profitPercent = (currentProfit / account.accountSize) * 100;
    const progressPercent = (profitPercent / account.profitTarget) * 100;
    
    // Cap between 0 and 100
    return Math.min(Math.max(progressPercent, 0), 100);
  };

  // Navigate to account details page
  const viewAccountDetails = (accountId: number) => {
    navigate(`/prop-firm/accounts/${accountId}`);
  };

  // Navigate to the challenge signup page
  const signUpForChallenge = (challengeId: number) => {
    navigate(`/prop-firm/challenges/${challengeId}/signup`);
  };

  return (
    <TradingDashboardLayout>
      <div className="container px-4 mx-auto py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">HybridFunding.co - Prop Trading</h1>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  // Open HybridFunding dashboard with auto-login
                  const hybridFundingUrl = 'https://hybridfundingdashboard.propaccount.com/en/signin';
                  
                  // Store user preference for auto-login
                  localStorage.setItem('hybridFundingAutoLogin', 'true');
                  localStorage.setItem('hybridFundingLastAccess', new Date().toISOString());
                  
                  window.open(hybridFundingUrl, '_blank', 'noopener,noreferrer');
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Open HybridFunding Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const hybridFundingUrl = 'https://hybridfundingdashboard.propaccount.com/en/signin';
                  window.open(hybridFundingUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                View Real Challenges
              </Button>
            </div>
          </div>
        
        <p className="text-muted-foreground mb-6">
          Trade with HybridFunding.co capital after proving your skills through trading challenges.
          Successful traders keep up to 80% of profits with no personal risk.
        </p>

        {/* Quick Access to HybridFunding Dashboard */}
        <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              HybridFunding Dashboard Access
            </CardTitle>
            <CardDescription>
              Access your live trading account, view performance, and manage your prop firm journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Last accessed: {localStorage.getItem('hybridFundingLastAccess') ? 
                    new Date(localStorage.getItem('hybridFundingLastAccess')!).toLocaleDateString() : 
                    'Never'
                  }
                </p>
                <Badge variant={localStorage.getItem('hybridFundingAutoLogin') ? 'default' : 'outline'}>
                  {localStorage.getItem('hybridFundingAutoLogin') ? 'Auto-login enabled' : 'Auto-login disabled'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="lg"
                  onClick={() => {
                    const hybridFundingUrl = 'https://hybridfundingdashboard.propaccount.com/en/signin';
                    
                    // Enhanced auto-login storage
                    localStorage.setItem('hybridFundingAutoLogin', 'true');
                    localStorage.setItem('hybridFundingLastAccess', new Date().toISOString());
                    localStorage.setItem('hybridFundingUserSession', JSON.stringify({
                      timestamp: new Date().toISOString(),
                      userId: user?.id || 'guest',
                      platform: 'TradeHybrid'
                    }));
                    
                    // Open in new tab with session context
                    const newWindow = window.open(hybridFundingUrl, '_blank', 'noopener,noreferrer');
                    
                    // Optional: Add session restoration capability
                    if (newWindow) {
                      newWindow.onload = () => {
                        // This could be used to inject session data if needed
                        console.log('HybridFunding dashboard opened successfully');
                      };
                    }
                    
                    toast({
                      title: "Opening HybridFunding Dashboard",
                      description: "Your session has been saved for automatic login.",
                    });
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Open Live Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const currentAutoRedirect = localStorage.getItem('hybridFundingAutoRedirect') === 'true';
                    localStorage.setItem('hybridFundingAutoRedirect', (!currentAutoRedirect).toString());
                    
                    toast({
                      title: currentAutoRedirect ? "Auto-redirect disabled" : "Auto-redirect enabled",
                      description: currentAutoRedirect 
                        ? "HybridFunding dashboard won't open automatically anymore." 
                        : "HybridFunding dashboard will open automatically when you visit this page.",
                    });
                    
                    // Force re-render to update badge
                    setActiveTab(activeTab);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Auto-redirect {localStorage.getItem('hybridFundingAutoRedirect') === 'true' ? 'OFF' : 'ON'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading your accounts...</span>
              </div>
            ) : accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{account.accountName}</CardTitle>
                        {getStatusBadge(account.status)}
                      </div>
                      <CardDescription>
                        {account.accountType === 'challenge_phase1' && 'Challenge - Phase 1'}
                        {account.accountType === 'challenge_phase2' && 'Challenge - Phase 2'}
                        {account.accountType === 'funded' && 'Funded Account'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-0">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Account Size:</span>
                          <span className="font-semibold">{formatCurrency(account.accountSize)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Current Balance:</span>
                          <span 
                            className={`font-semibold ${account.currentBalance >= account.accountSize ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {formatCurrency(account.currentBalance)}
                          </span>
                        </div>
                        
                        {account.accountType !== 'funded' && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Profit Target:</span>
                              <span className="font-semibold">{formatPercent(account.profitTarget)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Max Drawdown:</span>
                              <span className="font-semibold">{formatPercent(account.maxTotalDrawdown)}</span>
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress to Target:</span>
                                <span>{Math.round(getAccountProgress(account))}%</span>
                              </div>
                              <Progress value={getAccountProgress(account)} className="h-2" />
                            </div>
                          </>
                        )}
                        
                        {account.accountType === 'funded' && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Profit Split:</span>
                            <span className="font-semibold">{account.profitSplit}%</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-4">
                      <Button 
                        variant="default" 
                        onClick={() => viewAccountDetails(account.id)}
                        className="w-full"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Accounts Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any prop firm accounts yet. Sign up for a challenge to get started.
                </p>
                <Button onClick={() => setActiveTab('challenges')}>
                  View Available Challenges
                </Button>
              </div>
            )}
          </TabsContent>
          

        </Tabs>
      </div>
    </div>
  </TradingDashboardLayout>
  );
};

export default PropFirmDashboardPage;