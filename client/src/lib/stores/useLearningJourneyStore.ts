import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define market types for learning paths
export type MarketType = 'crypto' | 'futures' | 'forex' | 'stocks';

// Define difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Define module status
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

// Define a learning module
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  market: MarketType;
  difficulty: DifficultyLevel;
  estimatedTime: number; // in minutes
  status: ModuleStatus;
  progress: number; // 0-100
  prerequisites: string[]; // ids of prerequisite modules
  content?: {
    sections: {
      title: string;
      content: string;
      type?: 'text' | 'video' | 'quiz' | 'interactive';
      completed: boolean;
    }[];
  };
  quizResults?: {
    score: number;
    totalQuestions: number;
    passed: boolean;
    completedAt?: string;
  };
  completedAt?: string;
}

// Define the learning journey
export interface LearningJourney {
  id: string;
  market: MarketType;
  title: string;
  description: string;
  coverImage?: string;
  modules: LearningModule[];
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  isActive: boolean;
}

// Define user skills and preferences
export interface UserLearningProfile {
  preferredMarkets: MarketType[];
  skillLevels: Record<MarketType, DifficultyLevel>;
  learningPace: 'slow' | 'normal' | 'fast';
  interests: string[];
  completedModules: number;
  totalModules: number;
  quizAverage: number;
  lastActivity?: string;
}

// Define the store state
interface LearningJourneyState {
  activeJourneys: LearningJourney[];
  availableJourneys: LearningJourney[];
  userProfile: UserLearningProfile;
  currentModuleId: string | null;
  
  // Actions
  startJourney: (journeyId: string) => void;
  completeModule: (moduleId: string, quizResults?: { score: number; totalQuestions: number }) => void;
  startModule: (moduleId: string) => void;
  updateModuleProgress: (moduleId: string, progress: number) => void;
  updateUserProfile: (profile: Partial<UserLearningProfile>) => void;
  resetProgress: () => void;
  
  // Helper methods
  getJourneyById: (journeyId: string) => LearningJourney | undefined;
  getModuleById: (moduleId: string) => LearningModule | undefined;
  getJourneyForModule: (moduleId: string) => LearningJourney | undefined;
  getNextAvailableModule: (journeyId: string) => LearningModule | undefined;
  getModuleCompletion: (moduleId: string) => number;
  getJourneyCompletion: (journeyId: string) => number;
  getRecommendedModules: () => LearningModule[];
  getRecommendedJourneys: () => LearningJourney[];
}

const defaultUserProfile: UserLearningProfile = {
  preferredMarkets: ['crypto', 'futures'],
  skillLevels: {
    crypto: 'beginner',
    futures: 'beginner',
    forex: 'beginner',
    stocks: 'beginner',
  },
  learningPace: 'normal',
  interests: ['trading', 'technology'],
  completedModules: 0,
  totalModules: 0,
  quizAverage: 0,
};

