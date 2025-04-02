import React, { useState } from 'react';
import { Button } from './button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './popover';
import { 
  HelpCircle, 
  LightbulbIcon,
  CheckCircle2,
  PresentationIcon
} from 'lucide-react';
import { useOnboarding } from '../../lib/context/OnboardingProvider';

interface OnboardingButtonProps {
  className?: string;
}

export function OnboardingButton({ className }: OnboardingButtonProps) {
  console.log("OnboardingButton component rendering");
  
  const { 
    startOnboarding, 
    isFlowCompleted,
    currentFlow,
    isOnboarding,
    resetOnboarding
  } = useOnboarding();
  
  console.log("OnboardingButton - isOnboarding:", isOnboarding);
  console.log("OnboardingButton - currentFlow:", currentFlow);
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine available tours based on current path
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Available tours for this path
  const availableTours = [
    { id: 'main', title: 'Platform Overview', icon: PresentationIcon },
    
    // Trading dashboard tour
    ...(currentPath.includes('/trading') || currentPath.includes('/dashboard') ? [
      { id: 'trading-dashboard', title: 'Trading Dashboard Guide', icon: LightbulbIcon }
    ] : []),
    
    // THC staking tour
    ...(currentPath.includes('/thc') || currentPath.includes('/staking') ? [
      { id: 'thc-staking', title: 'THC Staking Guide', icon: LightbulbIcon }
    ] : []),
    
    // Prop firm tour
    ...(currentPath.includes('/prop-firm') ? [
      { id: 'prop-firm', title: 'Prop Firm Challenge Guide', icon: LightbulbIcon }
    ] : []),
    
    // Learning center tour
    ...(currentPath.includes('/learn') ? [
      { id: 'learning-center', title: 'Learning Center Guide', icon: LightbulbIcon }
    ] : []),
    
    // Metaverse tour
    ...(currentPath.includes('/metaverse') ? [
      { id: 'metaverse', title: 'Metaverse Trading Floor Guide', icon: LightbulbIcon }
    ] : []),
  ];
  
  const handleStartTour = (tourId: string) => {
    startOnboarding(tourId);
    setIsOpen(false);
  };
  
  const handleResetTours = () => {
    resetOnboarding();
    setIsOpen(false);
  };
  
  // If currently in onboarding mode, don't show the button
  if (isOnboarding) {
    return null;
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-xl z-40 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg border-2 border-blue-400 dark:border-blue-800 ${className}`}
          title="Help & Tours"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 shadow-xl" 
        align="end"
        side="top"
        sideOffset={16}
      >
        <div className="space-y-4">
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <h4 className="font-medium text-lg flex items-center text-slate-900 dark:text-white">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
              Help & Tours
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Take a guided tour to learn how to use the platform
            </p>
          </div>
          
          <div className="space-y-3">
            {availableTours.map((tour) => {
              const isCompleted = isFlowCompleted(tour.id);
              const Icon = tour.icon;
              
              return (
                <div 
                  key={tour.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{tour.title}</span>
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                    )}
                  </div>
                  <Button 
                    variant={isCompleted ? "outline" : "default"} 
                    size="sm"
                    className={isCompleted ? 
                      "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" : 
                      "bg-blue-600 hover:bg-blue-700 text-white"}
                    onClick={() => handleStartTour(tour.id)}
                  >
                    {isCompleted ? 'Replay' : 'Start'}
                  </Button>
                </div>
              );
            })}
          </div>
          
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              onClick={handleResetTours}
            >
              Reset all tours
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}