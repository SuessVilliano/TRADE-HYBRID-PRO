import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLearningStore, type Module, type Lesson, type Course } from '../../lib/stores/useLearningStore';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const { 
    courses, 
    fetchCourse, 
    isLoading, 
    error, 
    fetchUserProgress,
    userProgress,
    setCurrentLesson,
    setCurrentModule
  } = useLearningStore();
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  
  const courseIdNum = parseInt(courseId || '0');
  // Get progress for this specific course
  const progress = userProgress.find(p => p.course_id === courseIdNum);
  
  // Find the course in our store
  const course = courses.find(c => c.id === courseIdNum);
  
  // Retrieve active module
  const activeModule = course?.modules?.[activeModuleIndex];
  
  useEffect(() => {
    if (courseIdNum) {
      // Fetch the course if needed
      if (!course || !course.modules) {
        fetchCourse(courseIdNum);
      }
      
      // If we have progress data, set the active module based on where the user left off
      if (progress?.module_id) {
        const moduleIndex = course?.modules?.findIndex(m => m.id === progress.module_id) || 0;
        if (moduleIndex >= 0) {
          setActiveModuleIndex(moduleIndex);
        }
      }
    }
  }, [courseIdNum, fetchCourse, progress?.module_id, course]);
  
  // Handle module selection
  const handleModuleSelect = (index: number) => {
    setActiveModuleIndex(index);
    if (course && course.modules && course.modules[index]) {
      setCurrentModule(course.modules[index]);
    }
  };
  
  // Handle lesson selection
  const handleLessonSelect = (lesson: Lesson) => {
    if (course && activeModule) {
      setCurrentModule(activeModule);
      setCurrentLesson(lesson);
      navigate(`/learning/courses/${courseId}/lessons/${lesson.id}`);
    }
  };
  
  // Calculate progress percentage for a module
  const calculateModuleProgress = (module: Module) => {
    if (!progress) return 0;
    
    // If the user has completed the course, all modules are 100%
    if (progress.completed) return 100;
    
    // If this is a past module (based on order_num), it's 100%
    if (module.order_num < (activeModule?.order_num || 0)) return 100;
    
    // If this is a future module, it's 0%
    if (module.order_num > (activeModule?.order_num || 0)) return 0;
    
    // For the current module, return percentage based on lessons
    return progress.percentage_complete || 0;
  };
  
  // Function to render progress bar
  const ProgressBar = ({ percentage }: { percentage: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div 
        className="bg-green-500 h-2 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
  
  // If loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button 
            onClick={() => fetchCourse(courseIdNum)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // If course not found
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Course not found. Please go back to the Learning Center.</p>
          <button
            onClick={() => navigate('/learning')}
            className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Back to Learning Center
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/learning')}
        className="flex items-center text-primary hover:text-primary-dark mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Courses
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          {course.image_url ? (
            <img 
              src={course.image_url} 
              alt={course.title} 
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-white text-3xl font-bold">{course.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm">
                {course.category}
              </span>
              <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm capitalize">
                {course.level} Level
              </span>
              <span className="bg-black/30 text-white px-3 py-1 rounded-full text-sm">
                {Math.round(course.duration_minutes / 60)} hrs
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About this course</h2>
            <p className="text-gray-700">{course.description}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {course.tags.map(tag => (
                <span 
                  key={tag}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-3">Modules</h3>
                  <div className="space-y-3">
                    {course.modules?.map((module, index) => (
                      <div 
                        key={module.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          index === activeModuleIndex 
                            ? 'bg-primary text-white' 
                            : 'bg-white hover:bg-gray-100'
                        }`}
                        onClick={() => handleModuleSelect(index)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">{module.title}</h4>
                          <span className="text-xs">
                            {calculateModuleProgress(module)}%
                          </span>
                        </div>
                        <ProgressBar percentage={calculateModuleProgress(module)} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {progress && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-3">Your Progress</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Overall Completion</span>
                        <span className="font-medium">{progress.percentage_complete}%</span>
                      </div>
                      <ProgressBar percentage={progress.percentage_complete} />
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-gray-600">Last Accessed</span>
                        <span className="text-sm">
                          {new Date(progress.last_accessed_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {progress.completed && (
                        <div className="mt-3 flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Course Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                {activeModule ? (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">{activeModule.title}</h3>
                      <p className="text-gray-500 mt-1">{activeModule.description}</p>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {activeModule.lessons?.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleLessonSelect(lesson)}
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{lesson.title}</h4>
                            <span className="text-sm text-gray-500">
                              {lesson.duration_minutes} mins
                            </span>
                          </div>
                          <div className="mt-1 text-gray-500 text-sm line-clamp-2">
                            {lesson.content.substring(0, 120)}...
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm">
                            {lesson.quiz && (
                              <span className="text-blue-600 mr-3 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Has Quiz
                              </span>
                            )}
                            
                            {lesson.video_url && (
                              <span className="text-red-600 mr-3 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Video Lesson
                              </span>
                            )}
                            
                            {(lesson.resources?.length || 0) > 0 && (
                              <span className="text-green-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {lesson.resources?.length} Resources
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="mt-4 text-xl font-medium text-gray-700">No modules available</h3>
                    <p className="mt-2 text-gray-500">
                      This course doesn't have any modules yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;