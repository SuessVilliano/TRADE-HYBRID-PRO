import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ExperienceLevel, LearningAssessmentResult, TopicInterest } from './learning-assessment';
import { CheckCircle2, BookOpen, Clock, ChevronRight, Star, Lock } from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: ExperienceLevel;
  topics: TopicInterest[];
  completed: boolean;
  locked: boolean;
  prerequisites: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: LearningModule[];
  experienceLevel: ExperienceLevel;
  topics: TopicInterest[];
}

// Sample learning paths based on experience level and topics
const learningPaths: LearningPath[] = [
  // Beginner Paths
  {
    id: 'beginner-technical',
    title: 'Technical Analysis Fundamentals',
    description: 'Learn the basics of chart reading and technical analysis concepts',
    experienceLevel: 'beginner',
    topics: ['technical-analysis'],
    modules: [
      {
        id: 'b-tech-1',
        title: 'Understanding Price Charts',
        description: 'Learn about different chart types and how to read them',
        duration: 30,
        difficulty: 'beginner',
        topics: ['technical-analysis'],
        completed: false,
        locked: false,
        prerequisites: []
      },
      {
        id: 'b-tech-2',
        title: 'Support and Resistance',
        description: 'Identify key price levels that act as barriers',
        duration: 45,
        difficulty: 'beginner',
        topics: ['technical-analysis'],
        completed: false,
        locked: true,
        prerequisites: ['b-tech-1']
      },
      {
        id: 'b-tech-3',
        title: 'Trend Lines and Channels',
        description: 'How to draw and use trend lines for better analysis',
        duration: 60,
        difficulty: 'beginner',
        topics: ['technical-analysis'],
        completed: false,
        locked: true,
        prerequisites: ['b-tech-2']
      }
    ]
  },
  {
    id: 'beginner-crypto',
    title: 'Cryptocurrency Basics',
    description: 'Learn the fundamentals of cryptocurrencies and blockchain technology',
    experienceLevel: 'beginner',
    topics: ['crypto'],
    modules: [
      {
        id: 'b-crypto-1',
        title: 'What is Blockchain Technology?',
        description: 'Understand the underlying technology behind cryptocurrencies',
        duration: 45,
        difficulty: 'beginner',
        topics: ['crypto'],
        completed: false,
        locked: false,
        prerequisites: []
      },
      {
        id: 'b-crypto-2',
        title: 'Major Cryptocurrencies Explained',
        description: 'Learn about Bitcoin, Ethereum, and other important cryptocurrencies',
        duration: 60,
        difficulty: 'beginner',
        topics: ['crypto'],
        completed: false,
        locked: true,
        prerequisites: ['b-crypto-1']
      },
      {
        id: 'b-crypto-3',
        title: 'Setting Up a Crypto Wallet',
        description: 'How to securely store and manage your cryptocurrencies',
        duration: 30,
        difficulty: 'beginner',
        topics: ['crypto'],
        completed: false,
        locked: true,
        prerequisites: ['b-crypto-2']
      }
    ]
  },
  {
    id: 'beginner-risk',
    title: 'Risk Management Essentials',
    description: 'Learn how to protect your capital and manage trading risks',
    experienceLevel: 'beginner',
    topics: ['risk-management'],
    modules: [
      {
        id: 'b-risk-1',
        title: 'Understanding Risk-Reward Ratio',
        description: 'How to balance potential gains against potential losses',
        duration: 30,
        difficulty: 'beginner',
        topics: ['risk-management'],
        completed: false,
        locked: false,
        prerequisites: []
      },
      {
        id: 'b-risk-2',
        title: 'Position Sizing Basics',
        description: 'How to determine the right amount to invest in each trade',
        duration: 45,
        difficulty: 'beginner',
        topics: ['risk-management'],
        completed: false,
        locked: true,
        prerequisites: ['b-risk-1']
      },
      {
        id: 'b-risk-3',
        title: 'Stop Loss Strategies',
        description: 'Using stop losses to limit potential losses',
        duration: 45,
        difficulty: 'beginner',
        topics: ['risk-management'],
        completed: false,
        locked: true,
        prerequisites: ['b-risk-2']
      }
    ]
  },

  // Intermediate Paths
  {
    id: 'intermediate-technical',
    title: 'Advanced Chart Patterns',
    description: 'Master complex chart patterns and indicators for better trading decisions',
    experienceLevel: 'intermediate',
    topics: ['technical-analysis'],
    modules: [
      {
        id: 'i-tech-1',
        title: 'Continuation Patterns',
        description: 'Identify flags, pennants, and other continuation patterns',
        duration: 60,
        difficulty: 'intermediate',
        topics: ['technical-analysis'],
        completed: false,
        locked: false,
        prerequisites: []
      },
      {
        id: 'i-tech-2',
        title: 'Reversal Patterns',
        description: 'Learn about head and shoulders, double tops/bottoms, and more',
        duration: 75,
        difficulty: 'intermediate',
        topics: ['technical-analysis'],
        completed: false,
        locked: true,
        prerequisites: ['i-tech-1']
      },
      {
        id: 'i-tech-3',
        title: 'Fibonacci Retracement Levels',
        description: 'How to use Fibonacci levels for entry and exit points',
        duration: 90,
        difficulty: 'intermediate',
        topics: ['technical-analysis'],
        completed: false,
        locked: true,
        prerequisites: ['i-tech-2']
      }
    ]
  },
  {
    id: 'intermediate-forex',
    title: 'Forex Market Mastery',
    description: 'Develop skills for trading in the foreign exchange market',
    experienceLevel: 'intermediate',
    topics: ['forex'],
    modules: [
      {
        id: 'i-forex-1',
        title: 'Understanding Currency Pairs',
        description: 'Learn about major, minor, and exotic currency pairs',
        duration: 60,
        difficulty: 'intermediate',
        topics: ['forex'],
        completed: false,
        locked: false,
        prerequisites: []
      },
      {
        id: 'i-forex-2',
        title: 'Economic Indicators for Forex',
        description: 'How economic data affects currency markets',
        duration: 75,
        difficulty: 'intermediate',
        topics: ['forex'],
        completed: false,
        locked: true,
        prerequisites: ['i-forex-1']
      },
      {
        id: 'i-forex-3',
        title: 'Carry Trade Strategy',
        description: 'Learn about interest rate differentials in forex trading',
        duration: 60,
        difficulty: 'intermediate',
        topics: ['forex'],
        completed: false,
        locked: true,
        prerequisites: ['i-forex-2']
      }
    ]
  },
  
  // Advanced Paths
  {
    id: 'advanced-options',
    title: 'Advanced Options Strategies',
    description: 'Master complex options trading techniques and strategies',
    experienceLevel: 'advanced',
    topics: ['options'],
    modules: [
      {
        id: 'a-options-1',
        title: 'Multi-Leg Options Strategies',
        description: 'Learn about spreads, straddles, strangles, and more',
        duration: 90,
        difficulty: 'advanced',
        topics: ['options'],
        completed: false,
        locked: false,
        prerequisites: []
      },
      {
        id: 'a-options-2',
        title: 'Volatility Trading with Options',
        description: 'How to profit from market volatility using options',
        duration: 120,
        difficulty: 'advanced',
        topics: ['options'],
        completed: false,
        locked: true,
        prerequisites: ['a-options-1']
      },
      {
        id: 'a-options-3',
        title: 'Options for Portfolio Protection',
        description: 'Using options as hedging instruments',
        duration: 90,
        difficulty: 'advanced',
        topics: ['options'],
        completed: false,
        locked: true,
        prerequisites: ['a-options-2']
      }
    ]
  },
  {
    id: 'advanced-trading-psychology',
    title: 'Elite Trading Psychology',
    description: 'Master the mental aspects of trading for consistent performance',
    experienceLevel: 'advanced',
    topics: ['trading-psychology'],
    modules: [
      {
        id: 'a-psych-1',
        title: 'Cognitive Biases in Trading',
        description: 'Identify and overcome psychological biases that affect decisions',
        duration: 60,
        difficulty: 'advanced',
        topics: ['trading-psychology'],
        completed: false,
        locked: false,
        prerequisites: []
      },
      {
        id: 'a-psych-2',
        title: 'Developing a Trading Journal',
        description: 'Create an effective journal for self-improvement',
        duration: 45,
        difficulty: 'advanced',
        topics: ['trading-psychology'],
        completed: false,
        locked: true,
        prerequisites: ['a-psych-1']
      },
      {
        id: 'a-psych-3',
        title: 'Peak Performance Techniques',
        description: 'Mental strategies used by elite traders',
        duration: 90,
        difficulty: 'advanced',
        topics: ['trading-psychology'],
        completed: false,
        locked: true,
        prerequisites: ['a-psych-2']
      }
    ]
  }
];

