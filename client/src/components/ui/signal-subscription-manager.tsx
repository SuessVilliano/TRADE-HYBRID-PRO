import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Switch } from './switch';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Spinner } from '../ui/spinner';
import axios from 'axios';

// Define types for signal providers and subscriptions
interface SignalProvider {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
}

interface SignalSubscription {
  id: string;
  user_id: string;
  provider_id: string;
  symbol?: string;
  status: 'active' | 'cancelled';
  notifications_enabled: boolean;
  auto_trade: boolean;
  auto_trade_settings?: any;
  created_at: string;
  updated_at: string;
}

// List of available signal providers
const AVAILABLE_PROVIDERS: SignalProvider[] = [
  {
    id: 'paradox',
    name: 'Paradox Signals',
    description: 'Advanced AI-powered trading signals with high accuracy',
    category: 'ai'
  },
  {
    id: 'solaris',
    name: 'Solaris Signals',
    description: 'Technical analysis driven signals from expert traders',
    category: 'expert'
  },
  {
    id: 'hybrid',
    name: 'Trade Hybrid',
    description: 'Our proprietary blend of AI and expert analysis',
    category: 'premium'
  }
];

export function SignalSubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<SignalSubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user's current subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/signal-subscriptions');
        setSubscriptions(response.data.subscriptions || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching signal subscriptions:', err);
        setError('Failed to load your signal subscriptions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  // Helper to find if user is subscribed to a provider
  const isSubscribed = (providerId: string) => {
    return subscriptions.some(sub => 
      sub.provider_id === providerId && sub.status === 'active'
    );
  };

  // Get subscription for a provider
  const getSubscription = (providerId: string) => {
    return subscriptions.find(sub => 
      sub.provider_id === providerId && sub.status === 'active'
    );
  };

  // Subscribe to a signal provider
  const handleSubscribe = async (providerId: string) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/signal-subscriptions/subscribe', {
        providerId
      });
      
      // Update local subscriptions list
      if (response.data.subscription) {
        // Remove existing subscription with this provider if exists
        const updatedSubs = subscriptions.filter(sub => !(sub.provider_id === providerId && sub.status === 'active'));
        // Add the new subscription
        setSubscriptions([...updatedSubs, response.data.subscription]);
        setSuccessMessage(`Successfully subscribed to ${AVAILABLE_PROVIDERS.find(p => p.id === providerId)?.name || providerId}`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error subscribing to provider:', err);
      setError('Failed to subscribe to this signal provider. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Unsubscribe from a signal provider
  const handleUnsubscribe = async (providerId: string) => {
    try {
      const subscription = getSubscription(providerId);
      if (!subscription) return;
      
      setLoading(true);
      const response = await axios.post('/api/signal-subscriptions/unsubscribe', {
        subscriptionId: subscription.id
      });
      
      // Update local subscriptions list
      if (response.data.subscription) {
        setSubscriptions(subscriptions.map(sub => 
          sub.id === response.data.subscription.id 
            ? response.data.subscription 
            : sub
        ));
        setSuccessMessage(`Successfully unsubscribed from ${AVAILABLE_PROVIDERS.find(p => p.id === providerId)?.name || providerId}`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error unsubscribing from provider:', err);
      setError('Failed to unsubscribe from this signal provider. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle notification settings
  const handleToggleNotifications = async (providerId: string, enabled: boolean) => {
    try {
      const subscription = getSubscription(providerId);
      if (!subscription) return;
      
      setLoading(true);
      const response = await axios.patch(`/api/signal-subscriptions/${subscription.id}`, {
        notificationsEnabled: enabled
      });
      
      // Update local subscriptions list
      if (response.data.subscription) {
        setSubscriptions(subscriptions.map(sub => 
          sub.id === response.data.subscription.id 
            ? response.data.subscription 
            : sub
        ));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('Failed to update notification settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle auto-trade settings
  const handleToggleAutoTrade = async (providerId: string, enabled: boolean) => {
    try {
      const subscription = getSubscription(providerId);
      if (!subscription) return;
      
      setLoading(true);
      const response = await axios.patch(`/api/signal-subscriptions/${subscription.id}`, {
        autoTrade: enabled
      });
      
      // Update local subscriptions list
      if (response.data.subscription) {
        setSubscriptions(subscriptions.map(sub => 
          sub.id === response.data.subscription.id 
            ? response.data.subscription 
            : sub
        ));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error updating auto-trade settings:', err);
      setError('Failed to update auto-trade settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Signal Subscriptions</h2>
      
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-500 text-green-700">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <Spinner size="lg" />
        </div>
      )}
      
      {/* Provider List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {AVAILABLE_PROVIDERS.map(provider => {
          const subscription = getSubscription(provider.id);
          const subscribed = !!subscription;
          
          return (
            <Card key={provider.id} className={subscribed ? "border-green-500" : ""}>
              <CardHeader>
                <CardTitle>{provider.name}</CardTitle>
                <CardDescription>{provider.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {subscribed && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Notifications</span>
                      <Switch 
                        checked={subscription?.notifications_enabled}
                        onCheckedChange={(checked) => handleToggleNotifications(provider.id, checked)}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auto-trade</span>
                      <Switch 
                        checked={subscription?.auto_trade}
                        onCheckedChange={(checked) => handleToggleAutoTrade(provider.id, checked)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {subscribed ? (
                  <Button 
                    onClick={() => handleUnsubscribe(provider.id)} 
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    Unsubscribe
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe(provider.id)} 
                    className="w-full"
                    disabled={loading}
                  >
                    Subscribe
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SignalSubscriptionManager;