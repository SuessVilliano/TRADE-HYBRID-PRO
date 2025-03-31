import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, ArrowUp, ArrowDown, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './button';
import { Switch } from './switch';
import { Label } from './label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Badge } from './badge';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { TradeSignal } from '../../lib/services/google-sheets-service';

// Notification type
export interface SignalNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'new-signal' | 'update' | 'tp-hit' | 'sl-hit' | 'signal-completed';
  signalId?: string;
  read: boolean;
}

// Props
interface SignalNotificationsProps {
  signals?: TradeSignal[];
  onShowSignal?: (signalId: string) => void;
}

export function SignalNotifications({ signals = [], onShowSignal }: SignalNotificationsProps) {
  // State
  const [notifications, setNotifications] = useState<SignalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [notificationSettings, setNotificationSettings] = useState({
    newSignals: true,
    priceUpdates: true,
    takeProfitHit: true,
    stopLossHit: true,
    signalCompleted: true,
    useDesktopNotifications: 'denied' as NotificationPermission,
    sound: true,
  });
  
  // Initialize notifications on component mount
  useEffect(() => {
    // Check if browser supports notifications
    if ("Notification" in window) {
      // Get current permission state
      setNotificationSettings(prev => ({
        ...prev,
        useDesktopNotifications: Notification.permission
      }));
    }
  }, []);
  
  // Generate notifications whenever signals change
  useEffect(() => {
    if (signals && signals.length > 0) {
      // Generate sample notifications
      generateSampleNotifications();
      
      // Check unread count
      updateUnreadCount();
    }
  }, [signals]);
  
  // Update unread count
  const updateUnreadCount = () => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  };
  
  // Generate sample notifications based on signals
  const generateSampleNotifications = () => {
    if (!signals || signals.length === 0) return;
    
    // Take a few signals to create sample notifications
    const sampleNotifications: SignalNotification[] = [];
    
    // Add one "new signal" notification
    if (signals.length > 0) {
      const signal = signals[0];
      sampleNotifications.push({
        id: `new-${signal.id}`,
        title: 'New Trading Signal',
        message: `${signal.provider} AI has issued a new ${signal.direction.toUpperCase()} signal for ${signal.asset}`,
        timestamp: new Date(),
        type: 'new-signal',
        signalId: signal.id,
        read: false
      });
    }
    
    // Add "take profit hit" notification
    if (signals.length > 1) {
      const signal = signals[1];
      sampleNotifications.push({
        id: `tp-${signal.id}`,
        title: 'Take Profit Hit',
        message: `Your ${signal.direction.toUpperCase()} position on ${signal.asset} has hit take profit target 1 (${signal.takeProfit1})`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        type: 'tp-hit',
        signalId: signal.id,
        read: true
      });
    }
    
    // Add "stop loss hit" notification
    if (signals.length > 2) {
      const signal = signals[2];
      sampleNotifications.push({
        id: `sl-${signal.id}`,
        title: 'Stop Loss Hit',
        message: `Your ${signal.direction.toUpperCase()} position on ${signal.asset} has hit stop loss (${signal.stopLoss})`,
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        type: 'sl-hit',
        signalId: signal.id,
        read: true
      });
    }
    
    // Add "signal update" notification
    if (signals.length > 3) {
      const signal = signals[3];
      sampleNotifications.push({
        id: `update-${signal.id}`,
        title: 'Signal Update',
        message: `Take profit levels updated for ${signal.asset} ${signal.direction.toUpperCase()} signal`,
        timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
        type: 'update',
        signalId: signal.id,
        read: false
      });
    }
    
    // Add "signal completed" notification
    if (signals.length > 4) {
      const signal = signals[4];
      sampleNotifications.push({
        id: `complete-${signal.id}`,
        title: 'Signal Completed',
        message: `${signal.asset} signal has been completed with ${signal.pnlPercentage ? signal.pnlPercentage.toFixed(2) + '%' : 'profit'}`,
        timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
        type: 'signal-completed',
        signalId: signal.id,
        read: true
      });
    }
    
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  };
  
  // Request desktop notification permissions
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationSettings(prev => ({
        ...prev,
        useDesktopNotifications: permission
      }));
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read: true
      }))
    );
    setUnreadCount(0);
  };
  
  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    updateUnreadCount();
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: SignalNotification) => {
    // Mark notification as read
    markAsRead(notification.id);
    
    // Show the relevant signal if callback provided
    if (notification.signalId && onShowSignal) {
      onShowSignal(notification.signalId);
    }
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Toggle notifications on/off
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };
  
  // Update notification settings
  const handleSettingChange = (setting: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: value
    });
  };
  
  // Format notification timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: SignalNotification['type']) => {
    switch (type) {
      case 'new-signal':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'tp-hit':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'sl-hit':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'update':
        return <ArrowUp className="h-4 w-4 text-yellow-500" />;
      case 'signal-completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            disabled={!notificationsEnabled}
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            
            {unreadCount > 0 && notificationsEnabled && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-medium">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          align="end" 
          className="w-80 p-0" 
          sideOffset={8}
        >
          <div className="flex items-center justify-between border-b p-3">
            <h4 className="font-medium">Notifications</h4>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={toggleSettings}
                title="Notification settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={toggleNotifications}
                title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
              >
                {notificationsEnabled ? (
                  <BellOff className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {showSettings ? (
            <div className="p-3 space-y-4">
              <h4 className="font-medium mb-2">Notification Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-signals">New Signals</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when new signals are available
                    </p>
                  </div>
                  <Switch 
                    id="new-signals" 
                    checked={notificationSettings.newSignals}
                    onCheckedChange={(value) => handleSettingChange('newSignals', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="price-updates">Price Updates</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified about significant price movements
                    </p>
                  </div>
                  <Switch 
                    id="price-updates" 
                    checked={notificationSettings.priceUpdates}
                    onCheckedChange={(value) => handleSettingChange('priceUpdates', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tp-hit">Take Profit Hit</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when take profit levels are reached
                    </p>
                  </div>
                  <Switch 
                    id="tp-hit" 
                    checked={notificationSettings.takeProfitHit}
                    onCheckedChange={(value) => handleSettingChange('takeProfitHit', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sl-hit">Stop Loss Hit</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when stop loss levels are reached
                    </p>
                  </div>
                  <Switch 
                    id="sl-hit" 
                    checked={notificationSettings.stopLossHit}
                    onCheckedChange={(value) => handleSettingChange('stopLossHit', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="signal-completed">Signal Completed</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when signals are completed
                    </p>
                  </div>
                  <Switch 
                    id="signal-completed" 
                    checked={notificationSettings.signalCompleted}
                    onCheckedChange={(value) => handleSettingChange('signalCompleted', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound">Notification Sound</Label>
                    <p className="text-xs text-muted-foreground">
                      Play sound when new notifications arrive
                    </p>
                  </div>
                  <Switch 
                    id="sound" 
                    checked={notificationSettings.sound}
                    onCheckedChange={(value) => handleSettingChange('sound', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Desktop Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Show notifications outside the browser
                    </p>
                  </div>
                  {notificationSettings.useDesktopNotifications === 'granted' ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Enabled
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={requestNotificationPermission}
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                variant="outline" 
                onClick={toggleSettings}
              >
                Back to Notifications
              </Button>
            </div>
          ) : (
            <>
              <div className="max-h-[300px] overflow-y-auto">
                {sortedNotifications.length > 0 ? (
                  sortedNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`border-b p-3 cursor-pointer hover:bg-muted/50 transition-colors ${notification.read ? '' : 'bg-muted/20'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${notification.read ? '' : 'text-primary'}`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <h4 className="text-sm font-medium">No notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      You're all caught up! Check back later for updates.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}