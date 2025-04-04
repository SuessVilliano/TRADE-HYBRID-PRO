import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bell, Lock, Palette, MonitorSmartphone, Volume2, Database, Globe, Cpu, Settings } from 'lucide-react';
import useLocalStorage from '@/lib/hooks/useLocalStorage';
import { useTheme } from '@/lib/hooks/useTheme';
import { useAudio } from '@/lib/stores/useAudio';
import { BottomNavCustomizer } from './bottom-nav-customizer';
import { useUserPreferences } from '@/lib/stores/useUserPreferences';

export const SettingsPanel = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  
  // Account settings
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // Display settings
  const [chartType, setChartType] = useState('candlestick');
  const [defaultTimeframe, setDefaultTimeframe] = useState('1h');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [signalAlerts, setSignalAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(false);
  
  // Audio settings
  const audioStore = useAudio();
  const [musicVolume, setMusicVolume] = useState(Math.round(audioStore.musicVolume * 100) || 50);
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(Math.round(audioStore.effectsVolume * 100) || 50);
  const [tradingSounds, setTradingSounds] = useState(true);
  
  // Performance settings
  const [renderQuality, setRenderQuality] = useState('medium');
  const [enableMetaverse, setEnableMetaverse] = useState(true);
  const [showTips, setShowTips] = useState(true);
  
  // Handle audio volume changes
  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    audioStore.setMusicVolume(value / 100);
  };
  
  const handleSfxVolumeChange = (value: number) => {
    setSoundEffectsVolume(value);
    audioStore.setEffectsVolume(value / 100);
  };
  
  // Save settings
  const saveSettings = () => {
    // Here you would typically save these to your backend
    alert('Settings saved successfully!');
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <Lock className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-1.5">
            <Palette className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-1.5">
            <MonitorSmartphone className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-1.5">
            <Volume2 className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1.5">
            <Cpu className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter your username" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email address" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="jp">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle>Interface Settings</CardTitle>
              <CardDescription>
                Customize your trading interface appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartType">Default Chart Type</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger id="chartType">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candlestick">Candlestick</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="heikinashi">Heikin-Ashi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeframe">Default Timeframe</Label>
                <Select value={defaultTimeframe} onValueChange={setDefaultTimeframe}>
                  <SelectTrigger id="timeframe">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compactView">Compact View</Label>
                <Switch id="compactView" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTooltips">Show Tooltips</Label>
                <Switch id="showTooltips" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Settings</CardTitle>
              <CardDescription>
                Customize your bottom navigation bar and menu preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
                Configure which buttons appear in the bottom navigation bar.
                You can select up to 4 tabs to show in the bottom navigation.
              </div>
              
              {/* Add BottomNavCustomizer component here */}
              <div className="mt-4 mb-6">
                <BottomNavCustomizer 
                  trigger={
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full max-w-md flex items-center justify-center gap-2 py-6"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Customize Bottom Navigation Bar</span>
                    </Button>
                  } 
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <h3 className="text-md font-medium">Additional Options</h3>
                <div className="flex items-center justify-between mt-4">
                  <Label htmlFor="sidebarCollapsed">Collapsed Sidebar by Default</Label>
                  <Switch id="sidebarCollapsed" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="rememberLastPage">Remember Last Visited Page</Label>
                  <Switch id="rememberLastPage" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPanelLabels">Show Panel Labels</Label>
                  <Switch id="showPanelLabels" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifs">Email Notifications</Label>
                <Switch 
                  id="emailNotifs" 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="priceAlerts">Price Alerts</Label>
                <Switch 
                  id="priceAlerts" 
                  checked={priceAlerts} 
                  onCheckedChange={setPriceAlerts} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="signalAlerts">Signal Alerts</Label>
                <Switch 
                  id="signalAlerts" 
                  checked={signalAlerts} 
                  onCheckedChange={setSignalAlerts} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="newsAlerts">News Alerts</Label>
                <Switch 
                  id="newsAlerts" 
                  checked={newsAlerts} 
                  onCheckedChange={setNewsAlerts} 
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label htmlFor="alertFrequency">Alert Frequency</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger id="alertFrequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>Audio Settings</CardTitle>
              <CardDescription>
                Manage sound effects and background music
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableMusic">Enable Background Music</Label>
                  <Switch 
                    id="enableMusic" 
                    checked={!audioStore.musicMuted} 
                    onCheckedChange={(checked) => {
                      audioStore.toggleMusicMuted();
                    }} 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="musicVolume" className="min-w-[100px]">Music Volume</Label>
                  <input 
                    id="musicVolume" 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={musicVolume} 
                    onChange={(e) => handleMusicVolumeChange(parseInt(e.target.value))}
                    className="w-full" 
                  />
                  <span className="text-sm">{musicVolume}%</span>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableSoundEffects">Enable Sound Effects</Label>
                  <Switch 
                    id="enableSoundEffects" 
                    checked={!audioStore.isMuted} 
                    onCheckedChange={(checked) => {
                      audioStore.toggleMute();
                    }} 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="effectsVolume" className="min-w-[100px]">Effects Volume</Label>
                  <input 
                    id="effectsVolume" 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={soundEffectsVolume} 
                    onChange={(e) => handleSfxVolumeChange(parseInt(e.target.value))}
                    className="w-full" 
                  />
                  <span className="text-sm">{soundEffectsVolume}%</span>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <Label htmlFor="tradingSounds">Trading Action Sounds</Label>
                <Switch 
                  id="tradingSounds" 
                  checked={tradingSounds} 
                  onCheckedChange={setTradingSounds} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Adjust settings to optimize performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="renderQuality">Render Quality</Label>
                <Select value={renderQuality} onValueChange={setRenderQuality}>
                  <SelectTrigger id="renderQuality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Best Performance)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Best Visuals)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="metaverse">Enable Metaverse</Label>
                <Switch 
                  id="metaverse" 
                  checked={enableMetaverse} 
                  onCheckedChange={setEnableMetaverse} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tipTooltips">Show Trading Tips</Label>
                <Switch 
                  id="tipTooltips" 
                  checked={showTips} 
                  onCheckedChange={setShowTips} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hardwareAcceleration">Hardware Acceleration</Label>
                <Switch id="hardwareAcceleration" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="realTimeCharts">Real-time Chart Updates</Label>
                <Switch id="realTimeCharts" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>
                Connect with external trading services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg">TradingView</Label>
                    <p className="text-sm text-gray-500">Connect to your TradingView account</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg">Broker APIs</Label>
                    <p className="text-sm text-gray-500">Connect to your trading accounts</p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Alpaca</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">Connected</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">ABATEV Protocol</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">Disconnected</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg">Webhook Management</Label>
                    <p className="text-sm text-gray-500">Create and manage webhooks for trading signals</p>
                  </div>
                  <Button variant="outline" onClick={() => window.location.href = '/webhook-settings'}>Manage</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg">Wallet Connections</Label>
                    <p className="text-sm text-gray-500">Connect your crypto wallets</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};