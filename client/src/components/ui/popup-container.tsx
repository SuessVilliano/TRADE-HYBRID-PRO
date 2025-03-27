import React, { ReactNode, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface PopupContainerProps {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
}

/**
 * A common container component for all popups with improved visibility
 */
export function PopupContainer({ 
  children, 
  className, 
  onClose, 
  title, 
  showCloseButton = true // Default to showing close button
}: PopupContainerProps) {
  // Handle escape key press to close popup
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    
    // Prevent scrolling of the body when popup is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Safely handle close
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={cn(
        "relative w-[90%] max-w-4xl max-h-[90vh] overflow-auto rounded-lg bg-slate-800 border border-gray-600 shadow-xl text-white",
        className
      )}>
        {(title || showCloseButton) && (
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-700 bg-slate-900">
            {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
            {showCloseButton && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={handleClose} 
                className="ml-auto text-gray-300 hover:text-white hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
        <div className="p-4 text-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}