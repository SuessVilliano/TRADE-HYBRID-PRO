import React, { useState, useEffect } from 'react';
import { notificationService, NotificationDetail } from '@/lib/services/notification-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  X,
  Trash2,
  RefreshCw,
  Plus,
  Send
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { TestNotificationButton } from '@/components/ui/test-notification-button';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Admin Notifications Management Page
 * 
 * This page allows admins to:
 * 1. View all notifications sent to users
 * 2. Create and send new notifications
 * 3. Mark notifications as read or delete them
 * 4. Test different notification types
 */
export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDetail[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'system',
    priority: 'normal',
    link: '',
    linkText: ''
  });
  
  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);
  
  // Refresh notifications from service
  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications);
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    notificationService.clearAllNotifications();
    loadNotifications();
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };
  
  // Mark single notification as read
  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    loadNotifications();
  };
  
  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'unread' && !notification.read) ||
      (activeTab === 'read' && notification.read) ||
      (activeTab === notification.type);
      
    const matchesSearch = 
      !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });
  
  // Send new notification
  const sendNotification = () => {
    notificationService.showNotification({
      title: newNotification.title,
      body: newNotification.body,
      type: newNotification.type as any,
      priority: newNotification.priority as any,
      link: newNotification.link || undefined,
      linkText: newNotification.linkText || undefined
    });
    
    // Reset form
    setNewNotification({
      title: '',
      body: '',
      type: 'system',
      priority: 'normal',
      link: '',
      linkText: ''
    });
    
    // Refresh notifications list
    setTimeout(() => {
      loadNotifications();
    }, 500);
  };
  
  // Get color based on notification type
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'price-alert':
      case 'signal-entry':
      case 'signal-update':
        return 'bg-blue-500';
      case 'take-profit':
        return 'bg-green-500';
      case 'stop-loss':
      case 'signal-expiry':
        return 'bg-amber-500';
      case 'system':
        return 'bg-slate-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  // Get icon based on notification type
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'price-alert':
      case 'signal-entry':
      case 'signal-update':
        return <Info className="h-4 w-4" />;
      case 'take-profit':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'stop-loss':
      case 'signal-expiry':
        return <AlertTriangle className="h-4 w-4" />;
      case 'system':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-slate-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notification Management</h1>
            <p className="text-slate-500">View, manage, and test platform notifications</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadNotifications}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark All Read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllNotifications}
              className="flex items-center gap-1 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Notifications</CardTitle>
                  <Badge variant="outline" className="px-2 py-1 text-sm">
                    {notifications.length} Total
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input 
                    placeholder="Search notifications..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:max-w-[300px]"
                  />
                  <Tabs 
                    defaultValue="all" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="unread">Unread</TabsTrigger>
                      <TabsTrigger value="read">Read</TabsTrigger>
                      <TabsTrigger value="system">System</TabsTrigger>
                      <TabsTrigger value="signal-entry">Signals</TabsTrigger>
                      <TabsTrigger value="price-alert">Alerts</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Type</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead className="w-[100px]">Priority</TableHead>
                          <TableHead className="w-[160px]">Timestamp</TableHead>
                          <TableHead className="w-[80px]">Status</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNotifications.map((notification) => (
                          <TableRow key={notification.id} className={notification.read ? 'opacity-70' : ''}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <div className={`p-1 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                                  {getNotificationTypeIcon(notification.type)}
                                </div>
                                <span className="text-xs capitalize">
                                  {notification.type.replace('-', ' ')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{notification.title}</div>
                              <div className="text-sm text-slate-500 truncate max-w-[250px]">
                                {notification.body}
                              </div>
                              {notification.link && (
                                <div className="text-xs text-blue-500">
                                  {notification.linkText || 'View Link'}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getPriorityColor(notification.priority)} capitalize`}>
                                {notification.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span className="text-xs">{formatTimestamp(notification.timestamp)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {notification.read ? (
                                <Badge variant="outline" className="bg-slate-100">Read</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                  Unread
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <span className="sr-only">Mark as read</span>
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:text-red-500"
                              >
                                <span className="sr-only">Delete</span>
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Create New Notification */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create Notification</CardTitle>
                <CardDescription>
                  Send a new notification to all platform users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    placeholder="Notification title..."
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({
                      ...newNotification,
                      title: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Notification message..."
                    value={newNotification.body}
                    onChange={(e) => setNewNotification({
                      ...newNotification,
                      body: e.target.value
                    })}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select 
                      value={newNotification.type}
                      onValueChange={(value) => setNewNotification({
                        ...newNotification,
                        type: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="price-alert">Price Alert</SelectItem>
                        <SelectItem value="signal-entry">Signal Entry</SelectItem>
                        <SelectItem value="signal-update">Signal Update</SelectItem>
                        <SelectItem value="signal-expiry">Signal Expiry</SelectItem>
                        <SelectItem value="take-profit">Take Profit</SelectItem>
                        <SelectItem value="stop-loss">Stop Loss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select 
                      value={newNotification.priority}
                      onValueChange={(value) => setNewNotification({
                        ...newNotification,
                        priority: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link (Optional)</label>
                  <Input 
                    placeholder="https:// or relative path like /dashboard"
                    value={newNotification.link}
                    onChange={(e) => setNewNotification({
                      ...newNotification,
                      link: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link Text (Optional)</label>
                  <Input 
                    placeholder="View Details"
                    value={newNotification.linkText}
                    onChange={(e) => setNewNotification({
                      ...newNotification,
                      linkText: e.target.value
                    })}
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={sendNotification}
                  disabled={!newNotification.title || !newNotification.body}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
            
            {/* Test Notifications */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Test Notifications</CardTitle>
                <CardDescription>
                  Try different notification types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      notificationService.showSignalNotification(
                        'BTCUSDT',
                        'buy',
                        68500,
                        'Paradox AI'
                      );
                      setTimeout(loadNotifications, 500);
                    }}
                  >
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Signal
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      notificationService.showPriceAlertNotification(
                        'ETHUSDT',
                        3400,
                        'above',
                        3350
                      );
                      setTimeout(loadNotifications, 500);
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    Price Alert
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      notificationService.showTakeProfitNotification(
                        'BTCUSDT',
                        69500,
                        '+5.3%'
                      );
                      setTimeout(loadNotifications, 500);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Take Profit
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      notificationService.showStopLossNotification(
                        'SOLUSDT',
                        142.50,
                        '-2.8%'
                      );
                      setTimeout(loadNotifications, 500);
                    }}
                  >
                    <X className="h-4 w-4 mr-2 text-red-500" />
                    Stop Loss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}