// Create the crypto learning journey modules
const createCryptoJourney = (): LearningJourney => ({
  id: 'crypto-journey',
  market: 'crypto',
  title: 'Cryptocurrency Trading Mastery',
  description: 'Learn the fundamentals of cryptocurrency trading, from basic concepts to advanced strategies.',
  coverImage: '/images/learning/crypto-cover.png',
  modules: [
    {
      id: 'crypto-basics',
      title: 'Cryptocurrency Fundamentals',
      description: 'Learn the basics of blockchain technology, cryptocurrencies, and decentralized finance.',
      market: 'crypto',
      difficulty: 'beginner',
      estimatedTime: 30,
      status: 'available',
      progress: 0,
      prerequisites: [],
      content: {
        sections: [
          {
            title: 'Introduction to Blockchain',
            content: 'Blockchain is a distributed ledger technology...',
            completed: false,
          },
          {
            title: 'Understanding Cryptocurrencies',
            content: 'Cryptocurrencies are digital assets...',
            completed: false,
          },
          {
            title: 'Crypto Wallets and Security',
            content: 'Securing your cryptocurrencies is essential...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'crypto-markets',
      title: 'Crypto Markets and Exchanges',
      description: 'Understand how cryptocurrency markets work, different types of exchanges, and order types.',
      market: 'crypto',
      difficulty: 'beginner',
      estimatedTime: 45,
      status: 'locked',
      progress: 0,
      prerequisites: ['crypto-basics'],
      content: {
        sections: [
          {
            title: 'Centralized vs Decentralized Exchanges',
            content: 'There are two main types of cryptocurrency exchanges...',
            completed: false,
          },
          {
            title: 'Order Types in Crypto Markets',
            content: 'Understanding different order types is essential...',
            completed: false,
          },
          {
            title: 'Market Liquidity and Depth',
            content: 'Liquidity refers to how easily assets can be bought or sold...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'crypto-analysis',
      title: 'Technical Analysis for Crypto',
      description: 'Learn how to analyze cryptocurrency price charts using technical indicators and patterns.',
      market: 'crypto',
      difficulty: 'intermediate',
      estimatedTime: 60,
      status: 'locked',
      progress: 0,
      prerequisites: ['crypto-markets'],
      content: {
        sections: [
          {
            title: 'Candlestick Patterns',
            content: 'Candlestick patterns are visual representations...',
            completed: false,
          },
          {
            title: 'Moving Averages and Trends',
            content: 'Moving averages help identify the direction...',
            completed: false,
          },
          {
            title: 'Volume Analysis',
            content: 'Trading volume is a critical indicator...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'crypto-strategies',
      title: 'Crypto Trading Strategies',
      description: 'Discover effective strategies for day trading, swing trading, and long-term investing in cryptocurrencies.',
      market: 'crypto',
      difficulty: 'intermediate',
      estimatedTime: 75,
      status: 'locked',
      progress: 0,
      prerequisites: ['crypto-analysis'],
      content: {
        sections: [
          {
            title: 'Day Trading Crypto',
            content: 'Day trading involves making multiple trades...',
            completed: false,
          },
          {
            title: 'Swing Trading Strategies',
            content: 'Swing trading captures price movements...',
            completed: false,
          },
          {
            title: 'DCA and HODLing',
            content: 'Long-term investment strategies include...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'crypto-risk',
      title: 'Risk Management in Crypto',
      description: 'Learn essential risk management techniques to protect your capital in the volatile crypto markets.',
      market: 'crypto',
      difficulty: 'intermediate',
      estimatedTime: 45,
      status: 'locked',
      progress: 0,
      prerequisites: ['crypto-strategies'],
      content: {
        sections: [
          {
            title: 'Position Sizing',
            content: 'Determining the appropriate amount to invest...',
            completed: false,
          },
          {
            title: 'Stop Loss Strategies',
            content: 'Implementing effective stop losses...',
            completed: false,
          },
          {
            title: 'Risk-Reward Ratios',
            content: 'Understanding the relationship between risk and reward...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'crypto-defi',
      title: 'DeFi and Yield Farming',
      description: 'Explore decentralized finance protocols, yield farming, and liquidity mining opportunities.',
      market: 'crypto',
      difficulty: 'advanced',
      estimatedTime: 90,
      status: 'locked',
      progress: 0,
      prerequisites: ['crypto-risk'],
      content: {
        sections: [
          {
            title: 'Introduction to DeFi',
            content: 'Decentralized Finance represents a new paradigm...',
            completed: false,
          },
          {
            title: 'Lending and Borrowing Platforms',
            content: 'DeFi platforms allow users to lend and borrow...',
            completed: false,
          },
          {
            title: 'Yield Farming Strategies',
            content: 'Yield farming involves providing liquidity...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'crypto-advanced',
      title: 'Advanced Crypto Trading',
      description: 'Master advanced concepts including derivatives, futures, options, and leveraged trading in crypto markets.',
      market: 'crypto',
      difficulty: 'advanced',
      estimatedTime: 120,
      status: 'locked',
      progress: 0,
      prerequisites: ['crypto-defi'],
      content: {
        sections: [
          {
            title: 'Crypto Derivatives',
            content: 'Derivatives are financial instruments...',
            completed: false,
          },
          {
            title: 'Perpetual Futures',
            content: 'Perpetual futures contracts are unique to crypto...',
            completed: false,
          },
          {
            title: 'Options Trading in Crypto',
            content: 'Options provide the right but not obligation...',
            completed: false,
          },
          {
            title: 'Leveraged Trading Risks',
            content: 'Leverage amplifies both gains and losses...',
            completed: false,
          }
        ],
      },
    },
  ],
  progress: 0,
  isActive: false,
});

// Create the futures learning journey modules
const createFuturesJourney = (): LearningJourney => ({
  id: 'futures-journey',
  market: 'futures',
  title: 'Futures Trading Professional',
  description: 'Master the futures markets from fundamental concepts to professional trading strategies.',
  coverImage: '/images/learning/futures-cover.png',
  modules: [
    {
      id: 'futures-basics',
      title: 'Futures Markets Fundamentals',
      description: 'Learn the basics of futures contracts, market structure, and the role of futures in financial markets.',
      market: 'futures',
      difficulty: 'beginner',
      estimatedTime: 45,
      status: 'available',
      progress: 0,
      prerequisites: [],
      content: {
        sections: [
          {
            title: 'What Are Futures Contracts?',
            content: 'Futures contracts are agreements to buy or sell...',
            completed: false,
          },
          {
            title: 'Futures Market Participants',
            content: 'The futures market consists of various participants...',
            completed: false,
          },
          {
            title: 'Contract Specifications',
            content: 'Understanding the details of futures contracts...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'futures-margin',
      title: 'Margin and Leverage in Futures',
      description: 'Understand how margin accounts work, leverage mechanics, and risk management in futures trading.',
      market: 'futures',
      difficulty: 'beginner',
      estimatedTime: 60,
      status: 'locked',
      progress: 0,
      prerequisites: ['futures-basics'],
      content: {
        sections: [
          {
            title: 'Initial and Maintenance Margin',
            content: 'Trading futures requires posting an initial margin...',
            completed: false,
          },
          {
            title: 'Leverage and Its Impact',
            content: 'Futures contracts offer significant leverage...',
            completed: false,
          },
          {
            title: 'Margin Calls and Liquidation',
            content: 'Understanding what happens when prices move against you...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'futures-analysis',
      title: 'Technical Analysis for Futures',
      description: 'Learn specialized chart analysis techniques for futures markets, including volume and open interest.',
      market: 'futures',
      difficulty: 'intermediate',
      estimatedTime: 75,
      status: 'locked',
      progress: 0,
      prerequisites: ['futures-margin'],
      content: {
        sections: [
          {
            title: 'Futures Chart Analysis',
            content: 'Reading futures charts has some unique aspects...',
            completed: false,
          },
          {
            title: 'Volume in Futures Trading',
            content: 'Volume analysis is particularly important in futures...',
            completed: false,
          },
          {
            title: 'Open Interest Analysis',
            content: 'Open interest provides valuable information about...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'futures-strategies',
      title: 'Futures Trading Strategies',
      description: 'Master proven futures trading strategies including trend following, breakout trading, and mean reversion.',
      market: 'futures',
      difficulty: 'intermediate',
      estimatedTime: 90,
      status: 'locked',
      progress: 0,
      prerequisites: ['futures-analysis'],
      content: {
        sections: [
          {
            title: 'Trend Following in Futures',
            content: 'Trend following is one of the most popular...',
            completed: false,
          },
          {
            title: 'Breakout Trading Strategies',
            content: 'Breakout strategies aim to capture momentum...',
            completed: false,
          },
          {
            title: 'Mean Reversion Approaches',
            content: 'Mean reversion strategies are based on the idea...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'futures-spreads',
      title: 'Calendar Spreads and Relative Value',
      description: 'Learn advanced techniques for trading futures spreads and relative value opportunities.',
      market: 'futures',
      difficulty: 'advanced',
      estimatedTime: 120,
      status: 'locked',
      progress: 0,
      prerequisites: ['futures-strategies'],
      content: {
        sections: [
          {
            title: 'Calendar Spreads Explained',
            content: 'Calendar spreads involve trading the price difference...',
            completed: false,
          },
          {
            title: 'Inter-Commodity Spreads',
            content: 'Trading price relationships between different...',
            completed: false,
          },
          {
            title: 'Relative Value Opportunities',
            content: 'Identifying value discrepancies between related...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'futures-risk',
      title: 'Advanced Risk Management for Futures',
      description: 'Master sophisticated risk management techniques for futures portfolios, including VaR and stress testing.',
      market: 'futures',
      difficulty: 'advanced',
      estimatedTime: 90,
      status: 'locked',
      progress: 0,
      prerequisites: ['futures-spreads'],
      content: {
        sections: [
          {
            title: 'Portfolio-Level Risk Management',
            content: 'Managing risk across multiple futures positions...',
            completed: false,
          },
          {
            title: 'Value at Risk (VaR)',
            content: 'VaR is a statistical technique to estimate...',
            completed: false,
          },
          {
            title: 'Stress Testing Your Strategies',
            content: 'Preparing for extreme market conditions...',
            completed: false,
          }
        ],
      },
    },
    {
      id: 'futures-algo',
      title: 'Algorithmic Futures Trading',
      description: 'Learn how to develop, backtest, and implement algorithmic trading strategies for futures markets.',
      market: 'futures',
      difficulty: 'expert',
      estimatedTime: 150,
      status: 'locked',
      progress: 0,
      prerequisites: ['futures-risk'],
      content: {
        sections: [
          {
            title: 'Algorithmic Strategy Development',
            content: 'Creating systematic trading rules for futures...',
            completed: false,
          },
          {
            title: 'Backtesting Methodologies',
            content: 'Properly testing strategies against historical data...',
            completed: false,
          },
          {
            title: 'Live Implementation Considerations',
            content: 'Moving from backtesting to live trading requires...',
            completed: false,
          },
          {
            title: 'Evaluating Algorithm Performance',
            content: 'Metrics and methods for assessing your trading algorithms...',
            completed: false,
          }
        ],
      },
    },
  ],
  progress: 0,
  isActive: false,
});

// Basic forex journey outline
const createForexJourney = (): LearningJourney => ({
  id: 'forex-journey',
  market: 'forex',
  title: 'Foreign Exchange Trading',
  description: 'Master the world\'s largest financial market - Forex trading from fundamentals to advanced strategies.',
  coverImage: '/images/learning/forex-cover.png',
  modules: [
    {
      id: 'forex-basics',
      title: 'Forex Fundamentals',
      description: 'Understand currency pairs, pips, lots, and the structure of the foreign exchange market.',
      market: 'forex',
      difficulty: 'beginner',
      estimatedTime: 45,
      status: 'available',
      progress: 0,
      prerequisites: [],
      content: {
        sections: [
          {
            title: 'Introduction to Forex Market',
            content: 'The foreign exchange market is where currencies are traded...',
            completed: false,
          },
          {
            title: 'Currency Pairs Explained',
            content: 'Understanding base and quote currencies...',
            completed: false,
          },
          {
            title: 'Pips, Lots, and Leverage',
            content: 'The basic units of measurement in forex...',
            completed: false,
          }
        ],
      },
    },
    // More forex modules would go here
  ],
  progress: 0,
  isActive: false,
});

// Basic stocks journey outline
const createStocksJourney = (): LearningJourney => ({
  id: 'stocks-journey',
  market: 'stocks',
  title: 'Stock Market Investing',
  description: 'Learn effective stock trading and investing strategies from fundamental analysis to technical trading.',
  coverImage: '/images/learning/stocks-cover.png',
  modules: [
    {
      id: 'stocks-basics',
      title: 'Stock Market Fundamentals',
      description: 'Understand stock market structure, how shares work, and different types of equities.',
      market: 'stocks',
      difficulty: 'beginner',
      estimatedTime: 45,
      status: 'available',
      progress: 0,
      prerequisites: [],
      content: {
        sections: [
          {
            title: 'What Are Stocks?',
            content: 'Stocks represent ownership in a company...',
            completed: false,
          },
          {
            title: 'Stock Exchanges and Markets',
            content: 'Understanding where and how stocks are traded...',
            completed: false,
          },
          {
            title: 'Types of Stock Orders',
            content: 'Different ways to buy and sell stocks...',
            completed: false,
          }
        ],
      },
    },
    // More stock modules would go here
  ],
  progress: 0,
  isActive: false,
});

// Initialize the store with predefined journeys
export const useLearningJourneyStore = create<LearningJourneyState>()(
  persist(
    (set, get) => ({
      activeJourneys: [],
      availableJourneys: [
        createCryptoJourney(),
        createFuturesJourney(),
        createForexJourney(),
        createStocksJourney(),
      ],
      userProfile: defaultUserProfile,
      currentModuleId: null,
      
      // Action to start a learning journey
      startJourney: (journeyId: string) => {
        const journey = get().availableJourneys.find(j => j.id === journeyId);
        if (!journey) return;
        
        // Make sure the first module is available
        const updatedJourney = {
          ...journey,
          isActive: true,
          startedAt: new Date().toISOString(),
          modules: journey.modules.map((module, index) => 
            index === 0 
              ? { ...module, status: 'available' } 
              : module
          )
        };
        
        set(state => ({
          activeJourneys: [...state.activeJourneys, updatedJourney],
          availableJourneys: state.availableJourneys.filter(j => j.id !== journeyId),
        }));
      },
      
      // Complete a module
      completeModule: (moduleId: string, quizResults?: { score: number; totalQuestions: number }) => {
        const journey = get().getJourneyForModule(moduleId);
        if (!journey) return;
        
        const moduleIndex = journey.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;
        
        // Update the module status and quiz results
        const updatedJourney = {
          ...journey,
          modules: journey.modules.map((module, index) => {
            // Mark this module as completed
            if (module.id === moduleId) {
              return {
                ...module,
                status: 'completed',
                progress: 100,
                completedAt: new Date().toISOString(),
                quizResults: quizResults ? {
                  score: quizResults.score,
                  totalQuestions: quizResults.totalQuestions,
                  passed: (quizResults.score / quizResults.totalQuestions) >= 0.7,
                  completedAt: new Date().toISOString(),
                } : undefined,
              };
            }
            
            // Unlock the next module if this is the completed one
            if (index === moduleIndex + 1) {
              return {
                ...module,
                status: 'available',
              };
            }
            
            return module;
          }),
        };
        
        // Calculate new journey progress
        const completedModules = updatedJourney.modules.filter(m => m.status === 'completed').length;
        const journeyProgress = Math.round((completedModules / updatedJourney.modules.length) * 100);
        
        // Check if journey is completed
        const isJourneyCompleted = journeyProgress === 100;
        
        // Update the journey
        const finalJourney = {
          ...updatedJourney,
          progress: journeyProgress,
          completedAt: isJourneyCompleted ? new Date().toISOString() : updatedJourney.completedAt,
        };
        
        // Update user profile stats
        const userProfile = get().userProfile;
        const completedModuleCount = userProfile.completedModules + 1;
        
        // Update quiz average if quiz results were provided
        let newQuizAverage = userProfile.quizAverage;
        if (quizResults) {
          const quizScore = quizResults.score / quizResults.totalQuestions;
          const totalQuizzes = userProfile.completedModules; // Previous completed modules count
          newQuizAverage = totalQuizzes === 0 
            ? quizScore 
            : ((userProfile.quizAverage * totalQuizzes) + quizScore) / (totalQuizzes + 1);
        }
        
        set(state => ({
          activeJourneys: state.activeJourneys.map(j => 
            j.id === journey.id ? finalJourney : j
          ),
          userProfile: {
            ...userProfile,
            completedModules: completedModuleCount,
            lastActivity: new Date().toISOString(),
            quizAverage: newQuizAverage,
          },
        }));
      },
      
      // Start a module
      startModule: (moduleId: string) => {
        const journey = get().getJourneyForModule(moduleId);
        if (!journey) return;
        
        set(state => ({
          currentModuleId: moduleId,
          activeJourneys: state.activeJourneys.map(j => 
            j.id === journey.id 
              ? {
                  ...j,
                  modules: j.modules.map(m => 
                    m.id === moduleId 
                      ? { ...m, status: 'in_progress' } 
                      : m
                  )
                }
              : j
          ),
        }));
      },
      
      // Update module progress
      updateModuleProgress: (moduleId: string, progress: number) => {
        const journey = get().getJourneyForModule(moduleId);
        if (!journey) return;
        
        set(state => ({
          activeJourneys: state.activeJourneys.map(j => 
            j.id === journey.id 
              ? {
                  ...j,
                  modules: j.modules.map(m => 
                    m.id === moduleId 
                      ? { ...m, progress: Math.min(Math.max(0, progress), 100) } 
                      : m
                  )
                }
              : j
          ),
        }));
      },
      
      // Update user profile
      updateUserProfile: (profile: Partial<UserLearningProfile>) => {
        set(state => ({
          userProfile: {
            ...state.userProfile,
            ...profile,
            lastActivity: new Date().toISOString(),
          },
        }));
      },
      
      // Reset all progress
      resetProgress: () => {
        // Move active journeys back to available with reset progress
        const resetJourneys = [...get().activeJourneys, ...get().availableJourneys].map(journey => ({
          ...journey,
          isActive: false,
          progress: 0,
          startedAt: undefined,
          completedAt: undefined,
          modules: journey.modules.map((module, index) => ({
            ...module,
            status: index === 0 ? 'available' : 'locked',
            progress: 0,
            completedAt: undefined,
            quizResults: undefined,
            content: module.content 
              ? {
                  ...module.content,
                  sections: module.content.sections.map(section => ({
                    ...section,
                    completed: false,
                  })),
                }
              : undefined,
          })),
        }));
        
        set({
          activeJourneys: [],
          availableJourneys: resetJourneys,
          userProfile: {
            ...defaultUserProfile,
            lastActivity: new Date().toISOString(),
          },
          currentModuleId: null,
        });
      },
      
      // Helper method to get a journey by ID
      getJourneyById: (journeyId: string) => {
        return [...get().activeJourneys, ...get().availableJourneys].find(j => j.id === journeyId);
      },
      
      // Helper method to get a module by ID
      getModuleById: (moduleId: string) => {
        const allJourneys = [...get().activeJourneys, ...get().availableJourneys];
        for (const journey of allJourneys) {
          const module = journey.modules.find(m => m.id === moduleId);
          if (module) return module;
        }
        return undefined;
      },
      
      // Helper method to get the journey a module belongs to
      getJourneyForModule: (moduleId: string) => {
        const allJourneys = [...get().activeJourneys, ...get().availableJourneys];
        return allJourneys.find(journey => 
          journey.modules.some(module => module.id === moduleId)
        );
      },
      
      // Helper method to get the next available module in a journey
      getNextAvailableModule: (journeyId: string) => {
        const journey = get().getJourneyById(journeyId);
        if (!journey) return undefined;
        
        return journey.modules.find(module => module.status === 'available');
      },
      
      // Helper method to get module completion percentage
      getModuleCompletion: (moduleId: string) => {
        const module = get().getModuleById(moduleId);
        return module ? module.progress : 0;
      },
      
      // Helper method to get journey completion percentage
      getJourneyCompletion: (journeyId: string) => {
        const journey = get().getJourneyById(journeyId);
        return journey ? journey.progress : 0;
      },
      
      // Helper method to get recommended modules based on user profile
      getRecommendedModules: () => {
        const { userProfile, activeJourneys } = get();
        const recommendedModules: LearningModule[] = [];
        
        // Look for available modules in active journeys that match user preferences
        for (const journey of activeJourneys) {
          if (userProfile.preferredMarkets.includes(journey.market)) {
            const userSkillLevel = userProfile.skillLevels[journey.market];
            
            // Find available modules that match the user's skill level
            const matchingModules = journey.modules.filter(module => 
              (module.status === 'available' || module.status === 'in_progress') && 
              module.difficulty === userSkillLevel
            );
            
            recommendedModules.push(...matchingModules);
          }
        }
        
        // Sort by difficulty and then by status (in_progress first)
        recommendedModules.sort((a, b) => {
          // First by status (in_progress comes first)
          if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
          if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
          
          // Then by difficulty
          const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'advanced': 2, 'expert': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
        
        return recommendedModules.slice(0, 5); // Return top 5 recommendations
      },
      
      // Helper method to get recommended journeys based on user profile
      getRecommendedJourneys: () => {
        const { userProfile, availableJourneys } = get();
        
        // Filter journeys that match user's preferred markets
        const matchingJourneys = availableJourneys.filter(journey => 
          userProfile.preferredMarkets.includes(journey.market)
        );
        
        // Sort by relevance to user preferences
        matchingJourneys.sort((a, b) => {
          // Prioritize by preferred market order
          const marketPriorityA = userProfile.preferredMarkets.indexOf(a.market);
          const marketPriorityB = userProfile.preferredMarkets.indexOf(b.market);
          return marketPriorityA - marketPriorityB;
        });
        
        return matchingJourneys;
      },
    }),
    {
      name: 'learning-journey-storage',
    }
  )
);