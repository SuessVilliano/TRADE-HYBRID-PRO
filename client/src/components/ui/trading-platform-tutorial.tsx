import React, { useState, useEffect } from 'react';
import { useFeatureDisclosure, UserExperienceLevel } from '@/lib/context/FeatureDisclosureProvider';
import { TutorialButton } from './interactive-tutorial';
import { Button } from './button';
import { Info, HelpCircle, X, ChevronDown, ChevronUp, MinusCircle } from 'lucide-react';

// Create a custom tutorial step interface that allows for "center" placement
interface TradingTutorialStep {
  id: string;
  title: string;
  description: string;
  element?: string;
  placement?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  image?: string;
}

export function TradingPlatformTutorial() {
  const { completedTutorials, userLevel } = useFeatureDisclosure();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  // Check if this is the first time visiting the trading platform
  useEffect(() => {
    const hasVisitedTrading = localStorage.getItem('hasVisitedTrading');
    if (!hasVisitedTrading && !completedTutorials.includes('trading-basics')) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasVisitedTrading', 'true');
    }
    
    // Check if tutorial panel was previously hidden or minimized
    const tutorialHidden = localStorage.getItem('tutorialHidden') === 'true';
    const tutorialMinimized = localStorage.getItem('tutorialMinimized') === 'true';
    
    if (tutorialHidden) {
      setIsHidden(true);
    } else if (tutorialMinimized) {
      setIsMinimized(true);
    }
  }, [completedTutorials]);
  
  // Save minimized/hidden state to localStorage
  const toggleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem('tutorialMinimized', newState.toString());
  };
  
  const toggleHide = () => {
    const newState = !isHidden;
    setIsHidden(newState);
    localStorage.setItem('tutorialHidden', newState.toString());
  };
  
  const showTutorials = () => {
    setIsHidden(false);
    setIsMinimized(false);
    localStorage.setItem('tutorialHidden', 'false');
    localStorage.setItem('tutorialMinimized', 'false');
  };
  
  const basicTutorialSteps: TradingTutorialStep[] = [
    {
      id: 'step1',
      title: 'Welcome to the Trading Platform',
      description: 'This tutorial will guide you through the basic features of our trading platform. Let\'s get started!',
      // Use undefined for placement when using 'center' in modal
      placement: undefined,
    },
    {
      id: 'step2',
      title: 'Symbol Selector',
      description: 'Choose the trading instrument you want to analyze or trade from this dropdown menu.',
      element: '.symbol-selector',
      placement: 'bottom',
    },
    {
      id: 'step3',
      title: 'Trading Chart',
      description: 'This is the main chart for technical analysis. You can customize the timeframe and add indicators.',
      element: '.trading-chart',
      placement: 'top',
    },
    {
      id: 'step4',
      title: 'Control Center',
      description: 'Use the controls to adjust your chart settings, timeframes, and drawing tools.',
      element: '.chart-controls',
      placement: 'bottom',
    },
    {
      id: 'step5',
      title: 'Trading Panel',
      description: 'Place market orders, limit orders, or stop orders from this panel.',
      element: '.trade-panel',
      placement: 'left',
    },
    {
      id: 'step6',
      title: 'AI Companion',
      description: 'Get AI-powered market insights and trading suggestions from your virtual assistant.',
      element: '.ai-companion',
      placement: 'right',
    },
    {
      id: 'step7',
      title: 'Completed!',
      description: 'You\'ve completed the basic tutorial. Explore additional tutorials for advanced features.',
      placement: undefined,
    }
  ];
  
  const advancedTutorialSteps: TradingTutorialStep[] = [
    {
      id: 'advanced-step1',
      title: 'Advanced Trading Features',
      description: 'This tutorial will show you some of the more advanced features of the platform.',
      placement: undefined,
    },
    {
      id: 'advanced-step2',
      title: 'Advanced Order Types',
      description: 'Learn how to use OCO (One-Cancels-Other), trailing stops, and bracket orders.',
      element: '.advanced-orders',
      placement: 'right',
    },
    {
      id: 'advanced-step3',
      title: 'Risk Management Tools',
      description: 'Calculate position sizes, risk-to-reward ratios, and maximum drawdown.',
      element: '.risk-calculator',
      placement: 'bottom',
    },
    {
      id: 'advanced-step4',
      title: 'Custom Indicators',
      description: 'Create and save your own custom indicators and strategies.',
      element: '.custom-indicators',
      placement: 'top',
    },
    {
      id: 'advanced-step5',
      title: 'Completed!',
      description: 'You\'ve mastered the advanced trading features. Check out the strategy builder tutorial next!',
      placement: undefined,
    }
  ];
  
  const aiTutorialSteps: TradingTutorialStep[] = [
    {
      id: 'ai-step1',
      title: 'AI Trading Assistant',
      description: 'Learn how to use our AI assistant to enhance your trading decisions.',
      placement: undefined,
    },
    {
      id: 'ai-step2',
      title: 'Market Analysis',
      description: 'Ask the AI for real-time market analysis of any trading instrument.',
      element: '.ai-input',
      placement: 'top',
    },
    {
      id: 'ai-step3',
      title: 'Strategy Suggestions',
      description: 'Get AI-powered strategy suggestions based on current market conditions.',
      element: '.ai-strategies',
      placement: 'right',
    },
    {
      id: 'ai-step4',
      title: 'Risk Assessment',
      description: 'The AI can assess the risk level of potential trades based on market volatility and other factors.',
      element: '.risk-assessment',
      placement: 'bottom',
    },
    {
      id: 'ai-step5',
      title: 'Completed!',
      description: 'You now know how to leverage AI in your trading. Keep exploring to discover more features!',
      placement: undefined,
    }
  ];
  
  // First-time welcome modal
  if (showWelcomeModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg shadow-lg max-w-lg w-full p-6 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-900/50 p-2 rounded-full">
              <Info className="h-5 w-5 text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold">Welcome to the Trading Platform</h3>
          </div>
          
          <p className="text-slate-300 mb-6">
            It looks like this is your first time using our trading platform. Would you like to take a quick tutorial to learn the basics?
          </p>
          
          <div className="flex flex-col space-y-3">
            <TutorialButton
              tutorialId="trading-basics"
              steps={basicTutorialSteps as any}
              buttonText="Start Basic Tutorial"
              variant="default"
              className="w-full"
            />
            
            <Button variant="outline" onClick={() => setShowWelcomeModal(false)} className="w-full">
              Skip Tutorial
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Tutorial buttons that will appear in the platform interface
  if (isHidden) {
    // Show just a small button to restore tutorials
    return (
      <div className="fixed bottom-4 right-4 z-30">
        <Button 
          size="sm"
          variant="outline"
          className="bg-slate-800/90 backdrop-blur-sm rounded-full h-8 w-8 p-0 flex items-center justify-center"
          onClick={showTutorials}
          title="Show Tutorials"
        >
          <HelpCircle className="h-4 w-4 text-blue-400" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="tutorial-buttons fixed bottom-4 right-4 flex flex-col space-y-2 z-30">
      <div className="bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-semibold">Platform Tutorials</h4>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0" 
              onClick={toggleMinimize}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20" 
              onClick={toggleHide}
              title="Hide Tutorials"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="space-y-2">
            <TutorialButton
              tutorialId="trading-basics"
              steps={basicTutorialSteps as any}
              buttonText="Basic Trading Tutorial"
              className="w-full text-xs justify-start"
            />
            
            {userLevel === UserExperienceLevel.INTERMEDIATE || 
             userLevel === UserExperienceLevel.ADVANCED || 
             userLevel === UserExperienceLevel.EXPERT ? (
              <TutorialButton
                tutorialId="trading-advanced"
                steps={advancedTutorialSteps as any}
                buttonText="Advanced Trading Tutorial"
                className="w-full text-xs justify-start"
              />
            ) : null}
            
            {userLevel === UserExperienceLevel.ADVANCED || 
             userLevel === UserExperienceLevel.EXPERT ? (
              <TutorialButton
                tutorialId="trading-ai"
                steps={aiTutorialSteps as any}
                buttonText="AI Assistant Tutorial"
                className="w-full text-xs justify-start"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}