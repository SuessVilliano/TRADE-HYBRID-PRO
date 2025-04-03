import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import TestNotificationButton from '@/components/ui/test-notification-button';
import { PopupContainer } from '@/components/ui/popup-container';
import { PushNotificationToggle } from '@/components/ui/push-notification-toggle';

export interface NotificationSettingsInterface {
  enabled: boolean;
  sound: boolean;
  browser: boolean;
  inApp: boolean;
  soundVolume: number;
  signalEntry: boolean;
  signalUpdate: boolean;
  signalExpiry: boolean;
  priceAlert: boolean;
  takeProfit: boolean;
  stopLoss: boolean;
  technicalPattern: boolean;
  alertSound: string;
  successSound: string;
  warningSound: string;
  priorityLevel: number;
  markets: {
    crypto: boolean;
    forex: boolean;
    stocks: boolean;
    futures: boolean;
  };
  enabledSymbols: {
    crypto: string[];
    stocks: string[];
    forex: string[];
    futures: string[];
  };
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  workingDaysOnly: boolean;
}

const DEFAULT_SETTINGS: NotificationSettingsInterface = {
  enabled: true,
  sound: true,
  browser: true,
  inApp: true,
  soundVolume: 70,
  
  signalEntry: true,
  signalUpdate: true,
  signalExpiry: true,
  priceAlert: true,
  takeProfit: true,
  stopLoss: true,
  technicalPattern: false,
  
  alertSound: 'price-alert',
  successSound: 'success',
  warningSound: 'trading-signal',
  
  priorityLevel: 3,
  
  markets: {
    crypto: true,
    forex: true,
    stocks: true,
    futures: true,
  },
  
  enabledSymbols: {
    crypto: [],
    stocks: [],
    forex: [],
    futures: [],
  },
  
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  workingDaysOnly: false,
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettingsInterface>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [availableSounds, setAvailableSounds] = useState<string[]>([
    'price-alert', 'trading-signal', 'success', 'message', 'chime'
  ]);

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('notification-settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading notification settings', error);
      }
    };

    loadSettings();
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  // Update a setting value
  const updateSetting = (key: keyof NotificationSettingsInterface, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update a nested setting value
  const updateNestedSetting = (parent: keyof NotificationSettingsInterface, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as any,
        [key]: value
      }
    }));
  };

  // Save settings
  const saveSettings = () => {
    try {
      localStorage.setItem('notification-settings', JSON.stringify(settings));
      setHasChanges(false);
      // Show success message
      alert('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings', error);
      alert('Failed to save settings');
    }
  };

  // Reset settings
  const resetSettings = () => {
    if (window.confirm('Reset notification settings to default?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('notification-settings');
      setHasChanges(true);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetSettings}>
              Reset
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={!hasChanges}
              variant={hasChanges ? "default" : "outline"}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sounds">Sounds</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="test">Test Notifications</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <PopupContainer className="mb-6" padding>
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-notifications" className="font-medium">Enable Notifications</Label>
                    <p className="text-sm text-slate-400">Master switch for all notifications</p>
                  </div>
                  <Switch 
                    id="enable-notifications" 
                    checked={settings.enabled}
                    onCheckedChange={(checked) => updateSetting('enabled', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <Label className="font-medium">Notification Channels</Label>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="in-app-notifications" className="font-medium">In-App Notifications</Label>
                      <p className="text-sm text-slate-400">Show notifications within the platform</p>
                    </div>
                    <Switch 
                      id="in-app-notifications" 
                      checked={settings.inApp}
                      onCheckedChange={(checked) => updateSetting('inApp', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="browser-notifications" className="font-medium">Browser Notifications</Label>
                      <p className="text-sm text-slate-400">Show desktop notifications</p>
                    </div>
                    <Switch 
                      id="browser-notifications" 
                      checked={settings.browser}
                      onCheckedChange={(checked) => updateSetting('browser', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-slate-400">Receive notifications when the browser is closed</p>
                    </div>
                    <PushNotificationToggle 
                      disabled={!settings.enabled || !settings.browser}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sound-notifications" className="font-medium">Sound Alerts</Label>
                      <p className="text-sm text-slate-400">Play sounds for notifications</p>
                    </div>
                    <Switch 
                      id="sound-notifications" 
                      checked={settings.sound}
                      onCheckedChange={(checked) => updateSetting('sound', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <Label className="font-medium">Notification Types</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="price-alerts" className="font-medium">Price Alerts</Label>
                    <Switch 
                      id="price-alerts" 
                      checked={settings.priceAlert}
                      onCheckedChange={(checked) => updateSetting('priceAlert', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signal-entry" className="font-medium">Signal Entry Alerts</Label>
                    <Switch 
                      id="signal-entry" 
                      checked={settings.signalEntry}
                      onCheckedChange={(checked) => updateSetting('signalEntry', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signal-update" className="font-medium">Signal Update Alerts</Label>
                    <Switch 
                      id="signal-update" 
                      checked={settings.signalUpdate}
                      onCheckedChange={(checked) => updateSetting('signalUpdate', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signal-expiry" className="font-medium">Signal Expiry Alerts</Label>
                    <Switch 
                      id="signal-expiry" 
                      checked={settings.signalExpiry}
                      onCheckedChange={(checked) => updateSetting('signalExpiry', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="take-profit" className="font-medium">Take Profit Alerts</Label>
                    <Switch 
                      id="take-profit" 
                      checked={settings.takeProfit}
                      onCheckedChange={(checked) => updateSetting('takeProfit', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stop-loss" className="font-medium">Stop Loss Alerts</Label>
                    <Switch 
                      id="stop-loss" 
                      checked={settings.stopLoss}
                      onCheckedChange={(checked) => updateSetting('stopLoss', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="technical-pattern" className="font-medium">Technical Pattern Alerts</Label>
                    <Switch 
                      id="technical-pattern" 
                      checked={settings.technicalPattern}
                      onCheckedChange={(checked) => updateSetting('technicalPattern', checked)}
                      disabled={!settings.enabled}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <Label className="font-medium">Priority Level</Label>
                  <p className="text-sm text-slate-400">Set the minimum priority level for notifications (higher value = fewer notifications)</p>
                  
                  <div className="w-full px-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs">Low (1)</span>
                      <span className="text-xs">High (5)</span>
                    </div>
                    <Slider
                      value={[settings.priorityLevel]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(val) => updateSetting('priorityLevel', val[0])}
                      disabled={!settings.enabled}
                    />
                    <div className="flex justify-center mt-2">
                      <span className="text-sm font-medium">Current: {settings.priorityLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </PopupContainer>
          </TabsContent>

          {/* Sound Settings */}
          <TabsContent value="sounds">
            <PopupContainer className="mb-6" padding>
              <h2 className="text-xl font-semibold mb-4">Sound Settings</h2>
              
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-volume" className="font-medium">Sound Volume</Label>
                    <p className="text-sm text-slate-400">Adjust volume for notification sounds</p>
                  </div>
                  <div className="w-[200px]">
                    <Slider
                      id="sound-volume"
                      value={[settings.soundVolume]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(val) => updateSetting('soundVolume', val[0])}
                      disabled={!settings.sound || !settings.enabled}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-sm">{settings.soundVolume}%</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <Label className="font-medium">Sound Selection</Label>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="alert-sound" className="font-medium">Alert Sound</Label>
                      <div className="flex items-center mt-2 gap-2">
                        <select
                          id="alert-sound"
                          value={settings.alertSound}
                          onChange={(e) => updateSetting('alertSound', e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 w-full"
                          disabled={!settings.sound || !settings.enabled}
                        >
                          {availableSounds.map(sound => (
                            <option key={sound} value={sound}>{sound}</option>
                          ))}
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(`/sounds/${settings.alertSound}.mp3`);
                            audio.volume = settings.soundVolume / 100;
                            audio.play();
                          }}
                          disabled={!settings.sound || !settings.enabled}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="success-sound" className="font-medium">Success Sound</Label>
                      <div className="flex items-center mt-2 gap-2">
                        <select
                          id="success-sound"
                          value={settings.successSound}
                          onChange={(e) => updateSetting('successSound', e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 w-full"
                          disabled={!settings.sound || !settings.enabled}
                        >
                          {availableSounds.map(sound => (
                            <option key={sound} value={sound}>{sound}</option>
                          ))}
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(`/sounds/${settings.successSound}.mp3`);
                            audio.volume = settings.soundVolume / 100;
                            audio.play();
                          }}
                          disabled={!settings.sound || !settings.enabled}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="warning-sound" className="font-medium">Warning Sound</Label>
                      <div className="flex items-center mt-2 gap-2">
                        <select
                          id="warning-sound"
                          value={settings.warningSound}
                          onChange={(e) => updateSetting('warningSound', e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 w-full"
                          disabled={!settings.sound || !settings.enabled}
                        >
                          {availableSounds.map(sound => (
                            <option key={sound} value={sound}>{sound}</option>
                          ))}
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(`/sounds/${settings.warningSound}.mp3`);
                            audio.volume = settings.soundVolume / 100;
                            audio.play();
                          }}
                          disabled={!settings.sound || !settings.enabled}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PopupContainer>
          </TabsContent>

          {/* Timing Settings */}
          <TabsContent value="timing">
            <PopupContainer className="mb-6" padding>
              <h2 className="text-xl font-semibold mb-4">Timing Settings</h2>
              
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quiet-hours" className="font-medium">Quiet Hours</Label>
                    <p className="text-sm text-slate-400">Disable notifications during specific hours</p>
                  </div>
                  <Switch 
                    id="quiet-hours" 
                    checked={settings.quietHoursEnabled}
                    onCheckedChange={(checked) => updateSetting('quietHoursEnabled', checked)}
                    disabled={!settings.enabled}
                  />
                </div>
                
                {settings.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-md">
                    <div>
                      <Label htmlFor="quiet-start" className="font-medium">Start Time</Label>
                      <input
                        id="quiet-start"
                        type="time"
                        value={settings.quietHoursStart}
                        onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                        className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2"
                        disabled={!settings.quietHoursEnabled || !settings.enabled}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="quiet-end" className="font-medium">End Time</Label>
                      <input
                        id="quiet-end"
                        type="time"
                        value={settings.quietHoursEnd}
                        onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                        className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2"
                        disabled={!settings.quietHoursEnabled || !settings.enabled}
                      />
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="working-days" className="font-medium">Working Days Only</Label>
                    <p className="text-sm text-slate-400">Only show notifications on weekdays (Monday-Friday)</p>
                  </div>
                  <Switch 
                    id="working-days" 
                    checked={settings.workingDaysOnly}
                    onCheckedChange={(checked) => updateSetting('workingDaysOnly', checked)}
                    disabled={!settings.enabled}
                  />
                </div>
              </div>
            </PopupContainer>
          </TabsContent>

          {/* Markets Settings */}
          <TabsContent value="markets">
            <PopupContainer className="mb-6" padding>
              <h2 className="text-xl font-semibold mb-4">Market Settings</h2>
              
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <Label className="font-medium">Enable Markets</Label>
                  <p className="text-sm text-slate-400">Select which markets to receive notifications for</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-md">
                      <Label htmlFor="crypto-market" className="font-medium">Cryptocurrency</Label>
                      <Switch 
                        id="crypto-market" 
                        checked={settings.markets.crypto}
                        onCheckedChange={(checked) => updateNestedSetting('markets', 'crypto', checked)}
                        disabled={!settings.enabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-md">
                      <Label htmlFor="forex-market" className="font-medium">Forex</Label>
                      <Switch 
                        id="forex-market" 
                        checked={settings.markets.forex}
                        onCheckedChange={(checked) => updateNestedSetting('markets', 'forex', checked)}
                        disabled={!settings.enabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-md">
                      <Label htmlFor="stocks-market" className="font-medium">Stocks</Label>
                      <Switch 
                        id="stocks-market" 
                        checked={settings.markets.stocks}
                        onCheckedChange={(checked) => updateNestedSetting('markets', 'stocks', checked)}
                        disabled={!settings.enabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-md">
                      <Label htmlFor="futures-market" className="font-medium">Futures</Label>
                      <Switch 
                        id="futures-market" 
                        checked={settings.markets.futures}
                        onCheckedChange={(checked) => updateNestedSetting('markets', 'futures', checked)}
                        disabled={!settings.enabled}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Symbol Filtering</Label>
                      <p className="text-sm text-slate-400">Add specific symbols to filter notifications (leave empty to receive all)</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => alert('Symbol filtering will be implemented in a future update')}
                      disabled={!settings.enabled}
                    >
                      Manage Symbols
                    </Button>
                  </div>
                </div>
              </div>
            </PopupContainer>
          </TabsContent>

          {/* Test Notifications */}
          <TabsContent value="test">
            <PopupContainer className="mb-6" padding>
              <h2 className="text-xl font-semibold mb-4">Test Notifications</h2>
              <p className="text-sm text-slate-400 mb-6">Use these buttons to test different types of notifications</p>
              
              <div className="grid gap-4">
                <TestNotificationButton />
              </div>
            </PopupContainer>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}