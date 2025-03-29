import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PopupContainer } from '@/components/ui/popup-container';
import { useLearningJourneyStore, MarketType, DifficultyLevel } from '@/lib/stores/useLearningJourneyStore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserStore } from '@/lib/stores/useUserStore';
import { CryptoLearningRoadmap } from '@/components/ui/crypto-learning-roadmap';

export default function LearningJourney() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [activeTab, setActiveTab] = useState<string>('crypto-roadmap');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Learning journey store hooks
  const {
    activeJourneys,
    availableJourneys,
    userProfile,
    startJourney,
    updateUserProfile,
    getNextAvailableModule,
    getRecommendedModules,
    getRecommendedJourneys,
    getJourneyCompletion,
  } = useLearningJourneyStore();

  // User profile form state
  const [profileForm, setProfileForm] = useState({
    preferredMarkets: userProfile.preferredMarkets,
    skillLevels: { ...userProfile.skillLevels },
    learningPace: userProfile.learningPace,
    interests: [...userProfile.interests],
  });

  // Check if user has set up profile
  useEffect(() => {
    if (
      userProfile.preferredMarkets.length === 0 ||
      !userProfile.lastActivity
    ) {
      setShowProfileSetup(true);
    }
  }, [userProfile]);

  // Handle saving user profile
  const handleSaveProfile = () => {
    updateUserProfile(profileForm);
    setShowProfileSetup(false);
  };

  // Market type names for display
  const marketNames: Record<MarketType, string> = {
    crypto: 'Cryptocurrency',
    futures: 'Futures',
    forex: 'Forex',
    stocks: 'Stocks',
  };

  // Difficulty level names for display
  const difficultyNames: Record<DifficultyLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
  };

  // Get recommended modules based on user profile
  const recommendedModules = getRecommendedModules();

  // Handle starting a learning journey
  const handleStartJourney = (journeyId: string) => {
    startJourney(journeyId);
    setActiveTab('my-journeys');
  };

  // Handle continuing a learning journey
  const handleContinueJourney = (journeyId: string) => {
    const nextModule = getNextAvailableModule(journeyId);
    if (nextModule) {
      navigate(`/learn/module/${nextModule.id}`);
    }
  };

  // Format hours/minutes from minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Learning Journey</h1>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowProfileSetup(true)}
            >
              Update Preferences
            </Button>
            <Button onClick={() => navigate('/learn')}>
              Browse All Resources
            </Button>
          </div>
        </div>

        {/* User Profile Setup Modal */}
        {showProfileSetup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <PopupContainer className="w-full max-w-2xl" padding>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Learning Preferences</h2>
                
                {userProfile.lastActivity && (
                  <button
                    onClick={() => setShowProfileSetup(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              
              <p className="text-slate-300 mb-6">
                Tell us about your interests and skill levels to get personalized learning recommendations.
              </p>
              
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Which markets are you interested in?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(marketNames).map(([key, name]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`market-${key}`}
                          className="rounded border-slate-700 bg-slate-800"
                          checked={profileForm.preferredMarkets.includes(key as MarketType)}
                          onChange={(e) => {
                            const market = key as MarketType;
                            if (e.target.checked) {
                              setProfileForm({
                                ...profileForm,
                                preferredMarkets: [...profileForm.preferredMarkets, market],
                              });
                            } else {
                              setProfileForm({
                                ...profileForm,
                                preferredMarkets: profileForm.preferredMarkets.filter(m => m !== market),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`market-${key}`}>{name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">What's your experience level?</h3>
                  
                  <div className="grid gap-4">
                    {profileForm.preferredMarkets.map((market) => (
                      <div key={market} className="bg-slate-800/70 p-4 rounded-md">
                        <Label className="mb-2 block">{marketNames[market]}</Label>
                        <Select
                          value={profileForm.skillLevels[market]}
                          onValueChange={(value) => {
                            setProfileForm({
                              ...profileForm,
                              skillLevels: {
                                ...profileForm.skillLevels,
                                [market]: value as DifficultyLevel,
                              },
                            });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(difficultyNames).map(([key, name]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Learning Pace</h3>
                  <RadioGroup
                    value={profileForm.learningPace}
                    onValueChange={(value) => {
                      setProfileForm({
                        ...profileForm,
                        learningPace: value as 'slow' | 'normal' | 'fast',
                      });
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slow" id="pace-slow" />
                      <Label htmlFor="pace-slow">Slow & Thorough</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="pace-normal" />
                      <Label htmlFor="pace-normal">Balanced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="pace-fast" />
                      <Label htmlFor="pace-fast">Fast & Focused</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </PopupContainer>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="crypto-roadmap">Crypto Roadmap</TabsTrigger>
            <TabsTrigger value="my-journeys">My Learning Paths</TabsTrigger>
            <TabsTrigger value="discover">Discover Paths</TabsTrigger>
          </TabsList>

          {/* Personalized Crypto Roadmap Tab */}
          <TabsContent value="crypto-roadmap">
            <CryptoLearningRoadmap onModuleSelect={(moduleId) => {
              navigate(`/learn/module/${moduleId}`);
            }} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <PopupContainer className="mb-8" padding>
                  <h2 className="text-2xl font-semibold mb-6">Learning Progress</h2>
                  
                  {activeJourneys.length > 0 ? (
                    <div className="grid gap-6">
                      {activeJourneys.map((journey) => (
                        <div key={journey.id} className="border border-slate-700 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-lg">{journey.title}</h3>
                            <span className="text-sm px-2 py-1 bg-slate-700 rounded">
                              {marketNames[journey.market]}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-slate-400 mb-1">
                              <span>Progress</span>
                              <span>{journey.progress}%</span>
                            </div>
                            <Progress value={journey.progress} className="h-2" />
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleContinueJourney(journey.id)}
                          >
                            {journey.progress === 100 ? 'Review' : 'Continue Learning'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">You haven't started any learning paths yet.</p>
                      <Button onClick={() => setActiveTab('discover')}>Browse Learning Paths</Button>
                    </div>
                  )}
                </PopupContainer>
                
                {recommendedModules.length > 0 && (
                  <PopupContainer className="mb-8" padding>
                    <h2 className="text-2xl font-semibold mb-6">Recommended Next Steps</h2>
                    
                    <div className="grid gap-4">
                      {recommendedModules.map((module) => (
                        <div key={module.id} className="border border-slate-700 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm px-2 py-0.5 bg-slate-700 rounded">
                                  {marketNames[module.market]}
                                </span>
                                <span className="text-sm text-slate-400">
                                  {difficultyNames[module.difficulty]}
                                </span>
                              </div>
                              <h3 className="font-semibold text-lg mb-1">{module.title}</h3>
                              <p className="text-sm text-slate-300 mb-3">{module.description}</p>
                              
                              {module.progress > 0 && (
                                <div className="mb-3">
                                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Progress</span>
                                    <span>{module.progress}%</span>
                                  </div>
                                  <Progress value={module.progress} className="h-1.5" />
                                </div>
                              )}
                            </div>
                            
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/learn/module/${module.id}`)}
                            >
                              {module.status === 'in_progress' ? 'Continue' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopupContainer>
                )}
              </div>
              
              <div>
                <PopupContainer className="mb-8" padding>
                  <h2 className="text-xl font-semibold mb-4">Learning Stats</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-800/70 p-3 rounded-md">
                      <div className="text-sm text-slate-400 mb-1">Completed Modules</div>
                      <div className="text-2xl font-semibold">{userProfile.completedModules}</div>
                    </div>
                    
                    {userProfile.quizAverage > 0 && (
                      <div className="bg-slate-800/70 p-3 rounded-md">
                        <div className="text-sm text-slate-400 mb-1">Quiz Score Average</div>
                        <div className="text-2xl font-semibold">{(userProfile.quizAverage * 100).toFixed(0)}%</div>
                      </div>
                    )}
                    
                    <div className="bg-slate-800/70 p-3 rounded-md">
                      <div className="text-sm text-slate-400 mb-1">Active Learning Paths</div>
                      <div className="text-2xl font-semibold">{activeJourneys.length}</div>
                    </div>
                    
                    {userProfile.lastActivity && (
                      <div className="bg-slate-800/70 p-3 rounded-md">
                        <div className="text-sm text-slate-400 mb-1">Last Activity</div>
                        <div className="text-lg font-semibold">
                          {new Date(userProfile.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </PopupContainer>
                
                <PopupContainer className="mb-8" padding>
                  <h2 className="text-xl font-semibold mb-4">Learning Preferences</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Markets</div>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.preferredMarkets.map((market) => (
                          <span key={market} className="px-2 py-1 bg-slate-800 rounded text-sm">
                            {marketNames[market]}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Skill Levels</div>
                      <div className="space-y-2">
                        {userProfile.preferredMarkets.map((market) => (
                          <div key={market} className="flex justify-between text-sm">
                            <span>{marketNames[market]}:</span>
                            <span>{difficultyNames[userProfile.skillLevels[market]]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Learning Pace</div>
                      <div className="capitalize">{userProfile.learningPace}</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => setShowProfileSetup(true)}
                  >
                    Update Preferences
                  </Button>
                </PopupContainer>
              </div>
            </div>
          </TabsContent>

          {/* My Journeys Tab */}
          <TabsContent value="my-journeys">
            {activeJourneys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJourneys.map((journey) => (
                  <PopupContainer key={journey.id} className="h-full flex flex-col" padding>
                    <div className="flex-grow">
                      <div className="bg-slate-800 rounded-md aspect-video mb-4 flex items-center justify-center">
                        {/* Journey image would go here */}
                        <div className="text-center text-slate-500">
                          <div className="font-medium">{marketNames[journey.market]}</div>
                          <div className="text-xs">Learning Path</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{journey.title}</h3>
                      <p className="text-slate-300 text-sm mb-4">{journey.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        <div>
                          <div className="flex justify-between text-sm text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{journey.progress}%</span>
                          </div>
                          <Progress value={journey.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-800/50 rounded">
                            <div className="text-slate-400">Modules</div>
                            <div>{journey.modules.length}</div>
                          </div>
                          
                          <div className="p-2 bg-slate-800/50 rounded">
                            <div className="text-slate-400">Completed</div>
                            <div>{journey.modules.filter(m => m.status === 'completed').length}</div>
                          </div>
                          
                          <div className="p-2 bg-slate-800/50 rounded">
                            <div className="text-slate-400">Est. Time</div>
                            <div>{formatTime(journey.modules.reduce((sum, m) => sum + m.estimatedTime, 0))}</div>
                          </div>
                          
                          <div className="p-2 bg-slate-800/50 rounded">
                            <div className="text-slate-400">Difficulty</div>
                            <div className="capitalize">{journey.modules[0]?.difficulty || 'Mixed'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={() => handleContinueJourney(journey.id)}
                    >
                      {journey.progress === 100 ? 'Review Materials' : 'Continue Learning'}
                    </Button>
                  </PopupContainer>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold mb-4">No Active Learning Paths</h3>
                <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                  You haven't started any learning paths yet. Discover and start your learning journey to see your progress here.
                </p>
                <Button onClick={() => setActiveTab('discover')}>Browse Learning Paths</Button>
              </div>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableJourneys.map((journey) => (
                <PopupContainer key={journey.id} className="h-full flex flex-col" padding>
                  <div className="flex-grow">
                    <div className="bg-slate-800 rounded-md aspect-video mb-4 flex items-center justify-center">
                      {/* Journey image would go here */}
                      <div className="text-center text-slate-500">
                        <div className="font-medium">{marketNames[journey.market]}</div>
                        <div className="text-xs">Learning Path</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mb-3">
                      <h3 className="text-xl font-bold">{journey.title}</h3>
                      <span className="text-sm px-2 py-0.5 bg-slate-700 rounded-full">
                        {marketNames[journey.market]}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-4">{journey.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-6">
                      <div className="p-2 bg-slate-800/50 rounded">
                        <div className="text-slate-400">Modules</div>
                        <div>{journey.modules.length}</div>
                      </div>
                      
                      <div className="p-2 bg-slate-800/50 rounded">
                        <div className="text-slate-400">Est. Time</div>
                        <div>{formatTime(journey.modules.reduce((sum, m) => sum + m.estimatedTime, 0))}</div>
                      </div>
                      
                      <div className="p-2 bg-slate-800/50 rounded">
                        <div className="text-slate-400">Start Level</div>
                        <div className="capitalize">{journey.modules[0]?.difficulty || 'Beginner'}</div>
                      </div>
                      
                      <div className="p-2 bg-slate-800/50 rounded">
                        <div className="text-slate-400">End Level</div>
                        <div className="capitalize">{journey.modules[journey.modules.length - 1]?.difficulty || 'Advanced'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleStartJourney(journey.id)}
                    disabled={!isAuthenticated}
                  >
                    {isAuthenticated ? 'Start Learning Path' : 'Login to Start'}
                  </Button>
                </PopupContainer>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}