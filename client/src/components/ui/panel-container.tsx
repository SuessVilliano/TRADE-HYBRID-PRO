import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, Move, Maximize, Minimize } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { PopupContainer } from './popup-container';

export interface PanelContainerProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  isDraggable?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
  collapsible?: boolean;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  title,
  icon,
  children,
  className = '',
  defaultCollapsed = false,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  isDraggable = false,
  headerClassName = '',
  bodyClassName = '',
  collapsible = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <PopupContainer className={cn("flex flex-col h-full", className)} padding={false}>
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between py-2 px-3 border-b border-slate-700 bg-slate-800/70",
          headerClassName,
          { "cursor-move": isDraggable }
        )}
      >
        <div className="flex items-center space-x-2 flex-grow">
          {icon && <span className="text-slate-400">{icon}</span>}
          <h3 className="font-medium text-sm">{title}</h3>
          {isDraggable && <Move size={12} className="text-slate-500 ml-2" />}
        </div>
        
        <div className="flex items-center space-x-1">
          {onMinimize && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-slate-400 hover:text-slate-100"
              onClick={onMinimize}
              aria-label="Minimize panel"
            >
              <Minimize size={14} />
            </Button>
          )}
          
          {onMaximize && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-slate-400 hover:text-slate-100"
              onClick={onMaximize}
              aria-label={isMaximized ? "Restore panel" : "Maximize panel"}
            >
              <Maximize size={14} />
            </Button>
          )}
          
          {collapsible && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-slate-400 hover:text-slate-100"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </Button>
          )}
          
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-slate-400 hover:text-red-500"
              onClick={onClose}
              aria-label="Close panel"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Body */}
      <div 
        className={cn(
          "flex-1 overflow-auto p-3",
          bodyClassName,
          { "hidden": isCollapsed }
        )}
      >
        {children}
      </div>
    </PopupContainer>
  );
};