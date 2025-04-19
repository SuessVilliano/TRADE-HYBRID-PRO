import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  Download,
  Users,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/formatters';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Temporarily commenting out until we resolve path issues
// import { useAuth } from '@/lib/hooks/use-auth';

// Chart component import would go here for data visualization
// import { LineChart } from '@/components/ui/line-chart';

const PropFirmAdminDashboard: React.FC = () => {
  // Temporarily creating a dummy user until we fix the import
  const user = { isAdmin: true };
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && user.isAdmin) {
      setIsAdmin(true);
      fetchAdminData();
    } else {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all accounts
      const accountsResponse = await fetch('/api/prop-firm/admin/accounts');
      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const accountsData = await accountsResponse.json();
      setAccounts(accountsData);
      
      // Fetch all challenges
      const challengesResponse = await fetch('/api/prop-firm/challenges');
      if (!challengesResponse.ok) {
        throw new Error('Failed to fetch challenges');
      }
      const challengesData = await challengesResponse.json();
      setChallenges(challengesData);
      
      // Fetch pending payouts
      const payoutsResponse = await fetch('/api/prop-firm/admin/payouts?status=pending');
      if (!payoutsResponse.ok) {
        throw new Error('Failed to fetch payouts');
      }
      const payoutsData = await payoutsResponse.json();
      setPayouts(payoutsData);
      
      // Fetch users with prop firm accounts
      const usersResponse = await fetch('/api/prop-firm/admin/users?isPropTrader=true');
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }
      const usersData = await usersResponse.json();
      setUsers(usersData);
      
      // Fetch summary statistics
      const statsResponse = await fetch('/api/prop-firm/admin/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const statsData = await statsResponse.json();
      setStats(statsData);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (payoutId: number, status: string) => {
    try {
      const response = await fetch(`/api/prop-firm/admin/payouts/${payoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process payout');
      }
      
      // Refresh payout data
      const payoutsResponse = await fetch('/api/prop-firm/admin/payouts?status=pending');
      const payoutsData = await payoutsResponse.json();
      setPayouts(payoutsData);
      
      toast({
        title: 'Success',
        description: `Payout ${status === 'paid' ? 'marked as paid' : 'rejected'} successfully.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error processing payout:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payout. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const updateAccountStatus = async (accountId: number, status: string, tradingAllowed: boolean) => {
    try {
      const response = await fetch(`/api/prop-firm/admin/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, tradingAllowed }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update account status');
      }
      
      // Update account in local state
      const updatedAccounts = accounts.map(account => {
        if (account.id === accountId) {
          return { ...account, status, tradingAllowed };
        }
        return account;
      });
      
      setAccounts(updatedAccounts);
      
      toast({
        title: 'Success',
        description: `Account status updated to ${status}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating account status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update account status. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const exportData = (type: string) => {
    let dataToExport: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'accounts':
        dataToExport = accounts;
        filename = 'prop-firm-accounts.json';
        break;
      case 'challenges':
        dataToExport = challenges;
        filename = 'prop-firm-challenges.json';
        break;
      case 'payouts':
        dataToExport = payouts;
        filename = 'prop-firm-payouts.json';
        break;
      case 'users':
        dataToExport = users;
        filename = 'prop-firm-users.json';
        break;
      default:
        return;
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter accounts based on search term, status, and type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      account.id.toString().includes(searchTerm) ||
      (account.user && account.user.username && account.user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;
    const matchesType = filterType === 'all' || account.accountType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="text-center p-8 bg-muted rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            You do not have permission to view this page.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Prop Firm Admin Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={() => fetchAdminData()}
          >
            Refresh Data
          </Button>
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Accounts</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.totalAccounts || 0}</h3>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium text-green-500">+{stats.newAccountsThisMonth || 0}</span> new this month
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Funded</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.fundedAccounts || 0}</h3>
                </div>
                <ShieldCheck className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium text-green-500">{stats.fundedAccountsPercent || 0}%</span> success rate
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue || 0)}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium text-green-500">+{formatCurrency(stats.revenueThisMonth || 0)}</span> this month
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Pending Payouts</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.pendingPayouts || 0}</h3>
                </div>
                <Clock className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium">{formatCurrency(stats.pendingPayoutsAmount || 0)}</span> total amount
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
            <TabsTrigger value="users">Traders</TabsTrigger>
          </TabsList>
          
          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Trader Accounts</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('accounts')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <CardDescription>
                  Manage all prop firm accounts
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search accounts..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="challenge_phase1">Challenge - Phase 1</SelectItem>
                        <SelectItem value="challenge_phase2">Challenge - Phase 2</SelectItem>
                        <SelectItem value="funded">Funded Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {filteredAccounts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Trader</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Current Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Trading</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.id}</TableCell>
                            <TableCell>{account.accountName}</TableCell>
                            <TableCell>{account.user?.username || 'Unknown'}</TableCell>
                            <TableCell>
                              {account.accountType === 'challenge_phase1' && 'Challenge P1'}
                              {account.accountType === 'challenge_phase2' && 'Challenge P2'}
                              {account.accountType === 'funded' && 'Funded'}
                            </TableCell>
                            <TableCell>{formatCurrency(account.accountSize)}</TableCell>
                            <TableCell className={account.currentBalance >= account.accountSize ? 'text-green-500' : 'text-red-500'}>
                              {formatCurrency(account.currentBalance)}
                            </TableCell>
                            <TableCell>
                              {account.status === 'active' && (
                                <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
                              )}
                              {account.status === 'funded' && (
                                <Badge className="bg-green-500 hover:bg-green-600">Funded</Badge>
                              )}
                              {account.status === 'failed' && (
                                <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>
                              )}
                              {account.status === 'completed' && (
                                <Badge className="bg-purple-500 hover:bg-purple-600">Completed</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {account.tradingAllowed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell>{formatDate(account.startDate)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/prop-firm/accounts/${account.id}`)}>
                                    View Details
                                  </DropdownMenuItem>
                                  {account.status !== 'failed' && (
                                    <DropdownMenuItem onClick={() => updateAccountStatus(account.id, 'failed', false)}>
                                      Mark as Failed
                                    </DropdownMenuItem>
                                  )}
                                  {account.tradingAllowed && (
                                    <DropdownMenuItem onClick={() => updateAccountStatus(account.id, account.status, false)}>
                                      Disable Trading
                                    </DropdownMenuItem>
                                  )}
                                  {!account.tradingAllowed && (
                                    <DropdownMenuItem onClick={() => updateAccountStatus(account.id, account.status, true)}>
                                      Enable Trading
                                    </DropdownMenuItem>
                                  )}
                                  {account.accountType === 'challenge_phase1' && (
                                    <DropdownMenuItem onClick={() => updateAccountStatus(account.id, 'funded', true)}>
                                      Promote to Funded
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No accounts found matching the criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Trading Challenges</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportData('challenges')}
                    >
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/prop-firm/admin/challenges/new')}
                    >
                      Create Challenge
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Manage prop firm challenge programs
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {challenges.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Market Type</TableHead>
                          <TableHead>Account Size</TableHead>
                          <TableHead>Phase 1 Target</TableHead>
                          <TableHead>Phase 2 Target</TableHead>
                          <TableHead>Max Drawdown</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {challenges.map((challenge) => (
                          <TableRow key={challenge.id}>
                            <TableCell className="font-medium">{challenge.id}</TableCell>
                            <TableCell>{challenge.name}</TableCell>
                            <TableCell>{challenge.marketType || 'N/A'}</TableCell>
                            <TableCell>{formatCurrency(challenge.accountSize)}</TableCell>
                            <TableCell>{formatPercent(challenge.targetProfitPhase1)}</TableCell>
                            <TableCell>{challenge.targetProfitPhase2 ? formatPercent(challenge.targetProfitPhase2) : 'N/A'}</TableCell>
                            <TableCell>{formatPercent(challenge.maxTotalDrawdown)}</TableCell>
                            <TableCell>
                              {challenge.active ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/prop-firm/admin/challenges/${challenge.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No challenges found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Pending Payouts</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('payouts')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <CardDescription>
                  Manage payout requests from traders
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {payouts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Trader</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Requested Date</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payouts.map((payout) => (
                          <TableRow key={payout.id}>
                            <TableCell className="font-medium">{payout.id}</TableCell>
                            <TableCell>{payout.user?.username || 'Unknown'}</TableCell>
                            <TableCell>{payout.account?.accountName || `Account #${payout.propAccountId}`}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(payout.amount)}</TableCell>
                            <TableCell>{payout.paymentMethod}</TableCell>
                            <TableCell>{formatDate(payout.requestedAt)}</TableCell>
                            <TableCell>
                              {formatDate(payout.tradePeriodStart)} - {formatDate(payout.tradePeriodEnd)}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-green-500 text-white hover:bg-green-600"
                                  onClick={() => processPayment(payout.id, 'paid')}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => processPayment(payout.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending payouts found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Prop Firm Traders</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('users')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <CardDescription>
                  Manage users participating in prop firm challenges
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Membership</TableHead>
                          <TableHead>Active Accounts</TableHead>
                          <TableHead>Funded Accounts</TableHead>
                          <TableHead>Join Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge className={
                                user.membershipLevel === 'lifetime' ? 'bg-purple-500' : 
                                user.membershipLevel === 'yearly' ? 'bg-blue-500' : 
                                user.membershipLevel === 'monthly' ? 'bg-green-500' : 'bg-gray-500'
                              }>
                                {user.membershipLevel || 'Free'}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.activeAccountsCount || 0}</TableCell>
                            <TableCell>{user.fundedAccountsCount || 0}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No prop firm traders found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropFirmAdminDashboard;