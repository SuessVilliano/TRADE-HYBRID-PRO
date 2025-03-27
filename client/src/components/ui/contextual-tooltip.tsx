import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger as RadixTooltipTrigger,
  TooltipContent
} from './tooltip';
import { Button } from './button';

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
  guideStep?: number;
  pulse?: boolean;
  appearance?: "info" | "success" | "warning" | "critical";
}

interface GuideTourContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isFirstTimeUser: boolean;
  completeTour: () => void;
  registerTooltip: (id: string, step: number) => void;
  tooltips: Map<string, number>;
  startTour: () => void;
  isTourActive: boolean;
}

const defaultGuideTourContext: GuideTourContextType = {
  currentStep: 0,
  setCurrentStep: () => {},
  isFirstTimeUser: false,
  completeTour: () => {},
  registerTooltip: () => {},
  tooltips: new Map(),
  startTour: () => {},
  isTourActive: false
};

const GuideTourContext = createContext<GuideTourContextType>(defaultGuideTourContext);

export const GuideTourProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [tooltips, setTooltips] = useState<Map<string, number>>(new Map());
  const [isTourActive, setIsTourActive] = useState(false);
  
  // Check if user is first time visitor
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('tour_completed');
    if (!hasCompletedTour) {
      setIsFirstTimeUser(true);
    }
  }, []);
  
  // Register a tooltip with its guide step
  const registerTooltip = (id: string, step: number) => {
    setTooltips(prev => {
      const newMap = new Map(prev);
      newMap.set(id, step);
      return newMap;
    });
  };
  
  // Complete the tour
  const completeTour = () => {
    setIsTourActive(false);
    setCurrentStep(0);
    localStorage.setItem('tour_completed', 'true');
  };
  
  // Start the tour
  const startTour = () => {
    setIsTourActive(true);
    setCurrentStep(1); // Start with the first step
  };
  
  return (
    <GuideTourContext.Provider 
      value={{ 
        currentStep, 
        setCurrentStep, 
        isFirstTimeUser,
        completeTour,
        registerTooltip,
        tooltips,
        startTour,
        isTourActive
      }}
    >
      {children}
    </GuideTourContext.Provider>
  );
};

export const useGuideTour = () => useContext(GuideTourContext);

