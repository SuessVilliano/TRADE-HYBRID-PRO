import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLearningStore } from '@/lib/stores/learning-store';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft,
  BookOpen, 
  FileText, 
  Play,
  Clock, 
  CheckCircle,
  XCircle,
  BarChart,
  Star,
  Award,
  Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from '@/lib/context/AuthContext';

// Resource type badge component
const ResourceTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <FileText className="h-3 w-3 mr-1" />
          PDF
        </Badge>
      );
    case 'video':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          <Play className="h-3 w-3 mr-1" />
          Video
        </Badge>
      );
    case 'article':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <BookOpen className="h-3 w-3 mr-1" />
          Article
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
          <FileText className="h-3 w-3 mr-1" />
          {type}
        </Badge>
      );
  }
};

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  content: string;
  orderNum: number;
  duration: number;
  videoUrl?: string | null;
  resources?: Resource[];
  completed?: boolean;
}

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderNum: number;
  lessons: Lesson[];
}

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || '0');
  const { isAuthenticated } = useAuth();

  const { 
    fetchCourseDetails, 
    fetchModulesForCourse,
    fetchLessonsForModule,
    markLessonCompleted,
    userProgress,
    isLoading, 
    error 
  } = useLearningStore();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeTab, setActiveTab] = useState<string>('content');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [courseProgress, setCourseProgress] = useState<number>(0);

  // Course instructor information (mock data - would come from API)
  const instructor = {
    name: "Alex Thompson",
    title: "Senior Market Analyst & Pro Trader",
    bio: "Alex has over 15 years of experience in financial markets, specializing in forex and cryptocurrency trading. He has trained thousands of traders worldwide.",
    avatarUrl: "/images/instructor-placeholder.jpg"
  };

  useEffect(() => {
    if (courseId > 0) {
      // Load course details
      fetchCourseDetails(courseId)
        .then(courseData => {
          setCourse(courseData);
        })
        .catch(err => console.error("Failed to fetch course details:", err));

      // Load modules for the course
      fetchModulesForCourse(courseId)
        .then(modulesData => {
          setModules(modulesData);
          
          // If modules exist, load lessons for the first module
          if (modulesData && modulesData.length > 0) {
            fetchLessonsForModule(modulesData[0].id)
              .then(lessonsData => {
                // Update modules with lessons
                const updatedModules = [...modulesData];
                updatedModules[0].lessons = lessonsData;
                setModules(updatedModules);
                
                // Set the first lesson as selected if available
                if (lessonsData && lessonsData.length > 0) {
                  setSelectedLesson(lessonsData[0]);
                }
              })
              .catch(err => console.error("Failed to fetch lessons:", err));
          }
        })
        .catch(err => console.error("Failed to fetch modules:", err));
    }
  }, [courseId, fetchCourseDetails, fetchModulesForCourse, fetchLessonsForModule]);

  // Load completed lessons from user progress
  useEffect(() => {
    if (userProgress && userProgress.completedLessons) {
      setCompletedLessons(userProgress.completedLessons);
      
      // Calculate course progress percentage
      const totalLessons = modules.reduce((count, module) => count + module.lessons.length, 0);
      if (totalLessons > 0) {
        const percentage = Math.round((userProgress.completedLessons.length / totalLessons) * 100);
        setCourseProgress(percentage);
      }
    }
  }, [userProgress, modules]);

  // Select a lesson
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('lesson');
  };

  // Load lessons for a module if not already loaded
  const handleModuleExpand = async (moduleId: number) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex !== -1 && (!modules[moduleIndex].lessons || modules[moduleIndex].lessons.length === 0)) {
      try {
        const lessonsData = await fetchLessonsForModule(moduleId);
        const updatedModules = [...modules];
        updatedModules[moduleIndex].lessons = lessonsData;
        setModules(updatedModules);
      } catch (err) {
        console.error(`Failed to fetch lessons for module ${moduleId}:`, err);
      }
    }
  };

  // Mark a lesson as completed
  const handleMarkLessonComplete = async () => {
    if (selectedLesson) {
      try {
        await markLessonCompleted(selectedLesson.id);
        // Update local state
        setCompletedLessons(prev => [...prev, selectedLesson.id]);
        
        // If there's a next lesson, navigate to it
        const currentModuleIndex = modules.findIndex(m => m.id === selectedLesson.moduleId);
        if (currentModuleIndex !== -1) {
          const currentLessonIndex = modules[currentModuleIndex].lessons.findIndex(l => l.id === selectedLesson.id);
          
          if (currentLessonIndex < modules[currentModuleIndex].lessons.length - 1) {
            // Next lesson in same module
            handleSelectLesson(modules[currentModuleIndex].lessons[currentLessonIndex + 1]);
          } else if (currentModuleIndex < modules.length - 1) {
            // First lesson in next module
            if (!modules[currentModuleIndex + 1].lessons || modules[currentModuleIndex + 1].lessons.length === 0) {
              await handleModuleExpand(modules[currentModuleIndex + 1].id);
            }
            
            if (modules[currentModuleIndex + 1].lessons && modules[currentModuleIndex + 1].lessons.length > 0) {
              handleSelectLesson(modules[currentModuleIndex + 1].lessons[0]);
            }
          }
        }
      } catch (err) {
        console.error(`Failed to mark lesson ${selectedLesson.id} as completed:`, err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3">Loading course...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
        <p>Failed to load course: {error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/learning-center')} 
          className="mt-2"
        >
          Return to Academy
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-lg">
        <p>Course not found or still loading.</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/learning-center')} 
          className="mt-2"
        >
          Return to Academy
        </Button>
      </div>
    );
  }

  // Get total course duration
  const totalDuration = modules.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.duration, 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course header with back navigation */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/learning-center')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Academy
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {course.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level} Level</Badge>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4 mr-1" />
                {totalDuration} hours
              </div>
              {course.certification && (
                <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                  <Award className="h-4 w-4 mr-1" />
                  Includes Certificate
                </div>
              )}
            </div>
            
            {courseProgress > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm font-medium">{courseProgress}%</span>
                </div>
                <Progress value={courseProgress} className="h-2" />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden mr-3">
                <img 
                  src={instructor.avatarUrl || '/images/avatar-placeholder.jpg'} 
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/avatar-placeholder.jpg';
                  }}
                />
              </div>
              <div>
                <h3 className="font-medium">{instructor.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{instructor.title}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {instructor.bio}
            </p>
            
            <div className="flex flex-col space-y-2">
              {/* Course actions */}
              {isAuthenticated ? (
                <>
                  {courseProgress === 0 ? (
                    <Button 
                      onClick={() => {
                        if (modules[0]?.lessons?.[0]) {
                          handleSelectLesson(modules[0].lessons[0]);
                        }
                      }}
                    >
                      Start Course
                    </Button>
                  ) : courseProgress < 100 ? (
                    <Button 
                      onClick={() => {
                        // Find the first incomplete lesson
                        for (const module of modules) {
                          if (module.lessons) {
                            const incompleteLesson = module.lessons.find(lesson => !completedLessons.includes(lesson.id));
                            if (incompleteLesson) {
                              handleSelectLesson(incompleteLesson);
                              break;
                            }
                          }
                        }
                      }}
                    >
                      Continue Course
                    </Button>
                  ) : (
                    <Button disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Course Completed
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  onClick={() => navigate('/login')}
                >
                  Login to Start
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Course content tabs */}
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="lesson" disabled={!selectedLesson}>Lesson</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Accordion 
              type="multiple" 
              className="w-full"
              onValueChange={(expandedValues) => {
                // Load lessons for newly expanded modules
                expandedValues.forEach(value => {
                  const moduleId = parseInt(value);
                  if (!isNaN(moduleId)) {
                    handleModuleExpand(moduleId);
                  }
                });
              }}
            >
              {modules.map(module => (
                <AccordionItem value={module.id.toString()} key={module.id}>
                  <AccordionTrigger className="px-4">
                    <div className="flex flex-col items-start">
                      <h3 className="font-medium text-left">{module.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-left">{module.description}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-1 px-4 pb-4">
                    {module.lessons && module.lessons.length > 0 ? (
                      module.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-left ${
                            selectedLesson?.id === lesson.id 
                              ? 'bg-primary/10 text-primary' 
                              : ''
                          }`}
                        >
                          <div className="flex-1 flex items-center">
                            {completedLessons.includes(lesson.id) ? (
                              <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mr-3" />
                            )}
                            <span>{lesson.title}</span>
                          </div>
                          <div className="flex items-center">
                            {lesson.videoUrl && (
                              <Video className="h-4 w-4 mr-1 text-slate-400" />
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {lesson.duration} min
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-2 px-3 text-slate-500 dark:text-slate-400 text-sm">
                        Loading lessons...
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>
        
        <TabsContent value="lesson">
          {selectedLesson ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-2xl font-semibold mb-2">{selectedLesson.title}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedLesson.duration} min
                  </div>
                  {completedLessons.includes(selectedLesson.id) ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : null}
                </div>
                
                {selectedLesson.videoUrl && (
                  <div className="aspect-video bg-slate-900 rounded-lg mb-6 overflow-hidden">
                    <iframe 
                      src={selectedLesson.videoUrl} 
                      title={selectedLesson.title}
                      className="w-full h-full" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                    />
                  </div>
                )}
                
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                </div>
                
                {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3">Additional Resources</h3>
                    <div className="space-y-2">
                      {selectedLesson.resources.map((resource, index) => (
                        <a 
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <div className="mr-3">
                            <ResourceTypeBadge type={resource.type} />
                          </div>
                          <span>{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('content')}
                  >
                    Back to Content
                  </Button>
                  
                  {!completedLessons.includes(selectedLesson.id) && (
                    <Button onClick={handleMarkLessonComplete}>
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Select a lesson from the course content.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('content')} 
                className="mt-4"
              >
                View Course Content
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4">About This Course</h2>
            
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">What You'll Learn</h3>
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Separator className="my-6" />
            
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Prerequisites</h3>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-600 dark:text-slate-300">
                    Before taking this course, it's recommended that you complete:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                    {course.prerequisites.map((prereqId: number) => {
                      // This would ideally fetch the prerequisite course title
                      return <li key={prereqId}>Course #{prereqId}</li>;
                    })}
                  </ul>
                </div>
              </div>
            )}
            
            {course.certification && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Certification</h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 flex items-start">
                  <Award className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-700 dark:text-slate-300">
                      This course includes a certification upon completion. You'll need to:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                      <li>Complete all lessons in the course</li>
                      <li>Pass the final assessment with a score of 80% or higher</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-medium mb-3">About the Instructor</h3>
              <div className="flex items-start">
                <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden mr-4 flex-shrink-0">
                  <img 
                    src={instructor.avatarUrl || '/images/avatar-placeholder.jpg'} 
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/avatar-placeholder.jpg';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-medium">{instructor.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{instructor.title}</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    {instructor.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}