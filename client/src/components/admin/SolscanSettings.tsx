import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface ApiStatus {
  working: boolean;
  message: string;
  useFallbackMode: boolean;
}

interface ApiSettings {
  useFallbackMethods: boolean;
  solscanApiAvailable: boolean;
  cachingEnabled: boolean;
  initialized: boolean;
  fallbackRpcUrl: string;
}

export function SolscanSettings() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Fetch API status on mount
  useEffect(() => {
    checkApiStatus();
    getSettings();
  }, []);

  // Check API status
  const checkApiStatus = async () => {
    setStatusLoading(true);
    setMessage(null);
    try {
      const response = await axios.get('/api/solscan/status');
      if (response.data.success) {
        setStatus({
          working: response.data.status === 'working',
          message: response.data.message,
          useFallbackMode: response.data.useFallbackMode
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to check API status: ' + response.data.message
        });
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      setMessage({
        type: 'error',
        text: 'Error checking API status. See console for details.'
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // Get current settings
  const getSettings = async () => {
    try {
      const response = await axios.get('/api/solscan/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Update API key
  const updateApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({
        type: 'error',
        text: 'API key cannot be empty'
      });
      return;
    }

    setUpdating(true);
    setMessage(null);
    try {
      const response = await axios.post('/api/solscan/update-key', { apiKey });
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'API key updated successfully. ' + 
                (response.data.status === 'working' ? 'The API is now working!' : 'API still not working.')
        });
        // Refresh status and settings
        checkApiStatus();
        getSettings();
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to update API key: ' + response.data.message
        });
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      setMessage({
        type: 'error',
        text: 'Error updating API key. See console for details.'
      });
    } finally {
      setUpdating(false);
      setApiKey(''); // Clear the input
    }
  };

  // Toggle fallback mode
  const toggleFallbackMode = async (enableFallback: boolean) => {
    try {
      const response = await axios.post('/api/solscan/toggle-fallback', { enableFallback });
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Fallback mode ${enableFallback ? 'enabled' : 'disabled'} successfully.`
        });
        // Update local state
        if (settings) {
          setSettings({
            ...settings,
            useFallbackMethods: response.data.currentSettings.useFallbackMethods,
            solscanApiAvailable: response.data.currentSettings.solscanApiAvailable
          });
        }
      }
    } catch (error) {
      console.error('Error toggling fallback mode:', error);
      setMessage({
        type: 'error',
        text: 'Error toggling fallback mode. See console for details.'
      });
    }
  };

  // Refresh token cache
  const refreshTokenCache = async () => {
    setRefreshingToken(true);
    setMessage(null);
    try {
      const response = await axios.post('/api/solscan/refresh-token-cache');
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: 'Token cache refreshed successfully.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to refresh token cache: ' + response.data.message
        });
      }
    } catch (error) {
      console.error('Error refreshing token cache:', error);
      setMessage({
        type: 'error',
        text: 'Error refreshing token cache. See console for details.'
      });
    } finally {
      setRefreshingToken(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Solscan API Settings</CardTitle>
        <CardDescription>
          Manage Solscan API integration for blockchain data access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">API Status</h3>
            <div className="flex items-center justify-between mt-2">
              <span>Status:</span>
              <span className={`font-medium ${status?.working ? 'text-green-600' : 'text-red-600'}`}>
                {statusLoading ? 'Checking...' : (status?.working ? 'Working' : 'Not Working')}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Message:</span>
              <span className="font-medium">{status?.message || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Fallback Mode:</span>
              <span className={`font-medium ${status?.useFallbackMode ? 'text-amber-600' : 'text-green-600'}`}>
                {status?.useFallbackMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={checkApiStatus} 
              disabled={statusLoading}
            >
              {statusLoading ? 'Checking...' : 'Check Status'}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium">Update API Key</h3>
            <div className="grid gap-2 mt-2">
              <Label htmlFor="apiKey">New API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your Solscan API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
              <Button 
                onClick={updateApiKey} 
                disabled={updating || !apiKey.trim()} 
                className="mt-2"
              >
                {updating ? 'Updating...' : 'Update API Key'}
              </Button>
            </div>
          </div>

          {settings && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium">Service Settings</h3>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fallbackMode">Fallback Mode</Label>
                  <Switch
                    id="fallbackMode"
                    checked={settings.useFallbackMethods}
                    onCheckedChange={toggleFallbackMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>API Available:</span>
                  <span className={`font-medium ${settings.solscanApiAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.solscanApiAvailable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Caching Enabled:</span>
                  <span className={`font-medium ${settings.cachingEnabled ? 'text-green-600' : 'text-amber-600'}`}>
                    {settings.cachingEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service Initialized:</span>
                  <span className={`font-medium ${settings.initialized ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.initialized ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fallback RPC URL:</span>
                  <span className="font-medium">{settings.fallbackRpcUrl}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium">Token Cache</h3>
            <Button
              variant="outline"
              onClick={refreshTokenCache}
              disabled={refreshingToken}
              className="mt-2"
            >
              {refreshingToken ? 'Refreshing...' : 'Refresh Token Cache'}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Last checked: {new Date().toLocaleTimeString()}
        </p>
      </CardFooter>
    </Card>
  );
}