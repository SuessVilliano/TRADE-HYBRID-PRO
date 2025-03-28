import React from 'react';
import { Button } from './button';
import { Menu } from 'lucide-react';

interface MobileSidebarToggleProps {
  className?: string;
  onClick?: () => void;
}

export function MobileSidebarToggle({ className = '', onClick }: MobileSidebarToggleProps) {
  // Function to handle various types of sidebars
  const handleToggle = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    // Try to close any existing open overlays
    const openOverlays = document.querySelectorAll('[data-sidebar-overlay="true"]');
    if (openOverlays.length > 0) {
      // If there are open overlays, simulate a click on them to close
      openOverlays.forEach(overlay => {
        (overlay as HTMLElement).click();
      });
      return;
    }
    
    // Try to find the toggle button for the game sidebar
    const expandButton = document.querySelector('[data-sidebar-toggle="expand"]');
    if (expandButton) {
      (expandButton as HTMLElement).click();
      return;
    }
    
    // Try to find and click any visible sidebar toggle
    const anyToggle = document.querySelector('[data-sidebar="trigger"]');
    if (anyToggle) {
      (anyToggle as HTMLElement).click();
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`md:hidden ${className}`}
      onClick={handleToggle}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}