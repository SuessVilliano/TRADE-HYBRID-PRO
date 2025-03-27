import React, { ReactNode } from 'react';
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
  showCloseButton = false 
}: PopupContainerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className={cn(
        "relative w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-slate-900/95 border border-gray-700 shadow-xl",
        className
      )}>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {showCloseButton && onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}