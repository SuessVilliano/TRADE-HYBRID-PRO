import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { useFeatureDisclosure, UserExperienceLevel } from '@/lib/context/FeatureDisclosureProvider';

// Define tutorial step interface
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  placement?: 'top' | 'right' | 'bottom' | 'left';
  image?: string; // Optional image URL
}

interface TutorialProps {
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveTutorial: React.FC<TutorialProps> = ({
  tutorialId,
  steps,
  onComplete,
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { markTutorialCompleted, completedTutorials } = useFeatureDisclosure();

  // Check if tutorial is already completed
  const isTutorialCompleted = completedTutorials.includes(tutorialId);

  // If tutorial is already completed, close it
  useEffect(() => {
    if (isTutorialCompleted && isOpen) {
      onClose();
    }
  }, [isTutorialCompleted, isOpen, onClose]);

  // Find and highlight the target element when step changes
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    if (step.element) {
      const element = document.querySelector(step.element) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        setHighlightedElement(null);
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, steps, isOpen]);

  // Position the tooltip relative to the highlighted element
  useEffect(() => {
    if (!highlightedElement || !tooltipRef.current || !isOpen) return;

    const step = steps[currentStep];
    const tooltipElement = tooltipRef.current;
    const elementRect = highlightedElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    // Add a buffer space (in pixels)
    const buffer = 20;
    
    let top, left;
    
    switch (step.placement) {
      case 'top':
        top = elementRect.top - tooltipRect.height - buffer;
        left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
        left = elementRect.right + buffer;
        break;
      case 'bottom':
        top = elementRect.bottom + buffer;
        left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
        left = elementRect.left - tooltipRect.width - buffer;
        break;
      default:
        // Default to bottom if not specified
        top = elementRect.bottom + buffer;
        left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
    }
    
    // Ensure the tooltip stays within viewport bounds
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    if (left < 20) left = 20;
    if (left + tooltipRect.width > viewport.width - 20) left = viewport.width - tooltipRect.width - 20;
    if (top < 20) top = 20;
    if (top + tooltipRect.height > viewport.height - 20) top = viewport.height - tooltipRect.height - 20;
    
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
    
    // Add highlight effect to the target element
    const originalOutline = highlightedElement.style.outline;
    const originalPosition = highlightedElement.style.position;
    const originalZIndex = highlightedElement.style.zIndex;
    
    highlightedElement.style.outline = '3px solid rgb(124, 58, 237)';
    highlightedElement.style.position = 'relative';
    highlightedElement.style.zIndex = '1000';
    
    return () => {
      // Reset element styling on cleanup
      if (highlightedElement) {
        highlightedElement.style.outline = originalOutline;
        highlightedElement.style.position = originalPosition;
        highlightedElement.style.zIndex = originalZIndex;
      }
    };
  }, [highlightedElement, currentStep, steps, isOpen]);

  if (!isOpen || isTutorialCompleted) {
    return null;
  }

  const currentStepData = steps[currentStep];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark tutorial as completed
      markTutorialCompleted(tutorialId);
      if (onComplete) onComplete();
      onClose();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    markTutorialCompleted(tutorialId);
    onClose();
  };

