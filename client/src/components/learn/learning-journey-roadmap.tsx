import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { PopupContainer } from '../ui/popup-container';
import { useUserStore } from '../../lib/stores/useUserStore';
import { Badge } from '../ui/badge';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  lessons: number;
  progress: number;
  badgeTitle: string;
  topics: string[];
  isUnlocked: boolean;
  prereqIds?: string[];
}

export function LearningJourneyRoadmap() {
  const { isAuthenticated, user } = useUserStore();
  
  // Example modules data (in a real application, this would come from an API)
  const modules: Module[] = [
    {
      id: 'crypto-basics',
      title: 'Cryptocurrency Fundamentals',
      description: 'Master the essentials of blockchain technology, cryptocurrency markets, and basic trading principles.',
      duration: '4 hours',
      level: 'Beginner',
      lessons: 6,
      progress: isAuthenticated ? 85 : 0,
      badgeTitle: 'Crypto Pioneer',
      topics: ['Blockchain', 'Bitcoin', 'Market Structure', 'Wallets', 'Exchanges'],
      isUnlocked: true,
    },
    {
      id: 'technical-analysis',
      title: 'Technical Analysis for Crypto',
      description: 'Learn to read charts, identify patterns, and use technical indicators for better crypto trading decisions.',
      duration: '6 hours',
      level: 'Intermediate',
      lessons: 8,
      progress: isAuthenticated ? 40 : 0,
      badgeTitle: 'Chart Master',
      topics: ['Candlesticks', 'Support/Resistance', 'Moving Averages', 'Oscillators', 'Volume Analysis'],
      isUnlocked: isAuthenticated,
      prereqIds: ['crypto-basics']
    },
    {
      id: 'trading-strategies',
      title: 'Crypto Trading Strategies',
      description: 'Discover powerful trading strategies specifically designed for volatile cryptocurrency markets.',
      duration: '5 hours',
      level: 'Intermediate',
      lessons: 7,
      progress: isAuthenticated ? 10 : 0,
      badgeTitle: 'Strategy Expert',
      topics: ['Trend Following', 'Range Trading', 'Breakout Trading', 'Scalping', 'Position Sizing'],
      isUnlocked: isAuthenticated,
      prereqIds: ['technical-analysis']
    },
    {
      id: 'risk-management',
      title: 'Advanced Risk Management',
      description: 'Master the art of preserving capital through advanced risk management techniques for crypto traders.',
      duration: '3 hours',
      level: 'Advanced',
      lessons: 5,
      progress: isAuthenticated ? 0 : 0,
      badgeTitle: 'Risk Guardian',
      topics: ['Position Sizing', 'Stop Loss Strategies', 'Portfolio Management', 'Drawdown Control'],
      isUnlocked: isAuthenticated,
      prereqIds: ['trading-strategies']
    },
    {
      id: 'defi-advanced',
      title: 'DeFi and Advanced Crypto',
      description: 'Explore decentralized finance, yield farming, liquidity provision and advanced crypto concepts.',
      duration: '8 hours',
      level: 'Advanced',
      lessons: 10,
      progress: isAuthenticated ? 0 : 0,
      badgeTitle: 'DeFi Explorer',
      topics: ['Smart Contracts', 'DEXs', 'Yield Farming', 'Liquidity Mining', 'Tokenomics', 'NFTs'],
      isUnlocked: isAuthenticated,
      prereqIds: ['risk-management']
    },
    {
      id: 'solana-ecosystem',
      title: 'Solana Ecosystem Deep Dive',
      description: 'Immerse yourself in the Solana ecosystem, understanding its unique advantages and opportunities.',
      duration: '5 hours',
      level: 'Advanced',
      lessons: 7,
      progress: isAuthenticated ? 0 : 0,
      badgeTitle: 'Solana Expert',
      topics: ['Solana Architecture', 'SOL Trading', 'Solana DApps', 'Solana NFTs', 'SPL Tokens'],
      isUnlocked: isAuthenticated,
      prereqIds: ['defi-advanced']
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid gap-10">
        {modules.map((module, index) => (
          <RoadmapModule 
            key={module.id}
            module={module}
            index={index}
            isLast={index === modules.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface RoadmapModuleProps {
  module: Module;
  index: number;
  isLast: boolean;
}

function RoadmapModule({ module, index, isLast }: RoadmapModuleProps) {
  const isEvenIndex = index % 2 === 0;
  const alignmentClass = isEvenIndex ? 'md:ml-0 md:mr-auto' : 'md:ml-auto md:mr-0';
  
  return (
    <div className="relative">
      {/* Connection line */}
      {!isLast && (
        <div className="absolute left-[1.5rem] top-[5.5rem] bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 md:left-1/2 md:-ml-0.5"></div>
      )}
      
      {/* Module step indicator */}
      <div className="absolute left-0 top-5 md:left-1/2 md:-ml-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center z-10 border-2 border-slate-800">
        <span className="text-white font-medium">{index + 1}</span>
      </div>
      
      {/* Module card */}
      <div className={`ml-14 md:w-5/12 ${alignmentClass}`}>
        <PopupContainer padding className="relative h-full">
          {/* Level badge */}
          <Badge className={`absolute top-3 right-3 
            ${module.level === 'Beginner' ? 'bg-green-600' : 
              module.level === 'Intermediate' ? 'bg-blue-600' : 'bg-purple-600'}`}
          >
            {module.level}
          </Badge>
          
          <h3 className="text-xl font-bold mb-1 mt-2 pr-20">{module.title}</h3>
          
          {/* Badge award */}
          <div className="flex items-center mb-3 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-slate-300">Earn the <span className="text-yellow-500">{module.badgeTitle}</span> badge</span>
          </div>
          
          <p className="text-slate-300 mb-3 text-sm">{module.description}</p>
          
          {/* Module details */}
          <div className="bg-slate-800/50 p-3 rounded-md mb-4 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-slate-400">Duration</div>
              <div>{module.duration}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Lessons</div>
              <div>{module.lessons}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Progress</div>
              <div className="flex items-center">
                <div className="h-2 w-16 bg-slate-700 rounded-full mr-2 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${module.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs">{module.progress}%</span>
              </div>
            </div>
          </div>
          
          {/* Topics */}
          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-2">Topics covered:</div>
            <div className="flex flex-wrap gap-1">
              {module.topics.map((topic, i) => (
                <span key={i} className="bg-slate-800 px-2 py-1 rounded-full text-xs">
                  {topic}
                </span>
              ))}
            </div>
          </div>
          
          {/* Action button */}
          {module.isUnlocked ? (
            <Link to={`/learn/module/${module.id}`} className="block w-full">
              <Button 
                className={`w-full ${module.progress > 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                variant={module.progress > 0 ? 'default' : 'outline'}
              >
                {module.progress === 0 ? 'Start Module' : 
                  module.progress === 100 ? 'Review Complete Module' : 'Continue Learning'}
              </Button>
            </Link>
          ) : (
            <div className="w-full">
              <Button 
                variant="outline" 
                className="w-full opacity-70" 
                disabled
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Complete Previous Module
              </Button>
            </div>
          )}
        </PopupContainer>
      </div>
    </div>
  );
}