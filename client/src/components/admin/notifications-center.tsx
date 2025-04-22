import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Bell, 
  Plus, 
  AlertTriangle, 
  Info, 
  Check, 
  XCircle, 
  Send, 
  Users, 
  Filter, 
  Search,
  Clock,
  Trash,
  Edit,
  Eye,
  MoreVertical,
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  priority: 'low' | 'normal' | 'high';
  audience: 'all' | 'premium' | 'specific';
  userIds?: string[];
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
  dismissable: boolean;
  link?: string;
  linkText?: string;
  icon?: string;
  sender: string;
}

interface NotificationTemplates {
  newSignal: string;
  systemUpdate: string;
  priceAlert: string;
  accountAlert: string;
  apiUpdate: string;
}

interface NotificationSettings {
  defaultDismissable: boolean;
  defaultExpiration: number;
  allowOverrides: boolean;
  maxNotificationsPerDay: number;
  notifyOnNewVersion: boolean;
  notifyOnNewSignals: boolean;
  notifyOnSystemUpdates: boolean;
}

export function AdminNotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplates>({
    newSignal: 'New trading signal available for {{symbol}} - {{direction}} at {{price}}',
    systemUpdate: 'System update: {{title}} - {{details}}',
    priceAlert: 'Price alert: {{symbol}} has reached {{price}}',
    accountAlert: 'Account alert: {{message}}',
    apiUpdate: 'API update: {{service}} connection {{status}}'
  });
  const [settings, setSettings] = useState<NotificationSettings>({
    defaultDismissable: true,
    defaultExpiration: 24,
    allowOverrides: true,
    maxNotificationsPerDay: 50,
    notifyOnNewVersion: true,
    notifyOnNewSignals: true,
    notifyOnSystemUpdates: true
  });
  
  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'info',
    priority: 'normal',
    audience: 'all',
    active: true,
    dismissable: true,
    link: '',
    linkText: ''
  });
  
  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, []);
  
  // Function to load notifications (would be an API call in a real implementation)
  const loadNotifications = async () => {
    try {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/admin/notifications');
      // const data = await response.json();
      // setNotifications(data);
      
      // Simulated data for demonstration
      const demoNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Trading Signals',
          body: 'Paradox AI has issued 5 new trading signals for the day.',
          type: 'info',
          priority: 'normal',
          audience: 'all',
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          active: true,
          dismissable: true,
          sender: 'system'
        },
        {
          id: '2',
          title: 'System Maintenance',
          body: 'Scheduled maintenance will occur on April 25, 2025 from 2:00 AM to 4:00 AM UTC.',
          type: 'warning',
          priority: 'high',
          audience: 'all',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
          active: true,
          dismissable: true,
          sender: 'admin'
        },
        {
          id: '3',
          title: 'API Integration Update',
          body: 'We have updated our TradingView integration to support more timeframes.',
          type: 'success',
          priority: 'normal',
          audience: 'premium',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          active: true,
          dismissable: true,
          sender: 'system'
        },
        {
          id: '4',
          title: 'Welcome to TradeHybrid!',
          body: 'Thank you for joining TradeHybrid. Explore our features and tools for better trading.',
          type: 'info',
          priority: 'normal',
          audience: 'all',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          active: true,
          dismissable: true,
          sender: 'system'
        },
        {
          id: '5',
          title: 'Account Security Alert',
          body: 'We detected a login from a new location. Please verify it was you.',
          type: 'error',
          priority: 'high',
          audience: 'specific',
          userIds: ['user123'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          active: true,
          dismissable: false,
          link: '/settings/security',
          linkText: 'Review Activity',
          sender: 'system'
        }
      ];
      
      setNotifications(demoNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    }
  };
  
  // Handle creating a new notification
  const handleCreateNotification = () => {
    // Validation
    if (!newNotification.title || !newNotification.body) {
      toast.error('Title and body are required');
      return;
    }
    
    // Create new notification object
    const notification: Notification = {
      id: `new-${Date.now()}`,
      title: newNotification.title,
      body: newNotification.body,
      type: newNotification.type as any,
      priority: newNotification.priority as any,
      audience: newNotification.audience as any,
      createdAt: new Date(),
      active: newNotification.active,
      dismissable: newNotification.dismissable,
      sender: 'admin'
    };
    
    if (newNotification.link) {
      notification.link = newNotification.link;
      notification.linkText = newNotification.linkText || 'View';
    }
    
    // Add to list (in a real implementation, this would be an API call)
    setNotifications(prev => [notification, ...prev]);
    
    // Reset form
    setNewNotification({
      title: '',
      body: '',
      type: 'info',
      priority: 'normal',
      audience: 'all',
      active: true,
      dismissable: true,
      link: '',
      linkText: ''
    });
    
    // Show success message
    toast.success('Notification created', {
      description: 'Your notification has been created and sent to users'
    });
  };
  
  // Handle updating notification status
  const toggleNotificationStatus = (id: string, active: boolean) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, active } 
          : notification
      )
    );
    
    toast.info(`Notification ${active ? 'activated' : 'deactivated'}`);
  };
  
  // Handle deleting a notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success('Notification deleted');
  };
  
  // Send test notification to current user
  const sendTestNotification = () => {
    if (!newNotification.title || !newNotification.body) {
      toast.error('Title and body are required');
      return;
    }
    
    // Here we're just using the toast system to simulate receiving the notification
    const type = newNotification.type as 'info' | 'success' | 'warning' | 'error';
    
    switch (type) {
      case 'success':
        toast.success(newNotification.title, {
          description: newNotification.body
        });
        break;
      case 'warning':
        toast.warning(newNotification.title, {
          description: newNotification.body
        });
        break;
      case 'error':
        toast.error(newNotification.title, {
          description: newNotification.body
        });
        break;
      default:
        toast.info(newNotification.title, {
          description: newNotification.body
        });
    }
    
    toast.success('Test notification sent');
  };
  
  // Filter notifications based on active tab and search/filters
  const filteredNotifications = notifications.filter(notification => {
    // Tab filter
    if (activeTab === 'active' && !notification.active) return false;
    if (activeTab === 'high' && notification.priority !== 'high') return false;
    if (activeTab === 'system' && notification.sender !== 'system') return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = notification.title.toLowerCase().includes(query);
      const matchesBody = notification.body.toLowerCase().includes(query);
      if (!matchesTitle && !matchesBody) return false;
    }
    
    // Type filter
    if (filterType && notification.type !== filterType) return false;
    
    // Priority filter
    if (filterPriority && notification.priority !== filterPriority) return false;
    
    return true;
  });
  
  // Save settings
  const saveSettings = () => {
    // In a real implementation, this would be an API call
    // localStorage.setItem('notificationSettings', JSON.stringify(settings));
    toast.success('Notification settings saved');
  };
  
  // Format date to relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Bell className="h-6 w-6 mr-2 text-purple-400" />
            Notification Center
          </h2>
          <p className="text-slate-400">Manage system notifications for all users</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadNotifications()}>
            Refresh
          </Button>
          <Button variant="default" size="sm" className="gap-1" onClick={() => setActiveTab('new')}>
            <Plus className="h-4 w-4" />
            New Notification
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="high">High Priority</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="new">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center mb-4">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Search notifications..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={filterType || ''} onValueChange={(value) => setFilterType(value || null)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority || ''} onValueChange={(value) => setFilterPriority(value || null)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="self-start sm:self-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterType(null);
                  setFilterPriority(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
          
          {filteredNotifications.length === 0 ? (
            <div className="bg-slate-800 rounded-md p-8 text-center">
              <HelpCircle className="h-12 w-12 mx-auto text-slate-500 mb-3" />
              <h3 className="text-xl font-medium mb-1">No notifications found</h3>
              <p className="text-slate-400 mb-4">No notifications match your current filters</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterType(null);
                  setFilterPriority(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <Card key={notification.id} className={`bg-slate-800 border-slate-700 ${!notification.active && 'opacity-60'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {notification.type === 'info' && <Info className="h-5 w-5 text-blue-400 mr-2" />}
                        {notification.type === 'success' && <Check className="h-5 w-5 text-green-400 mr-2" />}
                        {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />}
                        {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-400 mr-2" />}
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.priority === 'high' && (
                          <Badge className="bg-red-900/30 text-red-400 hover:bg-red-900/50">
                            High Priority
                          </Badge>
                        )}
                        
                        <Badge 
                          variant="outline" 
                          className={notification.active ? 'text-green-400 border-green-800/60' : 'text-slate-400 border-slate-700'}
                        >
                          {notification.active ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => toggleNotificationStatus(notification.id, !notification.active)}>
                              {notification.active ? (
                                <XCircle className="h-4 w-4 mr-2" />
                              ) : (
                                <Check className="h-4 w-4 mr-2" />
                              )}
                              {notification.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-400" 
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardDescription className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-slate-500 mr-1" />
                      {formatRelativeTime(notification.createdAt)}
                      {notification.audience !== 'all' && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {notification.audience === 'premium' ? 'Premium Users' : 'Specific Users'}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{notification.body}</p>
                    
                    {notification.link && (
                      <div className="mt-2">
                        <Button variant="link" className="p-0 h-auto text-blue-400">
                          {notification.linkText || 'View'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Active Notifications</CardTitle>
              <CardDescription>
                All currently active notifications visible to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Content is the same as "all" tab but filtered for active notifications */}
              <div className="space-y-4">
                {notifications.filter(n => n.active).length === 0 ? (
                  <p className="text-slate-400 text-center">No active notifications found</p>
                ) : (
                  notifications
                    .filter(n => n.active)
                    .map(notification => (
                      <Card key={notification.id} className="bg-slate-850 border-slate-700">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-400 mr-2" />}
                              {notification.type === 'success' && <Check className="h-5 w-5 text-green-400 mr-2" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />}
                              {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-400 mr-2" />}
                              <CardTitle className="text-base">{notification.title}</CardTitle>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => toggleNotificationStatus(notification.id, false)}
                            >
                              Deactivate
                            </Button>
                          </div>
                          <CardDescription className="flex items-center">
                            <Clock className="h-3.5 w-3.5 text-slate-500 mr-1" />
                            {formatRelativeTime(notification.createdAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-300">{notification.body}</p>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="high">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>High Priority Notifications</CardTitle>
              <CardDescription>
                Critical notifications that require immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => n.priority === 'high').length === 0 ? (
                  <p className="text-slate-400 text-center">No high priority notifications found</p>
                ) : (
                  notifications
                    .filter(n => n.priority === 'high')
                    .map(notification => (
                      <Card key={notification.id} className={`bg-slate-850 border-slate-700 ${!notification.active && 'opacity-60'}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-400 mr-2" />}
                              {notification.type === 'success' && <Check className="h-5 w-5 text-green-400 mr-2" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />}
                              {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-400 mr-2" />}
                              <CardTitle className="text-base">{notification.title}</CardTitle>
                            </div>
                            
                            <Badge 
                              variant="outline" 
                              className={notification.active ? 'text-green-400 border-green-800/60' : 'text-slate-400 border-slate-700'}
                            >
                              {notification.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center">
                            <Clock className="h-3.5 w-3.5 text-slate-500 mr-1" />
                            {formatRelativeTime(notification.createdAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-300">{notification.body}</p>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>
                Automated notifications sent by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => n.sender === 'system').length === 0 ? (
                  <p className="text-slate-400 text-center">No system notifications found</p>
                ) : (
                  notifications
                    .filter(n => n.sender === 'system')
                    .map(notification => (
                      <Card key={notification.id} className={`bg-slate-850 border-slate-700 ${!notification.active && 'opacity-60'}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-400 mr-2" />}
                              {notification.type === 'success' && <Check className="h-5 w-5 text-green-400 mr-2" />}
                              {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />}
                              {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-400 mr-2" />}
                              <CardTitle className="text-base">{notification.title}</CardTitle>
                            </div>
                            
                            <Badge 
                              variant="outline" 
                              className={notification.active ? 'text-green-400 border-green-800/60' : 'text-slate-400 border-slate-700'}
                            >
                              {notification.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center">
                            <Clock className="h-3.5 w-3.5 text-slate-500 mr-1" />
                            {formatRelativeTime(notification.createdAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-300">{notification.body}</p>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Create New Notification</CardTitle>
              <CardDescription>
                Create and send a new notification to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Notification Title</Label>
                    <Input 
                      id="title" 
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notification title"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Notification Type</Label>
                    <Select 
                      value={newNotification.type} 
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="type" className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="body">Notification Message</Label>
                  <Textarea 
                    id="body" 
                    value={newNotification.body}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Enter notification message"
                    className="mt-1 h-24"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newNotification.priority} 
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger id="priority" className="mt-1">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="audience">Audience</Label>
                    <Select 
                      value={newNotification.audience} 
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, audience: value }))}
                    >
                      <SelectTrigger id="audience" className="mt-1">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="premium">Premium Only</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="active">Status</Label>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-slate-400">Notification Active</span>
                      <Switch 
                        id="active" 
                        checked={newNotification.active}
                        onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, active: checked }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Label className="mb-2 block">Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Dismissable</span>
                        <p className="text-xs text-slate-400">Allow users to dismiss this notification</p>
                      </div>
                      <Switch 
                        checked={newNotification.dismissable}
                        onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, dismissable: checked }))}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Include Link</span>
                        <Switch 
                          checked={!!newNotification.link}
                          onCheckedChange={(checked) => setNewNotification(prev => ({ 
                            ...prev, 
                            link: checked ? '/settings' : '',
                            linkText: checked ? 'View' : ''
                          }))}
                        />
                      </div>
                      
                      {newNotification.link && (
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input 
                            placeholder="Link URL" 
                            value={newNotification.link} 
                            onChange={(e) => setNewNotification(prev => ({ ...prev, link: e.target.value }))}
                          />
                          <Input 
                            placeholder="Link Text" 
                            value={newNotification.linkText} 
                            onChange={(e) => setNewNotification(prev => ({ ...prev, linkText: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
              <Button variant="outline" onClick={sendTestNotification}>
                <Send className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
              <Button onClick={handleCreateNotification}>
                <Bell className="h-4 w-4 mr-2" />
                Create & Send Notification
              </Button>
            </CardFooter>
          </Card>
          
          {/* Notification Settings */}
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure global notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block font-medium">Default Dismissable</Label>
                    <p className="text-xs text-slate-400">Make notifications dismissable by default</p>
                  </div>
                  <Switch 
                    checked={settings.defaultDismissable}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, defaultDismissable: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="defaultExpiration" className="block font-medium">Default Expiration (hours)</Label>
                  <p className="text-xs text-slate-400 mb-2">How long notifications remain active by default</p>
                  <Input 
                    id="defaultExpiration" 
                    type="number" 
                    value={settings.defaultExpiration}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultExpiration: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label htmlFor="maxNotifications" className="block font-medium">Maximum Daily Notifications</Label>
                  <p className="text-xs text-slate-400 mb-2">Limit the number of notifications sent per day</p>
                  <Input 
                    id="maxNotifications" 
                    type="number" 
                    value={settings.maxNotificationsPerDay}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxNotificationsPerDay: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="block font-medium">Automated Notifications</Label>
                  <p className="text-xs text-slate-400">Configure which automated notifications are sent</p>
                  
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New signal notifications</span>
                      <Switch 
                        checked={settings.notifyOnNewSignals}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifyOnNewSignals: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System update notifications</span>
                      <Switch 
                        checked={settings.notifyOnSystemUpdates}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifyOnSystemUpdates: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New version notifications</span>
                      <Switch 
                        checked={settings.notifyOnNewVersion}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifyOnNewVersion: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-slate-700 pt-4">
              <Button onClick={saveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}