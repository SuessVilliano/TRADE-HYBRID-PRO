import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLearningStore, useCourseProgress, useQuizAttempts, type Lesson, type Quiz } from '../../lib/stores/useLearningStore';

const LessonDetail: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const { courses, isLoading, error, fetchCourse, setCurrent } = useLearningStore();
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'resources'>('content');
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizResponses, setQuizResponses] = useState<Record<string, any>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  
  const courseIdNum = parseInt(courseId || '0');
  const lessonIdNum = parseInt(lessonId || '0');
  
  const { progress, updateProgress } = useCourseProgress(courseIdNum);
  
  // Find the course, module, and lesson in our store
  const course = courses.find(c => c.id === courseIdNum);
  let currentLesson: Lesson | undefined;
  let currentModule: any;
  let nextLesson: Lesson | undefined;
  let prevLesson: Lesson | undefined;
  
  // Find current lesson, module, and adjacent lessons if they exist
  if (course?.modules) {
    for (const module of course.modules) {
      if (!module.lessons) continue;
      
      const lessonIndex = module.lessons.findIndex(l => l.id === lessonIdNum);
      
      if (lessonIndex >= 0) {
        currentLesson = module.lessons[lessonIndex];
        currentModule = module;
        
        // Find previous and next lessons
        if (lessonIndex > 0) {
          prevLesson = module.lessons[lessonIndex - 1];
        } else {
          // Look for the last lesson of the previous module
          const moduleIndex = course.modules.findIndex(m => m.id === module.id);
          if (moduleIndex > 0) {
            const prevModule = course.modules[moduleIndex - 1];
            if (prevModule.lessons?.length) {
              prevLesson = prevModule.lessons[prevModule.lessons.length - 1];
            }
          }
        }
        
        if (lessonIndex < module.lessons.length - 1) {
          nextLesson = module.lessons[lessonIndex + 1];
        } else {
          // Look for the first lesson of the next module
          const moduleIndex = course.modules.findIndex(m => m.id === module.id);
          if (moduleIndex < course.modules.length - 1) {
            const nextModule = course.modules[moduleIndex + 1];
            if (nextModule.lessons?.length) {
              nextLesson = nextModule.lessons[0];
            }
          }
        }
        
        break;
      }
    }
  }
  
  // Get quiz attempts for this lesson's quiz
  const { attempts, addAttempt } = useQuizAttempts(currentLesson?.quiz?.id || 0);
  
  useEffect(() => {
    if (courseIdNum) {
      // Fetch the course if needed
      if (!course || !course.modules) {
        fetchCourse(courseIdNum);
      }
      
      // Set current course, module, and lesson
      if (currentLesson && currentModule) {
        setCurrent(courseIdNum, currentModule.id, lessonIdNum);
        
        // Update progress for this lesson
        const allLessonsCount = course?.modules?.reduce((count, m) => count + (m.lessons?.length || 0), 0) || 1;
        const completedLessonCount = 1; // At least viewing this lesson
        
        const newPercentage = Math.round((completedLessonCount / allLessonsCount) * 100);
        
        // Only update if the new percentage is higher
        if (!progress || newPercentage > progress.percentageComplete) {
          updateProgress({
            courseId: courseIdNum,
            moduleId: currentModule.id,
            lessonId: lessonIdNum,
            percentageComplete: newPercentage
          });
        }
      }
    }
  }, [courseIdNum, lessonIdNum, course, currentLesson, currentModule, setCurrent, updateProgress, progress, fetchCourse]);
  
  // Handle navigation to next/previous lesson
  const navigateToLesson = (lesson?: Lesson) => {
    if (lesson) {
      navigate(`/learning/courses/${courseId}/lessons/${lesson.id}`);
    }
  };
  
  // Handle marking lesson as complete
  const markAsComplete = () => {
    if (course && currentModule && currentLesson) {
      // Calculate the new progress percentage
      const totalLessons = course.modules.reduce((count, m) => count + (m.lessons?.length || 0), 0);
      const completedLessons = (progress?.percentageComplete || 0) * totalLessons / 100 + 1;
      const newPercentage = Math.min(Math.round((completedLessons / totalLessons) * 100), 100);
      
      updateProgress({
        moduleId: currentModule.id,
        lessonId: currentLesson.id,
        percentageComplete: newPercentage
      });
      
      // Navigate to next lesson if available
      if (nextLesson) {
        navigateToLesson(nextLesson);
      }
    }
  };
  
  // Quiz handling functions
  const startQuiz = () => {
    setActiveTab('quiz');
    setQuizResponses({});
    setShowQuizResults(false);
    setQuizStartTime(new Date());
  };
  
  const handleQuizAnswer = (questionId: number, answer: any) => {
    setQuizResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const submitQuiz = (quiz: Quiz) => {
    const endTime = new Date();
    const timeSpent = quizStartTime ? Math.round((endTime.getTime() - quizStartTime.getTime()) / 1000) : 0;
    
    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    
    quiz.questions.forEach(question => {
      totalPoints += question.points;
      
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        if (quizResponses[question.id] === question.correctAnswer) {
          correctAnswers += question.points;
        }
      } else if (question.type === 'matching') {
        // For matching, check each key-value pair
        const userAnswers = quizResponses[question.id] || {};
        const correctMatches = Object.entries(userAnswers).filter(
          ([key, value]) => question.correctAnswer[key] === value
        ).length;
        
        // Award points proportionally
        const totalMatches = Object.keys(question.correctAnswer).length;
        correctAnswers += (correctMatches / totalMatches) * question.points;
      } else if (question.type === 'fill-in-blank') {
        // For fill-in-blank, compare strings ignoring case
        const userAnswer = String(quizResponses[question.id] || '').trim().toLowerCase();
        const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
        
        if (userAnswer === correctAnswer) {
          correctAnswers += question.points;
        }
      }
    });
    
    const scorePercentage = Math.round((correctAnswers / totalPoints) * 100);
    const passed = scorePercentage >= quiz.passingScore;
    
    // Save quiz attempt
    addAttempt({
      quizId: quiz.id,
      score: scorePercentage,
      passed,
      answers: quizResponses,
      timeSpent,
      completedAt: new Date()
    });
    
    // Update state to show results
    setQuizScore(scorePercentage);
    setQuizPassed(passed);
    setShowQuizResults(true);
    
    // If passed, update course progress
    if (passed && course && currentModule && currentLesson) {
      // Calculate the new progress percentage
      const totalLessons = course.modules.reduce((count, m) => count + (m.lessons?.length || 0), 0);
      const completedLessons = (progress?.percentageComplete || 0) * totalLessons / 100 + 1;
      const newPercentage = Math.min(Math.round((completedLessons / totalLessons) * 100), 100);
      
      updateProgress({
        moduleId: currentModule.id,
        lessonId: currentLesson.id,
        percentageComplete: newPercentage
      });
    }
  };
  
  // Render quiz questions
  const renderQuizQuestions = (quiz: Quiz) => {
    return (
      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium text-lg mb-2">
              {index + 1}. {question.text}
            </h4>
            
            {question.type === 'multiple-choice' && (
              <div className="space-y-2 mt-3">
                {question.options?.map((option, i) => (
                  <label key={i} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                    <input 
                      type="radio" 
                      name={`question-${question.id}`} 
                      checked={quizResponses[question.id] === option}
                      onChange={() => handleQuizAnswer(question.id, option)}
                      disabled={showQuizResults}
                      className="form-radio h-4 w-4 text-primary" 
                    />
                    <span>{option}</span>
                    
                    {showQuizResults && quizResponses[question.id] === option && (
                      option === question.correctAnswer ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )
                    )}
                  </label>
                ))}
                
                {showQuizResults && quizResponses[question.id] !== question.correctAnswer && (
                  <div className="mt-2 text-green-600">
                    <span className="font-medium">Correct answer: </span>
                    {question.correctAnswer}
                  </div>
                )}
              </div>
            )}
            
            {question.type === 'true-false' && (
              <div className="space-y-2 mt-3">
                {['True', 'False'].map((option) => (
                  <label key={option} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                    <input 
                      type="radio" 
                      name={`question-${question.id}`} 
                      checked={quizResponses[question.id] === (option === 'True')}
                      onChange={() => handleQuizAnswer(question.id, option === 'True')}
                      disabled={showQuizResults}
                      className="form-radio h-4 w-4 text-primary" 
                    />
                    <span>{option}</span>
                    
                    {showQuizResults && quizResponses[question.id] === (option === 'True') && (
                      (option === 'True') === question.correctAnswer ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )
                    )}
                  </label>
                ))}
                
                {showQuizResults && quizResponses[question.id] !== question.correctAnswer && (
                  <div className="mt-2 text-green-600">
                    <span className="font-medium">Correct answer: </span>
                    {question.correctAnswer ? 'True' : 'False'}
                  </div>
                )}
              </div>
            )}
            
            {question.type === 'fill-in-blank' && (
              <div className="mt-3">
                <input 
                  type="text" 
                  value={quizResponses[question.id] || ''}
                  onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                  disabled={showQuizResults}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent" 
                  placeholder="Your answer"
                />
                
                {showQuizResults && (
                  String(quizResponses[question.id] || '').trim().toLowerCase() === 
                  String(question.correctAnswer).trim().toLowerCase() ? (
                    <div className="mt-2 text-green-600 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Correct!
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="text-red-600 flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Incorrect
                      </div>
                      <div className="text-green-600 mt-1">
                        <span className="font-medium">Correct answer: </span>
                        {question.correctAnswer}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
        
        {!showQuizResults && (
          <button
            onClick={() => submitQuiz(quiz)}
            className="w-full mt-4 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Submit Quiz
          </button>
        )}
        
        {showQuizResults && (
          <div className={`p-4 rounded-lg ${quizPassed ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className={`text-lg font-medium ${quizPassed ? 'text-green-800' : 'text-red-800'}`}>
              {quizPassed ? 'Congratulations!' : 'Keep trying!'}
            </h3>
            <p className="mt-1">
              You scored {quizScore}%. {quizPassed 
                ? 'You have passed this quiz.' 
                : `You need ${quiz.passingScore}% to pass.`}
            </p>
            
            <div className="mt-3 flex space-x-4">
              {!quizPassed && (
                <button
                  onClick={startQuiz}
                  className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Retry Quiz
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('content')}
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to Lesson
              </button>
              
              {nextLesson && quizPassed && (
                <button
                  onClick={() => navigateToLesson(nextLesson)}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Next Lesson
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
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
  
  // If lesson not found
  if (!currentLesson || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Lesson not found. Please go back to the course.</p>
          <button
            onClick={() => navigate(`/learning/courses/${courseId}`)}
            className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/learning/courses/${courseId}`)}
        className="flex items-center text-primary hover:text-primary-dark mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Course
      </button>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
          <p className="text-gray-600">{course.title} / {currentModule.title}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {prevLesson && (
            <button
              onClick={() => navigateToLesson(prevLesson)}
              className="flex items-center text-gray-600 hover:text-primary"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          )}
          
          <button
            onClick={markAsComplete}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Mark as Complete
          </button>
          
          {nextLesson && (
            <button
              onClick={() => navigateToLesson(nextLesson)}
              className="flex items-center text-gray-600 hover:text-primary"
            >
              Next
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'content'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Lesson Content
            </button>
            
            {currentLesson.quiz && (
              <button
                onClick={startQuiz}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'quiz'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Quiz
              </button>
            )}
            
            {(currentLesson.resources?.length || 0) > 0 && (
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'resources'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                Resources
              </button>
            )}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'content' && (
            <div>
              {currentLesson.videoUrl && (
                <div className="mb-6">
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <iframe
                      src={currentLesson.videoUrl}
                      title={currentLesson.title}
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}
              
              <div className="prose max-w-none">
                {currentLesson.content}
              </div>
            </div>
          )}
          
          {activeTab === 'quiz' && currentLesson.quiz && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{currentLesson.quiz.title}</h2>
              <p className="text-gray-600 mb-6">{currentLesson.quiz.description}</p>
              
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">Passing Score: </span>
                  <span>{currentLesson.quiz.passingScore}%</span>
                </div>
                
                {currentLesson.quiz.timeLimit && (
                  <div>
                    <span className="font-medium">Time Limit: </span>
                    <span>{Math.floor(currentLesson.quiz.timeLimit / 60)} minutes</span>
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Questions: </span>
                  <span>{currentLesson.quiz.questions.length}</span>
                </div>
              </div>
              
              {attempts.length > 0 && !showQuizResults && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Previous Attempts</h3>
                  <p className="text-blue-600 mb-3">
                    You have attempted this quiz {attempts.length} time(s).
                    Your highest score is {Math.max(...attempts.map(a => a.score))}%.
                  </p>
                  
                  {!attempts.some(a => a.passed) && (
                    <p className="text-blue-600">
                      You haven't passed this quiz yet. Keep trying!
                    </p>
                  )}
                </div>
              )}
              
              {renderQuizQuestions(currentLesson.quiz)}
            </div>
          )}
          
          {activeTab === 'resources' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
              
              <div className="space-y-4">
                {currentLesson.resources?.map((resource, index) => (
                  <a
                    key={index}
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-primary">{resource}</span>
                    <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;