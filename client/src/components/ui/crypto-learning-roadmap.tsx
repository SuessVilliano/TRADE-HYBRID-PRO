import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PopupContainer } from '@/components/ui/popup-container';
import { 
  LearningModule, 
  MarketType, 
  DifficultyLevel,
  useLearningJourneyStore 
} from '@/lib/stores/useLearningJourneyStore';
import { Award, BookOpen, Check, ChevronRight, Layers, Lock, MoreHorizontal, AlertTriangle, Flame, Target, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CryptoLearningRoadmapProps {
  onModuleSelect?: (moduleId: string) => void;
}

export function CryptoLearningRoadmap({ onModuleSelect }: CryptoLearningRoadmapProps) {
  const navigate = useNavigate();
  const { 
    getJourneyById, 
    getModuleById,
    getJourneyForModule,
    startModule,
    startJourney,
    userProfile,
  } = useLearningJourneyStore();

  // Get the crypto journey
  const cryptoJourney = getJourneyById('crypto-journey');
  
  // State for roadmap visualization settings
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  // Toggle expanded state for a module
  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  // Functions to determine module and path styles based on status
  const getModuleClassName = (status: string, isHovered: boolean) => {
    const baseClass = "relative flex-1 p-4 rounded-md transition-all duration-200 cursor-pointer ";
    
    if (status === 'completed') {
      return baseClass + (isHovered ? "bg-green-800/50 border border-green-500" : "bg-green-900/30 border border-green-600/50");
    } else if (status === 'in_progress') {
      return baseClass + (isHovered ? "bg-blue-800/50 border border-blue-500" : "bg-blue-900/30 border border-blue-600/50");
    } else if (status === 'available') {
      return baseClass + (isHovered ? "bg-slate-800 border border-slate-600" : "bg-slate-800/70 border border-slate-700");
    } else {
      return baseClass + (isHovered ? "bg-slate-800/60 border border-slate-700/80" : "bg-slate-800/40 border border-slate-700/50");
    }
  };

  const getConnectorClassName = (status: string) => {
    const baseClass = "h-14 w-1 mx-auto ";
    
    if (status === 'completed') {
      return baseClass + "bg-gradient-to-b from-green-600 to-green-600/50";
    } else if (status === 'in_progress') {
      return baseClass + "bg-gradient-to-b from-blue-600 to-blue-600/50";
    } else if (status === 'available') {
      return baseClass + "bg-gradient-to-b from-slate-600 to-slate-600/50";
    } else {
      return baseClass + "bg-gradient-to-b from-slate-700/50 to-slate-700/20";
    }
  };

  // Function to handle clicking on a module
  const handleModuleClick = (moduleId: string) => {
    const module = getModuleById(moduleId);
    
    if (!module) {
      console.error(`Module with ID ${moduleId} not found`);
      return;
    }
    
    if (module.status === 'locked') {
      // Show prerequisites tooltip
      toggleModuleExpanded(moduleId);
    } else {
      try {
        // Navigate to module or start it
        if (onModuleSelect) {
          onModuleSelect(moduleId);
        } else {
          console.log(`Handling click for module: ${moduleId}`);
          
          // Check if the journey exists and is active
          if (!cryptoJourney) {
            console.error('Crypto journey not found');
            return;
          }
          
          // Start the journey if it's not active yet
          if (!cryptoJourney.isActive) {
            console.log('Starting crypto journey:', cryptoJourney.id);
            startJourney('crypto-journey');
            
            // Wait a bit to allow the journey to initialize
            setTimeout(() => {
              console.log('Starting module after journey activation');
              startModule(moduleId);
              navigate(`/learn/module/${moduleId}`);
            }, 300);
            return;
          }
          
          // If the journey is already active, start the module directly
          console.log('Journey already active, starting module');
          startModule(moduleId);
          
          // Wrap navigation in a try-catch to prevent uncaught errors
          navigate(`/learn/module/${moduleId}`);
        }
      } catch (error) {
        console.error('Error navigating to module:', error);
        // Show expanded view instead of crashing
        toggleModuleExpanded(moduleId);
      }
    }
  };

  // Function to get an icon based on module difficulty
  const getDifficultyIcon = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'beginner':
        return <BookOpen className="h-4 w-4 text-blue-400" />;
      case 'intermediate':
        return <Layers className="h-4 w-4 text-yellow-400" />;
      case 'advanced':
        return <Flame className="h-4 w-4 text-red-400" />;
      case 'expert':
        return <Target className="h-4 w-4 text-purple-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-400" />;
    }
  };

  // Function to render a module skill badge
  const renderSkillBadge = (skill: string) => {
    const skillColors: Record<string, string> = {
      'analysis': 'bg-blue-900/50 text-blue-300 border-blue-700',
      'trading': 'bg-green-900/50 text-green-300 border-green-700',
      'defi': 'bg-purple-900/50 text-purple-300 border-purple-700',
      'risk': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
      'fundamentals': 'bg-slate-900/50 text-slate-300 border-slate-700',
      'technical': 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
      'advanced': 'bg-red-900/50 text-red-300 border-red-700',
    };
    
    // Map module IDs to skills
    const skillMap: Record<string, string[]> = {
      'crypto-basics': ['fundamentals'],
      'crypto-markets': ['fundamentals', 'trading'],
      'crypto-analysis': ['technical', 'analysis'],
      'crypto-strategies': ['trading', 'technical'],
      'crypto-risk': ['risk', 'trading'],
      'crypto-defi': ['defi', 'advanced'],
      'crypto-advanced': ['advanced', 'technical', 'trading'],
    };
    
    const colorClass = skillColors[skill] || 'bg-slate-800 text-slate-300 border-slate-700';
    
    return (
      <Badge 
        key={skill} 
        className={`text-xs px-2 py-0.5 mr-1 mb-1 border ${colorClass}`}
      >
        {skill}
      </Badge>
    );
  };

  // If no crypto journey is found
  if (!cryptoJourney) {
    return (
      <PopupContainer padding>
        <div className="flex flex-col items-center justify-center py-10">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Crypto Learning Journey Not Found</h3>
          <p className="text-slate-400 text-center mb-6">
            The cryptocurrency learning journey could not be loaded.
          </p>
          <Button onClick={() => navigate('/learn')}>
            Browse All Resources
          </Button>
        </div>
      </PopupContainer>
    );
  }

  return (
    <PopupContainer padding className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Crypto Trading Mastery Roadmap</h2>
          <p className="text-slate-400 mt-1">Your personalized journey to cryptocurrency trading proficiency</p>
        </div>
        
        {cryptoJourney.progress > 0 && (
          <div className="flex flex-col items-end">
            <div className="text-sm text-slate-400 mb-1">Overall Progress</div>
            <div className="flex items-center gap-2">
              <Progress value={cryptoJourney.progress} className="w-40 h-2" />
              <span className="text-sm font-medium">{cryptoJourney.progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Your level indicator */}
        <div className="absolute -left-4 top-0 bottom-0 w-1 hidden md:flex flex-col items-center">
          <div className="h-full flex flex-col justify-between py-8">
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-500 rotate-90 origin-bottom-left translate-y-6 translate-x-4">EXPERT</span>
              <span className="text-xs text-slate-500 rotate-90 origin-bottom-left translate-y-6 translate-x-4">ADVANCED</span>
              <span className="text-xs text-slate-500 rotate-90 origin-bottom-left translate-y-6 translate-x-4">INTERMEDIATE</span>
              <span className="text-xs text-slate-500 rotate-90 origin-bottom-left translate-y-6 translate-x-4">BEGINNER</span>
            </div>
          </div>
        </div>
        
        {/* Roadmap modules */}
        <div className="flex flex-col space-y-4">
          {cryptoJourney.modules.map((module, index) => {
            const isExpanded = expandedModules.includes(module.id);
            const isHovered = hoveredModule === module.id;
            const isLast = index === cryptoJourney.modules.length - 1;
            
            return (
              <div key={module.id} className="flex flex-col">
                <div 
                  className={getModuleClassName(module.status, isHovered)}
                  onClick={() => handleModuleClick(module.id)}
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {module.status === 'completed' && (
                          <div className="bg-green-900/60 text-green-400 p-1 rounded-full">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        {module.status === 'locked' && (
                          <div className="bg-slate-800 text-slate-500 p-1 rounded-full">
                            <Lock className="h-3 w-3" />
                          </div>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-slate-700 rounded-full">
                          {module.difficulty}
                        </span>
                        <div className="flex items-center gap-1">
                          {getDifficultyIcon(module.difficulty)}
                          {module.estimatedTime && (
                            <span className="text-xs text-slate-400">
                              {module.estimatedTime} min
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1">{module.title}</h3>
                      
                      {/* Skills tags */}
                      <div className="flex flex-wrap mt-2">
                        {/* Map module IDs to skills */}
                        {module.id === 'crypto-basics' && renderSkillBadge('fundamentals')}
                        {module.id === 'crypto-markets' && (
                          <>
                            {renderSkillBadge('fundamentals')}
                            {renderSkillBadge('trading')}
                          </>
                        )}
                        {module.id === 'crypto-analysis' && (
                          <>
                            {renderSkillBadge('technical')}
                            {renderSkillBadge('analysis')}
                          </>
                        )}
                        {module.id === 'crypto-strategies' && (
                          <>
                            {renderSkillBadge('trading')}
                            {renderSkillBadge('technical')}
                          </>
                        )}
                        {module.id === 'crypto-risk' && (
                          <>
                            {renderSkillBadge('risk')}
                            {renderSkillBadge('trading')}
                          </>
                        )}
                        {module.id === 'crypto-defi' && (
                          <>
                            {renderSkillBadge('defi')}
                            {renderSkillBadge('advanced')}
                          </>
                        )}
                        {module.id === 'crypto-advanced' && (
                          <>
                            {renderSkillBadge('advanced')}
                            {renderSkillBadge('technical')}
                            {renderSkillBadge('trading')}
                          </>
                        )}
                      </div>
                      
                      {module.progress > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col justify-between items-end">
                      {module.status === 'locked' ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button variant="outline" size="sm" disabled>
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Complete previous modules to unlock</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Button 
                          variant={module.status === 'completed' ? 'outline' : 'default'} 
                          size="sm"
                        >
                          {module.status === 'completed' 
                            ? 'Review' 
                            : module.status === 'in_progress' 
                              ? 'Continue' 
                              : 'Start'}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      
                      <div 
                        className="text-slate-400 hover:text-white cursor-pointer mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModuleExpanded(module.id);
                        }}
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Prerequisites warning for locked modules */}
                  {module.status === 'locked' && (
                    <div className="mt-3 bg-slate-800/60 p-2 rounded-md text-xs text-slate-400">
                      <div className="flex items-center text-yellow-400 mb-1">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        <span>Prerequisites Required</span>
                      </div>
                      <div>
                        Complete the following modules first:
                        <ul className="list-disc list-inside mt-1">
                          {module.prerequisites.map(prereqId => {
                            const prereq = getModuleById(prereqId);
                            return prereq ? (
                              <li key={prereqId} className="ml-2">
                                {prereq.title}
                                {prereq.status === 'completed' && (
                                  <Check className="inline-block h-3 w-3 ml-1 text-green-500" />
                                )}
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Expanded module details */}
                {isExpanded && module.content && (
                  <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-md mt-1 mb-3 text-sm">
                    <h4 className="font-medium mb-2">Module Content Preview</h4>
                    <ul className="space-y-2">
                      {module.content.sections.map((section, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          <span>{section.title}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {module.status !== 'locked' && (
                      <Button 
                        className="w-full mt-3"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModuleClick(module.id);
                        }}
                      >
                        {module.status === 'completed' 
                          ? 'Review Module' 
                          : module.status === 'in_progress' 
                            ? 'Continue Learning' 
                            : 'Start Module'}
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Connector between modules */}
                {!isLast && (
                  <div className={getConnectorClassName(module.status)}></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Achievement badge at the end */}
        <div className="flex justify-center mt-6">
          <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-700/50 rounded-lg p-4 flex items-center">
            <div className="bg-yellow-900/60 p-3 rounded-full mr-4">
              <Award className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-yellow-300">Crypto Trading Mastery Certificate</h3>
              <p className="text-sm text-yellow-200/70">
                Complete all modules to earn your certification
              </p>
              <div className="mt-2">
                <Progress 
                  value={cryptoJourney.progress} 
                  className="h-2 bg-yellow-900/50" 
                />
                <div className="text-xs text-yellow-400/80 mt-1">
                  {cryptoJourney.progress}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User skill level indicator */}
      <div className="mt-8 border-t border-slate-700 pt-4">
        <h3 className="text-lg font-semibold mb-3">Your Crypto Trading Skills</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Technical Analysis</span>
              <Badge variant="outline" className="text-xs">
                {userProfile.skillLevels.crypto}
              </Badge>
            </div>
            <Progress 
              value={
                userProfile.skillLevels.crypto === 'beginner' ? 25 :
                userProfile.skillLevels.crypto === 'intermediate' ? 50 :
                userProfile.skillLevels.crypto === 'advanced' ? 75 : 100
              } 
              className="h-1.5" 
            />
          </div>
          
          <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Risk Management</span>
              <Badge variant="outline" className="text-xs">developing</Badge>
            </div>
            <Progress 
              value={
                cryptoJourney.modules.find(m => m.id === 'crypto-risk')?.status === 'completed' ? 100 :
                cryptoJourney.modules.find(m => m.id === 'crypto-risk')?.status === 'in_progress' ? 50 : 
                cryptoJourney.modules.find(m => m.id === 'crypto-strategies')?.status === 'completed' ? 40 : 20
              } 
              className="h-1.5" 
            />
          </div>
          
          <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">DeFi Knowledge</span>
              <Badge variant="outline" className="text-xs">
                {
                  cryptoJourney.modules.find(m => m.id === 'crypto-defi')?.status === 'completed' ? 'advanced' :
                  cryptoJourney.modules.find(m => m.id === 'crypto-defi')?.status === 'in_progress' ? 'learning' : 'beginner'
                }
              </Badge>
            </div>
            <Progress 
              value={
                cryptoJourney.modules.find(m => m.id === 'crypto-defi')?.status === 'completed' ? 100 :
                cryptoJourney.modules.find(m => m.id === 'crypto-defi')?.status === 'in_progress' ? 60 : 
                cryptoJourney.modules.find(m => m.id === 'crypto-risk')?.status === 'completed' ? 40 : 10
              } 
              className="h-1.5" 
            />
          </div>
        </div>
      </div>
      
      {/* Recommended next steps */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Recommended Next Steps</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Find the first available or in_progress module */}
          {cryptoJourney.modules.find(m => m.status === 'in_progress' || m.status === 'available') ? (
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 text-blue-400 mr-2" />
                <h4 className="font-medium">Continue Your Learning Path</h4>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Pick up where you left off in your crypto trading education journey.
              </p>
              <Button 
                size="sm"
                onClick={() => {
                  const nextModule = cryptoJourney.modules.find(m => m.status === 'in_progress' || m.status === 'available');
                  if (nextModule) {
                    handleModuleClick(nextModule.id);
                  }
                }}
              >
                Continue Learning
              </Button>
            </div>
          ) : (
            <div className="bg-green-900/20 border border-green-800/40 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Award className="h-5 w-5 text-green-400 mr-2" />
                <h4 className="font-medium">Congratulations!</h4>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                You've completed the entire Crypto Trading Mastery path.
              </p>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => navigate('/learn')}
              >
                Explore More Resources
              </Button>
            </div>
          )}
          
          <div className="bg-purple-900/20 border border-purple-800/40 rounded-md p-4">
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-purple-400 mr-2" />
              <h4 className="font-medium">Test Your Knowledge</h4>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              Take practice quizzes to reinforce what you've learned in the modules.
            </p>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => navigate('/learn')}
            >
              Practice Quizzes
            </Button>
          </div>
        </div>
      </div>
    </PopupContainer>
  );
}