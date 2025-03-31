import { create } from 'zustand';
import axios from 'axios';

// Define interface types
export interface Course {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'crypto' | 'forex' | 'stocks' | 'futures' | 'general';
  estimated_duration: number; // in minutes
  modules?: Module[];
  created_at: Date;
  updated_at: Date;
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  order: number;
  lessons?: Lesson[];
  created_at: Date;
  updated_at: Date;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  content: string; // HTML content
  order: number;
  video_url?: string;
  estimated_duration: number; // in minutes
  has_quiz: boolean;
  quiz_questions?: QuizQuestion[];
  created_at: Date;
  updated_at: Date;
}

export interface QuizQuestion {
  id: number;
  lesson_id: number;
  question: string;
  options: string[]; // JSON array of options
  correct_answer: number; // Index of correct option
  explanation: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCourseProgress {
  id: number;
  user_id: number;
  course_id: number;
  completed_lessons: number[];
  completed_quizzes: number[];
  completed_at?: Date;
  certificate_issued: boolean;
  certificate_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  issued_at: Date;
  certificate_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface LearningJournalEntry {
  id: number;
  user_id: number;
  course_id?: number;
  lesson_id?: number;
  title: string;
  content: string;
  tags?: string[]; // JSON array of tags
  created_at: Date;
  updated_at: Date;
}

// Journal entry input type
type JournalEntryInput = {
  title: string;
  content: string;
  course_id?: number | null;
  lesson_id?: number | null;
  tags?: string[];
};

// Define store interface 
interface LearningStore {
  // Courses
  courses: Course[];
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseId: number) => Promise<void>;
  
  // User Progress
  userProgress: UserCourseProgress[];
  fetchUserProgress: () => Promise<void>;
  markLessonComplete: (lessonId: number, courseId: number) => Promise<void>;
  submitQuiz: (lessonId: number, answers: Record<number, number>) => Promise<{passed: boolean; score: number}>;
  
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
  currentLesson: null,
  userProgress: [],
  certificates: [],
  journalEntries: [],
  isLoading: false,
  error: null,

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
  submitQuiz: async (lessonId: number, answers: Record<number, number>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/quiz/submit`, { 
        lessonId, 
        answers 
      });
      
      // Update local state
      await get().fetchUserProgress();
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