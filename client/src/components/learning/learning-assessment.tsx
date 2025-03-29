import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Check, ArrowRight } from 'lucide-react';

// Types
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TopicInterest = 'trading' | 'defi' | 'nft' | 'blockchain' | 'tokenomics';

interface AssessmentQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    experienceValue: ExperienceLevel;
  }[];
}

interface TopicInterestOption {
  id: TopicInterest;
  title: string;
  description: string;
  selected: boolean;
}

export interface LearningAssessmentResult {
  experienceLevel: ExperienceLevel;
  topicInterests: TopicInterest[];
  availableTime: number;
}

interface LearningAssessmentProps {
  onComplete: (assessment: LearningAssessmentResult) => void;
}

const knowledgeQuestions: AssessmentQuestion[] = [
  {
    id: 'q1',
    question: 'How familiar are you with cryptocurrency concepts?',
    options: [
      { id: 'q1a', text: 'I\'m completely new to cryptocurrencies', experienceValue: 'beginner' },
      { id: 'q1b', text: 'I understand the basics and have made a few trades', experienceValue: 'intermediate' },
      { id: 'q1c', text: 'I\'m very familiar and have been trading regularly', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q2',
    question: 'Have you used decentralized exchanges before?',
    options: [
      { id: 'q2a', text: 'No, I\'ve never used one', experienceValue: 'beginner' },
      { id: 'q2b', text: 'Yes, but only a few times', experienceValue: 'intermediate' },
      { id: 'q2c', text: 'Yes, I use them frequently', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q3',
    question: 'Do you understand how blockchain transactions work?',
    options: [
      { id: 'q3a', text: 'Not really', experienceValue: 'beginner' },
      { id: 'q3b', text: 'I have a basic understanding', experienceValue: 'intermediate' },
      { id: 'q3c', text: 'Yes, I understand the technical details', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q4',
    question: 'Have you participated in staking or yield farming?',
    options: [
      { id: 'q4a', text: 'No, I don\'t know what those are', experienceValue: 'beginner' },
      { id: 'q4b', text: 'I\'ve tried basic staking on exchanges', experienceValue: 'intermediate' },
      { id: 'q4c', text: 'Yes, I actively use DeFi platforms for yield', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q5',
    question: 'How comfortable are you with reading price charts?',
    options: [
      { id: 'q5a', text: 'Not comfortable at all', experienceValue: 'beginner' },
      { id: 'q5b', text: 'I understand some basic patterns', experienceValue: 'intermediate' },
      { id: 'q5c', text: 'Very comfortable, I use technical analysis regularly', experienceValue: 'advanced' }
    ]
  }
];

const topicOptions: TopicInterestOption[] = [
  { id: 'trading', title: 'Trading Strategies', description: 'Learn technical analysis, chart patterns, and trading psychology', selected: false },
  { id: 'defi', title: 'DeFi & Yield Farming', description: 'Explore decentralized finance, lending, borrowing, and yield optimization', selected: false },
  { id: 'nft', title: 'NFTs & Digital Assets', description: 'Understand NFT markets, collections, and digital ownership', selected: false },
  { id: 'blockchain', title: 'Blockchain Fundamentals', description: 'Study the technology behind cryptocurrencies', selected: false },
  { id: 'tokenomics', title: 'Tokenomics', description: 'Learn about token design, utility, and economic models', selected: false }
];

const timeOptions = [
  { value: 2, label: 'Less than 2 hours per week' },
  { value: 5, label: '2-5 hours per week' },
  { value: 10, label: '5-10 hours per week' },
  { value: 15, label: 'More than 10 hours per week' }
];

export function LearningAssessment({ onComplete }: LearningAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [topics, setTopics] = useState<TopicInterestOption[]>(topicOptions);
  const [availableTime, setAvailableTime] = useState<number>(5);
  
  // Progress calculation
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  // Handle answering knowledge questions
  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };
  
  // Handle next question or step
  const handleNext = () => {
    if (currentStep === 1) {
      if (currentQuestionIndex < knowledgeQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Complete assessment and calculate experience level
      calculateResults();
    }
  };
  
  // Handle going back
  const handleBack = () => {
    if (currentStep === 1 && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setCurrentQuestionIndex(knowledgeQuestions.length - 1);
      }
    }
  };
  
  // Toggle topic selection
  const toggleTopic = (topicId: TopicInterest) => {
    setTopics(topics.map(topic => 
      topic.id === topicId ? { ...topic, selected: !topic.selected } : topic
    ));
  };
  
  // Calculate final results
  const calculateResults = () => {
    // Count experience levels based on answers
    const experienceCounts = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };
    
    Object.keys(answers).forEach(questionId => {
      const question = knowledgeQuestions.find(q => q.id === questionId);
      if (question) {
        const selectedOption = question.options.find(o => o.id === answers[questionId]);
        if (selectedOption) {
          experienceCounts[selectedOption.experienceValue]++;
        }
      }
    });
    
    // Determine overall experience level
    let experienceLevel: ExperienceLevel = 'beginner';
    if (experienceCounts.advanced > experienceCounts.intermediate && 
        experienceCounts.advanced > experienceCounts.beginner) {
      experienceLevel = 'advanced';
    } else if (experienceCounts.intermediate > experienceCounts.beginner) {
      experienceLevel = 'intermediate';
    }
    
    // Get selected topics
    const selectedTopics = topics
      .filter(topic => topic.selected)
      .map(topic => topic.id);
    
    // If no topics selected, default to all
    const topicInterests = selectedTopics.length > 0 
      ? selectedTopics 
      : ['trading', 'blockchain']; // Default topics
    
    onComplete({
      experienceLevel,
      topicInterests,
      availableTime
    });
  };
  
  // Current question display
  const currentQuestion = knowledgeQuestions[currentQuestionIndex];
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Learning Assessment</CardTitle>
        <CardDescription>
          Let's personalize your crypto learning journey
        </CardDescription>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent>
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h3>
            
            <RadioGroup
              value={answers[currentQuestion.id]}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.id} 
                  className="flex items-center space-x-2 border rounded-md p-3 my-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">What topics are you most interested in learning?</h3>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`
                    border rounded-md p-3 cursor-pointer transition-colors
                    ${topic.selected ? 'border-primary bg-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                  `}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium">{topic.title}</h4>
                    {topic.selected && <Check size={18} className="text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">How much time can you dedicate to learning each week?</h3>
            
            <RadioGroup
              value={availableTime.toString()}
              onValueChange={(value) => setAvailableTime(Number(value))}
            >
              {timeOptions.map((option) => (
                <div 
                  key={option.value} 
                  className="flex items-center space-x-2 border rounded-md p-3 my-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  onClick={() => setAvailableTime(option.value)}
                >
                  <RadioGroupItem value={option.value.toString()} id={`time-${option.value}`} />
                  <Label htmlFor={`time-${option.value}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 1 && currentQuestionIndex === 0}
        >
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={(currentStep === 1 && !answers[currentQuestion.id])}
          className="flex items-center gap-2"
        >
          {currentStep === totalSteps ? 'Complete' : 'Continue'}
          <ArrowRight size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}