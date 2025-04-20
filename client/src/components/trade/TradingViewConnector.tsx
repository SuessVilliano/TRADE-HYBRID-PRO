import { useState } from 'react';
import { toast } from 'sonner';

interface TradingViewConnectorProps {
  className?: string;
  onConnect?: (success: boolean) => void;
}

export default function TradingViewConnector({ className = '', onConnect }: TradingViewConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Function to initiate TradingView OAuth flow
  const connectToTradingView = async () => {
    setIsConnecting(true);

    try {
      // Store the current URL for the callback
      const redirectUri = encodeURIComponent(window.location.origin + '/tradingview-callback');
      
      // Generate a random state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('tradingview_oauth_state', state);
      
      // Define the required scopes
      const scopes = encodeURIComponent('alert_read alert_write chart_data');
      
      // Simulate TradingView OAuth flow (this is a placeholder)
      // In a real implementation, you would use TradingView's actual OAuth endpoints
      toast.info('TradingView Connection', {
        description: 'Opening TradingView authorization window...'
      });
      
      // We'll use the traditional OAuth flow approach
      // Open a popup window for the OAuth flow
      const width = 600;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      // In a real implementation, replace this URL with TradingView's actual OAuth authorization URL
      // For now, we'll create a mechanism to simulate the OAuth flow
      const oauthUrl = `/api/tradingview/auth?redirect_uri=${redirectUri}&state=${state}&scope=${scopes}`;
      
      const popup = window.open(
        oauthUrl,
        'tradingview-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Poll for the popup window to close or for storage to be updated
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          setIsConnecting(false);
          
          // Check for successful authentication via localStorage
          const authResult = localStorage.getItem('tradingview_auth_result');
          if (authResult) {
            try {
              const result = JSON.parse(authResult);
              if (result.success) {
                setIsConnected(true);
                localStorage.removeItem('tradingview_auth_result');
                toast.success('Connected to TradingView', {
                  description: 'Your TradingView account is now linked'
                });
                if (onConnect) onConnect(true);
              } else {
                toast.error('TradingView Connection Failed', {
                  description: result.error || 'Authorization was not completed'
                });
                if (onConnect) onConnect(false);
              }
            } catch (error) {
              console.error('Error parsing TradingView auth result:', error);
              toast.error('TradingView Connection Error', {
                description: 'Failed to parse authentication result'
              });
              if (onConnect) onConnect(false);
            }
            localStorage.removeItem('tradingview_auth_result');
          } else {
            // If no auth result is found, assume the user closed the window
            toast.error('TradingView Connection Cancelled', {
              description: 'Authorization was cancelled or timed out'
            });
            if (onConnect) onConnect(false);
          }
        }
      }, 500);
      
      // Set a timeout to stop checking if it takes too long
      setTimeout(() => {
        clearInterval(checkPopup);
        if (isConnecting) {
          setIsConnecting(false);
          toast.error('TradingView Connection Timeout', {
            description: 'Connection attempt timed out'
          });
          if (onConnect) onConnect(false);
        }
      }, 120000); // 2 minutes timeout
      
    } catch (error) {
      console.error('Error connecting to TradingView:', error);
      setIsConnecting(false);
      toast.error('TradingView Connection Error', {
        description: 'An error occurred while connecting to TradingView'
      });
      if (onConnect) onConnect(false);
    }
  };

  const disconnectFromTradingView = () => {
    try {
      // Clear any TradingView tokens or credentials from localStorage
      localStorage.removeItem('tradingview_token');
      localStorage.removeItem('tradingview_user');
      
      setIsConnected(false);
      toast.success('Disconnected from TradingView', {
        description: 'Your TradingView account has been unlinked'
      });
      
      if (onConnect) onConnect(false);
    } catch (error) {
      console.error('Error disconnecting from TradingView:', error);
      toast.error('TradingView Disconnection Error', {
        description: 'An error occurred while disconnecting'
      });
    }
  };

  return (
    <div className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/logos/tradingview.svg" 
            alt="TradingView Logo" 
            className="w-8 h-8"
          />
          <h3 className="text-lg font-medium">TradingView Integration</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Connect your TradingView account to enable automatic trade execution from TradingView alerts
        and import your indicators, watchlists, and charts.
      </p>

      <div className="flex justify-end space-x-2">
        {!isConnected ? (
          <button
            onClick={connectToTradingView}
            disabled={isConnecting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect to TradingView'}
          </button>
        ) : (
          <button
            onClick={disconnectFromTradingView}
            className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}