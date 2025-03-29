import React, { useState } from 'react';
import { LightbulbIcon, X } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { TradingTipsSettings } from './micro-learning-tips';
import { useMicroLearning } from '../../lib/context/MicroLearningProvider';

interface TradingTipsButtonProps {
  className?: string;
}

export function TradingTipsButton({ className }: TradingTipsButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showTip, settings } = useMicroLearning();

  // Determine the indicator color based on frequency setting
  const getIndicatorColor = () => {
    switch (settings.frequency) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      case 'off':
        return 'text-slate-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex items-center gap-2 ${className}`}
        onClick={() => setIsDialogOpen(true)}
        title="Trading Tips Settings"
      >
        <LightbulbIcon className={`h-4 w-4 ${getIndicatorColor()}`} />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-center justify-between pr-0">
            <DialogTitle>Trading Tips Settings</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => setIsDialogOpen(false)}
              aria-label="Close"
            >
              <X size={16} />
            </Button>
          </DialogHeader>
          <div className="py-4">
            <TradingTipsSettings />
          </div>
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                showTip(); // Show a tip immediately when closing settings
              }}
            >
              Show Tip Now
            </Button>
            <Button 
              variant="default" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}