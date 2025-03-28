import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { Menu } from 'lucide-react';

interface MobileSidebarToggleProps {
  className?: string;
  onClick?: () => void;
}

export function MobileSidebarToggle({ className = '', onClick }: MobileSidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Function to directly toggle sidebar via sheet component
  const toggleSidebar = () => {
    try {
      // Find SheetTrigger and click it directly
      const sheetTriggers = document.querySelectorAll('button[data-radix-collection-item]');
      if (sheetTriggers.length > 0) {
        // Find a trigger by aria-controls that contains "radix-:r0:" pattern
        for (const trigger of sheetTriggers) {
          const ariaControls = trigger.getAttribute('aria-controls');
          if (ariaControls && ariaControls.includes('radix-:r')) {
            (trigger as HTMLElement).click();
            console.log("Clicked sheet trigger");
            return;
          }
        }
      }
      
      // Next try SidebarTrigger component
      const sidebarTrigger = document.querySelector('button[data-sidebar="trigger"]');
      if (sidebarTrigger) {
        (sidebarTrigger as HTMLElement).click();
        console.log("Clicked sidebar trigger");
        return;
      }
      
      // If nothing works, we'll try direct DOM manipulation
      toggleSidebarDirect();
      
    } catch (error) {
      console.error("Error toggling sidebar via triggers:", error);
      toggleSidebarDirect();
    }
  };
  
  // Function to directly manipulate DOM when triggers fail
  const toggleSidebarDirect = () => {
    try {
      // First try to handle game sidebar
      const gameSidebar = document.querySelector('[data-sidebar="game"]');
      if (gameSidebar) {
        if (gameSidebar.classList.contains('expanded')) {
          gameSidebar.classList.remove('expanded');
        } else {
          gameSidebar.classList.add('expanded');
        }
        console.log("Toggled game sidebar directly");
        return;
      }
      
      // Next try main sidebar
      const mainSidebar = document.querySelector('[data-sidebar="main"]');
      if (mainSidebar) {
        if (mainSidebar.classList.contains('hidden')) {
          mainSidebar.classList.remove('hidden');
          mainSidebar.classList.add('flex');
          console.log("Showed main sidebar directly");
        } else {
          mainSidebar.classList.add('hidden');
          mainSidebar.classList.remove('flex');
          console.log("Hid main sidebar directly");
        }
        return;
      }
      
      // Try to close any dialog/overlay if open
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs.length > 0) {
        dialogs.forEach(dialog => {
          // Find close button and click it
          const closeButton = dialog.querySelector('button[aria-label="Close"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
            console.log("Closed dialog");
          }
        });
        return;
      }
      
      console.log("No sidebar found to toggle");
      
    } catch (error) {
      console.error("Error toggling sidebar directly:", error);
    }
  };

  // Handle the toggle action
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
      return;
    }
    
    console.log("Mobile sidebar toggle clicked");
    toggleSidebar();
  };
  
  // Handle outside clicks to close sidebars
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const isSidebarContent = target.closest('[data-sidebar="sidebar"]');
      const isSidebarTrigger = target.closest('button[data-sidebar="trigger"]') || 
                              target.closest('[data-radix-collection-item]');
      
      if (!isSidebarContent && !isSidebarTrigger) {
        // Close any open overlays or dialogs
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          dialogs.forEach(dialog => {
            // Only if this is a sidebar dialog
            if (dialog.querySelector('[data-sidebar="sidebar"]')) {
              const closeButton = dialog.querySelector('button[aria-label="Close"]');
              if (closeButton) {
                (closeButton as HTMLElement).click();
                console.log("Auto-closed dialog");
              }
            }
          });
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <button
      type="button"
      className={`md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${className}`}
      onClick={handleToggle}
      aria-label="Toggle sidebar"
      role="button"
      tabIndex={0}
    >
      <Menu className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}