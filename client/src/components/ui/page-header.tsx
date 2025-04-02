import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", className)}>
      <div className="flex items-start">
        {icon && (
          <div className="mr-3 mt-1 flex-shrink-0 h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex-shrink-0 flex space-x-2 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}