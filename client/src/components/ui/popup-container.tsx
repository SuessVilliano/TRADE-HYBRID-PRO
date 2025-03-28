import React from 'react';
import { cn } from '@/lib/utils';

interface PopupContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: boolean;
}

export const PopupContainer: React.FC<PopupContainerProps> = ({
  children,
  className = '',
  style = {},
  padding = true,
}) => {
  return (
    <div
      className={cn(
        "bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg",
        padding ? "p-4" : "",
        "cyberpunk-glow",
        className
      )}
      style={{
        ...style,
        boxShadow: "0 0 20px rgba(var(--primary), 0.1), 0 0 8px rgba(var(--secondary), 0.08)",
      }}
    >
      {children}
    </div>
  );
};