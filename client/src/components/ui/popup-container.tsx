import React from 'react';
import { cn } from '../../lib/utils';

interface PopupContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  opacity?: 'low' | 'medium' | 'high';
  blur?: 'none' | 'low' | 'medium' | 'high';
  border?: boolean;
  rounded?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function PopupContainer({
  children,
  className,
  padding = true,
  opacity = 'medium',
  blur = 'medium',
  border = true,
  rounded = true,
  glass = true,
  onClick,
}: PopupContainerProps) {
  // Opacity classes
  const opacityClasses = {
    low: 'bg-opacity-30',
    medium: 'bg-opacity-50',
    high: 'bg-opacity-70',
  };

  // Blur classes 
  const blurClasses = {
    none: '',
    low: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    high: 'backdrop-blur-lg',
  };

  return (
    <div
      className={cn(
        'bg-slate-800',
        opacityClasses[opacity],
        glass && blurClasses[blur],
        border && 'border border-slate-700',
        rounded && 'rounded-lg',
        padding && 'p-4',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}