import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { useUserStore } from '../lib/stores/useUserStore';

interface LessonResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'exercise';
  description: string;
  content?: string;
  videoUrl?: string;
  duration?: string;
  completed: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  resources: LessonResource[];
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  badgeTitle: string;
  lessons: Lesson[];
  progress: number;
  topics: string[];
}

export default function LearningModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const { isAuthenticated } = useUserStore();
  
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  
  // This would be fetched from an API in a real application
  const mockModule: Module = {
    id: moduleId || 'crypto-basics',
    title: moduleId === 'crypto-basics' ? 'Cryptocurrency Fundamentals' :
           moduleId === 'technical-analysis' ? 'Technical Analysis for Crypto' :
           moduleId === 'trading-strategies' ? 'Crypto Trading Strategies' :
           moduleId === 'risk-management' ? 'Advanced Risk Management' :
           moduleId === 'defi-advanced' ? 'DeFi and Advanced Crypto' :
           moduleId === 'solana-ecosystem' ? 'Solana Ecosystem Deep Dive' : 'Module Not Found',
    description: 'Master the essentials of blockchain technology, cryptocurrency markets, and basic trading principles.',
    duration: '4 hours',
    level: moduleId === 'crypto-basics' ? 'Beginner' :
           moduleId === 'technical-analysis' || moduleId === 'trading-strategies' ? 'Intermediate' : 'Advanced',
    badgeTitle: moduleId === 'crypto-basics' ? 'Crypto Pioneer' :
                moduleId === 'technical-analysis' ? 'Chart Master' :
                moduleId === 'trading-strategies' ? 'Strategy Expert' :
                moduleId === 'risk-management' ? 'Risk Guardian' :
                moduleId === 'defi-advanced' ? 'DeFi Explorer' :
                moduleId === 'solana-ecosystem' ? 'Solana Expert' : 'Unknown Badge',
    progress: isAuthenticated ? (moduleId === 'crypto-basics' ? 85 : 
                               moduleId === 'technical-analysis' ? 40 :
                               moduleId === 'trading-strategies' ? 10 : 0) : 0,
    topics: moduleId === 'crypto-basics' ? 
            ['Blockchain', 'Bitcoin', 'Market Structure', 'Wallets', 'Exchanges'] :
            moduleId === 'technical-analysis' ?
            ['Candlesticks', 'Support/Resistance', 'Moving Averages', 'Oscillators', 'Volume Analysis'] :
            moduleId === 'trading-strategies' ?
            ['Trend Following', 'Range Trading', 'Breakout Trading', 'Scalping', 'Position Sizing'] :
            moduleId === 'risk-management' ?
            ['Position Sizing', 'Stop Loss Strategies', 'Portfolio Management', 'Drawdown Control'] :
            moduleId === 'defi-advanced' ?
            ['Smart Contracts', 'DEXs', 'Yield Farming', 'Liquidity Mining', 'Tokenomics', 'NFTs'] :
            moduleId === 'solana-ecosystem' ?
            ['Solana Architecture', 'SOL Trading', 'Solana DApps', 'Solana NFTs', 'SPL Tokens'] :
            ['Topic 1', 'Topic 2', 'Topic 3'],
    lessons: [
      {
        id: 'lesson-1',
        title: 'Introduction to the Module',
        description: 'An overview of what you will learn in this module and why it matters.',
        order: 1,
        completed: isAuthenticated && moduleId === 'crypto-basics',
        resources: [
          {
            id: 'video-intro',
            type: 'video',
            title: 'Welcome to the Module',
            description: 'A brief introduction to the module and its objectives.',
            videoUrl: 'https://www.youtube.com/embed/VYWc9dFqROI',
            duration: '5 min',
            completed: isAuthenticated && moduleId === 'crypto-basics'
          },
          {
            id: 'article-overview',
            type: 'article',
            title: 'Module Overview',
            description: 'A detailed overview of the module structure and learning objectives.',
            content: `
              <h2>Welcome to the module!</h2>
              <p>This module will take you through the fundamental concepts that you need to understand before diving deeper into the world of cryptocurrency trading.</p>
              <p>By the end of this module, you'll be able to:</p>
              <ul>
                <li>Understand what blockchain technology is and how it works</li>
                <li>Differentiate between different types of cryptocurrencies</li>
                <li>Set up secure wallets for storing your digital assets</li>
                <li>Navigate cryptocurrency exchanges confidently</li>
                <li>Understand the basics of market structure and order types</li>
              </ul>
              <p>Let's get started on your journey to becoming a crypto trading expert!</p>
            `,
            completed: isAuthenticated && moduleId === 'crypto-basics'
          }
        ]
      },
      {
        id: 'lesson-2',
        title: 'Core Concepts',
        description: 'The essential concepts and terminology that you need to understand.',
        order: 2,
        completed: isAuthenticated && moduleId === 'crypto-basics',
        resources: [
          {
            id: 'video-concepts',
            type: 'video',
            title: 'Core Concepts Explained',
            description: 'A video explaining the core concepts and terminology.',
            videoUrl: 'https://www.youtube.com/embed/SSo_EIwHSd4',
            duration: '15 min',
            completed: isAuthenticated && moduleId === 'crypto-basics'
          },
          {
            id: 'article-glossary',
            type: 'article',
            title: 'Cryptocurrency Glossary',
            description: 'A comprehensive glossary of cryptocurrency terms.',
            content: `
              <h2>Cryptocurrency Glossary</h2>
              <p>Here are some key terms you'll need to know:</p>
              <dl>
                <dt><strong>Blockchain</strong></dt>
                <dd>A distributed ledger technology that records transactions across many computers.</dd>
                <dt><strong>Cryptocurrency</strong></dt>
                <dd>A digital or virtual currency that uses cryptography for security.</dd>
                <dt><strong>Bitcoin</strong></dt>
                <dd>The first and most well-known cryptocurrency, created in 2009.</dd>
                <dt><strong>Altcoin</strong></dt>
                <dd>Any cryptocurrency other than Bitcoin.</dd>
                <dt><strong>Wallet</strong></dt>
                <dd>A software program that stores private and public keys and interacts with blockchain.</dd>
                <dt><strong>Mining</strong></dt>
                <dd>The process of validating transactions and adding them to the blockchain.</dd>
                <dt><strong>Exchange</strong></dt>
                <dd>A platform where you can buy and sell cryptocurrencies.</dd>
                <dt><strong>Market Order</strong></dt>
                <dd>An order to buy or sell at the best available current price.</dd>
                <dt><strong>Limit Order</strong></dt>
                <dd>An order to buy or sell at a specified price or better.</dd>
              </dl>
            `,
            completed: isAuthenticated && moduleId === 'crypto-basics'
          },
          {
            id: 'quiz-concepts',
            type: 'quiz',
            title: 'Core Concepts Quiz',
            description: 'Test your understanding of the core concepts.',
            content: JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  question: 'What is a blockchain?',
                  options: [
                    'A type of cryptocurrency',
                    'A distributed ledger technology',
                    'A centralized database',
                    'A trading platform'
                  ],
                  correctAnswer: 1
                },
                {
                  id: 'q2',
                  question: 'What was the first cryptocurrency?',
                  options: [
                    'Ethereum',
                    'Ripple',
                    'Bitcoin',
                    'Litecoin'
                  ],
                  correctAnswer: 2
                },
                {
                  id: 'q3',
                  question: 'What is an altcoin?',
                  options: [
                    'A Bitcoin alternative',
                    'Any cryptocurrency other than Bitcoin',
                    'A fake cryptocurrency',
                    'A coin used for trading alt stocks'
                  ],
                  correctAnswer: 1
                }
              ]
            }),
            completed: isAuthenticated && moduleId === 'crypto-basics'
          }
        ]
      },
      {
        id: 'lesson-3',
        title: 'Practical Application',
        description: 'Apply what you have learned to real-world scenarios.',
        order: 3,
        completed: isAuthenticated && moduleId === 'crypto-basics' && Math.random() > 0.5,
        resources: [
          {
            id: 'exercise-1',
            type: 'exercise',
            title: 'Setting Up Your First Wallet',
            description: 'A step-by-step guide to setting up a cryptocurrency wallet.',
            content: `
              <h2>Setting Up Your First Wallet</h2>
              <p>In this exercise, you'll learn how to set up a secure cryptocurrency wallet.</p>
              <h3>Exercise Steps:</h3>
              <ol>
                <li>Choose a wallet type (hardware, software, paper, etc.)</li>
                <li>Download and install the wallet software</li>
                <li>Set up a secure password and backup your recovery phrase</li>
                <li>Understand the wallet interface and features</li>
                <li>Make a small test transaction</li>
              </ol>
              <p>By the end of this exercise, you should have a functioning cryptocurrency wallet that you can use to store and manage your digital assets.</p>
            `,
            completed: isAuthenticated && moduleId === 'crypto-basics' && Math.random() > 0.5
          },
          {
            id: 'video-application',
            type: 'video',
            title: 'Practical Trading Example',
            description: 'A video demonstrating a practical trading example.',
            videoUrl: 'https://www.youtube.com/embed/tuwad1r1lxo',
            duration: '20 min',
            completed: isAuthenticated && moduleId === 'crypto-basics' && Math.random() > 0.5
          }
        ]
      },
      {
        id: 'lesson-4',
        title: 'Advanced Topics',
        description: 'Dive deeper into more advanced concepts and strategies.',
        order: 4,
        completed: false,
        resources: [
          {
            id: 'article-advanced',
            type: 'article',
            title: 'Advanced Trading Concepts',
            description: 'An article covering advanced trading concepts.',
            content: `
              <h2>Advanced Trading Concepts</h2>
              <p>Now that you understand the basics, let's explore some more advanced concepts:</p>
              <h3>Market Analysis</h3>
              <p>There are two main types of market analysis:</p>
              <ul>
                <li><strong>Fundamental Analysis</strong>: Evaluating a cryptocurrency's intrinsic value by examining related economic and financial factors.</li>
                <li><strong>Technical Analysis</strong>: Using historical price charts and market statistics to identify patterns and predict future price movements.</li>
              </ul>
              <h3>Risk Management</h3>
              <p>Proper risk management is crucial for successful trading. Key principles include:</p>
              <ul>
                <li>Never invest more than you can afford to lose</li>
                <li>Use stop-loss orders to limit potential losses</li>
                <li>Diversify your portfolio</li>
                <li>Don't trade based on emotions</li>
              </ul>
              <h3>Trading Strategies</h3>
              <p>Some common trading strategies include:</p>
              <ul>
                <li><strong>Day Trading</strong>: Opening and closing positions within the same day</li>
                <li><strong>Swing Trading</strong>: Holding positions for several days to capture 'swings' in the market</li>
                <li><strong>Position Trading</strong>: Holding positions for weeks, months, or even years</li>
                <li><strong>Scalping</strong>: Making numerous trades to profit from small price changes</li>
              </ul>
            `,
            completed: false
          },
          {
            id: 'quiz-advanced',
            type: 'quiz',
            title: 'Advanced Concepts Quiz',
            description: 'Test your understanding of the advanced concepts.',
            content: JSON.stringify({
              questions: [
                {
                  id: 'q1',
                  question: 'What is fundamental analysis?',
                  options: [
                    'Analyzing price charts to predict future movements',
                    'Evaluating a cryptocurrency\'s intrinsic value',
                    'Analyzing market sentiment on social media',
                    'Testing trading strategies'
                  ],
                  correctAnswer: 1
                },
                {
                  id: 'q2',
                  question: 'Which of the following is NOT a good risk management practice?',
                  options: [
                    'Using stop-loss orders',
                    'Diversifying your portfolio',
                    'Investing more to recover losses',
                    'Only investing what you can afford to lose'
                  ],
                  correctAnswer: 2
                },
                {
                  id: 'q3',
                  question: 'What is scalping?',
                  options: [
                    'Holding positions for weeks or months',
                    'Opening and closing positions within the same day',
                    'Making numerous trades to profit from small price changes',
                    'Buying low and selling high over a long period'
                  ],
                  correctAnswer: 2
                }
              ]
            }),
            completed: false
          }
        ]
      }
    ]
  };
  
  // Set the first lesson and resource as active by default
  useEffect(() => {
    if (mockModule.lessons.length > 0) {
      setActiveLesson(mockModule.lessons[0].id);
      if (mockModule.lessons[0].resources.length > 0) {
        setActiveResource(mockModule.lessons[0].resources[0].id);
      }
    }
  }, [moduleId]);
  
  // Get the active lesson and resource
  const currentLesson = mockModule.lessons.find(lesson => lesson.id === activeLesson);
  const currentResource = currentLesson?.resources.find(resource => resource.id === activeResource);
  
  const handleSelectLesson = (lessonId: string) => {
    setActiveLesson(lessonId);
    const selectedLesson = mockModule.lessons.find(lesson => lesson.id === lessonId);
    if (selectedLesson && selectedLesson.resources.length > 0) {
      setActiveResource(selectedLesson.resources[0].id);
    } else {
      setActiveResource(null);
    }
  };
  
  const handleSelectResource = (resourceId: string) => {
    setActiveResource(resourceId);
    setShowQuizResults(false);
  };
  
  const handleQuizSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowQuizResults(true);
  };
  
  const handleQuizAnswerChange = (questionId: string, answer: string) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer
    });
  };
  
  // Calculate quiz score
  const calculateQuizScore = () => {
    if (!currentResource || currentResource.type !== 'quiz' || !currentResource.content) {
      return 0;
    }
    
    try {
      const quizContent = JSON.parse(currentResource.content);
      let correctAnswers = 0;
      
      quizContent.questions.forEach((question: any) => {
        const userAnswer = parseInt(quizAnswers[question.id] || '-1');
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      return Math.round((correctAnswers / quizContent.questions.length) * 100);
    } catch (error) {
      console.error('Error calculating quiz score:', error);
      return 0;
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/learn/journey" className="text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold">{mockModule.title}</h1>
            <Badge className={`ml-2 
              ${mockModule.level === 'Beginner' ? 'bg-green-600' : 
                mockModule.level === 'Intermediate' ? 'bg-blue-600' : 'bg-purple-600'}`}
            >
              {mockModule.level}
            </Badge>
          </div>
          <p className="text-slate-300 mt-1">{mockModule.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Module Progress:</span>
            <span className="font-medium">{mockModule.progress}%</span>
          </div>
          <Progress value={mockModule.progress} className="w-36 h-2" />
        </div>
      </div>
      
      {/* Module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lesson Navigation */}
        <div className="lg:col-span-1">
          <PopupContainer padding className="sticky top-20">
            <h2 className="text-lg font-bold mb-4">Lessons</h2>
            <div className="space-y-2">
              {mockModule.lessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  className={`cursor-pointer p-3 rounded-md transition-colors ${
                    activeLesson === lesson.id 
                      ? 'bg-blue-900/40 border border-blue-500/50' 
                      : 'border border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => handleSelectLesson(lesson.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${activeLesson === lesson.id ? 'text-blue-300' : ''}`}>
                      {lesson.order}. {lesson.title}
                    </span>
                    {lesson.completed && (
                      <span className="text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{lesson.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {lesson.resources.map((resource) => (
                      <span 
                        key={resource.id}
                        className={`w-2 h-2 rounded-full ${
                          resource.completed ? 'bg-green-500' : 'bg-slate-500'
                        }`}
                        title={resource.title}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopupContainer>
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {currentLesson && (
            <div>
              {/* Resources Tabs */}
              <Tabs defaultValue={currentResource?.id} className="w-full" onValueChange={handleSelectResource}>
                <TabsList className="mb-4">
                  {currentLesson.resources.map((resource) => (
                    <TabsTrigger key={resource.id} value={resource.id} className="px-4">
                      <div className="flex items-center gap-2">
                        {resource.type === 'video' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {resource.type === 'article' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        )}
                        {resource.type === 'quiz' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {resource.type === 'exercise' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        )}
                        {resource.title}
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* Resource Content */}
                {currentLesson.resources.map((resource) => (
                  <TabsContent key={resource.id} value={resource.id}>
                    <PopupContainer padding>
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-1">{resource.title}</h2>
                        <p className="text-slate-400">{resource.description}</p>
                      </div>
                      
                      {/* Video */}
                      {resource.type === 'video' && resource.videoUrl && (
                        <div className="aspect-video overflow-hidden rounded-lg mb-6">
                          <iframe
                            width="100%"
                            height="100%"
                            src={resource.videoUrl}
                            title={resource.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                      
                      {/* Article */}
                      {resource.type === 'article' && resource.content && (
                        <div 
                          className="prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: resource.content }}
                        ></div>
                      )}
                      
                      {/* Quiz */}
                      {resource.type === 'quiz' && resource.content && (
                        <div>
                          {!showQuizResults ? (
                            <form onSubmit={handleQuizSubmit}>
                              <div className="space-y-6">
                                {JSON.parse(resource.content).questions.map((question: any, index: number) => (
                                  <div key={question.id} className="border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-3">
                                      {index + 1}. {question.question}
                                    </h3>
                                    <div className="space-y-2">
                                      {question.options.map((option: string, optionIndex: number) => (
                                        <div key={optionIndex} className="flex items-center">
                                          <input
                                            type="radio"
                                            id={`${question.id}-${optionIndex}`}
                                            name={question.id}
                                            value={optionIndex}
                                            className="mr-2"
                                            onChange={() => handleQuizAnswerChange(question.id, optionIndex.toString())}
                                            checked={quizAnswers[question.id] === optionIndex.toString()}
                                          />
                                          <label htmlFor={`${question.id}-${optionIndex}`}>
                                            {option}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-6">
                                <Button type="submit">Submit Quiz</Button>
                              </div>
                            </form>
                          ) : (
                            <div>
                              <div className="bg-slate-800 p-6 rounded-lg mb-6">
                                <h3 className="text-xl font-bold mb-2">Quiz Results</h3>
                                <div className="flex items-center gap-4">
                                  <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center text-3xl font-bold">
                                    {calculateQuizScore()}%
                                  </div>
                                  <div>
                                    {calculateQuizScore() >= 70 ? (
                                      <div>
                                        <p className="text-green-500 font-bold mb-1">Congratulations!</p>
                                        <p className="text-slate-300">
                                          You've passed the quiz. You can now move on to the next lesson.
                                        </p>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-amber-500 font-bold mb-1">Almost there!</p>
                                        <p className="text-slate-300">
                                          You need to score at least 70% to pass this quiz. Review the material and try again.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-6">
                                {JSON.parse(resource.content).questions.map((question: any, index: number) => {
                                  const userAnswer = parseInt(quizAnswers[question.id] || '-1');
                                  const isCorrect = userAnswer === question.correctAnswer;
                                  
                                  return (
                                    <div 
                                      key={question.id} 
                                      className={`border rounded-lg p-4 ${
                                        isCorrect ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
                                      }`}
                                    >
                                      <h3 className="text-lg font-medium mb-3">
                                        {index + 1}. {question.question}
                                      </h3>
                                      <div className="space-y-2">
                                        {question.options.map((option: string, optionIndex: number) => (
                                          <div 
                                            key={optionIndex} 
                                            className={`flex items-center p-2 rounded ${
                                              optionIndex === question.correctAnswer ? 'bg-green-900/30' : 
                                              optionIndex === userAnswer && userAnswer !== question.correctAnswer ? 'bg-red-900/30' : ''
                                            }`}
                                          >
                                            <div className="mr-2">
                                              {optionIndex === question.correctAnswer ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              ) : optionIndex === userAnswer && userAnswer !== question.correctAnswer ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              ) : (
                                                <span className="h-5 w-5 block"></span>
                                              )}
                                            </div>
                                            <div>{option}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="mt-6 flex gap-3">
                                <Button onClick={() => setShowQuizResults(false)}>
                                  Retry Quiz
                                </Button>
                                {calculateQuizScore() >= 70 && (
                                  <Button variant="outline">
                                    Next Lesson
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Exercise */}
                      {resource.type === 'exercise' && resource.content && (
                        <div>
                          <div 
                            className="prose prose-invert max-w-none mb-6"
                            dangerouslySetInnerHTML={{ __html: resource.content }}
                          ></div>
                          
                          <div className="mt-6">
                            <Button>
                              Mark as Completed
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Completion state */}
                      {resource.completed && (
                        <div className="mt-6 p-3 bg-green-900/20 border border-green-500 rounded-md flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>You have completed this {resource.type}!</span>
                        </div>
                      )}
                    </PopupContainer>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              disabled={!currentLesson || currentLesson.order === 1}
              onClick={() => {
                const prevLesson = mockModule.lessons.find(l => l.order === (currentLesson?.order || 0) - 1);
                if (prevLesson) {
                  handleSelectLesson(prevLesson.id);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Lesson
            </Button>
            
            <Button
              disabled={!currentLesson || currentLesson.order === mockModule.lessons.length}
              onClick={() => {
                const nextLesson = mockModule.lessons.find(l => l.order === (currentLesson?.order || 0) + 1);
                if (nextLesson) {
                  handleSelectLesson(nextLesson.id);
                }
              }}
            >
              Next Lesson
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}