import React from 'react';
import { Button } from './button';
import { MousePointer, Gamepad2 } from 'lucide-react';
import { useControlsStore } from '@/lib/stores/useControlsStore';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { toast } from 'sonner';

export function ControlsToggle() {
  const { controlsEnabled, toggleControls } = useControlsStore();
  const isMobile = useIsMobile();
  
  // Don't show this control on mobile devices
  if (isMobile) return null;
  
  // Handle toggle
  const handleToggle = () => {
    toggleControls();
    
    if (controlsEnabled) {
      toast.info("Navigation controls disabled. You can now interact with the UI.", {
        duration: 3000,
      });
    } else {
      toast.info("Navigation controls enabled. You can now move your character.", {
        duration: 3000,
      });
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-background p-1.5 rounded-lg shadow-md border border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={`flex items-center gap-2 ${!controlsEnabled ? 'text-primary' : 'text-muted-foreground'}`}
        title={controlsEnabled ? "Switch to UI Mode" : "Switch to Navigation Mode"}
      >
        {controlsEnabled ? (
          <>
            <MousePointer size={16} />
            <span className="text-xs">UI Mode</span>
          </>
        ) : (
          <>
            <Gamepad2 size={16} />
            <span className="text-xs">Nav Mode</span>
          </>
        )}
      </Button>
    </div>
  );
}