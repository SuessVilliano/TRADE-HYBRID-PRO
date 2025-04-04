import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLearningStore } from '../../lib/stores/useLearningStore';

interface QuizAnswer {
  questionId: number;
  selectedOption: number;
}

const LessonDetail: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { 
    fetchCourse, 
    currentCourse,
    markLessonComplete,
    submitQuiz,
    isLoading,
    error,
  } = useLearningStore();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{
    passed: boolean;
    score: number;
    correctAnswers?: number;
    totalQuestions?: number;
    passingScore?: number;
  } | null>(null);
  
  const lessonIdNum = parseInt(lessonId || '0');
  const courseIdNum = parseInt(courseId || '0');
  
  // Find the current lesson and module from the course data
  const currentLesson = currentCourse?.modules
    ?.flatMap(module => module.lessons || [])
    .find(lesson => lesson.id === lessonIdNum);
  
  const currentModule = currentCourse?.modules
    ?.find(module => module.lessons?.some(lesson => lesson.id === lessonIdNum));
  
  // Next lesson navigation
  const getNextLesson = () => {
    if (!currentModule || !currentLesson) return null;
    
    const lessonIndex = currentModule.lessons?.findIndex(l => l.id === lessonIdNum) || 0;
    
    // If there are more lessons in this module
    if (currentModule.lessons && lessonIndex < currentModule.lessons.length - 1) {
      return currentModule.lessons[lessonIndex + 1];
    }
    
    // If this is the last lesson, find the next module
    if (currentCourse?.modules) {
      const moduleIndex = currentCourse.modules.findIndex(m => m.id === currentModule.id);
      if (moduleIndex < currentCourse.modules.length - 1) {
        const nextModule = currentCourse.modules[moduleIndex + 1];
        if (nextModule.lessons && nextModule.lessons.length > 0) {
          return nextModule.lessons[0];
        }
      }
    }
    
    return null;
  };
  
  // Fetch course data if needed
  useEffect(() => {
    if (courseIdNum) {
      fetchCourse(courseIdNum);
    }
  }, [courseIdNum, fetchCourse]);
  
  // Handle marking lesson as completed
  const handleCompleteLesson = async () => {
    if (lessonIdNum && courseIdNum) {
      await markLessonComplete(lessonIdNum, courseIdNum);
      
      // If this lesson has a quiz, show it
      if (currentLesson?.quiz) {
        setShowQuiz(true);
      } else {
        // Otherwise navigate to the next lesson or back to course
        const nextLesson = getNextLesson();
        if (nextLesson) {
          navigate(`/learning-center/courses/${courseId}/lessons/${nextLesson.id}`);
        } else {
          navigate(`/learning-center/courses/${courseId}`);
        }
      }
    }
  };
  
  // Handle quiz answer selection
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };
  
  // Submit quiz answers
  const handleSubmitQuiz = async () => {
    if (currentLesson?.quiz) {
      const result = await submitQuiz(currentLesson.quiz.id, quizAnswers);
      setQuizResult(result);
    }
  };
  
  // Handle continuing after quiz
  const handleContinueAfterQuiz = () => {
    // If quiz was passed, go to next lesson or back to course
    const nextLesson = getNextLesson();
    if (nextLesson) {
      navigate(`/learning-center/courses/${courseId}/lessons/${nextLesson.id}`);
    } else {
      navigate(`/learning-center/courses/${courseId}`);
    }
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
  if (!currentLesson || !currentCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Lesson not found. Please go back to the course.</p>
          <button
            onClick={() => navigate(`/learning-center/courses/${courseId}`)}
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
        onClick={() => navigate(`/learning-center/courses/${courseId}`)}
        className="flex items-center text-primary hover:text-primary-dark mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Course: {currentCourse.title}
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
            {currentModule && (
              <span className="text-sm font-medium text-gray-500">
                Module: {currentModule.title}
              </span>
            )}
          </div>
          
          {/* Video if available */}
          {currentLesson.video_url && (
            <div className="mb-8">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={currentLesson.video_url}
                  className="w-full h-full"
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Lesson Content - don't show if quiz is showing */}
          {!showQuiz && (
            <>
              <div 
                className="prose prose-slate max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
              ></div>
              
              {/* Resources Section */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Additional Resources</h3>
                  <ul className="space-y-2">
                    {currentLesson.resources.map((resource, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {resource.title}
                          <span className="text-sm text-gray-500 ml-2">
                            ({resource.type})
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Complete Lesson Button */}
              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleCompleteLesson}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {currentLesson.quiz ? "Complete & Continue to Quiz" : "Mark as Complete & Continue"}
                </button>
              </div>
            </>
          )}
          
          {/* Quiz Section */}
          {showQuiz && currentLesson.quiz && !quizResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Quiz: {currentLesson.quiz.title}</h2>
              
              {currentLesson.quiz.description && (
                <p className="text-gray-600 mb-6">{currentLesson.quiz.description}</p>
              )}
              
              <div className="space-y-8">
                {currentLesson.quiz.questions.map((question, questionIndex) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium mb-4">
                      {questionIndex + 1}. {question.question}
                    </h3>
                    
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <label 
                          key={optionIndex}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            quizAnswers[question.id] === optionIndex 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            className="form-radio h-4 w-4 text-blue-600"
                            checked={quizAnswers[question.id] === optionIndex}
                            onChange={() => handleAnswerSelect(question.id, optionIndex)}
                          />
                          <span className="ml-3">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={
                    Object.keys(quizAnswers).length < currentLesson.quiz.questions.length
                  }
                  className={`px-6 py-3 rounded-lg ${
                    Object.keys(quizAnswers).length < currentLesson.quiz.questions.length
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          )}
          
          {/* Quiz Results */}
          {quizResult && (
            <div className={`rounded-lg p-6 text-center ${
              quizResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="mb-6">
                {quizResult.passed ? (
                  <div className="inline-block p-3 rounded-full bg-green-100">
                    <svg className="w-16 h-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="inline-block p-3 rounded-full bg-red-100">
                    <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h2 className={`text-2xl font-bold mb-2 ${
                quizResult.passed ? 'text-green-800' : 'text-red-800'
              }`}>
                {quizResult.passed ? 'Congratulations!' : 'Try Again'}
              </h2>
              
              <p className="text-lg mb-4">
                {quizResult.passed 
                  ? "You've successfully passed the quiz!" 
                  : "You didn't meet the passing requirement. Review the lesson and try again."}
              </p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Your Score</p>
                  <p className="text-xl font-bold">{quizResult.score}%</p>
                </div>
                
                <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500">Passing Score</p>
                  <p className="text-xl font-bold">{quizResult.passingScore}%</p>
                </div>
                
                {quizResult.correctAnswers !== undefined && (
                  <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Correct Answers</p>
                    <p className="text-xl font-bold">{quizResult.correctAnswers}/{quizResult.totalQuestions}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                {quizResult.passed ? (
                  <button
                    onClick={handleContinueAfterQuiz}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Continue
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                    >
                      Review Lesson
                    </button>
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizResult(null);
                      }}
                      className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 ml-0 mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto"
                    >
                      Retry Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;