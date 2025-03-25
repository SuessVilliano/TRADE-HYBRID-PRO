import React, { useEffect, useState } from "react";
import { useGame } from "@/lib/stores/useGame";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface TouchPosition {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export default function MobileControls() {
  const [moveTouch, setMoveTouch] = useState<TouchPosition | null>(null);
  const isMobile = useIsMobile();
  const gamePhase = useGame(state => state.phase);
  
  // Set up events for handling touch controls on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      
      const touch = e.touches[0];
      // Store initial touch position
      setMoveTouch({
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
      });
      
      // Prevent default to avoid scrolling
      e.preventDefault();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0 || !moveTouch) return;
      
      const touch = e.touches[0];
      // Update current touch position
      setMoveTouch(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentX: touch.clientX,
          currentY: touch.clientY,
        };
      });
      
      // Prevent default to avoid scrolling
      e.preventDefault();
    };
    
    const handleTouchEnd = () => {
      // Reset touch position
      setMoveTouch(null);
    };
    
    // Custom event to simulate key events for both mobile and desktop
    const simulateKeyEvent = (key: string, type: 'keydown' | 'keyup') => {
      const event = new KeyboardEvent(type, {
        code: key,
        key: key,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    };
    
    // Set up interval to check joystick position and simulate key events
    const interval = setInterval(() => {
      if (!moveTouch || gamePhase !== "playing") return;
      
      const { startX, startY, currentX, currentY } = moveTouch;
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      const threshold = 20; // Minimum distance to trigger movement
      
      // Reset all keys first
      simulateKeyEvent('KeyW', 'keyup');
      simulateKeyEvent('KeyS', 'keyup');
      simulateKeyEvent('KeyA', 'keyup');
      simulateKeyEvent('KeyD', 'keyup');
      
      // Apply new keys based on joystick position
      if (diffY < -threshold) {
        simulateKeyEvent('KeyW', 'keydown');
      } else if (diffY > threshold) {
        simulateKeyEvent('KeyS', 'keydown');
      }
      
      if (diffX < -threshold) {
        simulateKeyEvent('KeyA', 'keydown');
      } else if (diffX > threshold) {
        simulateKeyEvent('KeyD', 'keydown');
      }
    }, 50);
    
    // Add listeners
    const joystickElement = document.getElementById('mobile-joystick');
    if (joystickElement) {
      joystickElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      joystickElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      joystickElement.addEventListener('touchend', handleTouchEnd);
    }
    
    // Clean up on unmount
    return () => {
      clearInterval(interval);
      if (joystickElement) {
        joystickElement.removeEventListener('touchstart', handleTouchStart);
        joystickElement.removeEventListener('touchmove', handleTouchMove);
        joystickElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isMobile, moveTouch, gamePhase]);
  
  // Don't render anything if not on mobile
  if (!isMobile) return null;
  
  // Calculate joystick position
  const getJoystickPosition = () => {
    if (!moveTouch) return { x: 0, y: 0 };
    
    const { startX, startY, currentX, currentY } = moveTouch;
    const maxDistance = 50; // Maximum joystick travel distance
    
    let diffX = currentX - startX;
    let diffY = currentY - startY;
    
    // Limit to max distance
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      diffX *= ratio;
      diffY *= ratio;
    }
    
    return { x: diffX, y: diffY };
  };
  
  const joystickPos = getJoystickPosition();
  
  return (
    <div className="fixed bottom-10 left-10 z-50 touch-none">
      {/* Mobile joystick */}
      <div 
        id="mobile-joystick"
        className="w-32 h-32 rounded-full bg-black bg-opacity-30 border-2 border-white border-opacity-50 relative"
      >
        {/* Joystick handle */}
        <div 
          className="w-16 h-16 rounded-full bg-white bg-opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))` 
          }}
        />
      </div>
      
      {/* Action buttons container */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4">
        {/* Jump button */}
        <div 
          className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold"
          onTouchStart={() => {
            const event = new KeyboardEvent('keydown', {
              code: 'Space',
              key: ' ',
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(event);
          }}
          onTouchEnd={() => {
            const event = new KeyboardEvent('keyup', {
              code: 'Space',
              key: ' ',
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(event);
          }}
        >
          Jump
        </div>
        
        {/* Action button */}
        <div 
          className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold"
          onTouchStart={() => {
            const event = new KeyboardEvent('keydown', {
              code: 'KeyE',
              key: 'e',
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(event);
          }}
          onTouchEnd={() => {
            const event = new KeyboardEvent('keyup', {
              code: 'KeyE',
              key: 'e',
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(event);
          }}
        >
          Action
        </div>
      </div>
    </div>
  );
}