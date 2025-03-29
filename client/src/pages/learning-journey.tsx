import React, { useState } from 'react';
import { PopupContainer } from '../components/ui/popup-container';
import { LearningJourneyRoadmap } from '../components/learn/learning-journey-roadmap';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { useUserStore } from '../lib/stores/useUserStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function LearningJourney() {
  const { isAuthenticated, user } = useUserStore();
  const [activeTab, setActiveTab] = useState('roadmap');
  
  const userProgress = {
    completedModules: 1,
    totalModules: 6,
    earnedBadges: isAuthenticated ? 1 : 0,
    totalLessons: 43,
    completedLessons: isAuthenticated ? 9 : 0,
    totalHours: 31
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Crypto Learning Journey</h1>
          <p className="text-slate-300 mt-1">Personalized learning path to crypto trading mastery</p>
        </div>
        <Link to="/learn">
          <Button variant="outline" size="sm">
            Back to Education Hub
          </Button>
        </Link>
      </div>
      
      {/* Progress Stats Section */}
      <PopupContainer padding className="mb-8 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-2">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((userProgress.completedLessons / userProgress.totalLessons) * 100)}%
            </div>
            <div className="text-sm text-slate-400">Overall Progress</div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl font-bold">
              {userProgress.completedModules}/{userProgress.totalModules}
            </div>
            <div className="text-sm text-slate-400">Modules Completed</div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl font-bold text-yellow-500">
              {userProgress.earnedBadges}
            </div>
            <div className="text-sm text-slate-400">Badges Earned</div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl font-bold">
              {userProgress.completedLessons}/{userProgress.totalLessons}
            </div>
            <div className="text-sm text-slate-400">Lessons Completed</div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl font-bold">
              {userProgress.totalHours}h
            </div>
            <div className="text-sm text-slate-400">Total Learning Time</div>
          </div>
        </div>
      </PopupContainer>
      
      {/* User not logged in message */}
      {!isAuthenticated && (
        <PopupContainer padding className="mb-8 bg-blue-900/30 border border-blue-500/30">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Track Your Progress</h2>
              <p className="text-slate-300 mb-4">
                Sign in to track your progress, earn certificates, and unlock personalized learning recommendations.
              </p>
            </div>
            <div className="flex gap-2">
              <Button>Sign In</Button>
              <Button variant="outline">Create Account</Button>
            </div>
          </div>
        </PopupContainer>
      )}
      
      {/* Main Tabs */}
      <Tabs defaultValue="roadmap" className="w-full mb-8" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="roadmap" className="px-6">Learning Roadmap</TabsTrigger>
          <TabsTrigger value="achievements" className="px-6">Achievements</TabsTrigger>
          <TabsTrigger value="settings" className="px-6">Learning Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roadmap" className="pt-4">
          <PopupContainer padding className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Your Personalized Learning Path</h2>
            <p className="text-slate-300 mb-6">
              This roadmap is designed to help you progress from the fundamentals to advanced concepts in crypto trading.
              Complete each module to unlock the next one and earn badges along the way.
            </p>
            <LearningJourneyRoadmap />
          </PopupContainer>
        </TabsContent>
        
        <TabsContent value="achievements" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PopupContainer padding>
              <h2 className="text-2xl font-bold mb-6">Your Badges</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* Unlocked Badge */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-2 border-4 border-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="font-medium">Crypto Pioneer</div>
                  <div className="text-xs text-slate-400">Earned {isAuthenticated ? '2 weeks ago' : ''}</div>
                </div>
                
                {/* Locked Badges */}
                {['Chart Master', 'Strategy Expert', 'Risk Guardian', 'DeFi Explorer'].map((badge, index) => (
                  <div key={index} className="text-center opacity-40">
                    <div className="w-24 h-24 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-2 border-4 border-slate-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="font-medium">{badge}</div>
                    <div className="text-xs text-slate-400">Locked</div>
                  </div>
                ))}
              </div>
            </PopupContainer>
            
            <PopupContainer padding>
              <h2 className="text-2xl font-bold mb-6">Certificates</h2>
              
              <div className="border border-slate-700 rounded-lg p-4 mb-4 bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">No Certificates Yet</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Complete a full learning track to earn your first certificate. 
                  Certificates can be shared on LinkedIn and other platforms.
                </p>
              </div>
              
              <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50 opacity-70">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Crypto Trading Fundamentals</h3>
                  <div className="text-xs bg-purple-900 px-2 py-1 rounded-full">Coming Soon</div>
                </div>
                <div className="text-sm text-slate-400 mb-2">
                  Progress: 0/3 modules completed
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </PopupContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="pt-4">
          <PopupContainer padding>
            <h2 className="text-2xl font-bold mb-6">Learning Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Experience Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Beginner
                  </Button>
                  <Button variant="outline" className="justify-start opacity-70">Intermediate</Button>
                  <Button variant="outline" className="justify-start opacity-70">Advanced</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Learning Focus</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Crypto Trading
                  </Button>
                  <Button variant="outline" className="justify-start opacity-70">Fundamental Analysis</Button>
                  <Button variant="outline" className="justify-start opacity-70">Technical Analysis</Button>
                  <Button variant="outline" className="justify-start opacity-70">Blockchain Development</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Content Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Video Lessons
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interactive Exercises
                  </Button>
                  <Button variant="outline" className="justify-start opacity-70">Text-based Tutorials</Button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <Button disabled={!isAuthenticated} className="min-w-[200px]">
                  Save Preferences
                </Button>
                {!isAuthenticated && (
                  <div className="text-sm text-slate-400 mt-2">
                    Sign in to save your learning preferences
                  </div>
                )}
              </div>
            </div>
          </PopupContainer>
        </TabsContent>
      </Tabs>
      
      {activeTab === 'roadmap' && (
        <div className="mt-8 text-center">
          <p className="text-slate-400 mb-4">
            Don't know where to start? Take our quick assessment to get personalized recommendations.
          </p>
          <Button variant="outline" size="lg">
            Take Skill Assessment
          </Button>
        </div>
      )}
    </div>
  );
}