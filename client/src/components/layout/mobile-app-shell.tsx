import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  ChartBar, 
  Signal, 
  BookOpen, 
  Settings, 
  Bell, 
  Wallet, 
  Users, 
  MessageSquare,
  BarChart3,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useViewport } from '@/lib/services/responsive-layout-service';
import { useSolanaAuth } from '@/lib/context/SolanaAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';

interface MobileAppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
  hideHeader?: boolean;
}

export function MobileAppShell({ 
  children, 
  showNav = true,
  hideHeader = false
}: MobileAppShellProps) {
  const { isMobile, isTablet } = useViewport();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSolanaAuth();
  
  // Navigation items
  const navItems = [
    { 
      label: 'Dashboard', 
      icon: <Home className="h-5 w-5" />, 
      path: '/home',
      active: location.pathname === '/home'
    },
    { 
      label: 'Trading', 
      icon: <ChartBar className="h-5 w-5" />, 
      path: '/trading-dashboard',
      active: location.pathname.includes('trading-dashboard')
    },
    { 
      label: 'Signals', 
      icon: <Signal className="h-5 w-5" />, 
      path: '/trading-signals',
      active: location.pathname.includes('signals')
    },
    { 
      label: 'Learn', 
      icon: <BookOpen className="h-5 w-5" />, 
      path: '/learning-center',
      active: location.pathname.includes('learn')
    },
    { 
      label: 'Staking', 
      icon: <Wallet className="h-5 w-5" />, 
      path: '/thc-staking',
      active: location.pathname.includes('staking')
    },
    { 
      label: 'Social', 
      icon: <Users className="h-5 w-5" />, 
      path: '/social-network',
      active: location.pathname.includes('social')
    },
    { 
      label: 'Journal', 
      icon: <BarChart3 className="h-5 w-5" />, 
      path: '/trade-journal',
      active: location.pathname.includes('journal')
    },
    { 
      label: 'Settings', 
      icon: <Settings className="h-5 w-5" />, 
      path: '/settings',
      active: location.pathname.includes('settings')
    }
  ];
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };
  
  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && !isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex h-screen flex-col">
      {/* Mobile Header */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-14 items-center px-4 border-b">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/logos/trade-hybrid-logo.svg" 
                    alt="Trade Hybrid" 
                    className="h-6 w-auto"
                  />
                  <span className="font-semibold">Trade Hybrid</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto" 
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-3.5rem)] pb-10">
                <div className="flex flex-col gap-2 p-4">
                  {auth.isAuthenticated && (
                    <div className="flex items-center gap-2 mb-6 p-2 rounded-lg border">
                      <Avatar>
                        <AvatarImage src="/avatars/user-avatar.png" />
                        <AvatarFallback>
                          {auth.username?.substring(0, 2).toUpperCase() || 'TH'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{auth.username || 'User'}</span>
                        <span className="text-xs text-muted-foreground">Trader</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-auto" 
                        onClick={handleLogout}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                        item.active 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      {item.icon}
                      {item.label}
                      {item.label === 'Signals' && (
                        <Badge className="ml-auto px-1.5 py-0.5">New</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2 flex-1">
            <img 
              src="/logos/trade-hybrid-mobile-logo.svg" 
              alt="Trade Hybrid" 
              className="h-6 w-auto"
            />
            <span className="font-semibold text-lg hidden sm:inline-block">
              Trade Hybrid
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {notifications}
                </span>
              )}
            </Button>
            
            {auth.isAuthenticated ? (
              <Avatar 
                className="h-8 w-8 cursor-pointer" 
                onClick={() => navigate('/profile')}
              >
                <AvatarImage src="/avatars/user-avatar.png" />
                <AvatarFallback>
                  {auth.username?.substring(0, 2).toUpperCase() || 'TH'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Button size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
            )}
          </div>
        </header>
      )}
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      {/* Mobile Navigation Bar */}
      {showNav && isMobile && (
        <div className="sticky bottom-0 z-40 flex h-16 items-center justify-around border-t bg-background px-4">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              className={`flex flex-col items-center justify-center space-y-1 ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
          <button
            className="flex flex-col items-center justify-center space-y-1 text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MobileAppShell;