import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './button';
import { Home, ArrowLeft, Menu, X, Settings, User } from 'lucide-react';
import { useUserPreferences } from '@/lib/stores/useUserPreferences';
import { Sheet, SheetContent, SheetTrigger } from './sheet';
import { MainSidebar } from './main-sidebar-enhanced';

interface UniversalHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showSettingsButton?: boolean;
  showProfileButton?: boolean;
  onBackClick?: () => void;
}

export function UniversalHeader({
  title = 'Trade Hybrid',
  showBackButton = true,
  showHomeButton = true,
  showSettingsButton = true,
  showProfileButton = true,
  onBackClick
}: UniversalHeaderProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { toggleSidebarCollapsed } = useUserPreferences();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          {/* Mobile menu trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
              <MainSidebar 
                className="border-none"
                onNavItemClick={() => setIsMobileMenuOpen(false)} 
              />
            </SheetContent>
          </Sheet>
          
          {/* Desktop sidebar toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex" 
            onClick={() => toggleSidebarCollapsed()}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {/* Back button */}
            {showBackButton && (
              <Button variant="ghost" size="icon" onClick={handleBackClick}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Go back</span>
              </Button>
            )}
            
            {/* Home button */}
            {showHomeButton && (
              <Button variant="ghost" size="icon" onClick={handleHomeClick}>
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Button>
            )}
            
            {/* Title */}
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Settings button */}
            {showSettingsButton && (
              <Button variant="ghost" size="icon" onClick={handleSettingsClick}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            )}
            
            {/* Profile button */}
            {showProfileButton && (
              <Button variant="ghost" size="icon" onClick={handleProfileClick}>
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}