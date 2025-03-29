import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Check, ArrowRight } from 'lucide-react';

// Types
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TopicInterest = 'technical-analysis' | 'fundamental-analysis' | 'crypto' | 'stocks' | 'forex' | 'futures' | 'options' | 'risk-management' | 'trading-psychology';

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
    question: 'How experienced are you with trading in financial markets?',
    options: [
      { id: 'q1a', text: 'I\'m completely new to trading', experienceValue: 'beginner' },
      { id: 'q1b', text: 'I have some experience and have made a few trades', experienceValue: 'intermediate' },
      { id: 'q1c', text: 'I\'ve been trading actively for more than a year', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q2',
    question: 'How comfortable are you with reading financial charts?',
    options: [
      { id: 'q2a', text: 'Not comfortable at all', experienceValue: 'beginner' },
      { id: 'q2b', text: 'I understand basic patterns and indicators', experienceValue: 'intermediate' },
      { id: 'q2c', text: 'Very comfortable, I use technical analysis regularly', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q3',
    question: 'Have you used leverage or margin in your trading?',
    options: [
      { id: 'q3a', text: 'No, I haven\'t used leverage', experienceValue: 'beginner' },
      { id: 'q3b', text: 'Yes, with small positions and conservative leverage', experienceValue: 'intermediate' },
      { id: 'q3c', text: 'Yes, I regularly use leverage and understand the risks', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q4',
    question: 'How would you describe your knowledge of fundamental analysis?',
    options: [
      { id: 'q4a', text: 'I don\'t know much about it', experienceValue: 'beginner' },
      { id: 'q4b', text: 'I understand the basics (P/E ratios, earnings, etc.)', experienceValue: 'intermediate' },
      { id: 'q4c', text: 'I regularly analyze financial statements and economic data', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q5',
    question: 'Do you have experience with risk management strategies?',
    options: [
      { id: 'q5a', text: 'No, I haven\'t implemented risk management', experienceValue: 'beginner' },
      { id: 'q5b', text: 'I use basic stop losses and position sizing', experienceValue: 'intermediate' },
      { id: 'q5c', text: 'Yes, I have a comprehensive risk management system', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q6',
    question: 'How familiar are you with cryptocurrency trading?',
    options: [
      { id: 'q6a', text: 'I\'m completely new to cryptocurrencies', experienceValue: 'beginner' },
      { id: 'q6b', text: 'I\'ve made some crypto trades on exchanges', experienceValue: 'intermediate' },
      { id: 'q6c', text: 'I actively trade crypto and understand the market cycles', experienceValue: 'advanced' }
    ]
  },
  {
    id: 'q7',
    question: 'Have you traded forex (foreign exchange) markets?',
    options: [
      { id: 'q7a', text: 'No, I haven\'t traded forex', experienceValue: 'beginner' },
      { id: 'q7b', text: 'I\'ve made some forex trades', experienceValue: 'intermediate' },
      { id: 'q7c', text: 'Yes, I regularly trade currency pairs', experienceValue: 'advanced' }
    ]
  }
];

const topicOptions: TopicInterestOption[] = [
  { id: 'technical-analysis', title: 'Technical Analysis', description: 'Learn chart patterns, indicators, and price action strategies', selected: false },
  { id: 'fundamental-analysis', title: 'Fundamental Analysis', description: 'Analyze financial statements, economic data, and company valuations', selected: false },
  { id: 'crypto', title: 'Cryptocurrency Trading', description: 'Learn about blockchain assets, DeFi, NFTs, and tokenomics', selected: false },
  { id: 'stocks', title: 'Stock Market', description: 'Equity trading, market sectors, and company analysis', selected: false },
  { id: 'forex', title: 'Forex Trading', description: 'Currency pairs, central bank policies, and global economics', selected: false },
  { id: 'futures', title: 'Futures Trading', description: 'Commodity markets, contract specifications, and rollover strategies', selected: false },
  { id: 'options', title: 'Options Trading', description: 'Calls, puts, spreads, and volatility strategies', selected: false },
  { id: 'risk-management', title: 'Risk Management', description: 'Position sizing, stop losses, and portfolio diversification', selected: false },
  { id: 'trading-psychology', title: 'Trading Psychology', description: 'Emotional control, discipline, and mindset optimization', selected: false }
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
    
    // If no topics selected, default to some basics
    const topicInterests = selectedTopics.length > 0 
      ? selectedTopics 
      : ['technical-analysis', 'risk-management'] as TopicInterest[]; // Default topics
    
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
          Let's personalize your trading learning journey
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