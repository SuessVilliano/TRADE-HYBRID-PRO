import React, { ReactNode, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

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
    function handleEscapeKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscapeKey);
    
    // Prevent scrolling of the body when popup is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-hidden">
      {/* Overlay that can be clicked to close */}
      {onClose && (
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <div 
        className={cn(
          "w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-gray-800 border border-gray-600 shadow-xl text-white",
          className
        )}
      >
        {(title || showCloseButton) && (
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
            {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
            {showCloseButton && onClose && (
              <button 
                type="button" 
                onClick={onClose} 
                className="rounded-full p-1 hover:bg-gray-700 focus:outline-none"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-300" />
              </button>
            )}
          </div>
        )}
        
        {/* 
          Enable touch scrolling for mobile devices by setting
          -webkit-overflow-scrolling: touch, and ensure content is 
          positioned correctly with relative positioning
        */}
        <div 
          className="p-4 relative overflow-y-auto" 
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}