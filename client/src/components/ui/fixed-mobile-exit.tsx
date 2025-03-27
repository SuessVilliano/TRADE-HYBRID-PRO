import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { toast } from 'sonner';

// Global state to track when the user has been shown the exit instruction tooltip
let hasShownExitInstructions = false;

/**
 * A global fixed position button that appears at the bottom right corner of the viewport
 * This is an emergency exit for any situation where a user gets trapped in a UI component
 */
export function FixedMobileExit() {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  const handleEmergencyExit = () => {
    // Force navigation to the main page
    window.location.href = '/trading-space';
    
    // Show a toast message to explain what happened
    toast.info("Emergency exit activated. You've been returned to the main screen.");
  };
  
  // Show instructions tooltip the first time
  React.useEffect(() => {
    if (isMobile && !hasShownExitInstructions) {
      setTimeout(() => {
        toast.info("If you get stuck, use the emergency exit button at the bottom right.", {
          duration: 5000,
        });
        hasShownExitInstructions = true;
      }, 3000);
    }
  }, [isMobile]);
  
  return (
    <Button 
      className="fixed bottom-4 right-4 z-[9999] rounded-full shadow-lg bg-red-500 hover:bg-red-600 text-white"
      size="icon"
      onClick={handleEmergencyExit}
      aria-label="Emergency Exit"
    >
      <X className="h-5 w-5" />
    </Button>
  );
}