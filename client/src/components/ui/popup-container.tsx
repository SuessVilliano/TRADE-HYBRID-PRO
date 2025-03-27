import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PopupContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * A common container component for all popups with improved visibility
 */
export function PopupContainer({ children, className }: PopupContainerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className={cn(
        "relative w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-slate-900/95 border border-gray-700 shadow-xl",
        className
      )}>
        {children}
      </div>
    </div>
  );
}