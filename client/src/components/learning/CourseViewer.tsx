
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, PlayCircle, FileText, HelpCircle } from 'lucide-react';

export default function CourseViewer() {
  const { courseId } = useParams();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Course Content</h3>
              <div className="space-y-2">
                {/* Lesson list */}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardContent className="p-6">
              {!showQuiz ? (
                <div className="space-y-6">
                  {/* Lesson content */}
                  <div className="aspect-video bg-black rounded-lg mb-4">
                    {/* Video player will go here */}
                  </div>
                  
                  <div className="prose max-w-none dark:prose-invert">
                    {/* Lesson text content */}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button variant="outline" disabled={currentLesson === 0}>
                      Previous Lesson
                    </Button>
                    <Button onClick={() => setShowQuiz(true)}>
                      Take Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quiz interface */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