export function ContextualTooltip({
  id,
  title,
  content,
  position = "top",
  highlight = false,
  showArrow = true,
  className,
  trigger,
  autoShow = false,
  delay = 300,
  onAcknowledge,
  persistent = false,
  children,
  guideStep,
  pulse = false,
  appearance = "info"
}: ContextualTooltipProps) {
  const [open, setOpen] = useState(autoShow);
  const [acknowledged, setAcknowledged] = useState(false);
  const guideTour = useGuideTour();
  
  // Register this tooltip with the guide tour system if it has a step
  useEffect(() => {
    if (guideStep !== undefined) {
      guideTour.registerTooltip(id, guideStep);
    }
  }, [id, guideStep, guideTour]);
  
  // Show tooltip when it's this tooltip's turn in the guide tour
  useEffect(() => {
    if (
      guideTour.isTourActive && 
      guideStep !== undefined && 
      guideTour.currentStep === guideStep
    ) {
      setOpen(true);
    }
  }, [guideTour.isTourActive, guideTour.currentStep, guideStep]);
  
  // Auto-show tooltip after delay
  useEffect(() => {
    if (autoShow && !acknowledged) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, acknowledged, delay]);
  
  // Handle tooltip acknowledgment
  const handleAcknowledge = () => {
    setAcknowledged(true);
    setOpen(false);
    
    if (onAcknowledge) {
      onAcknowledge();
    }
    
    // If this is part of a guide tour, move to next step
    if (
      guideTour.isTourActive && 
      guideStep !== undefined && 
      guideTour.currentStep === guideStep
    ) {
      // Find the next step
      let nextStep = guideStep + 1;
      let foundNextStep = false;
      
      // Find if there are any tooltips with the next step number
      guideTour.tooltips.forEach((step, tooltipId) => {
        if (step === nextStep) {
          foundNextStep = true;
        }
      });
      
      if (foundNextStep) {
        guideTour.setCurrentStep(nextStep);
      } else {
        // If no more steps, complete the tour
        guideTour.completeTour();
      }
    }
  };
  
  // Get appearance styles
  const getAppearanceStyles = () => {
    switch (appearance) {
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100";
      case "warning":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-900 dark:text-yellow-100";
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100";
      case "info":
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100";
    }
  };
  
  // Get icon based on appearance
  const getIcon = () => {
    switch (appearance) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500 mr-2" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500 mr-2" />;
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip open={persistent ? open : (acknowledged ? false : open)} onOpenChange={setOpen}>
        <div className={cn("relative", highlight && "z-10", className)}>
          {children}
          {trigger && (
            <div className="absolute -top-2 -right-2">
              {trigger}
            </div>
          )}
          {!trigger && pulse && (
            <div className="absolute -top-2 -right-2 z-10">
              <div className={cn(
                "h-4 w-4 rounded-full",
                appearance === "success" ? "bg-green-500" : 
                appearance === "warning" ? "bg-yellow-500" : 
                appearance === "critical" ? "bg-red-500" : 
                "bg-blue-500",
                "animate-pulse"
              )}></div>
            </div>
          )}
        </div>
        <TooltipContent
          side={position}
          className={cn(
            "max-w-md p-4 border-2 shadow-lg",
            getAppearanceStyles(),
            highlight && "animate-bounce-subtle",
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getIcon()}
                <h3 className="font-semibold">{title}</h3>
              </div>
              {(guideTour.isTourActive) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => guideTour.completeTour()}
                  className="h-5 w-5 rounded-full -mr-2 -mt-2"
                  title="Skip Tour"
                >
                  <span className="sr-only">Skip Tour</span>
                  ✕
                </Button>
              )}
            </div>
            <div>{content}</div>
            {(persistent || guideTour.isTourActive) && (
              <div className="flex justify-end mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAcknowledge}
                  className={cn(
                    appearance === "success" ? "hover:bg-green-100 border-green-200" : 
                    appearance === "warning" ? "hover:bg-yellow-100 border-yellow-200" : 
                    appearance === "critical" ? "hover:bg-red-100 border-red-200" : 
                    "hover:bg-blue-100 border-blue-200",
                  )}
                >
                  {guideStep !== undefined && guideTour.isTourActive ? "Next" : "Got it"}
                </Button>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export interface GuideTooltipTriggerProps {
  onClick?: () => void;
  type?: "info" | "success" | "warning" | "error";
  pulse?: boolean;
  className?: string;
}

export function GuideTooltipTrigger({ 
  onClick,
  type = "info",
  pulse = false,
  className
}: GuideTooltipTriggerProps) {
  // Get background color based on type
  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500 hover:bg-green-600";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "error":
        return "bg-red-500 hover:bg-red-600";
      case "info":
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-full p-1 flex items-center justify-center cursor-pointer z-10",
        getBgColor(),
        pulse && "animate-pulse",
        className
      )}
    >
      <HelpCircle className="h-4 w-4 text-white" />
    </div>
  );
}

/**
 * Component to launch a guided tutorial tour for new users
 */
export function GuideTourLauncher({ title = "Tour Guide" }: { title?: string }) {
  const guideTour = useGuideTour();
  const [isHidden, setIsHidden] = useState(false);
  
  // If hidden, show a minimal button to restore
  if (isHidden) {
    return (
      <div className="fixed right-6 bottom-20 z-50">
        <Button 
          onClick={() => setIsHidden(false)}
          variant="outline"
          size="sm"
          className="bg-background/60 backdrop-blur-sm shadow-md hover:bg-background/80 border-gray-300 dark:border-gray-700"
        >
          <HelpCircle className="h-4 w-4 mr-1 text-primary" />
          <span className="text-xs">Show Tour Guide</span>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed right-6 bottom-20 z-50">
      <div className={cn(
        "relative p-1 rounded-xl bg-gradient-to-r from-blue-300/20 to-purple-300/20 backdrop-blur-sm shadow-xl",
        "animate-pulse-slow" // Always animate to attract attention
      )}>
        <div className="absolute -top-3 -right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHidden(true)}
            className="h-6 w-6 rounded-full bg-background shadow-md"
            title="Hide Tour Guide"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <Button 
          onClick={() => guideTour.startTour()}
          variant="default"
          size="lg"
          className={cn(
            "gap-2 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none hover:from-blue-600 hover:to-purple-600 rounded-lg",
            guideTour.isTourActive ? "opacity-50 pointer-events-none" : ""
          )}
        >
          <HelpCircle className="h-5 w-5 mr-1" />
          {title}
          {guideTour.isFirstTimeUser && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          )}
        </Button>
        
        {/* Animated glow effect */}
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur group-hover:opacity-50 animate-pulse-slow"></div>
        
        {/* Helper text */}
        <div className="absolute top-full left-0 right-0 mt-1 text-center">
          <span className="text-xs bg-background/80 text-primary px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
            {guideTour.isTourActive ? "Tour in progress..." : "Click for guided tour"}
          </span>
        </div>
      </div>
    </div>
  );
}