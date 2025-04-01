import React, { useState } from 'react';
import { Button } from './button';
import { Mic, MicOff, Play, Square } from 'lucide-react';

interface VapiVoiceAssistantProps {
  className?: string;
}

export function VapiVoiceAssistant({ className }: VapiVoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<{
    type: 'user' | 'assistant';
    text: string;
  }[]>([
    { type: 'assistant', text: 'Hello! I\'m your Voice Trading Assistant. You can ask me about market analysis, trade ideas, or help with placing orders.' }
  ]);
  
  const startRecording = () => {
    setIsRecording(true);
    
    // Simulate recording for demo
    setTimeout(() => {
      setConversation(prev => [
        ...prev,
        { type: 'user', text: 'What do you think about Bitcoin right now?' }
      ]);
      
      // Simulate assistant response
      setTimeout(() => {
        setConversation(prev => [
          ...prev,
          { type: 'assistant', text: 'Bitcoin is showing strong momentum above the $41,000 level with good volume. The 4-hour chart indicates a bullish trend continuation pattern. If you\'re considering a position, watch for support at $40,800.' }
        ]);
        setIsRecording(false);
      }, 1500);
    }, 2000);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
  };
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {conversation.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          
          {isRecording && (
            <div className="flex justify-center my-4">
              <div className="flex items-center space-x-1 text-red-500">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t p-4">
        <div className="flex justify-center space-x-4">
          {isRecording ? (
            <Button 
              size="lg" 
              variant="destructive" 
              className="rounded-full h-14 w-14 p-0 flex items-center justify-center"
              onClick={stopRecording}
            >
              <Square className="h-6 w-6" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="rounded-full h-14 w-14 p-0 flex items-center justify-center"
              onClick={startRecording}
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}
        </div>
        
        <div className="text-center mt-4 text-xs text-slate-500">
          <p>Tap the microphone and speak to interact with your AI trading assistant</p>
        </div>
      </div>
    </div>
  );
}