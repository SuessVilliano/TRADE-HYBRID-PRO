import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle, Clock, DollarSign, ChevronRight, TrendingUp, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatCurrency, formatPercent } from '@/lib/utils';

const PropFirmDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    // Fetch user's prop firm accounts
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/prop-firm/accounts');
        if (!response.ok) {
          throw new Error('Failed to fetch accounts');
        }
        
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load accounts. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    // Fetch available challenges
    const fetchChallenges = async () => {
      try {
        const response = await fetch('/api/prop-firm/challenges');
        if (!response.ok) {
          throw new Error('Failed to fetch challenges');
        }
        
        const data = await response.json();
        setChallenges(data);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        toast({
          title: 'Error',
          description: 'Failed to load challenges. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
    fetchChallenges();
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
    <div className="container px-4 mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Proprietary Trading Firm</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/prop-firm/challenges')}
          >
            View All Challenges
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Trade with our capital after proving your skills through trading challenges.
          Successful traders keep up to 80% of profits with no personal risk.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="accounts">My Accounts</TabsTrigger>
            <TabsTrigger value="challenges">Available Challenges</TabsTrigger>
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
          
          <TabsContent value="challenges" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading challenges...</span>
              </div>
            ) : challenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardHeader>
                      <CardTitle className="text-xl">{challenge.name}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Account Size:</span>
                          <span className="font-semibold">{formatCurrency(challenge.accountSize)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Phase 1 Target:</span>
                          <span className="font-semibold">{formatPercent(challenge.targetProfitPhase1)}</span>
                        </div>
                        
                        {challenge.targetProfitPhase2 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Phase 2 Target:</span>
                            <span className="font-semibold">{formatPercent(challenge.targetProfitPhase2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Max Drawdown:</span>
                          <span className="font-semibold">{formatPercent(challenge.maxTotalDrawdown)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold">{challenge.durationDays} days</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-1.5 items-center">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Succeed in both phases to earn a funded account</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5 items-center">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BarChart2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Trade through {challenge.broker_type?.displayName || 'our brokers'}</p>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => signUpForChallenge(challenge.id)}
                      >
                        Sign Up for Challenge
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Challenges Available</h3>
                <p className="text-muted-foreground">
                  There are no trading challenges available at the moment. Please check back later.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropFirmDashboard;