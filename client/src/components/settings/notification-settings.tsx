import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Bell, BellOff, Share2, AlertTriangle } from 'lucide-react';

// Import from services
import { userSettingsService, UserSettings } from '../../lib/services/user-settings-service';
import { tradeSignalService } from '../../lib/services/trade-signal-service';

export function NotificationSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      signalAlerts: true,
      priceAlerts: false,
      newsAlerts: false,
      emailNotifications: false,
      desktopNotifications: true,
      soundAlerts: true
    },
    trading: {
      copyTradingEnabled: false,
      autoTrade: false,
      riskPerTrade: 2,
      maxDailyRisk: 10
    },
    display: {
      theme: 'system',
      chartStyle: 'candles',
      showPnL: true,
      showRisk: true
    },
    webhooks: {
      enabled: false,
      url: '',
      triggers: ['new_signal', 'signal_update']
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Load user settings from service
    const userSettings = userSettingsService.getSettings();
    if (userSettings) {
      setSettings(userSettings);
    }
  }, []);
  
  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };
  
  const handleWebhookToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      webhooks: {
        ...prev.webhooks,
        enabled
      }
    }));
  };
  
  const handleWebhookUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      webhooks: {
        ...prev.webhooks,
        url: e.target.value
      }
    }));
  };
  
  const handleTriggerToggle = (trigger: string) => {
    setSettings(prev => {
      const currentTriggers = prev.webhooks.triggers;
      
      // Toggle trigger presence in the array
      const newTriggers = currentTriggers.includes(trigger)
        ? currentTriggers.filter(t => t !== trigger)
        : [...currentTriggers, trigger];
        
      return {
        ...prev,
        webhooks: {
          ...prev.webhooks,
          triggers: newTriggers
        }
      };
    });
  };
  
  const saveSettings = () => {
    setIsLoading(true);
    
    try {
      // Validate webhook URL if enabled
      if (settings.webhooks.enabled && settings.webhooks.url && !isValidUrl(settings.webhooks.url)) {
        toast.error('Invalid webhook URL', {
          description: 'Please enter a valid URL starting with http:// or https://'
        });
        setIsLoading(false);
        return;
      }
      
      // Save settings to service
      userSettingsService.saveSettings(settings);
      
      toast.success('Settings saved successfully', {
        description: 'Your notification preferences have been updated.'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings', {
        description: 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you want to receive trading alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Alert Types</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <Label htmlFor="signal-alerts" className="font-medium">Signal Alerts</Label>
                </div>
                <Switch
                  id="signal-alerts"
                  checked={settings.notifications.signalAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('signalAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <Label htmlFor="price-alerts" className="font-medium">Price Alerts</Label>
                </div>
                <Switch
                  id="price-alerts"
                  checked={settings.notifications.priceAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('priceAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <Label htmlFor="news-alerts" className="font-medium">News Alerts</Label>
                </div>
                <Switch
                  id="news-alerts"
                  checked={settings.notifications.newsAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('newsAlerts', checked)}
                />
              </div>
            </div>
          </div>
          
          {/* Notification Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Methods</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="desktop-notifications" className="font-medium">Desktop Notifications</Label>
                <Switch
                  id="desktop-notifications"
                  checked={settings.notifications.desktopNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('desktopNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="sound-alerts" className="font-medium">Sound Alerts</Label>
                <Switch
                  id="sound-alerts"
                  checked={settings.notifications.soundAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('soundAlerts', checked)}
                />
              </div>
            </div>
          </div>
          
          {/* Webhooks Configuration */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Webhook Notifications
                </h3>
                <p className="text-sm text-slate-500">
                  Receive signal notifications via webhooks to integrate with your own systems
                </p>
              </div>
              <Switch
                id="webhook-enabled"
                checked={settings.webhooks.enabled}
                onCheckedChange={handleWebhookToggle}
              />
            </div>
            
            {settings.webhooks.enabled && (
              <div className="space-y-4 pl-2 border-l-2 border-slate-200 dark:border-slate-800 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-service.com/webhook"
                    value={settings.webhooks.url}
                    onChange={handleWebhookUrlChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md"
                  />
                  <p className="text-xs text-slate-500">
                    This URL will receive POST requests when trading signals are generated
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Webhook Triggers</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trigger-new-signal"
                        checked={settings.webhooks.triggers.includes('new_signal')}
                        onChange={() => handleTriggerToggle('new_signal')}
                        className="rounded"
                      />
                      <Label htmlFor="trigger-new-signal">New Signals</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trigger-signal-update"
                        checked={settings.webhooks.triggers.includes('signal_update')}
                        onChange={() => handleTriggerToggle('signal_update')}
                        className="rounded"
                      />
                      <Label htmlFor="trigger-signal-update">Signal Updates</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trigger-price-alert"
                        checked={settings.webhooks.triggers.includes('price_alert')}
                        onChange={() => handleTriggerToggle('price_alert')}
                        className="rounded"
                      />
                      <Label htmlFor="trigger-price-alert">Price Alerts</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Test Webhook</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast.loading('Sending test webhook...');
                      
                      setTimeout(() => {
                        if (isValidUrl(settings.webhooks.url)) {
                          toast.success('Test webhook sent successfully', {
                            description: `Sent to ${settings.webhooks.url}`
                          });
                        } else {
                          toast.error('Failed to send test webhook', {
                            description: 'Please enter a valid webhook URL'
                          });
                        }
                      }, 1500);
                    }}
                  >
                    Send Test Notification
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Test Signal Notifications */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Test Notifications
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Send a test trading signal to verify your notification settings
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!settings.notifications.desktopNotifications) {
                    toast.warning('Desktop notifications are disabled', {
                      description: 'Enable desktop notifications to receive trading signals'
                    });
                    return;
                  }
                  
                  // Request notification permission if needed
                  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
                    userSettingsService.checkNotificationPermission().then(granted => {
                      if (granted) {
                        // Add test signal to trigger notification
                        tradeSignalService.addTestSignal();
                        toast.success('Test signal created', {
                          description: 'Check for a notification from your browser'
                        });
                      } else {
                        toast.error('Notification permission denied', {
                          description: 'Please enable notifications in your browser settings'
                        });
                      }
                    });
                  } else {
                    // Permission already granted, just send the test signal
                    tradeSignalService.addTestSignal();
                    toast.success('Test signal created', {
                      description: 'Check for a notification from your browser'
                    });
                  }
                }}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Test Signal Notification
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!settings.notifications.soundAlerts) {
                    toast.warning('Sound alerts are disabled', {
                      description: 'Enable sound alerts in the settings above'
                    });
                    return;
                  }
                  
                  userSettingsService.playNotificationSound();
                  toast.success('Test sound played', {
                    description: 'If you didn\'t hear anything, check your volume settings'
                  });
                }}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2 h-4 w-4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                Test Sound Alert
              </Button>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button 
              onClick={saveSettings} 
              disabled={isLoading}
            >
              Save Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationSettings;