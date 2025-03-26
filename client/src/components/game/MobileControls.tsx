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
  const [isSprinting, setIsSprinting] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
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
        key: key === 'Space' ? ' ' : key.charAt(key.length - 1).toLowerCase(),
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    };
    
    // Set up interval to check joystick position and simulate key events
    const interval = setInterval(() => {
      if (gamePhase !== "playing") return;
      
      // Handle sprinting
      if (isSprinting) {
        simulateKeyEvent('ShiftLeft', 'keydown');
      } else {
        simulateKeyEvent('ShiftLeft', 'keyup');
      }
      
      // Handle movement
      if (!moveTouch) {
        // Reset movement keys when not touching
        simulateKeyEvent('KeyW', 'keyup');
        simulateKeyEvent('KeyS', 'keyup');
        simulateKeyEvent('KeyA', 'keyup');
        simulateKeyEvent('KeyD', 'keyup');
        return;
      }
      
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
  }, [isMobile, moveTouch, gamePhase, isSprinting]);
  
  // Handle jump button
  useEffect(() => {
    if (!isMobile || gamePhase !== "playing") return;
    
    if (isJumping) {
      const event = new KeyboardEvent('keydown', {
        code: 'Space',
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    } else {
      const event = new KeyboardEvent('keyup', {
        code: 'Space',
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    }
  }, [isJumping, isMobile, gamePhase]);
  
  // Toggle microphone
  useEffect(() => {
    if (!isMobile || gamePhase !== "playing") return;
    
    if (isMicOn) {
      const event = new KeyboardEvent('keydown', {
        code: 'KeyT',
        key: 't',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    }
  }, [isMicOn, isMobile, gamePhase]);
  
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
    <>
      {/* Mobile joystick (left side) */}
      <div className="fixed bottom-6 left-6 z-50 touch-none">
        <div 
          id="mobile-joystick"
          className="w-36 h-36 rounded-full bg-black bg-opacity-50 border-2 border-white border-opacity-60 relative"
        >
          {/* Joystick handle */}
          <div 
            className="w-20 h-20 rounded-full bg-white bg-opacity-70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg flex items-center justify-center"
            style={{ 
              transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))` 
            }}
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 opacity-80 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons container (right side) */}
      <div className="fixed bottom-6 right-6 flex flex-wrap gap-3 z-50 touch-none">
        {/* Jump button */}
        <div 
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ${isJumping ? 'bg-green-600' : 'bg-green-500'}`}
          onTouchStart={() => setIsJumping(true)}
          onTouchEnd={() => setIsJumping(false)}
        >
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>Jump</span>
          </div>
        </div>
        
        {/* Sprint button */}
        <div 
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ${isSprinting ? 'bg-yellow-600' : 'bg-yellow-500'}`}
          onTouchStart={() => setIsSprinting(true)}
          onTouchEnd={() => setIsSprinting(false)}
        >
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Sprint</span>
          </div>
        </div>
        
        {/* Action/Interact button */}
        <div 
          className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-lg"
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
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Action</span>
          </div>
        </div>
        
        {/* Microphone button */}
        <div 
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ${isMicOn ? 'bg-red-600' : 'bg-gray-500'}`}
          onClick={() => setIsMicOn(!isMicOn)}
        >
          <div className="flex flex-col items-center">
            {isMicOn ? (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
            <span>{isMicOn ? 'Mute' : 'Talk'}</span>
          </div>
        </div>
      </div>
    </>
  );
}