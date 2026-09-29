import React, { useState } from 'react';
import { Button } from './button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from './popover';
import { 
  HelpCircle,
  Bot,
  LightbulbIcon,
  CheckCircle2,
  PresentationIcon,
  Brain,
  Mic,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useOnboarding } from '../../lib/context/OnboardingProvider';
import { AITradeAssistant } from '../ai/AITradeAssistant';
import { AIVoiceTrading } from '../ai/AIVoiceTrading';

interface OnboardingButtonProps {
  className?: string;
}

export function OnboardingButton({ className }: OnboardingButtonProps) {
  console.log("OnboardingButton component rendering");
  
  const { 
    startOnboarding, 
    isFlowCompleted,
    currentFlow,
    isOnboarding,
    resetOnboarding
  } = useOnboarding();
  
  console.log("OnboardingButton - isOnboarding:", isOnboarding);
  console.log("OnboardingButton - currentFlow:", currentFlow);
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState<'chat' | 'voice' | null>('chat');
  
  // Determine available tours based on current path
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Available tours for this path
  const availableTours = [
    { id: 'main', title: 'Platform Overview', icon: PresentationIcon },
    
    // Trading dashboard tour
    ...(currentPath.includes('/trading') || currentPath.includes('/dashboard') ? [
      { id: 'trading-dashboard', title: 'Trading Dashboard Guide', icon: LightbulbIcon }
    ] : []),
    
    // THC staking tour
    ...(currentPath.includes('/thc') || currentPath.includes('/staking') ? [
      { id: 'thc-staking', title: 'THC Staking Guide', icon: LightbulbIcon }
    ] : []),
    
    // Prop firm tour
    ...(currentPath.includes('/prop-firm') ? [
      { id: 'prop-firm', title: 'Prop Firm Challenge Guide', icon: LightbulbIcon }
    ] : []),
    
    // Learning center tour
    ...(currentPath.includes('/learn') ? [
      { id: 'learning-center', title: 'Learning Center Guide', icon: LightbulbIcon }
    ] : []),
    
    // Metaverse tour
    ...(currentPath.includes('/metaverse') ? [
      { id: 'metaverse', title: 'Metaverse Trading Floor Guide', icon: LightbulbIcon }
    ] : []),
  ];
  
  const handleStartTour = (tourId: string) => {
    startOnboarding(tourId);
    setIsOpen(false);
  };
  
  const handleResetTours = () => {
    resetOnboarding();
    setIsOpen(false);
  };
  
  // If currently in onboarding mode, don't show the button
  if (isOnboarding) {
    return null;
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`fixed bottom-5 right-4 z-50 h-12 rounded-full border border-violet-300 bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-3 text-white shadow-[0_12px_36px_rgba(79,70,229,.28)] hover:brightness-105 sm:bottom-6 sm:right-6 sm:px-4 ${className}`}
          title="Open Market Buddy"
        >
          <span className="relative mr-0 sm:mr-2">
            <Bot className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-300 ring-2 ring-violet-600" />
          </span>
          <span className="hidden text-sm font-black sm:inline">Market Buddy</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="max-h-[82vh] w-[calc(100vw-2rem)] overflow-y-auto border border-violet-200 bg-white shadow-2xl dark:border-violet-400/20 dark:bg-[#0b1020] sm:w-[440px]" 
        align="end"
        side="top"
        sideOffset={16}
      >
        <div className="space-y-4">
          {/* AI Assistant Section */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <h4 className="font-medium text-lg flex items-center text-slate-900 dark:text-white">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />
              Market Buddy
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your Trade Hybrid AI companion with your WHY, goals, Journal context, chat, voice, and platform guidance.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button
                variant={activeAssistant === 'chat' ? "default" : "outline"}
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                onClick={() => setActiveAssistant(activeAssistant === 'chat' ? null : 'chat')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button
                variant={activeAssistant === 'voice' ? "default" : "outline"}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                onClick={() => setActiveAssistant(activeAssistant === 'voice' ? null : 'voice')}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice
              </Button>
            </div>
          </div>

          {/* Help & Tours Section */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <h4 className="font-medium text-lg flex items-center text-slate-900 dark:text-white">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
              Help & Tours
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Take a guided tour to learn how to use the platform
            </p>
          </div>
          
          <div className="space-y-3">
            {availableTours.map((tour) => {
              const isCompleted = isFlowCompleted(tour.id);
              const Icon = tour.icon;
              
              return (
                <div 
                  key={tour.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{tour.title}</span>
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                    )}
                  </div>
                  <Button 
                    variant={isCompleted ? "outline" : "default"} 
                    size="sm"
                    className={isCompleted ? 
                      "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" : 
                      "bg-blue-600 hover:bg-blue-700 text-white"}
                    onClick={() => handleStartTour(tour.id)}
                  >
                    {isCompleted ? 'Replay' : 'Start'}
                  </Button>
                </div>
              );
            })}
          </div>
          
          {/* AI Assistant Interface */}
          {activeAssistant && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="h-96 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
                {activeAssistant === 'chat' && (
                  <AITradeAssistant className="h-full" />
                )}
                {activeAssistant === 'voice' && (
                  <AIVoiceTrading className="h-full" />
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              onClick={handleResetTours}
            >
              Reset all tours
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}