import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLearningStore } from '@/lib/stores/learning-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, CheckCircle, Clock, Trophy, Video, FileText, ExternalLink, Lock } from 'lucide-react';

const levelColorMap = {
  beginner: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  intermediate: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  advanced: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
};

// Format duration from minutes to hours and minutes
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
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
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, fetchCourseDetails, fetchModulesForCourse, fetchLessonsForModule, isLoading } = useLearningStore();
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  
  // Get course from store
  const course = courses.find(c => c.id === Number(courseId));
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!courseModules.length) return 0;
    
    const totalLessons = courseModules.reduce((acc, module) => acc + module.lessons.length, 0);
    if (totalLessons === 0) return 0;
    
    return Math.round((completedLessons.length / totalLessons) * 100);
  };
  
  // Load course modules and lessons
  useEffect(() => {
    if (courseId) {
      const id = Number(courseId);
      // Fetch course details if not available
      if (!course) {
        fetchCourseDetails(id);
      }
      
      // Fetch modules for course
      fetchModulesForCourse(id).then(modules => {
        setCourseModules(modules);
        
        // Set the first module active by default
        if (modules.length > 0 && !activeModule) {
          setActiveModule(modules[0].id);
          
          // Fetch lessons for each module
          modules.forEach(module => {
            fetchLessonsForModule(module.id);
          });
        }
      });
      
      // TODO: Fetch completed lessons from API
      // This would be replaced with an actual API call
      setCompletedLessons([]);
    }
  }, [courseId, course, fetchCourseDetails, fetchModulesForCourse, fetchLessonsForModule, activeModule]);
  
  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading course...</span>
      </div>
    );
  }
  
  // Toggle lesson completion (for demonstration)
  const toggleLessonCompletion = (lessonId: number) => {
    if (completedLessons.includes(lessonId)) {
      setCompletedLessons(completedLessons.filter(id => id !== lessonId));
    } else {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Link to="/learning-center">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning Center
        </Button>
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Course Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            {course.imageUrl && (
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className={levelColorMap[course.level as keyof typeof levelColorMap]}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                {course.certification && (
                  <Badge className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30">
                    <Trophy className="w-3 h-3 mr-1" /> Certification
                  </Badge>
                )}
              </div>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription className="text-slate-300">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-400 mb-1">Course Progress</div>
                <div className="flex items-center space-x-4">
                  <Progress value={calculateProgress()} className="flex-grow" />
                  <span className="text-sm font-medium">{calculateProgress()}%</span>
                </div>
              </div>
              
              <div className="flex items-center text-slate-300">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatDuration(course.duration)}</span>
              </div>
              
              {course.learningOutcomes && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">What you'll learn</div>
                  <div className="space-y-2">
                    {course.learningOutcomes.map((outcome, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm text-slate-300">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                {completedLessons.length > 0 ? "Continue Learning" : "Start Course"}
              </Button>
            </CardFooter>
          </Card>
          
          {course.certification && (
            <Card className="bg-gradient-to-r from-amber-950/50 to-amber-900/30 border-amber-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="h-5 w-5 text-amber-400 mr-2" />
                  Certification Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Complete this course to earn your Trade Hybrid Pro Trader certification. Demonstrate your expertise and enhance your trading credibility.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-amber-700/50 hover:border-amber-600/50">
                  View Certification Details
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        {/* Course Content */}
        <div className="lg:w-2/3">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          
          {courseModules.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {courseModules.sort((a, b) => a.orderNum - b.orderNum).map(module => {
                // Count completed lessons in this module
                const moduleLessons = module.lessons || [];
                const completedModuleLessons = moduleLessons.filter(lesson => 
                  completedLessons.includes(lesson.id)
                ).length;
                
                return (
                  <AccordionItem 
                    key={module.id} 
                    value={`module-${module.id}`}
                    className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-4 hover:bg-slate-750/50">
                      <div className="flex flex-col items-start text-left">
                        <div className="flex items-center">
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 mr-2">
                            Module {module.orderNum}
                          </span>
                          {completedModuleLessons === moduleLessons.length && moduleLessons.length > 0 ? (
                            <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" /> Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-700">
                              {completedModuleLessons > 0 
                                ? `${completedModuleLessons}/${moduleLessons.length} completed`
                                : 'Not started'}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-medium mt-1">{module.title}</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      <div className="space-y-1 pt-2 pb-4">
                        {moduleLessons.sort((a, b) => a.orderNum - b.orderNum).map(lesson => (
                          <div 
                            key={lesson.id}
                            className="px-4 py-3 hover:bg-slate-700/30 transition-colors flex items-center justify-between cursor-pointer"
                            onClick={() => toggleLessonCompletion(lesson.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 flex items-center justify-center">
                                {lesson.videoUrl ? (
                                  <Video className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <BookOpen className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-md">{lesson.title}</h4>
                                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDuration(lesson.duration)}
                                  </span>
                                  {lesson.resources && lesson.resources.length > 0 && (
                                    <span className="flex items-center">
                                      <FileText className="w-3 h-3 mr-1" />
                                      {lesson.resources.length} {lesson.resources.length === 1 ? 'resource' : 'resources'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              {completedLessons.includes(lesson.id) ? (
                                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-800 rounded-lg border border-slate-700">
              <BookOpen className="h-12 w-12 text-slate-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">Content Coming Soon</h3>
              <p className="text-slate-400 max-w-md">
                We're currently building out the content for this course. Check back soon for updates!
              </p>
            </div>
          )}
          
          {courseModules.length > 0 && (
            <div className="mt-8 flex justify-between">
              <Button variant="outline">
                <Link to="/learning-center" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Courses
                </Link>
              </Button>
              
              <Button>
                {completedLessons.length > 0 ? (
                  <span className="flex items-center">
                    Continue Learning
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Start First Lesson
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}