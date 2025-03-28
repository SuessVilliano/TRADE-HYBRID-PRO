import React, { useState, useEffect } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { BellRing, Volume2, Volume, VolumeX, Bell, Send, MessageSquare, Monitor, ChevronRight, Terminal, BadgeAlert } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { TRADING_SYMBOLS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PopupContainer } from '@/components/ui/popup-container';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/lib/hooks/useLocalStorage';

interface NotificationSettings {
  // General settings
  enabled: boolean;
  sound: boolean;
  browser: boolean;
  inApp: boolean;
  soundVolume: number;

  // Notification types
  priceAlert: boolean;
  signalEntry: boolean;
  signalUpdate: boolean;
  signalExpiry: boolean;
  takeProfit: boolean;
  stopLoss: boolean;
  technicalPattern: boolean;
  higherTimeframeSignal: boolean;
  
  // Sounds selection
  alertSound: string;
  successSound: string;
  warningSound: string;
  
  // Priority level (1-5)
  priorityLevel: number;
  
  // Market filters
  markets: {
    crypto: boolean;
    forex: boolean;
    stocks: boolean;
    futures: boolean;
  };
  
  // Symbol filters
  enabledSymbols: {
    crypto: string[];
    stocks: string[];
    forex: string[];
    futures: string[];
  };
  
  // Time filters
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  workingDaysOnly: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  browser: true,
  inApp: true,
  soundVolume: 70,
  
  priceAlert: true,
  signalEntry: true,
  signalUpdate: true,
  signalExpiry: true,
  takeProfit: true,
  stopLoss: true,
  technicalPattern: false,
  higherTimeframeSignal: true,
  
