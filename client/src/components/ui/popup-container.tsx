import React, { ReactNode } from 'react';
import { X, Minimize2 } from 'lucide-react';
import { Button } from './button';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';

interface PopupContainerProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  contentClassName?: string;
}

export function PopupContainer({ 
  title, 
  children, 
  onClose, 
  onMinimize, 
  className,
  contentClassName,
  icon,
  fullWidth = false
}: PopupContainerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden flex flex-col",
      fullWidth ? "w-full" : "w-[90%] md:w-auto md:min-w-[500px] max-w-[95vw]", 
      "h-[85vh] max-h-[85vh]",
      className
    )}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-muted/50 backdrop-blur-sm">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h2 className="font-semibold text-lg text-foreground">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMinimize} aria-label="Minimize">
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content - removing overflow-y-auto to prevent conflicts with ScrollArea */}
      <div className={cn("flex-1 p-4 h-full overflow-hidden bg-white/90 dark:bg-gray-900/90", contentClassName)}>
        {children}
      </div>
      
      {/* Mobile fixed close button */}
      {isMobile && onClose && (
        <Button 
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-primary text-white" 
          size="icon"
          onClick={onClose}
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}