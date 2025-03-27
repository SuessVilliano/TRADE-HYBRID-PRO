import React, { useState, useEffect } from 'react';
import { X, ArrowRight, GraduationCap, Award, CheckCircle2, LucideIcon, Book, BarChart, Globe, Bitcoin, Lightbulb, Clock, Star, Rocket, AlertTriangle, TrendingUp, Briefcase, Brain } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

// Education category types
type MarketType = 'futures' | 'forex' | 'crypto' | 'stocks' | 'prop_firms' | 'trader_mindset';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Course structure types
interface LessonResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'exercise';
  url?: string;
  duration?: number; // in minutes
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  resources: LessonResource[];
  completed: boolean;
  quizPassed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  badge?: {
    name: string;
    icon: string;
    description: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  marketType: MarketType;
  level: ExperienceLevel;
  modules: Module[];
  points: number;
  thyCoinReward: number;
  icon: React.ReactNode;
  modules_completed: number;
  totalModules: number;
  badgeIcon?: React.ReactNode;
  completed: boolean;
}

// Icons for different course types
const courseIcons: Record<MarketType, React.ReactNode> = {
  futures: <TrendingUp className="h-5 w-5 text-amber-500" />,
  forex: <Globe className="h-5 w-5 text-blue-500" />,
  crypto: <Bitcoin className="h-5 w-5 text-purple-500" />,
  stocks: <BarChart className="h-5 w-5 text-green-500" />,
  prop_firms: <Briefcase className="h-5 w-5 text-red-500" />,
  trader_mindset: <Brain className="h-5 w-5 text-indigo-500" />
};

// Badge icons for different experience levels
const badgeIcons: Record<ExperienceLevel, React.ReactNode> = {
  beginner: <Star className="h-4 w-4 text-blue-500" />,
  intermediate: <Award className="h-4 w-4 text-green-500" />,
  advanced: <Rocket className="h-4 w-4 text-purple-500" />,
  expert: <GraduationCap className="h-4 w-4 text-amber-500" />
};

