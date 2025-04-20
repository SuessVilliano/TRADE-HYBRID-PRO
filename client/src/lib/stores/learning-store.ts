import { create } from 'zustand';
import axios from 'axios';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  points: number;
  imageUrl?: string;
  featured: boolean;
  prerequisites: number[];
  learningOutcomes: string[];
  certification: boolean;
  certificateImageUrl?: string;
}

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderNum: number;
  lessons: Lesson[];
}

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
}

interface Quiz {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface UserProgress {
  completedLessons: number[];
  quizResults: { [quizId: number]: QuizResult };
}

interface QuizResult {
  score: number;
  completed: boolean;
  passed: boolean;
  attemptCount: number;
}

interface LearningStore {
  courses: Course[];
  modules: { [courseId: number]: Module[] };
  lessons: { [moduleId: number]: Lesson[] };
  quizzes: { [lessonId: number]: Quiz };
  userProgress: UserProgress;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCourses: () => Promise<Course[]>;
  fetchCourseDetails: (courseId: number) => Promise<Course>;
  fetchModulesForCourse: (courseId: number) => Promise<Module[]>;
  fetchLessonsForModule: (moduleId: number) => Promise<Lesson[]>;
  fetchQuizForLesson: (lessonId: number) => Promise<Quiz>;
  markLessonCompleted: (lessonId: number) => Promise<void>;
  submitQuizAttempt: (quizId: number, answers: number[]) => Promise<QuizResult>;
}

export const useLearningStore = create<LearningStore>((set, get) => ({
  courses: [],
  modules: {},
  lessons: {},
  quizzes: {},
  userProgress: {
    completedLessons: [],
    quizResults: {}
  },
  isLoading: false,
  error: null,
  
  // Fetch all courses
  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get('/api/learning/courses');
      set({ courses: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: errorMessage, isLoading: false });
      console.error("Error fetching courses:", error);
      return [];
    }
  },
  
  // Fetch single course details
  fetchCourseDetails: async (courseId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/learning/courses/${courseId}`);
      
      // Update the course in the courses array
      set(state => {
        const courseIndex = state.courses.findIndex(c => c.id === courseId);
        
        if (courseIndex >= 0) {
          const updatedCourses = [...state.courses];
          updatedCourses[courseIndex] = response.data;
          return { courses: updatedCourses, isLoading: false };
        } else {
          return { 
            courses: [...state.courses, response.data],
            isLoading: false 
          };
        }
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch course ${courseId}`;
      set({ error: errorMessage, isLoading: false });
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },
  
  // Fetch modules for a course
  fetchModulesForCourse: async (courseId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/learning/courses/${courseId}/modules`);
      
      // Initialize empty lessons arrays for each module
      const modulesWithEmptyLessons = response.data.map((module: Module) => ({
        ...module,
        lessons: []
      }));
      
      set(state => ({
        modules: {
          ...state.modules,
          [courseId]: modulesWithEmptyLessons
        },
        isLoading: false
      }));
      
      return modulesWithEmptyLessons;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch modules for course ${courseId}`;
      set({ error: errorMessage, isLoading: false });
      console.error(`Error fetching modules for course ${courseId}:`, error);
      return [];
    }
  },
  
  // Fetch lessons for a module
  fetchLessonsForModule: async (moduleId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/learning/modules/${moduleId}/lessons`);
      
      // Update lessons for this module
      set(state => ({
        lessons: {
          ...state.lessons,
          [moduleId]: response.data
        },
        isLoading: false
      }));
      
      // Also update the lessons in the module object within the modules object
      set(state => {
        const updatedModules = { ...state.modules };
        
        // Find which course this module belongs to
        for (const courseId in updatedModules) {
          const moduleIndex = updatedModules[courseId].findIndex(m => m.id === moduleId);
          
          if (moduleIndex >= 0) {
            updatedModules[courseId] = [...updatedModules[courseId]];
            updatedModules[courseId][moduleIndex] = {
              ...updatedModules[courseId][moduleIndex],
              lessons: response.data
            };
            break;
          }
        }
        
        return { modules: updatedModules };
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch lessons for module ${moduleId}`;
      set({ error: errorMessage, isLoading: false });
      console.error(`Error fetching lessons for module ${moduleId}:`, error);
      return [];
    }
  },
  
  // Fetch quiz for a lesson
  fetchQuizForLesson: async (lessonId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/learning/lessons/${lessonId}/quiz`);
      
      set(state => ({
        quizzes: {
          ...state.quizzes,
          [lessonId]: response.data
        },
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch quiz for lesson ${lessonId}`;
      set({ error: errorMessage, isLoading: false });
      console.error(`Error fetching quiz for lesson ${lessonId}:`, error);
      throw error;
    }
  },
  
  // Mark a lesson as completed
  markLessonCompleted: async (lessonId: number) => {
    try {
      await axios.post(`/api/learning/lessons/${lessonId}/complete`);
      
      // Update local user progress
      set(state => ({
        userProgress: {
          ...state.userProgress,
          completedLessons: state.userProgress.completedLessons.includes(lessonId)
            ? state.userProgress.completedLessons
            : [...state.userProgress.completedLessons, lessonId]
        }
      }));
    } catch (error) {
      console.error(`Error marking lesson ${lessonId} as completed:`, error);
      throw error;
    }
  },
  
  // Submit a quiz attempt
  submitQuizAttempt: async (quizId: number, answers: number[]) => {
    try {
      const response = await axios.post(`/api/learning/quizzes/${quizId}/attempt`, { answers });
      
      // Update local quiz results
      set(state => ({
        userProgress: {
          ...state.userProgress,
          quizResults: {
            ...state.userProgress.quizResults,
            [quizId]: response.data
          }
        }
      }));
      
      return response.data;
    } catch (error) {
      console.error(`Error submitting attempt for quiz ${quizId}:`, error);
      throw error;
    }
  }
}));