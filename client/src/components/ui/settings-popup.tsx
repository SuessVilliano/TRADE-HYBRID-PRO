import { useState, useEffect } from 'react';
import { Button } from './button';
import { X, Save, Volume2, Volume1, VolumeX, Mic, MicOff, Monitor, Smartphone, Moon, Sun, RotateCcw, BarChart2 } from 'lucide-react';
import { Switch } from './switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Slider } from './slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { useAudio } from '@/lib/stores/useAudio';
import { SignalTestButtons } from './signal-test-buttons';
import { useSignals } from '@/lib/stores/useSignals';
import { useMarketMood } from '@/lib/context/MarketMoodContext';
import { MarketMoodToggle, MarketMoodPreview } from './market-mood-components';

/**
 * Settings Popup Component
 * - Provides access to audio settings
 * - Controls graphics quality and display modes
 * - Supports accessibility options
 * - Manages voice chat and notification settings
 */
export function SettingsPopup({
  onClose
}: {
  onClose: () => void;
}) {
  // Ensure safe closing with cleanup
  const handleClose = () => {
    if (onClose) {
      try {
        onClose();
      } catch (error) {
        console.error("Error closing settings popup:", error);
      }
    }
  };
  
  const [activeTab, setActiveTab] = useState<'audio' | 'graphics' | 'accessibility' | 'account' | 'signals'>('audio');
  const { 
    isMuted, 
    toggleMute 
  } = useAudio();
  
  // Voice chat state (temporary until added to audio store)
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(false);
  const enableVoiceChat = async () => {
    // Simulate microphone permission request
    setVoiceChatEnabled(true);
    return true;
  };
  const disableVoiceChat = () => {
    setVoiceChatEnabled(false);
  };
  
  // Audio settings
  const [masterVolume, setMasterVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(60);
  const [effectsVolume, setEffectsVolume] = useState(80);
  const [voiceChatVolume, setVoiceChatVolume] = useState(85);
  
  // Graphics settings
  const [qualityPreset, setQualityPreset] = useState('medium');
  const [renderDistance, setRenderDistance] = useState(60);
  const [shadowQuality, setShadowQuality] = useState('medium');
  const [antialiasing, setAntialiasing] = useState(true);
  const [vsync, setVsync] = useState(true);
  const [frameRate, setFrameRate] = useState('60');
  const [theme, setTheme] = useState('system');
  
  // Accessibility settings
  const [textSize, setTextSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [subtitles, setSubtitles] = useState(false);
  
  // Account settings
  const [username, setUsername] = useState('Trader123');
  const [email, setEmail] = useState('trader123@example.com');
  const [notifications, setNotifications] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [tradingUpdates, setTradingUpdates] = useState(true);
  const [communityMessages, setCommunityMessages] = useState(true);

  // Toggle voice chat
  const handleToggleVoiceChat = async () => {
    if (voiceChatEnabled) {
      disableVoiceChat();
    } else {
      const success = await enableVoiceChat();
      if (!success) {
        alert('Failed to enable voice chat. Please check your microphone permissions.');
      }
    }
  };

  // Apply graphics preset
  const applyGraphicsPreset = (preset: string) => {
    setQualityPreset(preset);
    
    switch (preset) {
      case 'low':
        setRenderDistance(30);
        setShadowQuality('low');
        setAntialiasing(false);
        setVsync(false);
        setFrameRate('30');
        break;
      case 'medium':
        setRenderDistance(60);
        setShadowQuality('medium');
        setAntialiasing(true);
        setVsync(true);
        setFrameRate('60');
        break;
      case 'high':
        setRenderDistance(100);
        setShadowQuality('high');
        setAntialiasing(true);
        setVsync(true);
        setFrameRate('unlimited');
        break;
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    // Audio
    setMasterVolume(70);
    setMusicVolume(60);
    setEffectsVolume(80);
    setVoiceChatVolume(85);
    
    // Graphics
    applyGraphicsPreset('medium');
    setTheme('system');
    
    // Accessibility
    setTextSize('medium');
    setHighContrast(false);
    setReducedMotion(false);
    setColorBlindMode('none');
    setSubtitles(false);
    
    // Account
    setNotifications(true);
    setMarketAlerts(true);
    setTradingUpdates(true);
    setCommunityMessages(true);
    
    // Signal Notifications
    useSignals().setNotificationsEnabled(true);
  };

  // Save settings (simulation)
  const saveSettings = () => {
    // Store settings in localStorage
    localStorage.setItem('tradeHybrid_audioSettings', JSON.stringify({
      masterVolume,
      musicVolume,
      effectsVolume,
      voiceChatVolume,
      voiceChatEnabled
    }));
    
    localStorage.setItem('tradeHybrid_graphicsSettings', JSON.stringify({
      qualityPreset,
      renderDistance,
      shadowQuality,
      antialiasing,
      vsync,
      frameRate,
      theme
    }));
    
    localStorage.setItem('tradeHybrid_accessibilitySettings', JSON.stringify({
      textSize,
      highContrast,
      reducedMotion,
      colorBlindMode,
      subtitles
    }));
    
    localStorage.setItem('tradeHybrid_notificationSettings', JSON.stringify({
      notifications,
      marketAlerts,
      tradingUpdates,
      communityMessages
    }));
    
    alert('Settings saved successfully!');
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="w-full flex flex-col">
          <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="graphics">Graphics</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                <TabsTrigger value="signals">Signals</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-auto">
              <TabsContent value="audio" className="p-6 m-0">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Audio Settings</h3>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <><VolumeX className="h-4 w-4 mr-2" /> Unmute</>
                        ) : (
                          <><Volume1 className="h-4 w-4 mr-2" /> Mute</>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Master Volume</label>
                          <span className="text-sm text-muted-foreground">{masterVolume}%</span>
                        </div>
                        <Slider
                          value={[masterVolume]}
                          onValueChange={(value) => setMasterVolume(value[0])}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Music Volume</label>
                          <span className="text-sm text-muted-foreground">{musicVolume}%</span>
                        </div>
                        <Slider
                          value={[musicVolume]}
                          onValueChange={(value) => setMusicVolume(value[0])}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Sound Effects</label>
                          <span className="text-sm text-muted-foreground">{effectsVolume}%</span>
                        </div>
                        <Slider
                          value={[effectsVolume]}
                          onValueChange={(value) => setEffectsVolume(value[0])}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Voice Chat Volume</label>
                          <span className="text-sm text-muted-foreground">{voiceChatVolume}%</span>
                        </div>
                        <Slider
                          value={[voiceChatVolume]}
                          onValueChange={(value) => setVoiceChatVolume(value[0])}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Voice Chat</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable Voice Chat</p>
                          <p className="text-sm text-muted-foreground">
                            Communicate with other traders in proximity
                          </p>
                        </div>
                        <Button
                          variant={voiceChatEnabled ? "destructive" : "default"}
                          onClick={handleToggleVoiceChat}
                        >
                          {voiceChatEnabled ? (
                            <><MicOff className="h-4 w-4 mr-2" /> Disable</>
                          ) : (
                            <><Mic className="h-4 w-4 mr-2" /> Enable</>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Spatial Audio</p>
                          <p className="text-sm text-muted-foreground">
                            Hear voices based on player positions
                          </p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push-to-Talk</p>
                          <p className="text-sm text-muted-foreground">
                            Hold key to speak (default: T)
                          </p>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="graphics" className="p-6 m-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Graphics Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Quality Preset</label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant={qualityPreset === 'low' ? 'default' : 'outline'}
                            onClick={() => applyGraphicsPreset('low')}
                          >
                            Low
                          </Button>
                          <Button 
                            variant={qualityPreset === 'medium' ? 'default' : 'outline'}
                            onClick={() => applyGraphicsPreset('medium')}
                          >
                            Medium
                          </Button>
                          <Button 
                            variant={qualityPreset === 'high' ? 'default' : 'outline'}
                            onClick={() => applyGraphicsPreset('high')}
                          >
                            High
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Render Distance</label>
                          <span className="text-sm text-muted-foreground">{renderDistance}%</span>
                        </div>
                        <Slider
                          value={[renderDistance]}
                          onValueChange={(value) => setRenderDistance(value[0])}
                          min={10}
                          max={100}
                          step={5}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Shadow Quality</label>
                        <Select value={shadowQuality} onValueChange={setShadowQuality}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shadow quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off">Off</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Anti-aliasing</p>
                          <p className="text-sm text-muted-foreground">
                            Smooth jagged edges
                          </p>
                        </div>
                        <Switch checked={antialiasing} onCheckedChange={setAntialiasing} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">V-Sync</p>
                          <p className="text-sm text-muted-foreground">
                            Synchronize with monitor refresh rate
                          </p>
                        </div>
                        <Switch checked={vsync} onCheckedChange={setVsync} />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Frame Rate Limit</label>
                        <Select value={frameRate} onValueChange={setFrameRate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frame rate limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 FPS</SelectItem>
                            <SelectItem value="60">60 FPS</SelectItem>
                            <SelectItem value="144">144 FPS</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Market Mood Colors</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Adaptive Color Scheme</p>
                          <p className="text-sm text-muted-foreground">
                            Dynamically adjust UI colors based on market sentiment
                          </p>
                        </div>
                        <MarketMoodToggle />
                      </div>
                      
                      <MarketMoodPreview />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Display Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Display Mode</p>
                          <p className="text-sm text-muted-foreground">
                            Choose your preferred display mode
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant={theme === 'light' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setTheme('light')}
                          >
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </Button>
                          <Button 
                            variant={theme === 'dark' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setTheme('dark')}
                          >
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </Button>
                          <Button 
                            variant={theme === 'system' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setTheme('system')}
                          >
                            <Monitor className="h-4 w-4 mr-2" />
                            System
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="accessibility" className="p-6 m-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Text & Display</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Text Size</label>
                        <Select value={textSize} onValueChange={setTextSize}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select text size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="x-large">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">High Contrast</p>
                          <p className="text-sm text-muted-foreground">
                            Increase contrast for better readability
                          </p>
                        </div>
                        <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Reduced Motion</p>
                          <p className="text-sm text-muted-foreground">
                            Minimize animations and motion effects
                          </p>
                        </div>
                        <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Color Blind Mode</label>
                        <Select value={colorBlindMode} onValueChange={setColorBlindMode}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color blind mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="protanopia">Protanopia</SelectItem>
                            <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                            <SelectItem value="tritanopia">Tritanopia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Subtitles</p>
                          <p className="text-sm text-muted-foreground">
                            Show subtitles for voice and video content
                          </p>
                        </div>
                        <Switch checked={subtitles} onCheckedChange={setSubtitles} />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="account" className="p-6 m-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Username</label>
                        <Input 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          type="email"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive important alerts and updates
                          </p>
                        </div>
                        <Switch checked={notifications} onCheckedChange={setNotifications} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Market Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Price movements and important market events
                          </p>
                        </div>
                        <Switch 
                          checked={marketAlerts} 
                          onCheckedChange={setMarketAlerts}
                          disabled={!notifications} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Trading Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Order completions and portfolio changes
                          </p>
                        </div>
                        <Switch 
                          checked={tradingUpdates} 
                          onCheckedChange={setTradingUpdates}
                          disabled={!notifications} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Community Messages</p>
                          <p className="text-sm text-muted-foreground">
                            Updates from followed traders and groups
                          </p>
                        </div>
                        <Switch 
                          checked={communityMessages} 
                          onCheckedChange={setCommunityMessages}
                          disabled={!notifications} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Testing Signal Notifications */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Signal Notifications</h3>
                    <SignalTestButtons />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="flex justify-between mt-6 pt-4 border-t border-slate-700">
            <Button 
              variant="outline" 
              onClick={resetSettings}
              className="flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={saveSettings} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}