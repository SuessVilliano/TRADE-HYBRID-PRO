import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { AlertCircle, CheckCircle2, Key, Lock, Plus, RefreshCw, Trash } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { useForm } from 'react-hook-form';
import { Switch } from '../ui/switch';

// Define types for broker credentials
interface BrokerCredentials {
  id: number;
  userId: string;
  broker: string;
  name: string;
  isActive: boolean;
  isPaper: boolean;
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string | null;
  lastTestResult?: {
    success: boolean;
    message?: string;
    details?: any;
  } | null;
}

// Interface for the form values
interface BrokerFormValues {
  name: string;
  broker: string;
  apiKey?: string;
  apiSecret?: string;
  accountId?: string;
  token?: string;
  accountNumber?: string;
  username?: string;
  password?: string;
  server?: string;
  isPaper: boolean;
}

export function BrokerApiSettings() {
  const [brokerCredentials, setBrokerCredentials] = useState<BrokerCredentials[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alpaca');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  // Initialize react-hook-form
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<BrokerFormValues>({
    defaultValues: {
      name: '',
      broker: 'alpaca',
      isPaper: true
    }
  });
  
  // Watch the broker type to dynamically display the appropriate form fields
  const watchBroker = watch('broker');
  
  // Fetch broker credentials on component mount
  useEffect(() => {
    fetchBrokerCredentials();
  }, []);
  
  // Fetch broker credentials from server
  const fetchBrokerCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/broker-credentials');
      setBrokerCredentials(response.data.credentials || []);
    } catch (error) {
      console.error('Error fetching broker credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch broker credentials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };
  
  // Handle tab change - reset form when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    reset({
      name: '',
      broker: value,
      isPaper: true
    });
  };
  
  // Create new broker credentials
  const onSubmit = async (data: BrokerFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/broker-credentials', data);
      
      // Update credentials list
      setBrokerCredentials([response.data.credential, ...brokerCredentials]);
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Broker credentials added successfully',
        variant: 'default'
      });
      
      // Reset form
      reset({
        name: '',
        broker: activeTab,
        isPaper: true
      });
      
    } catch (error) {
      console.error('Error adding broker credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to add broker credentials',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Test broker connection
  const testConnection = async (credentialId: number) => {
    setIsTesting(credentialId);
    try {
      const response = await axios.post(`/api/broker-credentials/${credentialId}/test`);
      
      // Update credentials list with test result
      setBrokerCredentials(brokerCredentials.map(cred => 
        cred.id === credentialId 
          ? { 
              ...cred, 
              lastTestedAt: new Date().toISOString(),
              lastTestResult: response.data.result
            } 
          : cred
      ));
      
      // Show result toast
      if (response.data.result.success) {
        toast({
          title: 'Connection Successful',
          description: response.data.result.message || 'Successfully connected to broker API',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: response.data.result.message || 'Failed to connect to broker API',
          variant: 'destructive'
        });
      }
      
    } catch (error) {
      console.error('Error testing broker connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to test broker connection',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(null);
    }
  };
  
  // Delete broker credentials
  const deleteCredentials = async (credentialId: number) => {
    setIsDeleting(credentialId);
    try {
      await axios.delete(`/api/broker-credentials/${credentialId}`);
      
      // Update credentials list
      setBrokerCredentials(brokerCredentials.filter(cred => cred.id !== credentialId));
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Broker credentials deleted successfully',
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error deleting broker credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete broker credentials',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Toggle credential active status
  const toggleActive = async (credentialId: number, isActive: boolean) => {
    try {
      await axios.patch(`/api/broker-credentials/${credentialId}`, {
        isActive: !isActive
      });
      
      // Update credentials list
      setBrokerCredentials(brokerCredentials.map(cred => 
        cred.id === credentialId 
          ? { ...cred, isActive: !isActive } 
          : cred
      ));
      
      // Show success toast
      toast({
        title: 'Success',
        description: `Broker credentials ${!isActive ? 'activated' : 'deactivated'} successfully`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('Error toggling broker credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to update broker credentials',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Broker API Credentials</CardTitle>
          <CardDescription>
            Connect your trading accounts to enable automated trade execution via webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="alpaca">Alpaca</TabsTrigger>
              <TabsTrigger value="oanda">Oanda</TabsTrigger>
              <TabsTrigger value="ninjatrader">NinjaTrader</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Connection Name</Label>
                  <Input 
                    id="name" 
                    placeholder="My Alpaca Account" 
                    {...register('name', { required: true })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">Connection name is required</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="isPaper"
                    checked={watch('isPaper')}
                    onCheckedChange={(checked) => setValue('isPaper', checked)}
                  />
                  <Label htmlFor="isPaper">
                    {watchBroker === 'alpaca' ? 'Paper Trading' : 
                     watchBroker === 'oanda' ? 'Practice Account' : 'Demo Account'}
                  </Label>
                </div>
                
                <TabsContent value="alpaca" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="alpaca-api-key">API Key</Label>
                    <Input 
                      id="alpaca-api-key" 
                      placeholder="PKMFCA9UAO6C7DKDNP4Y" 
                      {...register('apiKey', { required: true })}
                    />
                    {errors.apiKey && (
                      <p className="text-sm text-red-500 mt-1">API Key is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="alpaca-api-secret">API Secret</Label>
                    <Input 
                      id="alpaca-api-secret" 
                      type="password" 
                      placeholder="Your API Secret" 
                      {...register('apiSecret', { required: true })}
                    />
                    {errors.apiSecret && (
                      <p className="text-sm text-red-500 mt-1">API Secret is required</p>
                    )}
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-md mt-3 border border-blue-100 text-sm">
                    <p>
                      <strong>How to get your Alpaca API credentials:</strong>
                    </p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Log in to your Alpaca account at <a href="https://app.alpaca.markets/" target="_blank" rel="noopener noreferrer" className="underline">app.alpaca.markets</a></li>
                      <li>Click on your name in the upper right corner, then select "Paper Account" or "Live Account"</li>
                      <li>Navigate to "API Keys" in the left sidebar</li>
                      <li>Create a new API key if you don't have one already</li>
                      <li>Copy the Key ID and Secret Key and paste them here</li>
                    </ol>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-3 text-amber-800 text-sm">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <strong>Important:</strong>
                    </div>
                    <p className="mt-1">
                      We're currently experiencing connectivity issues with some Alpaca accounts. 
                      If you encounter a 403 Forbidden error when testing, please ensure your API keys are correct and active.
                      You may need to visit the Alpaca dashboard to regenerate new API keys.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="oanda" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="oanda-api-token">API Token</Label>
                    <Input 
                      id="oanda-api-token" 
                      placeholder="Your Oanda API Token" 
                      {...register('token', { required: true })}
                    />
                    {errors.token && (
                      <p className="text-sm text-red-500 mt-1">API Token is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="oanda-account-id">Account ID</Label>
                    <Input 
                      id="oanda-account-id" 
                      placeholder="001-001-1234567-001" 
                      {...register('accountId', { required: true })}
                    />
                    {errors.accountId && (
                      <p className="text-sm text-red-500 mt-1">Account ID is required</p>
                    )}
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-md mt-3 border border-blue-100 text-sm">
                    <p>
                      <strong>How to get your Oanda API credentials:</strong>
                    </p>
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Log in to your Oanda account at <a href="https://www.oanda.com/" target="_blank" rel="noopener noreferrer" className="underline">oanda.com</a></li>
                      <li>Go to "My Account" and navigate to "Manage API Access"</li>
                      <li>Generate a new API token if you don't have one</li>
                      <li>Your Account ID can be found on the top right of your trading dashboard</li>
                      <li>Copy the API token and Account ID and paste them here</li>
                    </ol>
                  </div>
                </TabsContent>
                
                <TabsContent value="ninjatrader" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="nt-account-number">Account Number</Label>
                    <Input 
                      id="nt-account-number" 
                      placeholder="Your NinjaTrader Account Number" 
                      {...register('accountNumber', { required: true })}
                    />
                    {errors.accountNumber && (
                      <p className="text-sm text-red-500 mt-1">Account Number is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nt-username">Username</Label>
                    <Input 
                      id="nt-username" 
                      placeholder="Your NinjaTrader Username" 
                      {...register('username', { required: true })}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-500 mt-1">Username is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nt-password">Password</Label>
                    <Input 
                      id="nt-password" 
                      type="password" 
                      placeholder="Your NinjaTrader Password" 
                      {...register('password', { required: true })}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">Password is required</p>
                    )}
                  </div>
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mt-3 border border-yellow-100 text-sm">
                    <p>
                      <strong>Note about NinjaTrader integration:</strong>
                    </p>
                    <p className="mt-1">
                      NinjaTrader doesn't provide a direct web API. You'll need to install our desktop connector app for NinjaTrader to enable automated trading. 
                      <a href="/ninjatrader-connector-setup" className="underline ml-1">Download and setup instructions.</a>
                    </p>
                  </div>
                </TabsContent>
              </div>
              
              <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Broker Connection
                  </>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Broker Connections</CardTitle>
          <CardDescription>
            Manage your connected broker accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading broker connections...</p>
            </div>
          ) : brokerCredentials.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-medium">No broker connections yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first broker connection above to enable automated trading
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {brokerCredentials.map((credential) => (
                <Card key={credential.id} className={credential.isActive ? 'border-green-200' : 'border-gray-200'}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center">
                          {credential.name}
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            credential.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {credential.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            credential.isPaper ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {credential.broker === 'alpaca' && (credential.isPaper ? 'Paper' : 'Live')}
                            {credential.broker === 'oanda' && (credential.isPaper ? 'Practice' : 'Live')}
                            {credential.broker === 'ninjatrader' && (credential.isPaper ? 'Demo' : 'Live')}
                          </span>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {credential.broker.charAt(0).toUpperCase() + credential.broker.slice(1)} • Added on {formatDate(credential.createdAt)}
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleActive(credential.id, credential.isActive)}
                          className={credential.isActive ? 'text-orange-500' : 'text-green-500'}
                        >
                          {credential.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection(credential.id)}
                          disabled={isTesting === credential.id}
                        >
                          {isTesting === credential.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            'Test'
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => deleteCredentials(credential.id)}
                          disabled={isDeleting === credential.id}
                        >
                          {isDeleting === credential.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    {credential.lastTestedAt && (
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-muted-foreground mr-2">
                          Last tested: {formatDate(credential.lastTestedAt)}
                        </span>
                        {credential.lastTestResult && (
                          <span className={`flex items-center ${
                            credential.lastTestResult.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {credential.lastTestResult.success ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Success
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Failed: {credential.lastTestResult.message}
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-xs bg-gray-50 p-2 rounded-md mt-3 flex items-center">
                      <Lock className="h-3 w-3 mr-2 text-gray-400" />
                      <span className="text-muted-foreground">Credentials securely encrypted</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <div className="text-sm text-muted-foreground">
            <p>Your API credentials are encrypted and stored securely. We never share your credentials with third parties.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default BrokerApiSettings;