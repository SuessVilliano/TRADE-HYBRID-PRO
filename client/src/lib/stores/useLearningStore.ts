import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExperienceLevel, TopicInterest } from '@/components/learning/learning-assessment';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  topics: TopicInterest[];
  experienceLevel: ExperienceLevel;
  completed: boolean;
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  experienceLevel: ExperienceLevel;
  topics: TopicInterest[];
  modules: string[]; // Array of module IDs
  progress: number; // 0-100
}

interface UserLearningProfile {
  experienceLevel: ExperienceLevel;
  topicInterests: TopicInterest[];
  availableTime: number;
  completedModules: string[];
  inProgressModules: string[];
  bookmarkedModules: string[];
  assessmentCompleted: boolean;
  assessmentLastUpdated?: string;
}

interface LearningStoreState {
  modules: LearningModule[];
  paths: LearningPath[];
  userProfile: UserLearningProfile;
  
  // Learning assessment actions
  saveAssessmentResults: (experienceLevel: ExperienceLevel, topicInterests: TopicInterest[], availableTime: number) => void;
  resetAssessment: () => void;
  
  // Module actions
  startModule: (moduleId: string) => void;
  completeModule: (moduleId: string) => void;
  updateModuleProgress: (moduleId: string, progress: number) => void;
  bookmarkModule: (moduleId: string) => void;
  unbookmarkModule: (moduleId: string) => void;
  
  // Path actions
  getRecommendedPaths: () => LearningPath[];
  getPathById: (pathId: string) => LearningPath | undefined;
  getPathsForTopic: (topic: TopicInterest) => LearningPath[];
  
  // Module getters
  getModuleById: (moduleId: string) => LearningModule | undefined;
  getModulesForPath: (pathId: string) => LearningModule[];
  getBookmarkedModules: () => LearningModule[];
  getInProgressModules: () => LearningModule[];
  getCompletedModules: () => LearningModule[];
}

export const useLearningStore = create<LearningStoreState>()(
  persist(
    (set, get) => ({
      modules: [],
      paths: [],
      userProfile: {
        experienceLevel: 'beginner',
        topicInterests: [],
        availableTime: 5,
        completedModules: [],
        inProgressModules: [],
        bookmarkedModules: [],
        assessmentCompleted: false,
      },
      
      // Learning assessment actions
      saveAssessmentResults: (experienceLevel, topicInterests, availableTime) => set(state => ({
        userProfile: {
          ...state.userProfile,
          experienceLevel,
          topicInterests,
          availableTime,
          assessmentCompleted: true,
          assessmentLastUpdated: new Date().toISOString(),
        }
      })),
      
      resetAssessment: () => set(state => ({
        userProfile: {
          ...state.userProfile,
          assessmentCompleted: false,
          experienceLevel: 'beginner',
          topicInterests: [],
          availableTime: 5,
        }
      })),
      
      // Module actions
      startModule: (moduleId) => set(state => {
        const module = state.modules.find(m => m.id === moduleId);
        if (!module) return state;
        
        const inProgressModules = [...state.userProfile.inProgressModules];
        if (!inProgressModules.includes(moduleId)) {
          inProgressModules.push(moduleId);
        }
        
        return {
          modules: state.modules.map(m => 
            m.id === moduleId 
              ? { ...m, progress: Math.max(m.progress, 1), startedAt: m.startedAt || new Date().toISOString() } 
              : m
          ),
          userProfile: {
            ...state.userProfile,
            inProgressModules,
          }
        };
      }),
      
      completeModule: (moduleId) => set(state => {
        const module = state.modules.find(m => m.id === moduleId);
        if (!module) return state;
        
        const inProgressModules = state.userProfile.inProgressModules.filter(id => id !== moduleId);
        const completedModules = [...state.userProfile.completedModules];
        if (!completedModules.includes(moduleId)) {
          completedModules.push(moduleId);
        }
        
        return {
          modules: state.modules.map(m => 
            m.id === moduleId 
              ? { ...m, completed: true, progress: 100, completedAt: new Date().toISOString() } 
              : m
          ),
          userProfile: {
            ...state.userProfile,
            completedModules,
            inProgressModules,
          }
        };
      }),
      
      updateModuleProgress: (moduleId, progress) => set(state => ({
        modules: state.modules.map(m => 
          m.id === moduleId 
            ? { ...m, progress: Math.max(m.progress, progress) } 
            : m
        )
      })),
      
      bookmarkModule: (moduleId) => set(state => {
        const bookmarkedModules = [...state.userProfile.bookmarkedModules];
        if (!bookmarkedModules.includes(moduleId)) {
          bookmarkedModules.push(moduleId);
        }
        
        return {
          userProfile: {
            ...state.userProfile,
            bookmarkedModules,
          }
        };
      }),
      
      unbookmarkModule: (moduleId) => set(state => ({
        userProfile: {
          ...state.userProfile,
          bookmarkedModules: state.userProfile.bookmarkedModules.filter(id => id !== moduleId),
        }
      })),
      
      // Path actions
      getRecommendedPaths: () => {
        const { experienceLevel, topicInterests } = get().userProfile;
        
        return get().paths.filter(path => {
          // Match experience level
          const matchesExperience = path.experienceLevel === experienceLevel;
          
          // Check if any of the path topics match user interests
          const matchesTopics = path.topics.some(topic => 
            topicInterests.includes(topic)
          );
          
          return matchesExperience && matchesTopics;
        });
      },
      
      getPathById: (pathId) => {
        return get().paths.find(path => path.id === pathId);
      },
      
      getPathsForTopic: (topic) => {
        return get().paths.filter(path => path.topics.includes(topic));
      },
      
      // Module getters
      getModuleById: (moduleId) => {
        return get().modules.find(m => m.id === moduleId);
      },
      
      getModulesForPath: (pathId) => {
        const path = get().paths.find(p => p.id === pathId);
        if (!path) return [];
        
        return path.modules
          .map(moduleId => get().modules.find(m => m.id === moduleId))
          .filter((m): m is LearningModule => m !== undefined);
      },
      
      getBookmarkedModules: () => {
        const { bookmarkedModules } = get().userProfile;
        return get().modules.filter(m => bookmarkedModules.includes(m.id));
      },
      
      getInProgressModules: () => {
        const { inProgressModules } = get().userProfile;
        return get().modules.filter(m => inProgressModules.includes(m.id));
      },
      
      getCompletedModules: () => {
        const { completedModules } = get().userProfile;
        return get().modules.filter(m => completedModules.includes(m.id));
      },
    }),
    {
      name: 'learning-storage',
    }
  )
);