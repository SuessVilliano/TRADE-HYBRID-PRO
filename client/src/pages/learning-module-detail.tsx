import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PopupContainer } from '@/components/ui/popup-container';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLearningJourneyStore, MarketType, DifficultyLevel } from '@/lib/stores/useLearningJourneyStore';
import { useUserStore } from '@/lib/stores/useUserStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LearningModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [activeSection, setActiveSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  const { 
    getModuleById, 
    getJourneyForModule, 
    startModule, 
    startJourney,
    updateModuleProgress,
    completeModule,
    getJourneyById
  } = useLearningJourneyStore();
  
  const module = moduleId ? getModuleById(moduleId) : undefined;
  const journey = moduleId ? getJourneyForModule(moduleId) : undefined;
  
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
  
  useEffect(() => {
    // Ensure the journey is active and module is properly initialized
    if (moduleId && journey && !journey.isActive) {
      console.log('Starting journey:', journey.id);
      startJourney(journey.id);
      
      // Wait a bit for the journey to initialize
      setTimeout(() => {
        if (module && module.status === 'available') {
          console.log('Starting module after journey activation');
          startModule(moduleId);
        }
      }, 300);
    } else if (module && moduleId && module.status === 'available') {
      // If journey is already active but module needs to be started
      startModule(moduleId);
    }
  }, [module, moduleId, journey, startModule, startJourney]);
  
  // Update progress when changing sections
  useEffect(() => {
    if (module && moduleId && module.content) {
      const totalSections = module.content.sections.length;
      // Calculate progress based on current section (counting from 0)
      // We consider a step partially complete when the user starts it
      const newProgress = Math.round(((activeSection + 0.5) / totalSections) * 100);
      
      // Only update if it's an increase in progress
      if (newProgress > module.progress) {
        updateModuleProgress(moduleId, newProgress);
      }
    }
  }, [activeSection, module, moduleId, updateModuleProgress]);
  
  // If module not found, show error
  if (!module || !journey) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Module Not Found</h1>
          <p className="text-slate-300 mb-6">The learning module you're looking for could not be found.</p>
          <Button onClick={() => navigate('/learn/journey')}>Return to Learning Journey</Button>
        </div>
      </div>
    );
  }
  
  // If module is locked, show locked message
  if (module.status === 'locked') {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <PopupContainer padding>
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
              <div className="bg-slate-800/50 inline-block px-3 py-1 rounded-full text-sm mb-6">
                {marketNames[module.market]} • {difficultyNames[module.difficulty]}
              </div>
              
              <div className="max-w-lg mx-auto">
                <Alert className="mb-6">
                  <AlertTitle className="mb-2">This module is currently locked</AlertTitle>
                  <AlertDescription>
                    You need to complete the prerequisite modules before accessing this content.
                  </AlertDescription>
                </Alert>
                
                {module.prerequisites.length > 0 && (
                  <div className="text-left mb-6">
                    <h2 className="text-lg font-semibold mb-3">Required Prerequisites:</h2>
                    <ul className="space-y-2">
                      {module.prerequisites.map(prereqId => {
                        const prereqModule = getModuleById(prereqId);
                        return (
                          <li key={prereqId} className="flex items-center gap-2">
                            <span className={
                              prereqModule?.status === 'completed' 
                                ? 'text-green-500' 
                                : 'text-yellow-500'
                            }>
                              {prereqModule?.status === 'completed' ? '✓' : '→'}
                            </span>
                            <span>{prereqModule?.title || prereqId}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                
                <Button onClick={() => navigate(`/learn/journey`)}>
                  Return to Learning Path
                </Button>
              </div>
            </div>
          </PopupContainer>
        </div>
      </div>
    );
  }
  
  // If module is completed, show completion message with options to review
  if (module.status === 'completed') {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <PopupContainer padding>
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
              <div className="bg-slate-800/50 inline-block px-3 py-1 rounded-full text-sm mb-6">
                {marketNames[module.market]} • {difficultyNames[module.difficulty]}
              </div>
              
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-6 mb-8 inline-block">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">Module Completed!</h2>
                <p className="text-slate-300 mb-4">
                  You've successfully completed this module.
                </p>
                {module.quizResults && (
                  <div className="mb-4">
                    <p className="font-semibold">Quiz Score: {Math.round((module.quizResults.score / module.quizResults.totalQuestions) * 100)}%</p>
                    <p className="text-sm text-slate-400">Completed on {new Date(module.completedAt || '').toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => setActiveSection(0)} variant="outline">
                  Review Content
                </Button>
                
                {/* Get next module in the journey */}
                {journey.modules.some((m, i) => 
                  m.id === module.id && 
                  i < journey.modules.length - 1 && 
                  journey.modules[i + 1].status === 'available'
                ) && (
                  <Button 
                    onClick={() => {
                      const currentIndex = journey.modules.findIndex(m => m.id === module.id);
                      if (currentIndex >= 0 && currentIndex < journey.modules.length - 1) {
                        navigate(`/learn/module/${journey.modules[currentIndex + 1].id}`);
                      }
                    }}
                  >
                    Next Module
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/learn/journey`)}
                >
                  Return to Learning Path
                </Button>
              </div>
            </div>
          </PopupContainer>
        </div>
      </div>
    );
  }
  
  // Generate mock quiz questions for the content if none exist
  const generateQuizQuestions = () => {
    if (!module.content) return [];
    
    return module.content.sections.map((section, index) => ({
      question: `Question about ${section.title}?`,
      options: [
        `Answer option 1 for section ${index + 1}`,
        `Answer option 2 for section ${index + 1}`,
        `Answer option 3 for section ${index + 1}`,
        `Answer option 4 for section ${index + 1}`,
      ],
      correctAnswer: 0, // First option is correct for demo
    }));
  };
  
  const quizQuestions = generateQuizQuestions();
  
  // Handle submitting the quiz
  const handleQuizSubmit = () => {
    if (quizQuestions.length === 0) return;
    
    let correctCount = 0;
    quizQuestions.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    const score = correctCount;
    setQuizScore(score);
    setQuizSubmitted(true);
    
    // Mark module as completed
    if (moduleId) {
      completeModule(moduleId, {
        score: correctCount,
        totalQuestions: quizQuestions.length,
      });
    }
  };
  
  // Render content only if there is content
  if (!module.content) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
          <p className="text-slate-300 mb-6">This module is under development. Please check back later.</p>
          <Button onClick={() => navigate('/learn/journey')}>Return to Learning Journey</Button>
        </div>
      </div>
    );
  }
  
  // Navigation to next/previous section
  const goToNextSection = () => {
    if (activeSection < module.content!.sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };
  
  const goToPrevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };
  
  const currentSection = module.content.sections[activeSection];
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/learn/journey')}
            >
              ← Back to Learning Path
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/50 px-3 py-1 rounded text-sm">
              {marketNames[module.market]}
            </div>
            <div className="bg-slate-800/50 px-3 py-1 rounded text-sm">
              {difficultyNames[module.difficulty]}
            </div>
          </div>
        </div>
        
        <PopupContainer className="mb-8" padding>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-slate-300">{module.description}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-1">
              <span>Progress</span>
              <span>{module.progress}%</span>
            </div>
            <Progress value={module.progress} className="h-2" />
          </div>
          
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="content">Learning Content</TabsTrigger>
              <TabsTrigger value="quiz">Knowledge Check</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            {/* Content Tab */}
            <TabsContent value="content">
              <div className="grid grid-cols-12 gap-6">
                {/* Side navigation */}
                <div className="col-span-12 md:col-span-3">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h3 className="font-semibold mb-3">Sections</h3>
                    <ul className="space-y-1">
                      {module.content.sections.map((section, index) => (
                        <li key={index}>
                          <button
                            className={`w-full text-left px-3 py-2 rounded text-sm ${
                              activeSection === index 
                                ? 'bg-blue-900/50 text-blue-300' 
                                : 'hover:bg-slate-700/50'
                            }`}
                            onClick={() => setActiveSection(index)}
                          >
                            {index + 1}. {section.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="col-span-12 md:col-span-9">
                  <div className="bg-slate-800/30 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">{currentSection.title}</h2>
                    <div className="prose prose-invert max-w-none">
                      <p>{currentSection.content}</p>
                      
                      {/* This would be replaced with actual content */}
                      <p>Additional explanatory content would go here. This would include:</p>
                      <ul>
                        <li>Detailed explanations of concepts</li>
                        <li>Examples and illustrations</li>
                        <li>Code snippets (for technical topics)</li>
                        <li>Interactive elements</li>
                      </ul>
                      
                      {/* For video content */}
                      {currentSection.type === 'video' && (
                        <div className="bg-slate-900 aspect-video rounded flex items-center justify-center my-4">
                          <p className="text-slate-400">Video content would be embedded here</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <Button 
                        variant="outline"
                        onClick={goToPrevSection}
                        disabled={activeSection === 0}
                      >
                        Previous
                      </Button>
                      
                      {activeSection < module.content.sections.length - 1 ? (
                        <Button onClick={goToNextSection}>
                          Next
                        </Button>
                      ) : (
                        <Button onClick={() => handleQuizSubmit()}>
                          Complete & Take Quiz
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Quiz Tab */}
            <TabsContent value="quiz">
              <div className="bg-slate-800/30 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Knowledge Check</h2>
                
                {quizSubmitted ? (
                  <div className="text-center py-8">
                    <div className={`text-6xl mb-4 ${quizScore / quizQuestions.length >= 0.7 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {quizScore / quizQuestions.length >= 0.7 ? '🎉' : '📝'}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">
                      {quizScore / quizQuestions.length >= 0.7 ? 'Congratulations!' : 'Good Effort!'}
                    </h3>
                    
                    <p className="text-xl mb-4">
                      Your Score: {quizScore} / {quizQuestions.length}
                      <span className="block text-lg">
                        ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                      </span>
                    </p>
                    
                    <div className="mb-8">
                      {quizScore / quizQuestions.length >= 0.7 ? (
                        <p className="text-green-400">
                          You've successfully completed this module!
                        </p>
                      ) : (
                        <p className="text-yellow-400">
                          You might want to review some sections before moving on.
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button 
                        variant={quizScore / quizQuestions.length >= 0.7 ? 'outline' : 'default'}
                        onClick={() => setActiveSection(0)}
                      >
                        Review Content
                      </Button>
                      
                      {quizScore / quizQuestions.length >= 0.7 && journey && (
                        <Button 
                          onClick={() => navigate('/learn/journey')}
                        >
                          Continue Learning Path
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-6">
                      Test your knowledge of the concepts covered in this module. Answer the following questions to complete the module.
                    </p>
                    
                    <div className="space-y-8">
                      {quizQuestions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-slate-800/50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold mb-3">
                            {qIndex + 1}. {question.question}
                          </h3>
                          
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`q${qIndex}-o${oIndex}`}
                                  name={`question-${qIndex}`}
                                  className="mr-3"
                                  checked={quizAnswers[qIndex] === oIndex}
                                  onChange={() => {
                                    setQuizAnswers({
                                      ...quizAnswers,
                                      [qIndex]: oIndex
                                    });
                                  }}
                                />
                                <label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <Button 
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      >
                        Submit Answers
                      </Button>
                      
                      {Object.keys(quizAnswers).length < quizQuestions.length && (
                        <p className="text-sm text-slate-400 mt-2">
                          Please answer all questions before submitting.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Resources Tab */}
            <TabsContent value="resources">
              <div className="bg-slate-800/30 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Additional Resources</h2>
                
                <div className="grid gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Related Learning Paths</h3>
                    <ul className="space-y-2">
                      {/* Show related journeys based on the market */}
                      {[...useLearningJourneyStore.getState().activeJourneys, ...useLearningJourneyStore.getState().availableJourneys]
                        .filter(j => j.market === module.market && j.id !== journey.id)
                        .slice(0, 2)
                        .map(j => (
                          <li key={j.id} className="flex justify-between items-center">
                            <span>{j.title}</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/learn/journey`)}
                            >
                              View
                            </Button>
                          </li>
                        ))}
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">External References</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-blue-400 hover:underline">
                          {marketNames[module.market]} Trading Guide
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-400 hover:underline">
                          Advanced {module.title} Techniques
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-400 hover:underline">
                          Official Documentation
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Downloadable Materials</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>{module.title} Cheatsheet.pdf</span>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Practice Exercises.pdf</span>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopupContainer>
        
        {/* Module navigation */}
        <div className="flex justify-between items-center">
          {journey.modules.findIndex(m => m.id === module.id) > 0 && (
            <Button 
              variant="outline"
              onClick={() => {
                const currentIndex = journey.modules.findIndex(m => m.id === module.id);
                if (currentIndex > 0) {
                  const prevModule = journey.modules[currentIndex - 1];
                  navigate(`/learn/module/${prevModule.id}`);
                }
              }}
            >
              Previous Module
            </Button>
          )}
          
          <div className="flex-1"></div>
          
          {journey.modules.findIndex(m => m.id === module.id) < journey.modules.length - 1 && (
            <Button 
              variant="outline"
              disabled={module.status !== 'completed'}
              onClick={() => {
                const currentIndex = journey.modules.findIndex(m => m.id === module.id);
                if (currentIndex < journey.modules.length - 1) {
                  const nextModule = journey.modules[currentIndex + 1];
                  navigate(`/learn/module/${nextModule.id}`);
                }
              }}
            >
              Next Module
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}