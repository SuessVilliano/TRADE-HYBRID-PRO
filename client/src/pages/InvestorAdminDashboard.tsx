import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Plus,
  FileCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/formatters';

// For data visualization, we're using recharts
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const InvestorAdminDashboard: React.FC = () => {
  // Temporarily creating a dummy user until we fix the import
  const user = { isAdmin: true };
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [investors, setInvestors] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<any[]>([]);
  const [companyRevenue, setCompanyRevenue] = useState<any>({});
  const [feeSettings, setFeeSettings] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddInvestorDialogOpen, setIsAddInvestorDialogOpen] = useState(false);
  const [isAddInvestmentDialogOpen, setIsAddInvestmentDialogOpen] = useState(false);
  const [isUpdatePerformanceDialogOpen, setIsUpdatePerformanceDialogOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [performanceInput, setPerformanceInput] = useState('');

  // States for new investor form
  const [newInvestor, setNewInvestor] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    notes: '',
    tags: JSON.stringify(['investor']), // Default tags
    userId: '' // Link to user account if applicable
  });
  
  // Fee template presets for quick application
  const [feeTemplates, setFeeTemplates] = useState([
    { 
      name: 'Standard Performance Fee', 
      performanceFeePercent: 20, 
      setupFee: 100, 
      monthlyFee: 0 
    },
    { 
      name: 'Premium Package', 
      performanceFeePercent: 25, 
      setupFee: 250, 
      monthlyFee: 50 
    },
    { 
      name: 'Institutional Rate', 
      performanceFeePercent: 15, 
      setupFee: 500, 
      monthlyFee: 100 
    },
    { 
      name: 'VIP Client', 
      performanceFeePercent: 30, 
      setupFee: 0, 
      monthlyFee: 0 
    }
  ]);

  // States for new investment form
  const [newInvestment, setNewInvestment] = useState({
    investorId: '',
    type: 'personal',
    name: '',
    initialDeposit: '',
    depositDate: '',
    status: 'active',
    propFirmAccountId: '',
    performanceFeePercent: '20',
    setupFee: '100',
    monthlyFee: '0',
    notes: ''
  });

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
      
      // Initialize data to empty arrays/objects to prevent undefined errors
      let investorsData: any[] = [];
      let investmentsData: any[] = [];
      let performanceData: any[] = [];
      let revenueData = {
        total_revenue: 0,
        performance_fee_revenue: 0,
        setup_fee_revenue: 0,
        broker_processing_fee_revenue: 0
      };
      let feeSettingsData = {
        id: 1,
        name: "Default",
        defaultPerformanceFeePercent: 20,
        defaultSetupFee: 100,
        defaultMonthlyFee: 0,
        defaultBrokerProcessingFeePercent: 0.5,
        defaultBrokerProcessingFeeFlat: 10
      };
      
      // Fetch all investors with proper error handling
      try {
        const investorsResponse = await fetch('/api/investors');
        if (investorsResponse.ok) {
          const data = await investorsResponse.json();
          if (Array.isArray(data)) {
            investorsData = data;
          }
        } else {
          console.warn('Failed to fetch investors, status:', investorsResponse.status);
        }
      } catch (err) {
        console.error('Error fetching investors:', err);
      }
      setInvestors(investorsData);
      
      // Fetch all investments with proper error handling
      try {
        const investmentsResponse = await fetch('/api/investments');
        if (investmentsResponse.ok) {
          const data = await investmentsResponse.json();
          if (Array.isArray(data)) {
            investmentsData = data;
          }
        } else {
          console.warn('Failed to fetch investments, status:', investmentsResponse.status);
        }
      } catch (err) {
        console.error('Error fetching investments:', err);
      }
      setInvestments(investmentsData);
      
      // Fetch performance records with proper error handling
      try {
        const performanceResponse = await fetch('/api/investment-performance');
        if (performanceResponse.ok) {
          const data = await performanceResponse.json();
          if (Array.isArray(data)) {
            performanceData = data;
          }
        } else {
          console.warn('Failed to fetch performance records, status:', performanceResponse.status);
        }
      } catch (err) {
        console.error('Error fetching performance records:', err);
      }
      setPerformanceRecords(performanceData);
      
      // Fetch company revenue with proper error handling
      try {
        const revenueResponse = await fetch('/api/company-revenue');
        if (revenueResponse.ok) {
          const data = await revenueResponse.json();
          if (data && typeof data === 'object') {
            revenueData = data;
          }
        } else {
          console.warn('No company revenue data found, status:', revenueResponse.status);
        }
      } catch (err) {
        console.warn('Error fetching company revenue:', err);
      }
      setCompanyRevenue(revenueData);
      
      // Fetch fee settings with proper error handling
      try {
        const feeSettingsResponse = await fetch('/api/fee-settings');
        if (feeSettingsResponse.ok) {
          const data = await feeSettingsResponse.json();
          if (data && typeof data === 'object') {
            feeSettingsData = data;
          }
        } else {
          console.warn('Failed to fetch fee settings, status:', feeSettingsResponse.status);
        }
      } catch (err) {
        console.warn('Error fetching fee settings:', err);
      }
      setFeeSettings(feeSettingsData);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load some admin data. The page may have limited functionality.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new investor
  const handleAddInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/investors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvestor),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add investor');
      }
      
      const addedInvestor = await response.json();
      setInvestors([...investors, addedInvestor]);
      
      toast({
        title: 'Success',
        description: 'Investor added successfully.',
        variant: 'default',
      });
      
      // Reset form and close dialog
      setNewInvestor({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        notes: '',
        tags: JSON.stringify(['investor']),
        userId: ''
      });
      setIsAddInvestorDialogOpen(false);
      
    } catch (error) {
      console.error('Error adding investor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add investor. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Add new investment
  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newInvestment,
          initialDeposit: parseFloat(newInvestment.initialDeposit),
          currentBalance: parseFloat(newInvestment.initialDeposit),
          performanceFeePercent: parseFloat(newInvestment.performanceFeePercent),
          setupFee: parseFloat(newInvestment.setupFee),
          monthlyFee: parseFloat(newInvestment.monthlyFee),
          propFirmAccountId: newInvestment.propFirmAccountId.length > 0 ? parseInt(newInvestment.propFirmAccountId) : null
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add investment');
      }
      
      const addedInvestment = await response.json();
      setInvestments([...investments, addedInvestment]);
      
      toast({
        title: 'Success',
        description: 'Investment added successfully.',
        variant: 'default',
      });
      
      // Reset form and close dialog
      setNewInvestment({
        investorId: '',
        type: 'personal',
        name: '',
        initialDeposit: '',
        depositDate: '',
        status: 'active',
        propFirmAccountId: '',
        performanceFeePercent: '20',
        setupFee: '100',
        monthlyFee: '0',
        notes: ''
      });
      setIsAddInvestmentDialogOpen(false);
      
    } catch (error) {
      console.error('Error adding investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add investment. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Update performance for all investments
  const handleUpdatePerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const percentReturn = parseFloat(performanceInput);
      
      if (isNaN(percentReturn)) {
        throw new Error('Invalid percentage return');
      }
      
      const response = await fetch('/api/investment-performance/update-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          percentReturn,
          period: new Date().toISOString().slice(0, 7) // Format as YYYY-MM
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update performance');
      }
      
      // Refresh investment data
      fetchAdminData();
      
      toast({
        title: 'Success',
        description: 'Performance updated successfully for all investments.',
        variant: 'default',
      });
      
      // Reset input and close dialog
      setPerformanceInput('');
      setIsUpdatePerformanceDialogOpen(false);
      
    } catch (error) {
      console.error('Error updating performance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update performance. Please check your input and try again.',
        variant: 'destructive',
      });
    }
  };

  // Generate investor reports
  const generateInvestorReports = async () => {
    try {
      const response = await fetch('/api/investment-performance/generate-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: new Date().toISOString().slice(0, 7) // Format as YYYY-MM
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate reports');
      }
      
      toast({
        title: 'Success',
        description: 'Investor reports generated successfully.',
        variant: 'default',
      });
      
      // Refresh performance data
      fetchAdminData();
      
    } catch (error) {
      console.error('Error generating reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate investor reports. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Export data as JSON file
  const exportData = (type: string) => {
    let dataToExport: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'investors':
        dataToExport = investors;
        filename = 'investors.json';
        break;
      case 'investments':
        dataToExport = investments;
        filename = 'investments.json';
        break;
      case 'performance':
        dataToExport = performanceRecords;
        filename = 'investment-performance.json';
        break;
      case 'revenue':
        dataToExport = [companyRevenue];
        filename = 'company-revenue.json';
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

  // Calculate total assets under management
  const calculateTotalAUM = () => {
    return investments.reduce((total, investment) => total + (investment.currentBalance || 0), 0);
  };

  // Filter investments based on search term, status, and type
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = 
      (investment.name && investment.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (investment.investor && investment.investor.name && investment.investor.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || investment.status === filterStatus;
    const matchesType = filterType === 'all' || investment.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats for cards
  const totalAUM = calculateTotalAUM();
  const totalInvestors = investors.length;
  const activeInvestments = investments.filter(i => i.status === 'active').length;
  
  // Mock data for charts
  const performanceData = performanceRecords.length > 0 
    ? performanceRecords.slice(0, 6).map(record => ({
        period: record.period,
        return: record.percentReturn
      })) 
    : [
        { period: 'Jan', return: 2.3 },
        { period: 'Feb', return: 1.5 },
        { period: 'Mar', return: -0.8 },
        { period: 'Apr', return: 3.2 },
        { period: 'May', return: 1.7 },
        { period: 'Jun', return: 2.4 }
      ];

  const distributionData = investments.length > 0
    ? [
        { name: 'Personal', value: investments.filter(i => i.type === 'personal').length },
        { name: 'Prop Firm', value: investments.filter(i => i.type === 'prop_firm_management').length },
        { name: 'Hybrid', value: investments.filter(i => i.type === 'hybrid_fund').length }
      ]
    : [
        { name: 'Personal', value: 10 },
        { name: 'Prop Firm', value: 5 },
        { name: 'Hybrid', value: 15 }
      ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  if (loading) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading investor dashboard...</span>
        </div>
      </div>
    );
  }
  
  // If no data is loaded yet, show an empty state with the option to add data
  if (investors.length === 0) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="mb-4 p-4 rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Investors Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by adding your first investor to the platform.
            Once added, you can create investments and track performance.
          </p>
          <Button 
            onClick={() => setIsAddInvestorDialogOpen(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Investor
          </Button>
          
          {/* Add Investor Dialog */}
          <Dialog open={isAddInvestorDialogOpen} onOpenChange={setIsAddInvestorDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Investor</DialogTitle>
                <DialogDescription>
                  Enter the investor's details below to create a new investor profile.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddInvestor}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newInvestor.name}
                      onChange={(e) => setNewInvestor({...newInvestor, name: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newInvestor.email}
                      onChange={(e) => setNewInvestor({...newInvestor, email: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={newInvestor.phone}
                      onChange={(e) => setNewInvestor({...newInvestor, phone: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={newInvestor.address}
                      onChange={(e) => setNewInvestor({...newInvestor, address: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select 
                      value={newInvestor.status} 
                      onValueChange={(value) => setNewInvestor({...newInvestor, status: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      value={newInvestor.notes}
                      onChange={(e) => setNewInvestor({...newInvestor, notes: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddInvestorDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Investor</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
          <h1 className="text-3xl font-bold">Investor Management Dashboard</h1>
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
                  <p className="text-sm font-medium">Assets Under Management</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalAUM)}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium text-green-500">+{formatCurrency(companyRevenue.total_revenue || 0)}</span> total revenue
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Investors</p>
                  <h3 className="text-2xl font-bold mt-1">{totalInvestors}</h3>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium text-green-500">{investors.filter(i => i.status === 'active').length}</span> active investors
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
                <span className="font-medium text-green-500">{investments.length}</span> total investments
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Performance Fee</p>
                  <h3 className="text-2xl font-bold mt-1">{formatPercent(feeSettings.default_performance_fee_percent || 20)}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-80" />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-medium">{formatCurrency(feeSettings.default_setup_fee || 100)}</span> setup fee
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddInvestorDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Investor
          </Button>
          
          <Button onClick={() => setIsAddInvestmentDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Investment
          </Button>
          
          <Button onClick={() => setIsUpdatePerformanceDialogOpen(true)}>
            <TrendingUp className="mr-2 h-4 w-4" /> Update Performance
          </Button>
          
          <Button onClick={generateInvestorReports}>
            <FileCheck className="mr-2 h-4 w-4" /> Generate Reports
          </Button>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>
                Return percentage by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Return']} />
                    <Area type="monotone" dataKey="return" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Investment Distribution</CardTitle>
              <CardDescription>
                By investment type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="investments" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="performance">Performance Records</TabsTrigger>
            <TabsTrigger value="revenue">Company Revenue</TabsTrigger>
          </TabsList>
          
          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Investment Accounts</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('investments')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <CardDescription>
                  Manage all investment accounts
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investments..."
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
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="prop_firm_management">Prop Firm Management</SelectItem>
                        <SelectItem value="hybrid_fund">Hybrid Fund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {filteredInvestments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Investor</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Initial Deposit</TableHead>
                          <TableHead>Current Balance</TableHead>
                          <TableHead>Return</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvestments.map((investment) => (
                          <TableRow key={investment.id}>
                            <TableCell>{investment.id}</TableCell>
                            <TableCell className="font-medium">{investment.name}</TableCell>
                            <TableCell>{investment.investor?.name || '-'}</TableCell>
                            <TableCell>
                              {investment.type === 'personal' && 'Personal'}
                              {investment.type === 'prop_firm_management' && 'Prop Firm'}
                              {investment.type === 'hybrid_fund' && 'Hybrid Fund'}
                            </TableCell>
                            <TableCell>{formatCurrency(investment.initialDeposit)}</TableCell>
                            <TableCell>{formatCurrency(investment.currentBalance)}</TableCell>
                            <TableCell>
                              {investment.currentBalance && investment.initialDeposit 
                                ? formatPercent((investment.currentBalance - investment.initialDeposit) / investment.initialDeposit * 100) 
                                : '0%'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  investment.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                                  investment.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                  'bg-red-500 hover:bg-red-600'
                                }
                              >
                                {investment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => navigate(`/investments/${investment.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Investments Found</h3>
                    <p className="text-muted-foreground mb-4">
                      No investments match your search criteria.
                    </p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterType('all');
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Investors Tab */}
          <TabsContent value="investors" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Investors</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('investors')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <CardDescription>
                  Manage all investors
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="relative w-full md:w-96 mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search investors..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {investors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Join Date</TableHead>
                          <TableHead>Investments</TableHead>
                          <TableHead>Total Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investors
                          .filter(investor => 
                            investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (investor.phone && investor.phone.includes(searchTerm))
                          )
                          .map((investor) => (
                          <TableRow key={investor.id}>
                            <TableCell>{investor.id}</TableCell>
                            <TableCell className="font-medium">{investor.name}</TableCell>
                            <TableCell>{investor.email}</TableCell>
                            <TableCell>{investor.phone || '-'}</TableCell>
                            <TableCell>{formatDate(investor.join_date)}</TableCell>
                            <TableCell>
                              {investments.filter(inv => inv.investorId === investor.id).length}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(
                                investments
                                  .filter(inv => inv.investorId === investor.id)
                                  .reduce((sum, inv) => sum + (inv.currentBalance || 0), 0)
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  investor.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                                  investor.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                  'bg-red-500 hover:bg-red-600'
                                }
                              >
                                {investor.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setSelectedInvestor(investor)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setNewInvestment({
                                      ...newInvestment,
                                      investorId: investor.id.toString()
                                    });
                                    setIsAddInvestmentDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Investors Found</h3>
                    <p className="text-muted-foreground mb-4">
                      No investors match your search criteria.
                    </p>
                    <Button onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Performance Records Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Performance Records</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('performance')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <CardDescription>
                  View all investment performance records
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {performanceRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Investment</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Start Balance</TableHead>
                          <TableHead>End Balance</TableHead>
                          <TableHead>Return %</TableHead>
                          <TableHead>Gross Profit</TableHead>
                          <TableHead>Fees</TableHead>
                          <TableHead>Net Profit</TableHead>
                          <TableHead>Report</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {performanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.id}</TableCell>
                            <TableCell className="font-medium">
                              {investments.find(i => i.id === record.investment_id)?.name || `Investment #${record.investment_id}`}
                            </TableCell>
                            <TableCell>{record.period}</TableCell>
                            <TableCell>{formatCurrency(record.start_balance)}</TableCell>
                            <TableCell>{formatCurrency(record.end_balance)}</TableCell>
                            <TableCell>{formatPercent(record.percent_return)}</TableCell>
                            <TableCell>{formatCurrency(record.gross_profit)}</TableCell>
                            <TableCell>{formatCurrency(record.performance_fee + record.setup_fee + record.broker_processing_fee + record.other_fees)}</TableCell>
                            <TableCell>{formatCurrency(record.net_profit)}</TableCell>
                            <TableCell>
                              {record.report_generated ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(record.report_url, '_blank')}
                                >
                                  <Download className="h-4 w-4 mr-1" /> Report
                                </Button>
                              ) : (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Performance Records</h3>
                    <p className="text-muted-foreground mb-4">
                      There are no performance records available yet.
                    </p>
                    <Button onClick={() => setIsUpdatePerformanceDialogOpen(true)}>
                      Update Performance
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Company Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Company Revenue</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('revenue')}
                  >
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <CardDescription>
                  View company revenue from fees
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Performance Fees:</span>
                          <span className="font-semibold">{formatCurrency(companyRevenue.performance_fee_revenue || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Setup Fees:</span>
                          <span className="font-semibold">{formatCurrency(companyRevenue.setup_fee_revenue || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Broker Processing Fees:</span>
                          <span className="font-semibold">{formatCurrency(companyRevenue.broker_processing_fee_revenue || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Other Fees:</span>
                          <span className="font-semibold">{formatCurrency(companyRevenue.other_fee_revenue || 0)}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Revenue:</span>
                            <span className="font-bold text-xl">{formatCurrency(companyRevenue.total_revenue || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Assets Under Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Investor Count:</span>
                          <span className="font-semibold">{companyRevenue.total_investor_count || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Assets Under Management:</span>
                          <span className="font-semibold">{formatCurrency(companyRevenue.total_assets_under_management || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Current Period:</span>
                          <span className="font-semibold">{companyRevenue.period || '-'}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Revenue Ratio:</span>
                            <span className="font-bold">
                              {companyRevenue.total_assets_under_management 
                                ? formatPercent((companyRevenue.total_revenue || 0) / companyRevenue.total_assets_under_management * 100) 
                                : '0%'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Investor Dialog */}
      <Dialog open={isAddInvestorDialogOpen} onOpenChange={setIsAddInvestorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Investor</DialogTitle>
            <DialogDescription>
              Enter the investor's details below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddInvestor}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={newInvestor.name}
                  onChange={(e) => setNewInvestor({...newInvestor, name: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvestor.email}
                  onChange={(e) => setNewInvestor({...newInvestor, email: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newInvestor.phone}
                  onChange={(e) => setNewInvestor({...newInvestor, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={newInvestor.address}
                  onChange={(e) => setNewInvestor({...newInvestor, address: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={newInvestor.status} 
                  onValueChange={(value) => setNewInvestor({...newInvestor, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={newInvestor.notes}
                  onChange={(e) => setNewInvestor({...newInvestor, notes: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  User ID
                </Label>
                <Input
                  id="userId"
                  value={newInvestor.userId}
                  onChange={(e) => setNewInvestor({...newInvestor, userId: e.target.value})}
                  className="col-span-3"
                  placeholder="Link to existing user (optional)"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4 mt-4">
                <Label className="text-right mt-2">
                  Fee Templates
                </Label>
                <div className="col-span-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {feeTemplates.map((template, index) => (
                      <Button
                        key={index}
                        type="button" 
                        variant="outline"
                        className="h-auto py-2 px-3 justify-start items-start text-left"
                        onClick={() => {
                          // Apply template to new investment form
                          setNewInvestment({
                            ...newInvestment,
                            performanceFeePercent: template.performanceFeePercent.toString(),
                            setupFee: template.setupFee.toString(),
                            monthlyFee: template.monthlyFee.toString()
                          });
                          
                          toast({
                            title: 'Template Applied',
                            description: `Applied "${template.name}" fee structure`,
                            variant: 'default',
                          });
                        }}
                      >
                        <div>
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Performance: {template.performanceFeePercent}% | 
                            Setup: ${template.setupFee} | 
                            Monthly: ${template.monthlyFee}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Click a template to apply it when creating a new investment.
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddInvestorDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Investor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Investment Dialog */}
      <Dialog open={isAddInvestmentDialogOpen} onOpenChange={setIsAddInvestmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Investment</DialogTitle>
            <DialogDescription>
              Enter the investment details below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddInvestment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="investorId" className="text-right">
                  Investor *
                </Label>
                <Select 
                  value={newInvestment.investorId} 
                  onValueChange={(value) => setNewInvestment({...newInvestment, investorId: value})}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select investor" />
                  </SelectTrigger>
                  <SelectContent>
                    {investors.map((investor) => (
                      <SelectItem key={investor.id} value={investor.id.toString()}>
                        {investor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type *
                </Label>
                <Select 
                  value={newInvestment.type} 
                  onValueChange={(value) => setNewInvestment({...newInvestment, type: value})}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="prop_firm_management">Prop Firm Management</SelectItem>
                    <SelectItem value="hybrid_fund">Hybrid Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={newInvestment.name}
                  onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="initialDeposit" className="text-right">
                  Initial Deposit *
                </Label>
                <Input
                  id="initialDeposit"
                  type="number"
                  step="0.01"
                  value={newInvestment.initialDeposit}
                  onChange={(e) => setNewInvestment({...newInvestment, initialDeposit: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="depositDate" className="text-right">
                  Deposit Date *
                </Label>
                <Input
                  id="depositDate"
                  type="date"
                  value={newInvestment.depositDate}
                  onChange={(e) => setNewInvestment({...newInvestment, depositDate: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={newInvestment.status} 
                  onValueChange={(value) => setNewInvestment({...newInvestment, status: value})}
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
              
              {newInvestment.type === 'prop_firm_management' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="propFirmAccountId" className="text-right">
                    Prop Firm Account
                  </Label>
                  <Input
                    id="propFirmAccountId"
                    type="number"
                    value={newInvestment.propFirmAccountId}
                    onChange={(e) => setNewInvestment({...newInvestment, propFirmAccountId: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="performanceFeePercent" className="text-right">
                  Performance Fee %
                </Label>
                <Input
                  id="performanceFeePercent"
                  type="number"
                  step="0.1"
                  value={newInvestment.performanceFeePercent}
                  onChange={(e) => setNewInvestment({...newInvestment, performanceFeePercent: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="setupFee" className="text-right">
                  Setup Fee
                </Label>
                <Input
                  id="setupFee"
                  type="number"
                  step="0.01"
                  value={newInvestment.setupFee}
                  onChange={(e) => setNewInvestment({...newInvestment, setupFee: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monthlyFee" className="text-right">
                  Monthly Fee
                </Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  step="0.01"
                  value={newInvestment.monthlyFee}
                  onChange={(e) => setNewInvestment({...newInvestment, monthlyFee: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={newInvestment.notes}
                  onChange={(e) => setNewInvestment({...newInvestment, notes: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddInvestmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Investment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Update Performance Dialog */}
      <Dialog open={isUpdatePerformanceDialogOpen} onOpenChange={setIsUpdatePerformanceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Investment Performance</DialogTitle>
            <DialogDescription>
              Enter the percentage return for all investments for the current period.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdatePerformance}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentReturn" className="text-right">
                  Return %
                </Label>
                <Input
                  id="percentReturn"
                  type="number"
                  step="0.01"
                  value={performanceInput}
                  onChange={(e) => setPerformanceInput(e.target.value)}
                  className="col-span-3"
                  required
                  placeholder="e.g. 2.5 for 2.5%"
                />
              </div>
              
              <div className="col-span-4 text-sm text-muted-foreground">
                <p>This will calculate performance for the current month for all active investments.</p>
                <p className="mt-1">Fees will be automatically calculated based on your fee settings.</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUpdatePerformanceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Performance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorAdminDashboard;