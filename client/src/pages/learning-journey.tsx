import React, { useEffect } from 'react';
import { LearningAssessment, LearningAssessmentResult } from '@/components/learning/learning-assessment';
import { LearningRoadmap } from '@/components/learning/learning-roadmap';
import { Button } from '@/components/ui/button';
import { GraduationCap, RefreshCcw } from 'lucide-react';
import { useLearningStore } from '@/lib/stores/useLearningStore';

const LearningJourney: React.FC = () => {
  const { 
    userProfile, 
    saveAssessmentResults, 
    resetAssessment 
  } = useLearningStore();
  
  // Handle assessment completion
  const handleAssessmentComplete = (results: LearningAssessmentResult) => {
    const { experienceLevel, topicInterests, availableTime } = results;
    saveAssessmentResults(experienceLevel, topicInterests, availableTime);
    
    console.log('Assessment completed:', results);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {!userProfile.assessmentCompleted ? (
        <>
          <div className="text-center mb-8">
            <GraduationCap className="h-12 w-12 mx-auto mb-2 text-primary" />
            <h1 className="text-3xl font-bold">Trading Learning Journey</h1>
            <p className="text-muted-foreground mt-2">
              Take a short assessment to customize your learning experience
            </p>
          </div>
          
          <LearningAssessment onComplete={handleAssessmentComplete} />
        </>
      ) : (
        <>
          <div className="text-right mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAssessment}
              className="gap-2"
            >
              <RefreshCcw size={16} />
              Retake Assessment
            </Button>
          </div>
          
          <LearningRoadmap assessment={{
            experienceLevel: userProfile.experienceLevel,
            topicInterests: userProfile.topicInterests,
            availableTime: userProfile.availableTime
          }} />
        </>
      )}
    </div>
  );
};

export default LearningJourney;