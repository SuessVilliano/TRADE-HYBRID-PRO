import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PopupContainer } from '@/components/ui/popup-container';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/lib/stores/useUserStore';

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  video?: string;
  actionLabel?: string;
  actionPath?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Trade Hybrid",
    description: "Welcome to the future of trading! Trade Hybrid combines AI-powered trading tools, social features, and immersive visualization in one revolutionary platform. This tutorial will guide you through the key features.",
    image: "/images/tutorial/welcome.png",
    actionLabel: "Start Tour",
  },
  {
    title: "Trading Dashboard",
    description: "Access real-time market data, advanced charting tools, and AI-powered insights. Trade across multiple markets including Crypto, Futures, Forex, and Stocks.",
    image: "/images/tutorial/trading.png",
    actionLabel: "Visit Trading Dashboard",
    actionPath: "/trading",
  },
  {
    title: "Solana DEX Integration",
    description: "Trade directly on Solana decentralized exchanges with lower fees using THC token. Connect your Solana wallet to get started.",
    image: "/images/tutorial/solana-dex.png",
    actionLabel: "Connect Wallet",
    actionPath: "/solana-trading",
  },
  {
    title: "THC Token Ecosystem",
    description: "Our native THC token powers the platform with staking rewards, fee reductions, and membership benefits. Stake your tokens to earn passive income and unlock premium features.",
    image: "/images/tutorial/thc-token.png",
    actionLabel: "View Token Dashboard",
    actionPath: "/thc-staking",
  },
  {
    title: "3D Metaverse",
    description: "Explore our immersive trading environment where you can visualize market data, interact with other traders, and join virtual trading communities.",
    image: "/images/tutorial/metaverse.png",
    actionLabel: "Enter Metaverse",
    actionPath: "/metaverse",
  },
  {
    title: "Learning Journey",
    description: "Follow personalized learning paths for different market types. Whether you're interested in Crypto, Futures, Forex, or Stocks, we have tailored educational content for your needs.",
    image: "/images/tutorial/learning.png",
    actionLabel: "Start Learning",
    actionPath: "/learn/journey",
  },
  {
    title: "AI Market Analysis",
    description: "Get personalized market insights and trading suggestions from our AI-powered Market Buddy. Ask questions in natural language and receive detailed analysis.",
    image: "/images/tutorial/ai-market.png",
    actionLabel: "Try Market Buddy",
    actionPath: "/ai-market-analysis",
  },
  {
    title: "Trade Signals",
    description: "Receive AI-generated trading signals and alerts for price movements, technical patterns, and market opportunities.",
    image: "/images/tutorial/signals.png",
    actionLabel: "View Signals",
    actionPath: "/trading-signals",
  },
  {
    title: "Custom Notifications",
    description: "Set up personalized notifications for trading signals, price alerts, and platform updates. Choose your preferred notification channels and priority levels.",
    image: "/images/tutorial/notifications.png",
    actionLabel: "Configure Notifications",
    actionPath: "/notification-settings",
  },
  {
    title: "Bulls vs Bears Game",
    description: "Test your trading skills in our interactive Bulls vs Bears game. Compete against other traders or AI opponents in simulated market scenarios.",
    image: "/images/tutorial/bulls-bears.png",
    actionLabel: "Play Now",
    actionPath: "/bulls-vs-bears",
  },
  {
    title: "Ready to Begin?",
    description: "You've completed the platform tour! What would you like to do next?",
    actionLabel: "Start Trading",
    actionPath: "/trading",
  }
];

export function PlatformOnboarding({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  
  useEffect(() => {
    // Check if the user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem('hasCompletedOnboarding');
    if (hasSeenTutorial) {
      setIsOpen(false);
    }
  }, []);
  
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setIsOpen(false);
    if (onComplete) {
      onComplete();
    }
  };
  
  const handleAction = () => {
    const currentStepData = TUTORIAL_STEPS[currentStep];
    if (currentStepData.actionPath) {
      // If this is the final step, also mark the tutorial as complete
      if (currentStep === TUTORIAL_STEPS.length - 1) {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        if (onComplete) {
          onComplete();
        }
      }
      
      navigate(currentStepData.actionPath);
      setIsOpen(false);
    } else {
      handleNext();
    }
  };
  
  if (!isOpen) {
    return null;
  }
  
  const currentStepData = TUTORIAL_STEPS[currentStep];
  const progress = Math.round(((currentStep + 1) / TUTORIAL_STEPS.length) * 100);
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <PopupContainer className="w-full max-w-4xl shadow-xl" padding>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
          <button 
            onClick={handleComplete}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="relative w-full h-2 bg-slate-700 rounded mb-6">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-slate-300 mb-4">{currentStepData.description}</p>
            
            {!isAuthenticated && currentStep > 1 && currentStep < TUTORIAL_STEPS.length - 1 && (
              <div className="bg-blue-900/30 border border-blue-700 p-3 rounded-md mb-4">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-blue-400">Pro Tip:</span> Connect a wallet or create an account to unlock all features of the platform.
                </p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>Previous</Button>
              )}
              
              <Button variant="outline" onClick={handleNext}>
                {currentStep < TUTORIAL_STEPS.length - 1 ? "Skip" : "Close"}
              </Button>
              
              <Button onClick={handleAction}>
                {currentStepData.actionLabel || "Next"}
              </Button>
            </div>
          </div>
          
          <div>
            {currentStepData.image && (
              <div className="rounded-md overflow-hidden bg-slate-800 aspect-video">
                {/* Placeholder for actual images */}
                <div className="w-full h-full flex items-center justify-center bg-slate-700">
                  <p className="text-slate-400">Tutorial image: {currentStepData.image}</p>
                </div>
              </div>
            )}
            
            {currentStepData.video && (
              <div className="rounded-md overflow-hidden bg-slate-800 aspect-video">
                {/* Placeholder for actual videos */}
                <div className="w-full h-full flex items-center justify-center bg-slate-700">
                  <p className="text-slate-400">Tutorial video: {currentStepData.video}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-slate-400">
          <p>Step {currentStep + 1} of {TUTORIAL_STEPS.length}</p>
        </div>
      </PopupContainer>
    </div>
  );
}