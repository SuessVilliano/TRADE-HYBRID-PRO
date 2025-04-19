import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface PopupContainerProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  title?: string;
  onClose?: () => void;
}

export function PopupContainer({ 
  children, 
  className, 
  padding = false,
  title,
  onClose
}: PopupContainerProps) {
  return (
    <div className={cn(
      "bg-slate-900/95 backdrop-blur-sm",
      padding && "p-4",
      className
    )}>
      {title && onClose && (
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-800 transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}