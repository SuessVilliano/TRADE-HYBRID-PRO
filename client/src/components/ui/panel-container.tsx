import React, { useState, useRef, useEffect } from 'react';
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
  dragHandleProps?: any; // Props from react-beautiful-dnd
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
  dragHandleProps,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };
  
  // Handle manual dragging (in addition to react-beautiful-dnd)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggable && !isMaximized) {
      // Check if we're not clicking on a button or other control
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        return;
      }
      
      setIsDragging(true);
      
      // Calculate the offset of the click relative to the panel's position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      
      // Prevent text selection during drag
      e.preventDefault();
    }
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        // Update the panel's position based on the mouse position and initial offset
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <PopupContainer 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full", 
        className,
        isDragging ? "opacity-90 pointer-events-none" : ""
      )} 
      padding={false}
      style={isDragging ? {
        position: 'absolute',
        zIndex: 9999,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: containerRef.current?.offsetWidth,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      } : undefined}
    >
      {/* Header */}
      <div 
        {...(isDraggable && dragHandleProps)}
        onMouseDown={handleMouseDown}
        className={cn(
          "flex items-center justify-between py-2 px-3 border-b border-slate-700 bg-slate-800/70",
          headerClassName,
          { "cursor-grab": isDraggable && !isDragging, "cursor-grabbing": isDragging }
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