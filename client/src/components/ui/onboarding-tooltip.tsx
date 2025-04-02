import React, { useEffect, useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { X, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useOnboarding, OnboardingStep } from '@/lib/context/OnboardingProvider';

interface OnboardingTooltipProps {
  className?: string;
}

export function OnboardingTooltip({ className }: OnboardingTooltipProps) {
  const { 
    isOnboarding, 
    currentFlow, 
    currentStepIndex, 
    nextStep, 
    prevStep, 
    skipOnboarding 
  } = useOnboarding();
  
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  
  // Get current step
  const currentStep = currentFlow?.steps[currentStepIndex];
  
  // Calculate position based on target element
  useEffect(() => {
    if (!isOnboarding || !currentStep || !tooltipRef.current) {
      setVisible(false);
      return;
    }
    
    // Short delay to ensure the tooltip is rendered before we position it
    const timer = setTimeout(() => {
      positionTooltip();
      setVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isOnboarding, currentStep, currentStepIndex]);
  
  // Function to position the tooltip relative to the target element
  const positionTooltip = () => {
    if (!currentStep?.element || !tooltipRef.current) {
      // Center the tooltip if no target element
      setPosition({
        top: window.innerHeight / 2 - (tooltipRef.current?.offsetHeight || 0) / 2,
        left: window.innerWidth / 2 - (tooltipRef.current?.offsetWidth || 0) / 2
      });
      return;
    }
    
    const targetElement = document.querySelector(currentStep.element);
    
    if (!targetElement) {
      // Fall back to center if element not found
      setPosition({
        top: window.innerHeight / 2 - (tooltipRef.current?.offsetHeight || 0) / 2,
        left: window.innerWidth / 2 - (tooltipRef.current?.offsetWidth || 0) / 2
      });
      return;
    }
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Default padding
    const padding = 20;
    
    // Calculate position based on specified alignment
    let top = 0;
    let left = 0;
    
    switch (currentStep.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + padding;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - padding;
        break;
      case 'center':
      default:
        top = window.innerHeight / 2 - tooltipRect.height / 2;
        left = window.innerWidth / 2 - tooltipRect.width / 2;
        break;
    }
    
    // Ensure tooltip stays within viewport
    top = Math.max(10, Math.min(window.innerHeight - tooltipRect.height - 10, top));
    left = Math.max(10, Math.min(window.innerWidth - tooltipRect.width - 10, left));
    
    setPosition({ top, left });
  };
  
  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      if (isOnboarding) {
        positionTooltip();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOnboarding, currentStep]);
  
  // If not in onboarding mode, don't render anything
  if (!isOnboarding || !currentFlow || !currentStep) {
    return null;
  }
  
  // Calculate progress percentage
  const progress = ((currentStepIndex + 1) / currentFlow.steps.length) * 100;
  
  return (
    <div 
      className={`fixed z-50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      ref={tooltipRef}
    >
      <Card className="w-[350px] shadow-lg border-2 border-primary/20 bg-white dark:bg-slate-900 backdrop-blur-sm">
        <CardHeader className="pb-2 bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center text-slate-900 dark:text-white">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
              {currentStep.title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={skipOnboarding}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Step {currentStepIndex + 1} of {currentFlow.steps.length}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{currentStep.description}</p>
          
          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 mt-4 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2 bg-white dark:bg-slate-900">
          <div>
            {currentStepIndex > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
                onClick={prevStep}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          
          <div>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={nextStep}
            >
              {currentStepIndex < currentFlow.steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : 'Finish'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Highlight overlay for the target element */}
      {currentStep.element && (
        <div 
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div className="absolute inset-0 bg-transparent">
            {/* Create a "spotlight" effect */}
            <div
              className="absolute bg-transparent border-3 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] box-content"
              style={{
                top: document.querySelector(currentStep.element)?.getBoundingClientRect().top || 0,
                left: document.querySelector(currentStep.element)?.getBoundingClientRect().left || 0,
                width: document.querySelector(currentStep.element)?.getBoundingClientRect().width || 0,
                height: document.querySelector(currentStep.element)?.getBoundingClientRect().height || 0,
                borderRadius: '6px',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 10px 3px rgba(59, 130, 246, 0.3)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}