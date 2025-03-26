import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useOnClickOutside } from "../../hooks/use-on-click-outside";
import { Info, X, CheckCircle2, BarChart2 } from "lucide-react";
import { Button } from "./button";

export interface ContextualTooltipProps {
  id: string;
  title: string;
  content: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  highlight?: boolean;
  showArrow?: boolean;
  className?: string;
  trigger?: ReactNode;
  autoShow?: boolean;
  delay?: number;
  onAcknowledge?: () => void;
  persistent?: boolean;
  children: ReactNode;
}

// Store which tooltips have been acknowledged
const ACKNOWLEDGED_TOOLTIPS_KEY = "trade-hybrid-acknowledged-tooltips";
const getAcknowledgedTooltips = (): string[] => {
  try {
    const saved = localStorage.getItem(ACKNOWLEDGED_TOOLTIPS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to parse acknowledged tooltips:", e);
    return [];
  }
};

const acknowledgeTooltip = (id: string) => {
  try {
    const acknowledged = getAcknowledgedTooltips();
    if (!acknowledged.includes(id)) {
      acknowledged.push(id);
      localStorage.setItem(ACKNOWLEDGED_TOOLTIPS_KEY, JSON.stringify(acknowledged));
    }
  } catch (e) {
    console.error("Failed to save acknowledged tooltip:", e);
  }
};

export function ContextualTooltip({
  id,
  title,
  content,
  position = "bottom",
  highlight = true,
  showArrow = true,
  className,
  trigger,
  autoShow = true,
  delay = 1000,
  onAcknowledge,
  persistent = false,
  children
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [wasShown, setWasShown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(containerRef, () => {
    if (showTooltip && !persistent) {
      setShowTooltip(false);
    }
  });
  
  useEffect(() => {
    // Check if this tooltip has been acknowledged
    const acknowledged = getAcknowledgedTooltips();
    const isAcknowledged = acknowledged.includes(id);
    
    if (isAcknowledged && !persistent) {
      return;
    }
    
    // Auto show tooltip after delay
    if (autoShow && !wasShown) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setWasShown(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [id, autoShow, delay, wasShown, persistent]);
  
  const handleAcknowledge = () => {
    setShowTooltip(false);
    if (!persistent) {
      acknowledgeTooltip(id);
    }
    if (onAcknowledge) {
      onAcknowledge();
    }
  };
  
  // Position styles for the tooltip
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "bottom":
      default:
        return "top-full left-1/2 -translate-x-1/2 mt-2";
    }
  };
  
  // Arrow position styles
  const getArrowStyles = () => {
    switch (position) {
      case "top":
        return "bottom-[-6px] left-1/2 -translate-x-1/2 rotate-45";
      case "right":
        return "left-[-6px] top-1/2 -translate-y-1/2 rotate-45";
      case "left":
        return "right-[-6px] top-1/2 -translate-y-1/2 rotate-45";
      case "bottom":
      default:
        return "top-[-6px] left-1/2 -translate-x-1/2 rotate-45";
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className={cn("relative inline-block", highlight && "z-30")}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* The content that the tooltip is attached to */}
      <div 
        className={cn(
          "relative",
          highlight && showTooltip && "ring-2 ring-primary ring-opacity-50 rounded-sm"
        )}
        onClick={() => trigger && setShowTooltip(!showTooltip)}
      >
        {children}
        
        {/* Trigger button if provided */}
        {trigger && (
          <div className="absolute -top-2 -right-2 z-10">
            {trigger}
          </div>
        )}
      </div>
      
      {/* Tooltip content */}
      <AnimatePresence>
        {(showTooltip || (isVisible && trigger)) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : position === "bottom" ? -10 : 0, x: position === "left" ? 10 : position === "right" ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "absolute z-50 w-64 p-3 bg-popover text-popover-foreground rounded-md shadow-lg border",
              getPositionStyles(),
              className
            )}
          >
            {/* Arrow */}
            {showArrow && (
              <div 
                className={cn(
                  "absolute w-3 h-3 bg-popover border-t border-l transform -rotate-45",
                  getArrowStyles()
                )} 
              />
            )}
            
            {/* Tooltip header */}
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm">{title}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 -mr-1 -mt-1 text-muted-foreground hover:text-foreground"
                onClick={handleAcknowledge}
              >
                <X size={14} />
              </Button>
            </div>
            
            {/* Tooltip content */}
            <div className="text-xs text-muted-foreground space-y-2">
              {content}
            </div>
            
            {/* Acknowledge button */}
            <div className="mt-3 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 px-2"
                onClick={handleAcknowledge}
              >
                Got it
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Default trigger element
export function TooltipTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <Button 
      variant="outline" 
      size="icon"
      className="h-5 w-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
      onClick={onClick}
    >
      <Info size={10} />
    </Button>
  );
}