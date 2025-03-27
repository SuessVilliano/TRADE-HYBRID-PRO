import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';

interface MobileExitButtonProps {
  onClose: () => void;
  className?: string;
}

/**
 * A fixed position button that appears at the bottom right of the screen on mobile devices
 * to help users exit from popup screens that might otherwise trap them.
 */
export function MobileExitButton({ onClose, className }: MobileExitButtonProps) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <Button 
      className="fixed bottom-20 right-4 z-[9999] rounded-full shadow-lg bg-primary text-white" 
      size="icon"
      onClick={onClose}
      aria-label="Exit"
    >
      <X className="h-5 w-5" />
    </Button>
  );
}