import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  AlertCircle, 
  ChevronLeft, 
  Edit, 
  Download, 
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/formatters';

// For data visualization
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const InvestmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [investment, setInvestment] = useState<any>(null);
  const [performanceRecords, setPerformanceRecords] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedInvestment, setEditedInvestment] = useState<any>({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is admin
    if (user && user.isAdmin) {
      setIsAdmin(true);
    }
    
    // Only fetch data if we have a user and an investment ID
    if (id && user) {
      fetchInvestmentData();
    } else if (!user) {
      // Redirect to login if no user
      navigate('/login', { state: { from: `/investors/investment/${id}` } });
    }
  }, [id, user, navigate]);

  const fetchInvestmentData = async () => {
    try {
      setLoading(true);
      console.log(`Fetching investment details for ID: ${id}`);
      
      // Fetch investment details
      const investmentResponse = await fetch(`/api/investments/${id}`);
      if (!investmentResponse.ok) {
        console.error(`Investment fetch failed with status: ${investmentResponse.status}`);
        if (investmentResponse.status === 404) {
          throw new Error('Investment not found');
        } else if (investmentResponse.status === 403) {
          throw new Error('You do not have permission to view this investment');
        } else {
          throw new Error('Failed to fetch investment details');
        }
      }
      
      const investmentData = await investmentResponse.json();
      console.log('Received investment data:', investmentData);
      setInvestment(investmentData);
      setEditedInvestment(investmentData);
      
      // Fetch performance records
      console.log(`Fetching performance data for investment ID: ${id}`);
      const performanceResponse = await fetch(`/api/investment-performance?investmentId=${id}`);
      
      if (!performanceResponse.ok) {
        console.warn(`Performance data fetch failed with status: ${performanceResponse.status}`);
        // Don't throw error for performance data, just set empty array
        setPerformanceRecords([]);
      } else {
        const performanceData = await performanceResponse.json();
        console.log(`Received ${performanceData.length} performance records`);
        setPerformanceRecords(Array.isArray(performanceData) ? performanceData : []);
      }
      
    } catch (error) {
      console.error('Error fetching investment data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load investment details. Please try again later.',
        variant: 'destructive',
      });
      // Set investment to null to show the error state
      setInvestment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedInvestment,
          performanceFeePercent: parseFloat(editedInvestment.performanceFeePercent),
          setupFee: parseFloat(editedInvestment.setupFee),
          propFirmAccountId: editedInvestment.propFirmAccountId ? parseInt(editedInvestment.propFirmAccountId) : null
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update investment');
      }
      
      const updatedInvestment = await response.json();
      setInvestment(updatedInvestment);
      
      toast({
        title: 'Success',
        description: 'Investment updated successfully.',
        variant: 'default',
      });
      
      setIsEditDialogOpen(false);
      
    } catch (error) {
      console.error('Error updating investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update investment. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Generate monthly performance chart data
  const getPerformanceChartData = () => {
    if (performanceRecords.length === 0) return [];
    
    // Sort records by period
    const sortedRecords = [...performanceRecords].sort((a, b) => {
      return a.period.localeCompare(b.period);
    });
    
    // Map to chart format
    return sortedRecords.map(record => ({
      month: record.period,
      return: record.percent_return,
      balance: record.end_balance
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

  // Calculate cumulative return
  const calculateCumulativeReturn = () => {
    if (!investment) return 0;
    return ((investment.currentBalance - investment.initialDeposit) / investment.initialDeposit) * 100;
  };

  if (loading) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading investment details...</span>
        </div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="text-center p-8 bg-muted rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Investment Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The investment you are looking for could not be found or you may not have permission to view it.
          </p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{investment.name}</h1>
          {getStatusBadge(investment.status)}
          
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-auto"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Investment
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Investment Overview</CardTitle>
              <CardDescription>
                {formatInvestmentType(investment.type)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Initial Deposit</p>
                    <p className="text-xl font-semibold">{formatCurrency(investment.initialDeposit)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-xl font-semibold">{formatCurrency(investment.currentBalance)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p 
                      className={`text-xl font-semibold ${investment.currentBalance >= investment.initialDeposit ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {formatPercent(calculateCumulativeReturn())}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit Date</p>
                    <p className="font-semibold">{formatDate(investment.depositDate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Performance Fee</p>
                    <p className="font-semibold">{formatPercent(investment.performanceFeePercent)}</p>
                  </div>
                  
                  {investment.propFirmAccountId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Prop Firm Account</p>
                      <p className="font-semibold">{investment.propFirmAccount?.accountName || `Account #${investment.propFirmAccountId}`}</p>
                    </div>
                  )}
                  
                  {investment.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="font-semibold">{investment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Investor</CardTitle>
            </CardHeader>
            <CardContent>
              {investment.investor ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{investment.investor.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{investment.investor.email}</p>
                  </div>
                  
                  {investment.investor.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold">{investment.investor.phone}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Join Date</p>
                    <p className="font-semibold">{formatDate(investment.investor.join_date)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Investor data not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Performance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          {/* Performance Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
                <CardDescription>
                  Monthly performance history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceRecords.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getPerformanceChartData()}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" unit="%" />
                        <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
                        <Tooltip 
                          formatter={(value: any, name: string) => {
                            if (name === 'return') return [`${value}%`, 'Return'];
                            if (name === 'balance') return [formatCurrency(value), 'Balance'];
                            return [value, name];
                          }} 
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="return" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }}
                          name="Monthly Return (%)"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#82ca9d" 
                          name="End Balance"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Performance Data</h3>
                    <p className="text-muted-foreground mb-4">
                      There is no performance data available for this investment yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p 
                      className={`text-xl font-semibold ${investment.currentBalance >= investment.initialDeposit ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {formatPercent(calculateCumulativeReturn())}
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Profit</p>
                    <p 
                      className={`text-xl font-semibold ${investment.currentBalance >= investment.initialDeposit ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {formatCurrency(investment.currentBalance - investment.initialDeposit)}
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Performance Records</p>
                    <p className="text-xl font-semibold">{performanceRecords.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
                <CardDescription>
                  Detailed monthly performance records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceRecords.length > 0 ? (
                  <div className="space-y-4">
                    {performanceRecords.map((record) => (
                      <Card key={record.id} className="bg-muted/40">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <Badge>{record.period}</Badge>
                            </div>
                            <span 
                              className={`font-semibold ${record.percent_return >= 0 ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {formatPercent(record.percent_return)}
                            </span>
                          </div>
                          
                          <Separator className="my-2" />
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Start Balance</p>
                              <p className="font-medium">{formatCurrency(record.start_balance)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">End Balance</p>
                              <p className="font-medium">{formatCurrency(record.end_balance)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Gross Profit</p>
                              <p className="font-medium">{formatCurrency(record.gross_profit)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Net Profit</p>
                              <p className="font-medium">{formatCurrency(record.net_profit)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Performance Fee</p>
                              <p className="font-medium">{formatCurrency(record.performance_fee)}</p>
                            </div>
                            {record.setup_fee > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground">Setup Fee</p>
                                <p className="font-medium">{formatCurrency(record.setup_fee)}</p>
                              </div>
                            )}
                            {record.broker_processing_fee > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground">Broker Fee</p>
                                <p className="font-medium">{formatCurrency(record.broker_processing_fee)}</p>
                              </div>
                            )}
                            {record.other_fees > 0 && (
                              <div>
                                <p className="text-sm text-muted-foreground">Other Fees</p>
                                <p className="font-medium">{formatCurrency(record.other_fees)}</p>
                              </div>
                            )}
                          </div>
                          
                          {isAdmin && record.notes && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">Notes</p>
                              <p className="font-medium">{record.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Performance Records</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no performance records available for this investment yet.
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
                <CardTitle>Investment Reports</CardTitle>
                <CardDescription>
                  Download monthly performance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceRecords.filter(r => r.report_generated).length > 0 ? (
                  <div className="space-y-4">
                    {performanceRecords
                      .filter(r => r.report_generated)
                      .map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{record.period} Performance Report</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatPercent(record.percent_return)} return | {formatCurrency(record.net_profit)} net profit
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(record.report_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Reports Available</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no generated reports available for this investment yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Investment Dialog */}
      {isAdmin && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Investment</DialogTitle>
              <DialogDescription>
                Update the investment details below.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditInvestment}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editedInvestment.name}
                    onChange={(e) => setEditedInvestment({...editedInvestment, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select 
                    value={editedInvestment.status} 
                    onValueChange={(value) => setEditedInvestment({...editedInvestment, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentBalance" className="text-right">
                    Current Balance
                  </Label>
                  <Input
                    id="currentBalance"
                    type="number"
                    step="0.01"
                    value={editedInvestment.currentBalance}
                    onChange={(e) => setEditedInvestment({...editedInvestment, currentBalance: parseFloat(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="performanceFeePercent" className="text-right">
                    Performance Fee %
                  </Label>
                  <Input
                    id="performanceFeePercent"
                    type="number"
                    step="0.1"
                    value={editedInvestment.performanceFeePercent}
                    onChange={(e) => setEditedInvestment({...editedInvestment, performanceFeePercent: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                {editedInvestment.type === 'prop_firm_management' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="propFirmAccountId" className="text-right">
                      Prop Firm Account
                    </Label>
                    <Input
                      id="propFirmAccountId"
                      type="number"
                      value={editedInvestment.propFirmAccountId || ''}
                      onChange={(e) => setEditedInvestment({...editedInvestment, propFirmAccountId: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    value={editedInvestment.notes || ''}
                    onChange={(e) => setEditedInvestment({...editedInvestment, notes: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InvestmentDetails;