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
import { useOnboarding } from '@/lib/context/OnboardingProvider';

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
          className={`fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-40 bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80" 
        align="end"
        side="top"
        sideOffset={16}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-lg">Help & Tours</h4>
            <p className="text-sm text-muted-foreground">
              Take a guided tour to learn how to use the platform
            </p>
          </div>
          
          <div className="space-y-2">
            {availableTours.map((tour) => {
              const isCompleted = isFlowCompleted(tour.id);
              const Icon = tour.icon;
              
              return (
                <div 
                  key={tour.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2 text-primary" />
                    <span className="text-sm">{tour.title}</span>
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleStartTour(tour.id)}
                  >
                    {isCompleted ? 'Replay' : 'Start'}
                  </Button>
                </div>
              );
            })}
          </div>
          
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
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