interface LearningRoadmapProps {
  assessment: LearningAssessmentResult;
}

export function LearningRoadmap({ assessment }: LearningRoadmapProps) {
  const { experienceLevel, topicInterests, availableTime } = assessment;

  // Filter learning paths based on user preferences
  const recommendedPaths = learningPaths.filter(path => {
    // Match experience level
    const matchesExperience = path.experienceLevel === experienceLevel;
    
    // Check if any of the path topics match user interests
    const matchesTopics = path.topics.some(topic => 
      topicInterests.includes(topic)
    );
    
    return matchesExperience && matchesTopics;
  });

  // Fallback if no perfect matches
  const alternativePaths = learningPaths.filter(path => {
    // If experience level doesn't match but topics do
    return topicInterests.some(interest => path.topics.includes(interest));
  }).filter(path => !recommendedPaths.includes(path));

  // Calculate overall progress for a path
  const calculatePathProgress = (modules: LearningModule[]) => {
    if (modules.length === 0) return 0;
    const completedCount = modules.filter(m => m.completed).length;
    return (completedCount / modules.length) * 100;
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: ExperienceLevel) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  // Format time display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Trading Learning Roadmap</h1>
        <p className="text-muted-foreground">
          Customized learning paths based on your experience level ({experienceLevel})
          and interests in {topicInterests.join(', ')}.
        </p>
      </div>

      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="recommended">Recommended Paths</TabsTrigger>
          <TabsTrigger value="alternative">Alternative Paths</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {recommendedPaths.length > 0 ? (
            recommendedPaths.map(path => (
              <Card key={path.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(path.experienceLevel)}>
                      {path.experienceLevel}
                    </Badge>
                  </div>
                  <Progress value={calculatePathProgress(path.modules)} className="h-2 mt-2" />
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium mb-2">Modules:</h3>
                  <div className="space-y-3">
                    {path.modules.map(module => (
                      <div key={module.id} className={`p-3 border rounded-md ${module.locked ? 'opacity-70' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {module.completed ? (
                              <CheckCircle2 size={18} className="text-green-500" />
                            ) : module.locked ? (
                              <Lock size={18} className="text-muted-foreground" />
                            ) : (
                              <BookOpen size={18} className="text-primary" />
                            )}
                            <span className="font-medium">{module.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{formatDuration(module.duration)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={module.locked}
                            className="gap-1"
                          >
                            {module.completed ? 'Review' : 'Start'} <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Recommended Paths</CardTitle>
                <CardDescription>
                  We couldn't find learning paths that exactly match your preferences. 
                  Check the alternative paths tab for other options.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alternative" className="space-y-6">
          {alternativePaths.length > 0 ? (
            alternativePaths.map(path => (
              <Card key={path.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(path.experienceLevel)}>
                      {path.experienceLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium mb-2">Top Modules:</h3>
                  <div className="space-y-3">
                    {path.modules.slice(0, 2).map(module => (
                      <div key={module.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-primary" />
                            <span className="font-medium">{module.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{formatDuration(module.duration)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      </div>
                    ))}
                    <Button className="w-full mt-2">Explore Path</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Alternative Paths</CardTitle>
                <CardDescription>
                  There are no additional learning paths available at this time.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Progress</CardTitle>
              <CardDescription>
                Track your progress across all learning paths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningPaths
                  .filter(path => path.modules.some(m => m.completed))
                  .map(path => (
                    <div key={path.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{path.title}</h3>
                        <span className="text-sm">
                          {path.modules.filter(m => m.completed).length}/{path.modules.length} modules
                        </span>
                      </div>
                      <Progress value={calculatePathProgress(path.modules)} className="h-2" />
                    </div>
                  ))}
                
                {!learningPaths.some(path => path.modules.some(m => m.completed)) && (
                  <div className="text-center py-6">
                    <Star className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No progress yet</h3>
                    <p className="text-muted-foreground">
                      Start a learning module to track your progress
                    </p>
                    <Button className="mt-4">Explore Learning Paths</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}