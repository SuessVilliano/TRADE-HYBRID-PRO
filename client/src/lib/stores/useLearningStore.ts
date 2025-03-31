import { create } from 'zustand';
import axios from 'axios';

// Define interface types
export interface Course {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  level: string; // 'beginner', 'intermediate', 'advanced', 'all-levels'
  category: string; // 'crypto', 'forex', 'stocks', 'futures', 'general'
  duration: number; // in minutes
  points: number;
  featured: boolean;
  prerequisites?: number[]; // array of prerequisite course IDs
  learning_outcomes?: string[]; // array of learning outcomes
  certification: boolean;
  certificate_image_url?: string;
  modules?: Module[];
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order_num: number;
  lessons?: Lesson[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description?: string;
  content: string; // HTML content
  order_num: number;
  video_url?: string;
  interactive_content?: any;
  resources?: any[];
  duration: number; // in minutes
  quiz?: Quiz;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit?: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // Array of options
  correctAnswer: number; // Index of correct option
  explanation: string;
}

export interface UserCourseProgress {
  id: number;
  user_id: string;
  course_id: number;
  module_id?: number;
  lesson_id?: number;
  completed: boolean;
  percentage_complete: number;
  last_accessed_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: number;
  user_id: string;
  quiz_id: number;
  score: number;
  passed: boolean;
  answers: any; // User's answers
  time_spent?: number; // in seconds
  completed_at: string;
  created_at: string;
}

export interface Certificate {
  id: number;
  user_id: string;
  course_id: number;
  certificate_id: string;
  issue_date: string;
  expiry_date?: string;
  metadata?: any;
  created_at: string;
}

export interface LearningJournalEntry {
  id: number;
  user_id: number;
  content: string;
  course_id?: number;
  lesson_id?: number;
  related_to_trade_entry?: number;
  created_at: string;
  updated_at: string;
}

// Journal entry input type
type JournalEntryInput = {
  content: string;
  course_id?: number | null;
  lesson_id?: number | null;
  related_to_trade_entry?: number | null;
};

// Define store interface 
interface LearningStore {
  // Courses
  courses: Course[];
  currentCourse: Course | null;
  currentModule: Module | null;
  currentLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseId: number) => Promise<Course | null>;
  setCurrentLesson: (lesson: Lesson | null) => void;
  setCurrentModule: (module: Module | null) => void;
  
  // User Progress
  userProgress: UserCourseProgress[];
  quizAttempts: QuizAttempt[];
  fetchUserProgress: () => Promise<void>;
  fetchQuizAttempts: () => Promise<void>;
  markLessonComplete: (lessonId: number, courseId: number) => Promise<void>;
  submitQuiz: (quizId: number, answers: Record<number, number>) => Promise<{passed: boolean; score: number}>;
  
  // Certificates
  certificates: Certificate[];
  fetchCertificates: () => Promise<void>;
  
  // Learning Journal
  journalEntries: LearningJournalEntry[];
  fetchJournalEntries: () => Promise<void>;
  createJournalEntry: (entry: JournalEntryInput) => Promise<void>;
  updateJournalEntry: (entryId: number, data: Partial<JournalEntryInput>) => Promise<void>;
  deleteJournalEntry: (entryId: number) => Promise<void>;
}

// API base URL
const API_URL = '/api/learning';

// Create and export the store
export const useLearningStore = create<LearningStore>((set, get) => ({
  // Initial state
  courses: [],
  currentCourse: null,
  currentModule: null,
  currentLesson: null,
  userProgress: [],
  quizAttempts: [],
  certificates: [],
  journalEntries: [],
  isLoading: false,
  error: null,

  // Set current lesson
  setCurrentLesson: (lesson: Lesson | null) => {
    set({ currentLesson: lesson });
  },

  // Set current module
  setCurrentModule: (module: Module | null) => {
    set({ currentModule: module });
  },

  // Fetch all courses
  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/courses`);
      set({ courses: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching courses:', error);
      set({ 
        error: 'Failed to fetch courses. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Fetch a specific course with modules and lessons
  fetchCourse: async (courseId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/courses/${courseId}`);
      set({ currentCourse: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      set({ 
        error: 'Failed to fetch course details. Please try again later.', 
        isLoading: false 
      });
      return null;
    }
  },

  // Fetch user's progress for all courses
  fetchUserProgress: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/progress`);
      set({ userProgress: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching user progress:', error);
      set({ 
        error: 'Failed to fetch learning progress. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Fetch quiz attempts
  fetchQuizAttempts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/quiz-attempts`);
      set({ quizAttempts: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      set({ 
        error: 'Failed to fetch quiz attempts. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Mark a lesson as complete
  markLessonComplete: async (lessonId: number, courseId: number) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/progress/lesson-complete`, { 
        lessonId, 
        courseId 
      });
      
      // Update local state
      await get().fetchUserProgress();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      set({ 
        error: 'Failed to update progress. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Submit quiz answers
  submitQuiz: async (quizId: number, answers: Record<number, number>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/quiz/submit`, { 
        quizId, 
        answers 
      });
      
      // Update local state
      await get().fetchUserProgress();
      await get().fetchQuizAttempts();
      set({ isLoading: false });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      set({ 
        error: 'Failed to submit quiz. Please try again later.', 
        isLoading: false 
      });
      return { passed: false, score: 0 };
    }
  },

  // Fetch user certificates
  fetchCertificates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/certificates`);
      set({ certificates: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching certificates:', error);
      set({ 
        error: 'Failed to fetch certificates. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Fetch learning journal entries
  fetchJournalEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/journal`);
      set({ journalEntries: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      set({ 
        error: 'Failed to fetch journal entries. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Create a new journal entry
  createJournalEntry: async (entry: JournalEntryInput) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/journal`, entry);
      
      // Refresh journal entries
      await get().fetchJournalEntries();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error creating journal entry:', error);
      set({ 
        error: 'Failed to create journal entry. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Update an existing journal entry
  updateJournalEntry: async (entryId: number, data: Partial<JournalEntryInput>) => {
    set({ isLoading: true, error: null });
    try {
      await axios.put(`${API_URL}/journal/${entryId}`, data);
      
      // Refresh journal entries
      await get().fetchJournalEntries();
      set({ isLoading: false });
    } catch (error) {
      console.error(`Error updating journal entry ${entryId}:`, error);
      set({ 
        error: 'Failed to update journal entry. Please try again later.', 
        isLoading: false 
      });
    }
  },

  // Delete a journal entry
  deleteJournalEntry: async (entryId: number) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/journal/${entryId}`);
      
      // Update local state - remove the deleted entry
      const currentEntries = get().journalEntries;
      set({ 
        journalEntries: currentEntries.filter(entry => entry.id !== entryId),
        isLoading: false 
      });
    } catch (error) {
      console.error(`Error deleting journal entry ${entryId}:`, error);
      set({ 
        error: 'Failed to delete journal entry. Please try again later.', 
        isLoading: false 
      });
    }
  }
}));