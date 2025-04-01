import React, { useState } from 'react';
import { Button } from './button';
import { Camera, ImageOff } from 'lucide-react';

interface VisionAIScreenShareProps {
  className?: string;
}

export function VisionAIScreenShare({ className }: VisionAIScreenShareProps) {
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className="flex flex-col items-center space-y-6 max-w-xl text-center">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
          {isCaptureMode ? (
            <Camera className="h-12 w-12 text-blue-500" />
          ) : (
            <ImageOff className="h-12 w-12 text-slate-400" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Screen Analysis</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Share your screen or upload a chart image to get AI-powered analysis of trading patterns, indicators, and potential setups.
          </p>
        </div>
        
        <div className="space-y-3 w-full">
          <Button 
            className="w-full"
            onClick={() => setIsCaptureMode(!isCaptureMode)}
          >
            {isCaptureMode ? 'Cancel Capture' : 'Share Your Screen'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
          >
            Upload Chart Image
          </Button>
        </div>
        
        {isCaptureMode && (
          <div className="mt-4 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm">
            <p>
              Select the area of your screen that contains your chart or trading interface.
              The AI will analyze visible patterns and provide trading insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}