// Sample courses data
const sampleCourses: Course[] = [
  // Prop Firm Trading Course
  {
    id: 'prop-firms-beginner',
    title: 'Introduction to Prop Trading Firms',
    description: 'Learn how to leverage proprietary trading firms like Apex Trader Funding and Topstep to trade with other people\'s money (OPM).',
    marketType: 'prop_firms',
    level: 'beginner',
    modules: [
      {
        id: 'prop-basics',
        title: 'Understanding Proprietary Trading',
        description: 'Learn what prop firms are and how they enable traders to access significant capital.',
        lessons: [
          {
            id: 'prop-lesson-1',
            title: 'Prop Firms Explained',
            description: 'An introduction to proprietary trading firms and their business models.',
            duration: 20,
            resources: [
              {
                id: 'prop-resource-1',
                title: 'Prop Trading Fundamentals',
                type: 'video',
                duration: 15,
                description: 'An overview of how prop firms work and their requirements.'
              },
              {
                id: 'prop-resource-2',
                title: 'Prop Firm Quiz',
                type: 'quiz',
                description: 'Test your knowledge of prop firm basics.'
              }
            ],
            completed: false,
            quizPassed: false
          },
          {
            id: 'prop-lesson-2',
            title: 'Apex Trader Funding Overview',
            description: 'Learn about Apex Trader Funding\'s evaluation process and trading parameters.',
            duration: 25,
            resources: [
              {
                id: 'prop-resource-3',
                title: 'Apex Trader Funding Guide',
                type: 'article',
                description: 'Detailed explanation of Apex\'s rules and requirements.'
              },
              {
                id: 'prop-resource-4',
                title: 'Apex Trader Exercise',
                type: 'exercise',
                description: 'Practice trading within Apex parameters.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Prop Trader',
          icon: 'briefcase',
          description: 'Completed the basics of prop firm trading'
        }
      },
      {
        id: 'topstep-basics',
        title: 'Mastering Topstep Trading',
        description: 'Learn how to pass Topstep\'s Trading Combine and earn a funded account.',
        lessons: [
          {
            id: 'topstep-lesson-1',
            title: 'Topstep Trading Combine',
            description: 'Understanding the rules and strategies to pass the Trading Combine.',
            duration: 30,
            resources: [
              {
                id: 'topstep-resource-1',
                title: 'Trading Combine Strategy',
                type: 'video',
                duration: 20,
                description: 'Strategic approaches to pass the Trading Combine.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Topstep Expert',
          icon: 'award',
          description: 'Mastered Topstep Trading Combine strategies'
        }
      }
    ],
    points: 150,
    thyCoinReward: 75,
    icon: courseIcons.prop_firms,
    modules_completed: 0,
    totalModules: 2,
    badgeIcon: badgeIcons.beginner,
    completed: false
  },
  
  // Trader Mindset Course
  {
    id: 'mindset-beginner',
    title: 'Trader Psychology and Mindset',
    description: 'Develop the mental skills and emotional discipline required for successful trading.',
    marketType: 'trader_mindset',
    level: 'beginner',
    modules: [
      {
        id: 'trading-psychology',
        title: 'Trading Psychology Fundamentals',
        description: 'Understanding the psychological aspects of trading and how to master your emotions.',
        lessons: [
          {
            id: 'mindset-lesson-1',
            title: 'Emotional Discipline in Trading',
            description: 'Learn how to control emotions during volatile market conditions.',
            duration: 25,
            resources: [
              {
                id: 'mindset-resource-1',
                title: 'Trading Psychology Fundamentals',
                type: 'video',
                duration: 20,
                description: 'An introduction to the mental aspects of trading.'
              },
              {
                id: 'mindset-resource-2',
                title: 'Emotional Trading Quiz',
                type: 'quiz',
                description: 'Test your understanding of emotional control in trading.'
              }
            ],
            completed: false,
            quizPassed: false
          },
          {
            id: 'mindset-lesson-2',
            title: 'Developing a Trading Plan',
            description: 'Creating and sticking to a personalized trading plan.',
            duration: 30,
            resources: [
              {
                id: 'mindset-resource-3',
                title: 'Trading Plan Template',
                type: 'article',
                description: 'Step-by-step guide to creating your trading plan.'
              },
              {
                id: 'mindset-resource-4',
                title: 'Trading Plan Exercise',
                type: 'exercise',
                description: 'Create your own trading plan using the provided template.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Mind Master',
          icon: 'brain',
          description: 'Mastered the basics of trading psychology'
        }
      }
    ],
    points: 120,
    thyCoinReward: 60,
    icon: courseIcons.trader_mindset,
    modules_completed: 0,
    totalModules: 1,
    badgeIcon: badgeIcons.beginner,
    completed: false
  },
  
  // Advanced Trader Mindset Course
  {
    id: 'mindset-advanced',
    title: 'Elite Trader Psychology',
    description: 'Advanced techniques for developing professional trader mindset and becoming eligible to trade Hybrid Holdings funds.',
    marketType: 'trader_mindset',
    level: 'advanced',
    modules: [
      {
        id: 'performance-psychology',
        title: 'Peak Performance Psychology',
        description: 'Advanced techniques used by professional traders to maintain peak mental performance.',
        lessons: [
          {
            id: 'peak-lesson-1',
            title: 'Flow State Trading',
            description: 'Learn how to achieve and maintain flow state for optimal trading performance.',
            duration: 35,
            resources: [
              {
                id: 'peak-resource-1',
                title: 'Flow State Techniques',
                type: 'video',
                duration: 25,
                description: 'Advanced techniques to reach flow state during trading.'
              }
            ],
            completed: false,
            quizPassed: false
          },
          {
            id: 'peak-lesson-2',
            title: 'Trading Journal Mastery',
            description: 'Advanced journaling techniques for continuous improvement.',
            duration: 30,
            resources: [
              {
                id: 'peak-resource-2',
                title: 'Advanced Trading Journal',
                type: 'article',
                description: 'Comprehensive guide to effective trading journals.'
              },
              {
                id: 'peak-resource-3',
                title: 'Journal Analysis Exercise',
                type: 'exercise',
                description: 'Analyze trading patterns using journal data.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Elite Mindset',
          icon: 'brain',
          description: 'Mastered advanced trading psychology'
        }
      },
      {
        id: 'hybrid-holdings-prep',
        title: 'Hybrid Holdings Trader Preparation',
        description: 'Prepare for the opportunity to trade with Hybrid Holdings funds as a top-performing trader.',
        lessons: [
          {
            id: 'hybrid-lesson-1',
            title: 'Hybrid Holdings Trading Requirements',
            description: 'Understanding the performance metrics and requirements to qualify for trading Hybrid funds.',
            duration: 25,
            resources: [
              {
                id: 'hybrid-resource-1',
                title: 'Qualification Requirements',
                type: 'article',
                description: 'Detailed overview of the qualification process for Hybrid Holdings traders.'
              },
              {
                id: 'hybrid-resource-2',
                title: 'Performance Metrics Quiz',
                type: 'quiz',
                description: 'Test your understanding of required performance metrics.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Hybrid Ready',
          icon: 'rocket',
          description: 'Prepared to apply for Hybrid Holdings trading opportunities'
        }
      }
    ],
    points: 300,
    thyCoinReward: 150,
    icon: courseIcons.trader_mindset,
    modules_completed: 0,
    totalModules: 2,
    badgeIcon: badgeIcons.advanced,
    completed: false
  },
  {
    id: 'futures-beginner',
    title: 'Futures Trading Fundamentals',
    description: 'Learn the basics of futures contracts, margin requirements, and the fundamentals of futures markets.',
    marketType: 'futures',
    level: 'beginner',
    modules: [
      {
        id: 'futures-basics',
        title: 'Understanding Futures Contracts',
        description: 'Learn what futures contracts are and how they work.',
        lessons: [
          {
            id: 'futures-lesson-1',
            title: 'Introduction to Futures Markets',
            description: 'Overview of futures markets and their purpose.',
            duration: 15,
            resources: [
              {
                id: 'futures-resource-1',
                title: 'What Are Futures Contracts?',
                type: 'video',
                duration: 10,
                description: 'An introductory video explaining futures contracts.'
              },
              {
                id: 'futures-resource-2',
                title: 'Futures Markets Quiz',
                type: 'quiz',
                description: 'Test your knowledge of futures markets.'
              }
            ],
            completed: false,
            quizPassed: false
          },
          {
            id: 'futures-lesson-2',
            title: 'Contract Specifications',
            description: 'Understanding the details of futures contracts.',
            duration: 20,
            resources: [
              {
                id: 'futures-resource-3',
                title: 'Reading Contract Specifications',
                type: 'article',
                description: 'How to read and understand futures contract specifications.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Futures Explorer',
          icon: 'award',
          description: 'Completed the basics of futures trading'
        }
      }
    ],
    points: 100,
    thyCoinReward: 50,
    icon: courseIcons.futures,
    modules_completed: 0,
    totalModules: 1,
    badgeIcon: badgeIcons.beginner,
    completed: false
  },
  {
    id: 'forex-beginner',
    title: 'Introduction to Forex Trading',
    description: 'Learn the fundamentals of currency pairs, pips, and basic forex trading strategies.',
    marketType: 'forex',
    level: 'beginner',
    modules: [
      {
        id: 'forex-basics',
        title: 'Currency Pairs and Market Structure',
        description: 'Understanding major, minor, and exotic currency pairs.',
        lessons: [
          {
            id: 'forex-lesson-1',
            title: 'Currency Pairs Explained',
            description: 'Learn about different types of currency pairs and how they are quoted.',
            duration: 15,
            resources: [
              {
                id: 'forex-resource-1',
                title: 'Currency Pair Basics',
                type: 'video',
                duration: 12,
                description: 'An overview of how currency pairs work.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Currency Trader',
          icon: 'globe',
          description: 'Mastered the basics of forex trading'
        }
      }
    ],
    points: 100,
    thyCoinReward: 50,
    icon: courseIcons.forex,
    modules_completed: 0,
    totalModules: 1,
    badgeIcon: badgeIcons.beginner,
    completed: false
  },
  {
    id: 'crypto-beginner',
    title: 'Cryptocurrency Trading Basics',
    description: 'Learn about blockchain technology, cryptocurrency trading pairs, and the unique aspects of crypto markets.',
    marketType: 'crypto',
    level: 'beginner',
    modules: [
      {
        id: 'crypto-basics',
        title: 'Blockchain and Cryptocurrency Fundamentals',
        description: 'Understanding blockchain technology and how cryptocurrencies work.',
        lessons: [
          {
            id: 'crypto-lesson-1',
            title: 'Blockchain Explained',
            description: 'Learn the basics of blockchain technology and how it powers cryptocurrencies.',
            duration: 20,
            resources: [
              {
                id: 'crypto-resource-1',
                title: 'Blockchain Fundamentals',
                type: 'video',
                duration: 15,
                description: 'Visual explanation of blockchain technology.'
              }
            ],
            completed: false,
            quizPassed: false
          },
          {
            id: 'crypto-lesson-2',
            title: 'Trading THY Token',
            description: 'Learn how to trade the Trade Hybrid token and understand its utility in the ecosystem.',
            duration: 25,
            resources: [
              {
                id: 'crypto-resource-3',
                title: 'THY Token Analysis',
                type: 'article',
                description: 'Understanding THY token metrics and trading strategy.'
              },
              {
                id: 'crypto-resource-4',
                title: 'THY Token Trading Exercise',
                type: 'exercise',
                description: 'Practice trading THY tokens in a simulated environment.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Crypto Explorer',
          icon: 'bitcoin',
          description: 'Mastered the basics of cryptocurrency trading'
        }
      }
    ],
    points: 120,
    thyCoinReward: 75,
    icon: courseIcons.crypto,
    modules_completed: 0,
    totalModules: 1,
    badgeIcon: badgeIcons.beginner,
    completed: false
  },
  {
    id: 'stocks-beginner',
    title: 'Stock Market Fundamentals',
    description: 'Learn the basics of stock trading, market orders, and fundamental analysis.',
    marketType: 'stocks',
    level: 'beginner',
    modules: [
      {
        id: 'stocks-basics',
        title: 'Introduction to Stock Markets',
        description: 'Understanding how stock markets work and the basics of stock trading.',
        lessons: [
          {
            id: 'stocks-lesson-1',
            title: 'Stock Market Explained',
            description: 'Learn how stock markets function and how stocks are traded.',
            duration: 18,
            resources: [
              {
                id: 'stocks-resource-1',
                title: 'Stock Market Basics',
                type: 'video',
                duration: 15,
                description: 'An overview of stock markets and exchanges.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Stock Trader',
          icon: 'bar-chart',
          description: 'Mastered the basics of stock trading'
        }
      }
    ],
    points: 100,
    thyCoinReward: 50,
    icon: courseIcons.stocks,
    modules_completed: 0,
    totalModules: 1,
    badgeIcon: badgeIcons.beginner,
    completed: false
  },
  {
    id: 'futures-intermediate',
    title: 'Advanced Futures Trading Strategies',
    description: 'Learn advanced futures trading techniques including spread trading and hedging strategies.',
    marketType: 'futures',
    level: 'intermediate',
    modules: [
      {
        id: 'futures-advanced',
        title: 'Spread Trading Strategies',
        description: 'Understanding how to trade futures spreads.',
        lessons: [
          {
            id: 'futures-adv-lesson-1',
            title: 'Calendar Spreads',
            description: 'Learn how to trade calendar spreads in futures markets.',
            duration: 25,
            resources: [
              {
                id: 'futures-adv-resource-1',
                title: 'Calendar Spread Mechanics',
                type: 'video',
                duration: 20,
                description: 'A detailed explanation of calendar spreads.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'Futures Strategist',
          icon: 'award',
          description: 'Mastered intermediate futures trading strategies'
        }
      }
    ],
    points: 200,
    thyCoinReward: 100,
    icon: courseIcons.futures,
    modules_completed: 0,
    totalModules: 1,
    badgeIcon: badgeIcons.intermediate,
    completed: false
  },
  {
    id: 'crypto-intermediate',
    title: 'Decentralized Finance (DeFi) Trading',
    description: 'Learn how to trade and provide liquidity in DeFi protocols, including THY token staking.',
    marketType: 'crypto',
    level: 'intermediate',
    modules: [
      {
        id: 'defi-basics',
        title: 'Introduction to DeFi',
        description: 'Understanding decentralized finance and its key components.',
        lessons: [
          {
            id: 'defi-lesson-1',
            title: 'DeFi Protocols Explained',
            description: 'Learn about major DeFi protocols and how they work.',
            duration: 30,
            resources: [
              {
                id: 'defi-resource-1',
                title: 'DeFi Ecosystem Overview',
                type: 'article',
                description: 'A comprehensive guide to DeFi platforms.'
              }
            ],
            completed: false,
            quizPassed: false
          },
          {
            id: 'defi-lesson-2',
            title: 'THY Token in DeFi',
            description: 'Learn how to stake and use THY tokens in DeFi applications.',
            duration: 25,
            resources: [
              {
                id: 'defi-resource-2',
                title: 'THY Token Staking Guide',
                type: 'video',
                duration: 15,
                description: 'Step-by-step guide to staking THY tokens.'
              }
            ],
            completed: false,
            quizPassed: false
          }
        ],
        badge: {
          name: 'DeFi Explorer',
          icon: 'bitcoin',
          description: 'Mastered the basics of DeFi trading'
        }
      }
    ],
    points: 250,
    thyCoinReward: 150,
    icon: courseIcons.crypto,
    modules_completed: 0,
    totalModules: 1,
    badgeIcon: badgeIcons.intermediate,
    completed: false
  }
];

// User progress interface
interface UserProgress {
  completedCourses: string[];
  earnedBadges: string[];
  totalPoints: number;
  thyCoinBalance: number;
  level: {
    name: string;
    progress: number;
    nextLevel: string;
    pointsToNextLevel: number;
  };
}

// Sample user progress
const sampleUserProgress: UserProgress = {
  completedCourses: [],
  earnedBadges: [],
  totalPoints: 0,
  thyCoinBalance: 0,
  level: {
    name: 'Novice',
    progress: 0,
    nextLevel: 'Apprentice',
    pointsToNextLevel: 100
  }
};

// Trading Education Component
export function TradingEducation() {
  const [activeTab, setActiveTab] = useState<MarketType>('futures');
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>('beginner');
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [userProgress, setUserProgress] = useState<UserProgress>(sampleUserProgress);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  // Filter courses based on active tab and selected level
  const filteredCourses = courses.filter(
    course => course.marketType === activeTab && course.level === selectedLevel
  );
  
  // Complete a module
  const completeModule = (courseId: string, moduleId: string) => {
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id === courseId) {
          const updatedModules = course.modules.map(module => {
            if (module.id === moduleId) {
              // Mark all lessons as completed
              const updatedLessons = module.lessons.map(lesson => ({
                ...lesson,
                completed: true,
                quizPassed: true
              }));
              return {
                ...module,
                lessons: updatedLessons
              };
            }
            return module;
          });
          
          // Calculate modules completed
          const modulesCompleted = updatedModules.filter(m => 
            m.lessons.every(l => l.completed && l.quizPassed)
          ).length;
          
          // Check if all modules are completed
          const allModulesCompleted = modulesCompleted === course.totalModules;
          
          return {
            ...course,
            modules: updatedModules,
            modules_completed: modulesCompleted,
            completed: allModulesCompleted
          };
        }
        return course;
      });
    });
    
    // Update user progress
    if (!userProgress.earnedBadges.includes(moduleId)) {
      const module = courses.find(c => c.id === courseId)?.modules.find(m => m.id === moduleId);
      if (module?.badge) {
        setUserProgress(prev => ({
          ...prev,
          earnedBadges: [...prev.earnedBadges, moduleId],
          totalPoints: prev.totalPoints + 50, // Points for completing a module
        }));
      }
    }
  };
  
  // Complete a course
  const completeCourse = (courseId: string) => {
    // Find the course
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    // Mark all modules and lessons as completed
    setCourses(prevCourses => {
      return prevCourses.map(c => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map(module => {
            const updatedLessons = module.lessons.map(lesson => ({
              ...lesson,
              completed: true,
              quizPassed: true
            }));
            return {
              ...module,
              lessons: updatedLessons
            };
          });
          
          return {
            ...c,
            modules: updatedModules,
            modules_completed: c.totalModules,
            completed: true
          };
        }
        return c;
      });
    });
    
    // Update user progress if course not already completed
    if (!userProgress.completedCourses.includes(courseId)) {
      setUserProgress(prev => ({
        ...prev,
        completedCourses: [...prev.completedCourses, courseId],
        totalPoints: prev.totalPoints + course.points,
        thyCoinBalance: prev.thyCoinBalance + course.thyCoinReward,
        level: {
          ...prev.level,
          progress: Math.min((prev.level.progress + course.points / prev.level.pointsToNextLevel * 100), 100)
        }
      }));
      
      // Show completion notification
      // In a real application, you would show a more elaborate notification
      alert(`Congratulations! You've completed the "${course.title}" course and earned ${course.thyCoinReward} THY Coins!`);
    }
  };
  
  // Reset course view
  const resetView = () => {
    setSelectedCourse(null);
    setSelectedModule(null);
    setSelectedLesson(null);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Trading Education Hub</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={resetView} className={cn(!selectedCourse && "opacity-0 pointer-events-none")}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* User Progress Summary */}
      <Card className="mb-6">
        <CardHeader className="py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Your Trading Journey</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>Level: {userProgress.level.name}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Progress to Next Level</p>
              <div className="flex items-center gap-3">
                <Progress value={userProgress.level.progress} className="h-2" />
                <span className="text-sm font-medium">{Math.round(userProgress.level.progress)}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{userProgress.level.pointsToNextLevel - (userProgress.totalPoints % userProgress.level.pointsToNextLevel)} points to {userProgress.level.nextLevel}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Points</p>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="text-xl font-semibold">{userProgress.totalPoints}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{userProgress.completedCourses.length} courses completed</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">THY Coins Earned</p>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.168 6.123c-.894.29-1.606 1.13-1.917 2.123C5.084 8.827 5 9.399 5 10c0 .601.084 1.173.251 1.754.311.993 1.023 1.833 1.917 2.123.724.235 1.493.346 2.27.33.777.015 1.546-.095 2.27-.33.894-.29 1.606-1.13 1.917-2.123.167-.581.251-1.153.251-1.754 0-.601-.084-1.173-.251-1.754-.311-.993-1.023-1.833-1.917-2.123-.724-.235-1.493-.346-2.27-.33-.777-.015-1.546.095-2.27.33z"/>
                </svg>
                <span className="text-xl font-semibold">{userProgress.thyCoinBalance}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Redeemable for rewards & giveaways</p>
            </div>
          </div>
          
          {/* Badges Showcase */}
          {userProgress.earnedBadges.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Earned Badges:</p>
              <div className="flex flex-wrap gap-2">
                {userProgress.earnedBadges.map(badgeId => {
                  const courseWithBadge = courses.find(c => 
                    c.modules.some(m => m.id === badgeId)
                  );
                  const badge = courseWithBadge?.modules.find(m => m.id === badgeId)?.badge;
                  
                  if (!badge) return null;
                  
                  return (
                    <Badge key={badgeId} variant="outline" className="flex items-center gap-1 py-1 px-3">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span>{badge.name}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Course Selection View */}
      {!selectedCourse ? (
        <>
          {/* Market Type Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MarketType)} className="mb-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="futures" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>Futures</span>
              </TabsTrigger>
              <TabsTrigger value="forex" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Forex</span>
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-1">
                <Bitcoin className="h-4 w-4" />
                <span>Crypto</span>
              </TabsTrigger>
              <TabsTrigger value="stocks" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                <span>Stocks</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Experience Level Filter */}
            <div className="flex gap-2 my-4">
              <Button 
                variant={selectedLevel === 'beginner' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSelectedLevel('beginner')}
                className="flex items-center gap-1"
              >
                {badgeIcons.beginner}
                <span>Beginner</span>
              </Button>
              <Button 
                variant={selectedLevel === 'intermediate' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSelectedLevel('intermediate')}
                className="flex items-center gap-1"
              >
                {badgeIcons.intermediate}
                <span>Intermediate</span>
              </Button>
              <Button 
                variant={selectedLevel === 'advanced' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSelectedLevel('advanced')}
                className="flex items-center gap-1"
              >
                {badgeIcons.advanced}
                <span>Advanced</span>
              </Button>
              <Button 
                variant={selectedLevel === 'expert' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setSelectedLevel('expert')}
                className="flex items-center gap-1"
              >
                {badgeIcons.expert}
                <span>Expert</span>
              </Button>
            </div>
            
            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <Card key={course.id} className={cn("cursor-pointer transition-all hover:shadow-md", course.completed && "border-green-500")}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {course.icon}
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          {course.badgeIcon}
                          <span className="text-xs">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                        </div>
                      </div>
                      {course.completed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{course.modules_completed}/{course.totalModules} modules</span>
                        </div>
                        <Progress value={(course.modules_completed / course.totalModules) * 100} className="h-1.5" />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        <span>{course.points} points</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <svg className="h-3.5 w-3.5 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.168 6.123c-.894.29-1.606 1.13-1.917 2.123C5.084 8.827 5 9.399 5 10c0 .601.084 1.173.251 1.754.311.993 1.023 1.833 1.917 2.123.724.235 1.493.346 2.27.33.777.015 1.546-.095 2.27-.33.894-.29 1.606-1.13 1.917-2.123.167-.581.251-1.153.251-1.754 0-.601-.084-1.173-.251-1.754-.311-.993-1.023-1.833-1.917-2.123-.724-.235-1.493-.346-2.27-.33-.777-.015-1.546.095-2.27.33z"/>
                        </svg>
                        <span>{course.thyCoinReward} THY</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedCourse(course)}
                      >
                        {course.completed ? 'Review Course' : 'Start Learning'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                  <Book className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
                  <h3 className="text-lg font-medium">No courses available yet</h3>
                  <p className="text-sm text-muted-foreground">We're working on adding {selectedLevel} level courses for {activeTab} trading.</p>
                </div>
              )}
            </div>
          </Tabs>
        </>
      ) : (
        <>
          {/* Course Detail View */}
          <div className="mb-4 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetView} className="gap-1">
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Back to Courses</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-1">
              {courseIcons[selectedCourse.marketType]}
              <span className="font-medium">{selectedCourse.title}</span>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedCourse.icon}
                    {selectedCourse.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{selectedCourse.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className="mb-2 flex items-center gap-1">
                    {selectedCourse.badgeIcon}
                    <span>{selectedCourse.level.charAt(0).toUpperCase() + selectedCourse.level.slice(1)} Level</span>
                  </Badge>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span>{selectedCourse.points} points</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7.168 6.123c-.894.29-1.606 1.13-1.917 2.123C5.084 8.827 5 9.399 5 10c0 .601.084 1.173.251 1.754.311.993 1.023 1.833 1.917 2.123.724.235 1.493.346 2.27.33.777.015 1.546-.095 2.27-.33.894-.29 1.606-1.13 1.917-2.123.167-.581.251-1.153.251-1.754 0-.601-.084-1.173-.251-1.754-.311-.993-1.023-1.833-1.917-2.123-.724-.235-1.493-.346-2.27-.33-.777-.015-1.546.095-2.27.33z"/>
                      </svg>
                      <span>{selectedCourse.thyCoinReward} THY</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Course Progress</span>
                  <span>{selectedCourse.modules_completed}/{selectedCourse.totalModules} modules</span>
                </div>
                <Progress value={(selectedCourse.modules_completed / selectedCourse.totalModules) * 100} className="h-2" />
              </div>
              
              {/* Course Modules */}
              <h3 className="text-lg font-medium mb-3">Course Modules</h3>
              <Accordion type="single" collapsible className="mb-4">
                {selectedCourse.modules.map((module, index) => {
                  const allLessonsCompleted = module.lessons.every(lesson => lesson.completed && lesson.quizPassed);
                  
                  return (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2 text-left">
                          <span className="inline-flex items-center justify-center rounded-full bg-muted w-6 h-6 text-sm">
                            {index + 1}
                          </span>
                          <span>{module.title}</span>
                          {allLessonsCompleted && (
                            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                        <div className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="pl-8 border-l-2 border-muted py-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center rounded-full bg-muted w-5 h-5 text-xs">
                                      {lessonIndex + 1}
                                    </span>
                                    {lesson.title}
                                    {lesson.completed && lesson.quizPassed && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{lesson.duration} min</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Button 
                                  size="sm" 
                                  variant={lesson.completed ? "outline" : "default"}
                                  className="text-xs h-7 px-2"
                                  onClick={() => setSelectedLesson(lesson)}
                                >
                                  {lesson.completed ? 'Review' : 'Start'} Lesson
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Module completion button */}
                        <div className="mt-4 pl-8">
                          <Button
                            onClick={() => completeModule(selectedCourse.id, module.id)}
                            variant={allLessonsCompleted ? "outline" : "default"}
                            disabled={allLessonsCompleted}
                          >
                            {allLessonsCompleted ? 'Module Completed' : 'Complete Module (Demo)'}
                          </Button>
                          {module.badge && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Award className="h-4 w-4 text-amber-500" />
                              <span>Earn the "{module.badge.name}" badge by completing this module</span>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              
              {/* Complete Course Button */}
              <div className="flex justify-center mt-6">
                <Button 
                  size="lg"
                  variant={selectedCourse.completed ? "outline" : "default"}
                  onClick={() => completeCourse(selectedCourse.id)}
                  disabled={selectedCourse.completed}
                  className={cn("px-8", selectedCourse.completed && "bg-green-50 text-green-700 hover:bg-green-50")}
                >
                  {selectedCourse.completed ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Course Completed
                    </span>
                  ) : (
                    'Complete Course (Demo)'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium">{selectedLesson.title}</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLesson(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground mb-4">{selectedLesson.description}</p>
              
              {/* Lesson Resources */}
              <h4 className="font-medium mb-2">Lesson Resources</h4>
              <div className="space-y-3 mb-6">
                {selectedLesson.resources.map(resource => (
                  <Card key={resource.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded">
                            {resource.type === 'video' && <Play className="h-5 w-5 text-primary" />}
                            {resource.type === 'article' && <FileText className="h-5 w-5 text-primary" />}
                            {resource.type === 'quiz' && <HelpCircle className="h-5 w-5 text-primary" />}
                            {resource.type === 'exercise' && <Dumbbell className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {resource.duration && (
                            <>
                              <Clock className="h-3.5 w-3.5" />
                              <span>{resource.duration} min</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button size="sm" variant="outline">
                          {resource.type === 'video' && 'Watch Video'}
                          {resource.type === 'article' && 'Read Article'}
                          {resource.type === 'quiz' && 'Take Quiz'}
                          {resource.type === 'exercise' && 'Start Exercise'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setSelectedLesson(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Mark lesson as completed
                  setCourses(prevCourses => {
                    return prevCourses.map(course => {
                      if (course.id === selectedCourse?.id) {
                        const updatedModules = course.modules.map(module => {
                          const updatedLessons = module.lessons.map(lesson => {
                            if (lesson.id === selectedLesson.id) {
                              return {
                                ...lesson,
                                completed: true,
                                quizPassed: true
                              };
                            }
                            return lesson;
                          });
                          return {
                            ...module,
                            lessons: updatedLessons
                          };
                        });
                        
                        // Recalculate course completion
                        const modulesCompleted = updatedModules.filter(m => 
                          m.lessons.every(l => l.completed && l.quizPassed)
                        ).length;
                        
                        return {
                          ...course,
                          modules: updatedModules,
                          modules_completed: modulesCompleted,
                          completed: modulesCompleted === course.totalModules
                        };
                      }
                      return course;
                    });
                  });
                  
                  // Close lesson modal
                  setSelectedLesson(null);
                }}>
                  Complete Lesson (Demo)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Play, FileText, HelpCircle, Dumbbell } from 'lucide-react';

// This button can be used to show the Trading Education component
export function ShowTradingEducationButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-1"
      size="sm"
    >
      <GraduationCap className="h-4 w-4 text-primary" />
      <span>Trading Education</span>
    </Button>
  );
}