  alertSound: 'ping',
  successSound: 'cash',
  warningSound: 'alert',
  
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

// Sound options
const SOUNDS = [
  { value: 'ping', label: 'Ping' },
  { value: 'cash', label: 'Cash Register' },
  { value: 'alert', label: 'Alert' },
  { value: 'bell', label: 'Bell' },
  { value: 'chime', label: 'Chime' },
];

export function NotificationSettingsDialog() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>(
    'notification-settings', 
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [open, setOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  const handleToggle = (key: keyof NotificationSettings, value?: boolean) => {
    setSettings({
      ...settings,
      [key]: value !== undefined ? value : !settings[key as keyof NotificationSettings],
    });
  };

  const handleMarketToggle = (market: keyof NotificationSettings['markets']) => {
    setSettings({
      ...settings,
      markets: {
        ...settings.markets,
        [market]: !settings.markets[market],
      },
    });
  };

  const handleSliderChange = (value: number[]) => {
    setSettings({
      ...settings,
      soundVolume: value[0],
    });
  };

  const handleTimeChange = (key: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSoundChange = (key: 'alertSound' | 'successSound' | 'warningSound', value: string) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const playSound = (sound: string) => {
    setActiveSound(sound);
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.volume = settings.soundVolume / 100;
    audio.play();
  };

  const getEnabledSymbolsCount = () => {
    let count = 0;
    Object.values(settings.enabledSymbols).forEach(arr => {
      count += arr.length;
    });
    return count;
  };

  // Generate symbol options from TRADING_SYMBOLS
  const symbolOptions = {
    crypto: TRADING_SYMBOLS.crypto || [],
    forex: TRADING_SYMBOLS.forex || [],
    stocks: TRADING_SYMBOLS.stocks || [],
    futures: TRADING_SYMBOLS.futures || [],
  };

  // Toggle a symbol in the enabled symbols list
  const toggleSymbol = (market: keyof NotificationSettings['enabledSymbols'], symbol: string) => {
    const isEnabled = settings.enabledSymbols[market].includes(symbol);
    
    setSettings({
      ...settings,
      enabledSymbols: {
        ...settings.enabledSymbols,
        [market]: isEnabled
          ? settings.enabledSymbols[market].filter(s => s !== symbol)
          : [...settings.enabledSymbols[market], symbol],
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {settings.enabled ? (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          ) : (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-slate-800 border-slate-700 text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BellRing className="h-5 w-5 text-blue-400" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure how and when you receive trading signals notifications
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="sounds" className="text-xs">Sounds</TabsTrigger>
            <TabsTrigger value="markets" className="text-xs">Markets</TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">Timing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                <div className="flex items-center justify-between mb-5">
                  <Label htmlFor="notifications-enabled" className="text-lg font-semibold flex items-center gap-2">
                    <BadgeAlert className="h-5 w-5 text-blue-400" />
                    Enable All Notifications
                  </Label>
                  <Switch
                    id="notifications-enabled"
                    checked={settings.enabled}
                    onCheckedChange={(value) => handleToggle('enabled', value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Delivery Methods</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-blue-400" />
                        <Label htmlFor="browser-notifs">Browser Notifications</Label>
                      </div>
                      <Switch
                        id="browser-notifs"
                        checked={settings.browser}
                        disabled={!settings.enabled}
                        onCheckedChange={(value) => handleToggle('browser', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-400" />
                        <Label htmlFor="in-app-notifs">In-App Notifications</Label>
                      </div>
                      <Switch
                        id="in-app-notifs"
                        checked={settings.inApp}
                        disabled={!settings.enabled}
                        onCheckedChange={(value) => handleToggle('inApp', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-blue-400" />
                        <Label htmlFor="sound-notifs">Sound Alerts</Label>
                      </div>
                      <Switch
                        id="sound-notifs"
                        checked={settings.sound}
                        disabled={!settings.enabled}
                        onCheckedChange={(value) => handleToggle('sound', value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Notification Types</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-blue-400" />
                        <Label htmlFor="price-alerts">Price Alerts</Label>
                      </div>
                      <Switch
                        id="price-alerts"
                        checked={settings.priceAlert}
                        disabled={!settings.enabled}
                        onCheckedChange={(value) => handleToggle('priceAlert', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-blue-400" />
                        <Label htmlFor="signal-entry">Signal Entry Points</Label>
                      </div>
                      <Switch
                        id="signal-entry"
                        checked={settings.signalEntry}
                        disabled={!settings.enabled}
                        onCheckedChange={(value) => handleToggle('signalEntry', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-green-400" />
                        <Label htmlFor="take-profit">Take Profit Levels</Label>
                      </div>
                      <Switch
                        id="take-profit"
                        checked={settings.takeProfit}
                        disabled={!settings.enabled}
                        onCheckedChange={(value) => handleToggle('takeProfit', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-red-400" />
                        <Label htmlFor="stop-loss">Stop Loss Levels</Label>
                      </div>
                      <Switch
                        id="stop-loss"
                        checked={settings.stopLoss}
                        disabled={!settings.enabled}
                        onCheckedChange={(value) => handleToggle('stopLoss', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {settings.sound && settings.enabled && (
                <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Volume className="h-4 w-4 text-blue-400" />
                    Sound Volume
                  </h3>
                  <div className="flex items-center gap-4">
                    <VolumeX className="h-4 w-4 text-slate-400" />
                    <Slider
                      value={[settings.soundVolume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleSliderChange}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4 text-blue-400" />
                    <span className="text-sm w-8 text-right">{settings.soundVolume}%</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sounds">
            <div className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                <h3 className="font-semibold mb-4">Notification Sounds</h3>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="alert-sound">Alert Sound (Price Alerts)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={settings.alertSound}
                        onValueChange={(value) => handleSoundChange('alertSound', value)}
                        disabled={!settings.enabled || !settings.sound}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOUNDS.map((sound) => (
                            <SelectItem key={sound.value} value={sound.value}>
                              {sound.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => playSound(settings.alertSound)}
                        disabled={!settings.enabled || !settings.sound}
                        className={activeSound === settings.alertSound ? 'bg-blue-900/30' : ''}
                      >
                        <Volume className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="success-sound">Success Sound (Take Profit)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={settings.successSound}
                        onValueChange={(value) => handleSoundChange('successSound', value)}
                        disabled={!settings.enabled || !settings.sound}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOUNDS.map((sound) => (
                            <SelectItem key={sound.value} value={sound.value}>
                              {sound.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => playSound(settings.successSound)}
                        disabled={!settings.enabled || !settings.sound}
                        className={activeSound === settings.successSound ? 'bg-blue-900/30' : ''}
                      >
                        <Volume className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="warning-sound">Warning Sound (Stop Loss)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={settings.warningSound}
                        onValueChange={(value) => handleSoundChange('warningSound', value)}
                        disabled={!settings.enabled || !settings.sound}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select sound" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOUNDS.map((sound) => (
                            <SelectItem key={sound.value} value={sound.value}>
                              {sound.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => playSound(settings.warningSound)}
                        disabled={!settings.enabled || !settings.sound}
                        className={activeSound === settings.warningSound ? 'bg-blue-900/30' : ''}
                      >
                        <Volume className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700 mt-4">
                    <div className="text-sm text-slate-400">
                      Test notification sounds before saving
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (settings.enabled && settings.sound) {
                          playSound(settings.alertSound);
                          setTimeout(() => playSound(settings.successSound), 1000);
                          setTimeout(() => playSound(settings.warningSound), 2000);
                        }
                      }}
                      disabled={!settings.enabled || !settings.sound}
                    >
                      Test All Sounds
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="markets">
            <div className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                <h3 className="font-semibold mb-4">Market Filters</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Select which markets you want to receive notifications for
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="crypto-market">Cryptocurrency</Label>
                    </div>
                    <Switch
                      id="crypto-market"
                      checked={settings.markets.crypto}
                      disabled={!settings.enabled}
                      onCheckedChange={() => handleMarketToggle('crypto')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="forex-market">Forex</Label>
                    </div>
                    <Switch
                      id="forex-market"
                      checked={settings.markets.forex}
                      disabled={!settings.enabled}
                      onCheckedChange={() => handleMarketToggle('forex')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="stocks-market">Stocks</Label>
                    </div>
                    <Switch
                      id="stocks-market"
                      checked={settings.markets.stocks}
                      disabled={!settings.enabled}
                      onCheckedChange={() => handleMarketToggle('stocks')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="futures-market">Futures</Label>
                    </div>
                    <Switch
                      id="futures-market"
                      checked={settings.markets.futures}
                      disabled={!settings.enabled}
                      onCheckedChange={() => handleMarketToggle('futures')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Symbol Filters</h3>
                  <Badge variant="outline" className="bg-blue-900/20 text-xs">
                    {getEnabledSymbolsCount()} Symbols Selected
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-3">
                  Optionally select specific trading symbols for notifications. If none are selected, you'll receive notifications for all symbols in the enabled markets.
                </p>
                
                <Tabs defaultValue="crypto" className="mt-4">
                  <TabsList className="w-full grid grid-cols-4 mb-3">
                    <TabsTrigger value="crypto" disabled={!settings.markets.crypto} className="text-xs">
                      Crypto
                    </TabsTrigger>
                    <TabsTrigger value="forex" disabled={!settings.markets.forex} className="text-xs">
                      Forex
                    </TabsTrigger>
                    <TabsTrigger value="stocks" disabled={!settings.markets.stocks} className="text-xs">
                      Stocks
                    </TabsTrigger>
                    <TabsTrigger value="futures" disabled={!settings.markets.futures} className="text-xs">
                      Futures
                    </TabsTrigger>
                  </TabsList>
                  
                  {(Object.keys(symbolOptions) as Array<keyof typeof symbolOptions>).map(market => (
                    <TabsContent key={market} value={market} className="max-h-48">
                      <ScrollArea className="h-48 rounded bg-slate-800 p-2">
                        <div className="space-y-2">
                          {symbolOptions[market].map(symbol => (
                            <div key={symbol} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`symbol-${symbol}`} 
                                checked={settings.enabledSymbols[market].includes(symbol)}
                                onCheckedChange={() => toggleSymbol(market, symbol)}
                                disabled={!settings.enabled || !settings.markets[market]}
                              />
                              <Label htmlFor={`symbol-${symbol}`} className="text-sm">
                                {symbol}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timing">
            <div className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                <h3 className="font-semibold mb-4">Quiet Hours</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quiet-hours-enabled">Enable Quiet Hours</Label>
                  </div>
                  <Switch
                    id="quiet-hours-enabled"
                    checked={settings.quietHoursEnabled}
                    disabled={!settings.enabled}
                    onCheckedChange={(value) => handleToggle('quietHoursEnabled', value)}
                  />
                </div>
                
                {settings.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="quiet-start" className="text-sm block mb-2">From</Label>
                      <input
                        id="quiet-start"
                        type="time"
                        value={settings.quietHoursStart}
                        onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                        disabled={!settings.enabled}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end" className="text-sm block mb-2">To</Label>
                      <input
                        id="quiet-end"
                        type="time"
                        value={settings.quietHoursEnd}
                        onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                        disabled={!settings.enabled}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="working-days">Working Days Only (Mon-Fri)</Label>
                  </div>
                  <Switch
                    id="working-days"
                    checked={settings.workingDaysOnly}
                    disabled={!settings.enabled}
                    onCheckedChange={(value) => handleToggle('workingDaysOnly', value)}
                  />
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                <h3 className="font-semibold mb-4">Priority Level</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Set the minimum priority level for notifications (1 = Low, 5 = Critical)
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Low</span>
                  <Slider
                    value={[settings.priorityLevel]}
                    min={1}
                    max={5}
                    step={1}
                    disabled={!settings.enabled}
                    onValueChange={(value) => setSettings({ ...settings, priorityLevel: value[0] })}
                    className="flex-1"
                  />
                  <span className="text-sm">Critical</span>
                  <Badge variant="outline" className="ml-2 bg-blue-900/20 w-8 text-center">
                    {settings.priorityLevel}
                  </Badge>
                </div>
                <div className="mt-4 text-sm text-slate-400">
                  <ul className="space-y-1 list-disc pl-5">
                    <li>Low (1): All notifications</li>
                    <li>Medium (3): Only important signals and price alerts</li>
                    <li>Critical (5): Only high-confidence signals and major price movements</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="border-t border-slate-700 pt-4 mt-2">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-slate-400">
              Your notification preferences are automatically saved
            </div>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}