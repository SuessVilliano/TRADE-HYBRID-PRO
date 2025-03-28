import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PopupContainerProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'error' | 'success';
}

export const PopupContainer: React.FC<PopupContainerProps> = ({
  children,
  className,
  padding = false,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-slate-800 border-slate-700',
    primary: 'bg-indigo-900/90 border-indigo-700',
    secondary: 'bg-purple-900/90 border-purple-700',
    warning: 'bg-amber-900/90 border-amber-700',
    error: 'bg-red-900/90 border-red-700',
    success: 'bg-green-900/90 border-green-700',
  };

  return (
    <div className={cn(
      'rounded-lg border backdrop-blur-sm shadow-lg', 
      variantClasses[variant],
      padding && 'p-4',
      className
    )}>
      {children}
    </div>
  );
};