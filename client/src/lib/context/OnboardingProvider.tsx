import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Define types for onboarding steps
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  actions?: {
    label: string;
    action: () => void;
  }[];
  requiredFeature?: string; // Only show this step if user has access to this feature
}

// Define types for onboarding flows
export interface OnboardingFlow {
  id: string;
  title: string;
  path: string; // URL path this flow is relevant for
  steps: OnboardingStep[];
  completed: boolean;
}

// Define onboarding context type
export interface OnboardingContextType {
  isOnboarding: boolean;
  currentFlow: OnboardingFlow | null;
  currentStepIndex: number;
  completedFlows: string[];
  startOnboarding: (flowId: string) => void;
  stopOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  markFlowComplete: (flowId: string) => void;
  isFlowCompleted: (flowId: string) => boolean;
}

// Create context
const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Predefined onboarding flows
const onboardingFlows: OnboardingFlow[] = [
  {
    id: 'main',
    title: 'Welcome to Trade Hybrid',
    path: '/',
    completed: false,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Trade Hybrid!',
        description: 'Let\'s take a quick tour of the platform and show you how to get started.',
        position: 'center',
        actions: [
          {
            label: 'Let\'s Go!',
            action: () => {}
          }
        ]
      },
      {
        id: 'navigation',
        title: 'Navigation',
        description: 'Use the sidebar to navigate between different sections of the platform. You can access trading dashboards, educational content, and more.',
        element: '.sidebar, .main-navigation',
        position: 'right',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'profile',
        title: 'Your Profile',
        description: 'Click on your profile to access account settings, wallet information, and membership status.',
        element: '.user-profile, .user-menu',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'finish',
        title: 'Let\'s Start Trading!',
        description: 'You\'re all set to explore Trade Hybrid. Start by checking out the Trading Dashboard or Learning Center.',
        position: 'center',
        actions: [
          {
            label: 'Finish Tour',
            action: () => {}
          }
        ]
      }
    ]
  },
  {
    id: 'trading-dashboard',
    title: 'Trading Dashboard Tour',
    path: '/trading',
    completed: false,
    steps: [
      {
        id: 'dashboard-welcome',
        title: 'Welcome to the Trading Dashboard',
        description: 'This is your command center for all trading activities. Let\'s explore the key features.',
        position: 'center',
        actions: [
          {
            label: 'Let\'s Go!',
            action: () => {}
          }
        ]
      },
      {
        id: 'chart',
        title: 'TradingView Chart',
        description: 'The chart allows you to analyze price movements using various indicators and drawing tools. You can also switch between different timeframes.',
        element: '.trading-chart',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'order-panel',
        title: 'Order Panel',
        description: 'Create and manage your trades from here. You can set entry price, stop loss, take profit, and more.',
        element: '.order-panel',
        position: 'left',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'docking',
        title: 'Customizable Layout',
        description: 'You can dock, undock, and rearrange panels to create your perfect workspace. Try dragging a panel now!',
        element: '.dockable-panel',
        position: 'top',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'dashboard-finish',
        title: 'Ready to Trade',
        description: 'You now know the basics of the trading dashboard. Feel free to explore more features as you go!',
        position: 'center',
        actions: [
          {
            label: 'Finish Tour',
            action: () => {}
          }
        ]
      }
    ]
  },
  {
    id: 'thc-staking',
    title: 'THC Staking Guide',
    path: '/thc-staking',
    completed: false,
    steps: [
      {
        id: 'staking-welcome',
        title: 'Welcome to THC Staking',
        description: 'This section allows you to stake your THC tokens to earn rewards and access premium features.',
        position: 'center',
        actions: [
          {
            label: 'Let\'s Go!',
            action: () => {}
          }
        ]
      },
      {
        id: 'staking-tab',
        title: 'Staking Tab',
        description: 'Here you can stake your THC tokens for different durations to earn varying APY rates.',
        element: '[value="staking"]',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'matrix-tab',
        title: 'Matrix Tab',
        description: 'The matrix allows you to earn from referrals and build your network.',
        element: '[value="matrix"]',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'acquire-tab',
        title: 'Acquire THC Tab',
        description: 'Need more THC tokens? This section shows you different ways to acquire them.',
        element: '[value="acquire"]',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'staking-finish',
        title: 'Start Earning!',
        description: 'You\'re all set to start staking your THC tokens and earning rewards.',
        position: 'center',
        actions: [
          {
            label: 'Finish Tour',
            action: () => {}
          }
        ]
      }
    ]
  },
  {
    id: 'prop-firm',
    title: 'HybridFunding.co Challenge Guide',
    path: '/prop-firm',
    completed: false,
    steps: [
      {
        id: 'prop-welcome',
        title: 'Welcome to HybridFunding.co Challenges',
        description: 'Here you can take trading challenges to qualify for HybridFunding.co funding.',
        position: 'center',
        actions: [
          {
            label: 'Let\'s Go!',
            action: () => {}
          }
        ]
      },
      {
        id: 'challenge-options',
        title: 'Challenge Options',
        description: 'Browse different challenge options with varying account sizes and profit targets.',
        element: '.challenge-cards',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'challenge-rules',
        title: 'Challenge Rules',
        description: 'Make sure to understand the trading rules and profit targets before starting a challenge.',
        element: '.challenge-rules',
        position: 'right',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'prop-finish',
        title: 'Ready for the Challenge!',
        description: 'You\'re all set to start your prop firm challenge and prove your trading skills.',
        position: 'center',
        actions: [
          {
            label: 'Finish Tour',
            action: () => {}
          }
        ]
      }
    ]
  },
  {
    id: 'learning-center',
    title: 'Learning Center Guide',
    path: '/learn',
    completed: false,
    steps: [
      {
        id: 'learn-welcome',
        title: 'Welcome to the Learning Center',
        description: 'Our comprehensive educational resources will help you become a better trader.',
        position: 'center',
        actions: [
          {
            label: 'Let\'s Go!',
            action: () => {}
          }
        ]
      },
      {
        id: 'courses',
        title: 'Trading Courses',
        description: 'Access structured courses from beginner to advanced levels.',
        element: '.courses-section',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'learning-path',
        title: 'Learning Paths',
        description: 'Follow recommended learning paths based on your trading goals and experience level.',
        element: '.learning-paths',
        position: 'left',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'learn-finish',
        title: 'Start Learning!',
        description: 'You\'re all set to begin your educational journey with Trade Hybrid.',
        position: 'center',
        actions: [
          {
            label: 'Finish Tour',
            action: () => {}
          }
        ]
      }
    ]
  },
  {
    id: 'metaverse',
    title: 'Metaverse Trading Floor Guide',
    path: '/metaverse',
    completed: false,
    steps: [
      {
        id: 'metaverse-welcome',
        title: 'Welcome to the Trading Metaverse',
        description: 'Experience a 3D trading environment where you can interact with other traders and access exclusive features.',
        position: 'center',
        actions: [
          {
            label: 'Let\'s Go!',
            action: () => {}
          }
        ]
      },
      {
        id: 'navigation-controls',
        title: 'Navigation Controls',
        description: 'Use WASD or arrow keys to move, and mouse to look around.',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'trading-terminals',
        title: 'Trading Terminals',
        description: 'Approach a terminal to access advanced trading features and real-time market data.',
        element: '.trading-terminal',
        position: 'right',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'metaverse-finish',
        title: 'Explore the Metaverse!',
        description: 'You\'re ready to explore the trading metaverse. Connect with other traders and enjoy the unique experience!',
        position: 'center',
        actions: [
          {
            label: 'Finish Tour',
            action: () => {}
          }
        ]
      }
    ]
  },
  {
    id: 'wallet-connection',
    title: 'Wallet Connection Guide',
    path: '/wallet',
    completed: false,
    steps: [
      {
        id: 'wallet-welcome',
        title: 'Connect Your Crypto Wallet',
        description: 'Let\'s connect your cryptocurrency wallet to enable trading, staking, and other blockchain features on Trade Hybrid.',
        position: 'center',
        actions: [
          {
            label: 'Get Started',
            action: () => {}
          }
        ]
      },
      {
        id: 'what-is-wallet',
        title: 'What is a Crypto Wallet?',
        description: 'A cryptocurrency wallet is a secure digital tool that allows you to store, send, and receive digital assets. It\'s your personal interface to the blockchain ecosystem.',
        position: 'center',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'wallet-options',
        title: 'Choose Your Wallet',
        description: 'We support several popular wallets. Select the one you\'re most comfortable with. MetaMask and Phantom are great options for beginners.',
        element: '.wallet-options, .connect-wallet-button',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'browser-extension',
        title: 'Browser Extension Required',
        description: 'Most wallets require a browser extension. If you don\'t have your wallet installed yet, you\'ll be prompted to install it.',
        position: 'right',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'connection-permissions',
        title: 'Connection Permissions',
        description: 'When connecting your wallet, you\'ll be asked to approve the connection. This only gives Trade Hybrid permission to view your public address, not your funds.',
        position: 'left',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'security-tips',
        title: 'Security Best Practices',
        description: 'Never share your wallet\'s recovery phrase or private keys with anyone. Always verify the site URL before connecting your wallet. Consider using a hardware wallet for enhanced security.',
        position: 'center',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'connect-now',
        title: 'Connect Your Wallet Now',
        description: 'Click the "Connect Wallet" button to begin the connection process. Follow the prompts from your wallet to complete the connection.',
        element: '.wallet-connect-button, .wallet-options',
        position: 'bottom',
        actions: [
          {
            label: 'Next',
            action: () => {}
          }
        ]
      },
      {
        id: 'wallet-finish',
        title: 'Wallet Successfully Connected!',
        description: 'Congratulations! Your wallet is now connected to Trade Hybrid. You can now access all blockchain-related features of the platform.',
        position: 'center',
        actions: [
          {
            label: 'Finish Tour',
            action: () => {}
          }
        ]
      }
    ]
  }
];

