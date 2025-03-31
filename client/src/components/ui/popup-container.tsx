import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PopupContainerProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function PopupContainer({ 
  children, 
  className, 
  padding = false 
}: PopupContainerProps) {
  return (
    <div className={cn(
      "bg-slate-900/95 backdrop-blur-sm",
      padding && "p-4",
      className
    )}>
      {children}
    </div>
  );
}