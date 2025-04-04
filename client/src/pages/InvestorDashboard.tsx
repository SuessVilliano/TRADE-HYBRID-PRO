import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  AlertCircle, 
  Download, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  PieChart,
  FileCheck,
  Clock
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import { TradingDashboardLayout } from '@/components/ui/trading-dashboard-layout';

// For data visualization, we're using recharts
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const InvestorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [investor, setInvestor] = useState<any>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Track data loading with a ref to prevent duplicate requests
  const dataFetchedRef = React.useRef(false);
  
  useEffect(() => {
    // Prevent multiple fetches in development mode with React strict mode
    if (dataFetchedRef.current) return;
    
    // Fetch investor information
    const fetchInvestorData = async () => {
      try {
        setLoading(true);
        
        // Fetch investor profile
        const investorResponse = await fetch(`/api/investors/me`);
        if (!investorResponse.ok) {
          throw new Error('Failed to fetch investor profile');
        }
        
        const investorData = await investorResponse.json();
        setInvestor(investorData);
        
        if (!investorData || !investorData.id) {
          console.error('Invalid investor data received');
          setLoading(false);
          return;
        }
        
        // Fetch investments
        const investmentsResponse = await fetch(`/api/investments?investorId=${investorData.id}`);
        if (!investmentsResponse.ok) {
          throw new Error('Failed to fetch investments');
        }
        
        const investmentsData = await investmentsResponse.json();
        setInvestments(investmentsData || []);
        
        // Fetch performance records - check valid investments
        if (investmentsData && investmentsData.length > 0) {
          try {
            const performanceResponse = await fetch(`/api/investment-performance?investorId=${investorData.id}`);
            if (!performanceResponse.ok) {
              console.error('Performance records fetch returned status:', performanceResponse.status);
              // Don't throw error, just log and continue with empty array
              setPerformanceRecords([]);
            } else {
              const performanceData = await performanceResponse.json();
              // Ensure we have proper array data
              if (Array.isArray(performanceData)) {
                setPerformanceRecords(performanceData);
              } else {
                console.error('Invalid performance data format:', performanceData);
                setPerformanceRecords([]);
              }
            }
          } catch (perfError) {
            console.error('Error fetching performance records:', perfError);
            // Don't fail entire load, just set empty performance records
            setPerformanceRecords([]);
          }
        } else {
          // No investments, so no performance to fetch
          setPerformanceRecords([]);
        }
        
        // Mark data as fetched to prevent duplicate requests
        dataFetchedRef.current = true;
        
      } catch (error) {
        console.error('Error fetching investor data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your investment data. Please try again later.',
          variant: 'destructive',
        });
        // Set default empty values on error
        setInvestor(null);
        setInvestments([]);
        setPerformanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestorData();
  }, [toast, user]);

  // Calculate total portfolio value
  const calculateTotalPortfolioValue = () => {
    return investments.reduce((total, investment) => {
      return total + (investment.currentBalance || 0);
    }, 0);
  };

  // Calculate total return
  const calculateTotalReturn = () => {
    const totalDeposited = investments.reduce((total, investment) => {
      return total + (investment.initialDeposit || 0);
    }, 0);
    
    const currentValue = calculateTotalPortfolioValue();
    
    if (totalDeposited === 0) return 0;
    
    return ((currentValue - totalDeposited) / totalDeposited) * 100;
  };

  // Calculate monthly performance data for chart
  const getMonthlyPerformanceData = () => {
    // Safety check
    if (!performanceRecords || performanceRecords.length === 0) {
      return [];
    }
    
    // Group performance records by month
    const monthlyData: Record<string, number> = {};
    
    performanceRecords.forEach(record => {
      if (!record.period) return; // Skip invalid records
      
      if (monthlyData[record.period]) {
        // Weighted average based on investment size
        const existingValue = monthlyData[record.period];
        const recordWeight = (record.startBalance || 0) / Math.max(totalPortfolioValue, 1);
        monthlyData[record.period] = existingValue + ((record.percentReturn || 0) * recordWeight);
      } else {
        monthlyData[record.period] = record.percentReturn || 0;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(monthlyData).map(([period, returnValue]) => ({
      month: period,
      return: returnValue
    }));
  };

  // Format investment type for display
  const formatInvestmentType = (type: string) => {
    switch (type) {
      case 'personal':
        return 'Personal Account';
      case 'prop_firm_management':
        return 'Prop Firm Management';
      case 'hybrid_fund':
        return 'Hybrid Fund';
      default:
        return type;
    }
  };

  // Function to determine the badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'closed':
        return <Badge className="bg-red-500 hover:bg-red-600">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate investment distribution data for chart
  const getInvestmentDistributionData = () => {
    const typeDistribution: Record<string, number> = {
      'personal': 0,
      'prop_firm_management': 0,
      'hybrid_fund': 0
    };
    
    investments.forEach(investment => {
      if (typeDistribution[investment.type] !== undefined) {
        typeDistribution[investment.type] += investment.currentBalance || 0;
      }
    });
    
    return [
      { name: 'Personal', value: typeDistribution['personal'] },
      { name: 'Prop Firm', value: typeDistribution['prop_firm_management'] },
      { name: 'Hybrid Fund', value: typeDistribution['hybrid_fund'] }
    ];
  };

  // View investment details
  const viewInvestmentDetails = (investmentId: number) => {
    navigate(`/investments/${investmentId}`);
  };

  // Download performance report
  const downloadReport = (reportUrl: string) => {
    window.open(reportUrl, '_blank');
  };

  // Calculate total portfolio and statistics
  const totalPortfolioValue = calculateTotalPortfolioValue();
  const totalReturn = calculateTotalReturn();
  const activeInvestments = investments.filter(i => i.status === 'active').length;
  const monthlyPerformanceData = getMonthlyPerformanceData();
  const investmentDistributionData = getInvestmentDistributionData();

  if (loading) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your investment dashboard...</span>
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="text-center p-8 bg-muted rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Investor Profile</h3>
          <p className="text-muted-foreground mb-4">
            You don't have an investor profile yet. Please contact our team to set up your investment account.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TradingDashboardLayout>
      <div className="container px-4 mx-auto py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Investor Dashboard</h1>
            <Button 
              variant="outline" 
              onClick={() => {
                // Reset fetch state to allow refetching
                dataFetchedRef.current = false;
                // Then force a re-render to trigger the data fetch
                setLoading(true);
              }}
            >
              Refresh Data
            </Button>
          </div>
        
        <p className="text-muted-foreground mb-6">
          Welcome back, {investor.name}. Here's the current status of your investments.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Portfolio Value</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalPortfolioValue)}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className={`font-medium ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(totalReturn)}
                </span> total return
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Investments</p>
                  <h3 className="text-2xl font-bold mt-1">{activeInvestments}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium">{investments.length}</span> total investments
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Latest Performance</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {performanceRecords.length > 0
                      ? formatPercent(performanceRecords[0].percentReturn || 0)
                      : '0%'}
                  </h3>
                </div>
                <PieChart className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium">
                  {performanceRecords.length > 0 && performanceRecords[0].period
                    ? performanceRecords[0].period
                    : 'No data yet'}
                </span> period
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investments">My Investments</TabsTrigger>
            <TabsTrigger value="performance">Performance History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>
                  Your investment return percentage by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyPerformanceData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Return']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="return" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        name="Monthly Return"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Investment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your investments by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={investmentDistributionData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Investment Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-4">
            {investments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investments.map((investment) => (
                  <Card key={investment.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{investment.name}</CardTitle>
                        {getStatusBadge(investment.status)}
                      </div>
                      <CardDescription>
                        {formatInvestmentType(investment.type)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-0">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Initial Deposit:</span>
                          <span className="font-semibold">{formatCurrency(investment.initialDeposit)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Current Balance:</span>
                          <span 
                            className={`font-semibold ${investment.currentBalance >= investment.initialDeposit ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {formatCurrency(investment.currentBalance)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Return:</span>
                          <span 
                            className={`font-semibold ${investment.currentBalance >= investment.initialDeposit ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {formatPercent((investment.currentBalance - investment.initialDeposit) / investment.initialDeposit * 100)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Deposit Date:</span>
                          <span className="font-semibold">{formatDate(investment.depositDate)}</span>
                        </div>
                        
                        {investment.type === 'prop_firm_management' && investment.propFirmAccount && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Prop Firm Account:</span>
                            <span className="font-semibold">{investment.propFirmAccount.accountName}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-4">
                      <Button 
                        variant="default" 
                        onClick={() => viewInvestmentDetails(investment.id)}
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
                <h3 className="text-xl font-semibold mb-2">No Investments Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any investments yet. Please contact our team to set up your first investment.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
                <CardDescription>
                  Monthly performance records for your investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceRecords.length > 0 ? (
                  <div className="space-y-4">
                    {performanceRecords.map((record) => {
                      const investment = investments.find(i => i.id === record.investmentId);
                      
                      return (
                        <Card key={record.id} className="bg-muted/40">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-lg font-semibold">{investment?.name || `Investment #${record.investmentId}`}</h4>
                              <div className="flex items-center gap-2">
                                <Badge>{record.period}</Badge>
                                <span 
                                  className={`font-semibold ${record.percentReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}
                                >
                                  {formatPercent(record.percentReturn || 0)}
                                </span>
                              </div>
                            </div>
                            
                            <Separator className="my-2" />
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Start Balance</p>
                                <p className="font-medium">{formatCurrency(record.startBalance || 0)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">End Balance</p>
                                <p className="font-medium">{formatCurrency(record.endBalance || 0)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Gross Profit</p>
                                <p className="font-medium">{formatCurrency(record.grossProfit || 0)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Net Profit</p>
                                <p className="font-medium">{formatCurrency(record.netProfit || 0)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Performance Fee</p>
                                <p className="font-medium">{formatCurrency(record.performanceFee || 0)}</p>
                              </div>
                              {(record.setupFee || 0) > 0 && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Setup Fee</p>
                                  <p className="font-medium">{formatCurrency(record.setupFee || 0)}</p>
                                </div>
                              )}
                              {(record.brokerProcessingFee || 0) > 0 && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Broker Fee</p>
                                  <p className="font-medium">{formatCurrency(record.brokerProcessingFee || 0)}</p>
                                </div>
                              )}
                              {(record.otherFees || 0) > 0 && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Other Fees</p>
                                  <p className="font-medium">{formatCurrency(record.otherFees || 0)}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Performance Records</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no performance records available yet. Check back at the end of the month.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Reports</CardTitle>
                <CardDescription>
                  Download your monthly investment reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceRecords.filter(r => r.reportGenerated).length > 0 ? (
                  <div className="space-y-4">
                    {performanceRecords
                      .filter(r => r.reportGenerated)
                      .map((record) => {
                        const investment = investments.find(i => i.id === record.investmentId);
                        
                        return (
                          <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-semibold">{investment?.name || `Investment #${record.investmentId}`}</h4>
                              <p className="text-sm text-muted-foreground">
                                {record.period} - {formatPercent(record.percentReturn || 0)} return
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadReport(record.reportUrl || '')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no generated reports available yet. Reports are typically generated at the end of each month.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </TradingDashboardLayout>
  );
};

export default InvestorDashboardPage;