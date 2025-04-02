import React from 'react';
import { cn } from '@/lib/utils';
import { SignalIcon, ChartBarIcon, BellIcon, InboxIcon } from 'lucide-react';

interface EmptyPlaceholderProps {
  title: string;
  description?: string;
  icon?: 'signal' | 'chart' | 'notification' | 'inbox' | null;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyPlaceholder({
  title,
  description,
  icon,
  children,
  className,
}: EmptyPlaceholderProps) {
  
  const IconComponent = icon === 'signal' ? SignalIcon :
                       icon === 'chart' ? ChartBarIcon :
                       icon === 'notification' ? BellIcon :
                       icon === 'inbox' ? InboxIcon : null;
  
  return (
    <div className={cn(
      'flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50',
      className
    )}>
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {IconComponent && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <IconComponent className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}