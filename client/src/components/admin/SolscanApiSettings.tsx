import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button, Card, Input, Spinner, Switch, Typography } from '@/components/ui';

interface ApiStatus {
  working: boolean;
  message: string;
  useFallbackMode: boolean;
}

interface Settings {
  useFallbackMethods: boolean;
  solscanApiAvailable: boolean;
  cachingEnabled: boolean;
  initialized: boolean;
  fallbackRpcUrl: string;
}

const SolscanApiSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch initial status
  useEffect(() => {
    fetchApiStatus();
    fetchSettings();
  }, []);

  // Fetch API status from server
  const fetchApiStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/solscan/status');
      if (response.data.success) {
        setApiStatus({
          working: response.data.status === 'working',
          message: response.data.message,
          useFallbackMode: response.data.useFallbackMode
        });
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch API status');
      }
    } catch (err) {
      setError('Error fetching API status');
      console.error('Error fetching API status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch service settings
  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/solscan/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Error fetching settings');
      console.error('Error fetching settings:', err);
    }
  };

  // Update API key
  const updateApiKey = async () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUpdateSuccess(false);
      
      const response = await axios.post('/api/solscan/update-key', { apiKey });
      
      if (response.data.success) {
        setUpdateSuccess(true);
        await fetchApiStatus();
        await fetchSettings();
      } else {
        setError(response.data.message || 'Failed to update API key');
      }
    } catch (err) {
      setError('Error updating API key');
      console.error('Error updating API key:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle fallback mode
  const toggleFallbackMode = async (enableFallback: boolean) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/solscan/toggle-fallback', { enableFallback });
      
      if (response.data.success) {
        await fetchApiStatus();
        await fetchSettings();
      } else {
        setError(response.data.message || 'Failed to toggle fallback mode');
      }
    } catch (err) {
      setError('Error toggling fallback mode');
      console.error('Error toggling fallback mode:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh token cache
  const refreshTokenCache = async () => {
    try {
      setRefreshing(true);
      const response = await axios.post('/api/solscan/refresh-token-cache');
      
      if (response.data.success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        setError(response.data.message || 'Failed to refresh token cache');
      }
    } catch (err) {
      setError('Error refreshing token cache');
      console.error('Error refreshing token cache:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="p-6 shadow-md">
      <Typography variant="h2" className="mb-4">Solscan API Settings</Typography>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <p>{error}</p>
        </Alert>
      )}
      
      {updateSuccess && (
        <Alert className="mb-4 bg-green-100 text-green-800 border-green-200">
          <p>API settings updated successfully!</p>
        </Alert>
      )}
      
      <div className="mb-6">
        <Typography variant="h3" className="mb-2">Current Status</Typography>
        {loading ? (
          <div className="flex items-center">
            <Spinner size="sm" /> 
            <span className="ml-2">Loading...</span>
          </div>
        ) : apiStatus ? (
          <div>
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus.working ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <Typography>API Status: <span className="font-semibold">{apiStatus.working ? 'Working' : 'Not Working'}</span></Typography>
            </div>
            <Typography className="mb-2">Message: {apiStatus.message}</Typography>
            <Typography>Fallback Mode: <span className={apiStatus.useFallbackMode ? 'text-orange-500' : 'text-green-500'}>
              {apiStatus.useFallbackMode ? 'Enabled' : 'Disabled'}
            </span></Typography>
          </div>
        ) : (
          <Typography>No status information available</Typography>
        )}
      </div>
      
      {settings && (
        <div className="mb-6">
          <Typography variant="h3" className="mb-2">Service Settings</Typography>
          <div className="grid grid-cols-2 gap-2">
            <Typography>Solscan API Available:</Typography>
            <Typography>{settings.solscanApiAvailable ? 'Yes' : 'No'}</Typography>
            
            <Typography>Caching Enabled:</Typography>
            <Typography>{settings.cachingEnabled ? 'Yes' : 'No'}</Typography>
            
            <Typography>Service Initialized:</Typography>
            <Typography>{settings.initialized ? 'Yes' : 'No'}</Typography>
            
            <Typography>Fallback RPC URL:</Typography>
            <Typography>{settings.fallbackRpcUrl}</Typography>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <Typography variant="h3" className="mb-2">Update API Key</Typography>
        <Input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter new Solscan API Key"
          className="mb-4"
        />
        <Button 
          onClick={updateApiKey} 
          disabled={loading || !apiKey.trim()}
          className="mr-2"
        >
          {loading ? <><Spinner size="sm" className="mr-2" /> Updating...</> : 'Update API Key'}
        </Button>
      </div>
      
      <div className="mb-6">
        <Typography variant="h3" className="mb-2">Fallback Mode</Typography>
        <div className="flex items-center">
          <Switch 
            checked={settings?.useFallbackMethods || false}
            onCheckedChange={toggleFallbackMode}
            disabled={loading}
          />
          <Typography className="ml-2">
            {settings?.useFallbackMethods ? 'Enabled' : 'Disabled'}
          </Typography>
        </div>
        <Typography className="text-sm text-gray-500 mt-1">
          When enabled, the system will use direct RPC calls and cached data instead of Solscan API
        </Typography>
      </div>
      
      <div>
        <Typography variant="h3" className="mb-2">Token Cache</Typography>
        <Button 
          onClick={refreshTokenCache} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? <><Spinner size="sm" className="mr-2" /> Refreshing...</> : 'Refresh Token Cache'}
        </Button>
        <Typography className="text-sm text-gray-500 mt-1">
          Force update of cached THC token information
        </Typography>
      </div>
    </Card>
  );
};

export default SolscanApiSettings;