  // Show modal-style tutorial if no element to highlight
  if (!highlightedElement) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-lg max-w-lg w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {currentStepData.image && (
            <div className="mb-4 rounded-md overflow-hidden">
              <img 
                src={currentStepData.image} 
                alt={currentStepData.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          <p className="text-sm text-slate-300 mb-6">{currentStepData.description}</p>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    Finish
                    <CheckCircle className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tooltip style tutorial for highlighted elements
  return (
    <>
      {/* Semi-transparent overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={(e) => e.stopPropagation()} // Prevent clicks through the overlay
      />
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="fixed z-50 w-80 bg-background rounded-lg shadow-lg p-4"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
          <Button variant="ghost" size="icon" onClick={handleSkip} className="h-6 w-6">
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <p className="text-sm text-slate-300 mb-4">{currentStepData.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="mr-1 h-3 w-3" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  Finish
                  <CheckCircle className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

// Standalone button to trigger tutorials
interface TutorialButtonProps {
  tutorialId: string;
  steps: TutorialStep[];
  buttonText?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({
  tutorialId,
  steps,
  buttonText = 'Tutorial',
  className = '',
  variant = 'outline'
}) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { completedTutorials } = useFeatureDisclosure();
  
  const isTutorialCompleted = completedTutorials.includes(tutorialId);
  
  // Handle button click with error protection
  const handleOpenTutorial = () => {
    try {
      console.log("Opening tutorial:", tutorialId);
      // Validate that steps is an array
      if (!Array.isArray(steps) || steps.length === 0) {
        console.error("Tutorial steps invalid or empty:", steps);
        return;
      }
      
      setIsTutorialOpen(true);
    } catch (error) {
      console.error("Error opening tutorial:", error);
    }
  };
  
  return (
    <>
      <Button 
        variant={variant}
        size="sm"
        onClick={handleOpenTutorial}
        className={`${className} ${isTutorialCompleted ? 'opacity-60' : ''}`}
      >
        {buttonText}
        {isTutorialCompleted && <CheckCircle className="ml-1 h-3 w-3 text-green-500" />}
      </Button>
      
      {Array.isArray(steps) && steps.length > 0 && (
        <InteractiveTutorial
          tutorialId={tutorialId}
          steps={steps}
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />
      )}
    </>
  );
};

// Component to check if the user needs to see the experience level selector
interface ExperienceLevelSelectorProps {
  forceShow?: boolean;
}

export const ExperienceLevelSelector: React.FC<ExperienceLevelSelectorProps> = ({ forceShow = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userLevel, setUserLevel } = useFeatureDisclosure();
  
  // Check localStorage on mount to see if user has set a level before
  useEffect(() => {
    if (typeof window !== 'undefined' && !forceShow) {
      const hasSetLevel = localStorage.getItem('userExperienceLevel');
      setIsOpen(!hasSetLevel);
    } else if (forceShow) {
      setIsOpen(true);
    }
  }, [forceShow]);
  
  const handleSelectLevel = (level: UserExperienceLevel) => {
    setUserLevel(level);
    setIsOpen(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full p-8 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-2 text-white">Welcome to Trade Hybrid!</h2>
        <p className="text-slate-300 mb-6">
          To customize your experience, tell us about your trading experience level.
          This will help us show you the most relevant features.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent ${
              userLevel === UserExperienceLevel.BEGINNER ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'
            }`}
            onClick={() => handleSelectLevel(UserExperienceLevel.BEGINNER)}
          >
            <h3 className="font-semibold mb-2">Beginner</h3>
            <p className="text-sm text-slate-400">
              I'm new to trading. I want to learn the basics and start slowly.
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent ${
              userLevel === UserExperienceLevel.INTERMEDIATE ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'
            }`}
            onClick={() => handleSelectLevel(UserExperienceLevel.INTERMEDIATE)}
          >
            <h3 className="font-semibold mb-2">Intermediate</h3>
            <p className="text-sm text-slate-400">
              I have some trading experience. I'm familiar with charts and basic trading concepts.
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent ${
              userLevel === UserExperienceLevel.ADVANCED ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'
            }`}
            onClick={() => handleSelectLevel(UserExperienceLevel.ADVANCED)}
          >
            <h3 className="font-semibold mb-2">Advanced</h3>
            <p className="text-sm text-slate-400">
              I'm an experienced trader. I use technical analysis and have a trading strategy.
            </p>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent ${
              userLevel === UserExperienceLevel.EXPERT ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'
            }`}
            onClick={() => handleSelectLevel(UserExperienceLevel.EXPERT)}
          >
            <h3 className="font-semibold mb-2">Expert</h3>
            <p className="text-sm text-slate-400">
              I'm a professional trader. Show me all features and advanced tools.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>
            Continue to Trade Hybrid
          </Button>
        </div>
      </div>
    </div>
  );
};