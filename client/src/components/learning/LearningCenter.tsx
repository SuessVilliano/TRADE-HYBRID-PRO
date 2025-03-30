
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, BookOpen, Clock, ChevronRight, Star, Trophy } from 'lucide-react';

export default function LearningCenter() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userProgress, setUserProgress] = useState({
    coursesCompleted: 0,
    totalPoints: 0,
    badges: [],
    certificates: []
  });

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'crypto', name: 'Cryptocurrency' },
    { id: 'forex', name: 'Forex Trading' },
    { id: 'stocks', name: 'Stock Market' },
    { id: 'technical', name: 'Technical Analysis' },
    { id: 'fundamental', name: 'Fundamental Analysis' },
    { id: 'psychology', name: 'Trading Psychology' },
    { id: 'risk', name: 'Risk Management' }
  ];

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Trade Hybrid Learning Center</h1>
          <p className="text-slate-400 mt-2">Master trading across multiple markets with our comprehensive curriculum</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{userProgress.totalPoints}</div>
            <div className="text-sm text-slate-400">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userProgress.coursesCompleted}</div>
            <div className="text-sm text-slate-400">Courses Completed</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4 bg-background p-1">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-2">
              <div className="grid grid-cols-1 gap-4">
                {/* Course cards will be dynamically rendered here */}
                {/* This is a sample course card structure */}
                <Card className="hover:bg-accent/5 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Technical Analysis Mastery</h3>
                        <p className="text-sm text-slate-400 mb-4">
                          Master the art of reading charts and identifying trading opportunities
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            8 hours
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            12 lessons
                          </div>
                          <div className="flex items-center">
                            <Trophy className="w-4 h-4 mr-1" />
                            500 points
                          </div>
                        </div>
                      </div>
                      <Button>
                        Start Course
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Your Learning Journey</h3>
              {/* Progress tracking content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Certificate cards */}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Badge cards */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