// Provider component
interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  console.log("OnboardingProvider initialized");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedFlows, setCompletedFlows] = useLocalStorage<string[]>('onboarding_completed_flows', []);
  const [flows, setFlows] = useState<OnboardingFlow[]>(onboardingFlows);
  
  // Debug log
  console.log("Onboarding flows:", flows);

  // Auto-detect if we should show onboarding based on the current path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // Find a matching flow for the current path that hasn't been completed yet
      const matchingFlow = flows.find(flow => 
        currentPath.includes(flow.path) && 
        !completedFlows.includes(flow.id)
      );
      
      // If this is a user's first visit, suggest onboarding
      const isFirstVisit = localStorage.getItem('onboarding_first_visit') !== 'completed';
      
      if (isFirstVisit && matchingFlow) {
        // Ask user if they want to see the tour
        const wantsTour = confirm(`Would you like to see a quick tour of the ${matchingFlow.title}?`);
        if (wantsTour) {
          startOnboarding(matchingFlow.id);
        }
        localStorage.setItem('onboarding_first_visit', 'completed');
      }
    }
  }, []);

  // Start onboarding with a specific flow
  const startOnboarding = (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (flow) {
      setCurrentFlow(flow);
      setCurrentStepIndex(0);
      setIsOnboarding(true);
    }
  };

  // Stop onboarding
  const stopOnboarding = () => {
    setIsOnboarding(false);
    setCurrentFlow(null);
    setCurrentStepIndex(0);
  };

  // Move to next step
  const nextStep = () => {
    if (currentFlow && currentStepIndex < currentFlow.steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    } else {
      // If we're at the last step, mark the flow as completed
      if (currentFlow) {
        markFlowComplete(currentFlow.id);
      }
      stopOnboarding();
    }
  };

  // Move to previous step
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  };

  // Skip the whole onboarding
  const skipOnboarding = () => {
    if (currentFlow) {
      markFlowComplete(currentFlow.id);
    }
    stopOnboarding();
  };

  // Reset all onboarding progress
  const resetOnboarding = () => {
    setCompletedFlows([]);
    setFlows(flows.map(flow => ({ ...flow, completed: false })));
    stopOnboarding();
  };

  // Mark a flow as completed
  const markFlowComplete = (flowId: string) => {
    if (!completedFlows.includes(flowId)) {
      setCompletedFlows((prev: string[]) => [...prev, flowId]);
      setFlows(prevFlows => 
        prevFlows.map(flow => 
          flow.id === flowId ? { ...flow, completed: true } : flow
        )
      );
    }
  };

  // Check if a flow is completed
  const isFlowCompleted = (flowId: string) => {
    return completedFlows.includes(flowId);
  };

  // Context value
  const value = {
    isOnboarding,
    currentFlow,
    currentStepIndex,
    completedFlows,
    startOnboarding,
    stopOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
    resetOnboarding,
    markFlowComplete,
    isFlowCompleted
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook for using the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingProvider;