import { create } from 'zustand';
import axios from 'axios';

export interface Course {
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

export interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderNum: number;
  lessons: Lesson[];
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface Lesson {
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

export interface Quiz {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserProgress {
  completedLessons: number[];
  quizResults: { [quizId: number]: QuizResult };
}

export interface QuizResult {
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
      console.error('Error fetching courses:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch courses', 
        isLoading: false 
      });
      return [];
    }
  },
  
  // Fetch a specific course with details
  fetchCourseDetails: async (courseId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/learning/courses/${courseId}`);
      set(state => {
        const updatedCourses = [...state.courses];
        const existingIndex = updatedCourses.findIndex(c => c.id === courseId);
        
        if (existingIndex !== -1) {
          updatedCourses[existingIndex] = response.data;
        } else {
          updatedCourses.push(response.data);
        }
        
        return { 
          courses: updatedCourses, 
          isLoading: false 
        };
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to fetch course ${courseId}`, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch modules for a course
  fetchModulesForCourse: async (courseId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/learning/courses/${courseId}/modules`);
      
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
      console.error(`Error fetching modules for course ${courseId}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to fetch modules for course ${courseId}`, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch lessons for a module
  fetchLessonsForModule: async (moduleId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/learning/modules/${moduleId}/lessons`);
      
      set(state => ({
        lessons: {
          ...state.lessons,
          [moduleId]: response.data
        },
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching lessons for module ${moduleId}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to fetch lessons for module ${moduleId}`, 
        isLoading: false 
      });
      throw error;
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
      console.error(`Error fetching quiz for lesson ${lessonId}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Failed to fetch quiz for lesson ${lessonId}`, 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Mark a lesson as completed
  markLessonCompleted: async (lessonId: number) => {
    try {
      // First find the module and course IDs
      let moduleId = null;
      let courseId = null;
      
      // Look for the lesson in our state
      const { modules, lessons } = get();
      
      // Try to find the module from our lessons object
      for (const [modId, lessonList] of Object.entries(lessons)) {
        if (lessonList.find(lesson => lesson.id === lessonId)) {
          moduleId = parseInt(modId);
          break;
        }
      }
      
      // If we found the module, find the course
      if (moduleId) {
        for (const [cId, moduleList] of Object.entries(modules)) {
          if (moduleList.find(module => module.id === moduleId)) {
            courseId = parseInt(cId);
            break;
          }
        }
      }
      
      // Now mark the lesson as completed
      await axios.post('/api/learning/progress/lesson-complete', {
        lessonId,
        courseId,
        moduleId
      });
      
      // Update local state
      set(state => ({
        userProgress: {
          ...state.userProgress,
          completedLessons: [...state.userProgress.completedLessons, lessonId]
        }
      }));
    } catch (error) {
      console.error(`Error marking lesson ${lessonId} as completed:`, error);
      throw error;
    }
  },
  
  // Submit quiz attempt
  submitQuizAttempt: async (quizId: number, answers: number[]) => {
    try {
      const response = await axios.post('/api/learning/quiz/submit', {
        quizId,
        answers
      });
      
      const result = response.data;
      
      // Update local state
      set(state => ({
        userProgress: {
          ...state.userProgress,
          quizResults: {
            ...state.userProgress.quizResults,
            [quizId]: result
          }
        }
      }));
      
      return result;
    } catch (error) {
      console.error(`Error submitting quiz ${quizId} attempt:`, error);
      throw error;
    }
  }
}));