import React, { useState } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  onEnd: () => void;
}

export function MobileJoystick({ onMove, onEnd }: JoystickProps) {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setActive(true);
    setStartPosition({ x: touch.clientX, y: touch.clientY });
    setPosition({ x: 0, y: 0 });
  };
  
  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!active) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosition.x;
    const deltaY = touch.clientY - startPosition.y;
    
    // Limit the joystick movement to a radius of 50
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    
    let normX = deltaX;
    let normY = deltaY;
    
    if (distance > maxDistance) {
      normX = (deltaX / distance) * maxDistance;
      normY = (deltaY / distance) * maxDistance;
    }
    
    setPosition({ x: normX, y: normY });
    
    // Normalize values between -1 and 1 for movement
    const normalizedX = normX / maxDistance;
    const normalizedY = normY / maxDistance;
    
    onMove(normalizedX, normalizedY);
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    onEnd();
  };
  
  return (
    <div 
      className="absolute bottom-24 left-10 w-36 h-36 rounded-full bg-black/20 border-2 border-white/30 touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div 
        className="absolute w-20 h-20 rounded-full bg-black/40 border-2 border-white/50 transform -translate-x-1/2 -translate-y-1/2 touch-none"
        style={{ 
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
        }}
      />
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  onRelease?: () => void;
  color?: string;
  position: { right: number; bottom: number };
}

export function ActionButton({ label, onPress, onRelease, color = 'bg-blue-500', position }: ActionButtonProps) {
  return (
    <button
      className={`absolute w-16 h-16 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg border-2 border-white/50 touch-none`}
      style={{ 
        right: `${position.right}rem`, 
        bottom: `${position.bottom}rem` 
      }}
      onTouchStart={onPress}
      onTouchEnd={onRelease || (() => {})}
    >
      {label}
    </button>
  );
}

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onStopMove: () => void;
  onJump: () => void;
  onSprint: () => void;
  onStopSprint: () => void;
}

export function MobileControls({ onMove, onStopMove, onJump, onSprint, onStopSprint }: MobileControlsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="pointer-events-auto">
        <MobileJoystick onMove={onMove} onEnd={onStopMove} />
        <ActionButton label="JUMP" onPress={onJump} position={{ right: 2, bottom: 8 }} color="bg-green-600" />
        <ActionButton 
          label="SPRINT" 
          onPress={onSprint} 
          onRelease={onStopSprint}
          position={{ right: 6, bottom: 3 }} 
          color="bg-orange-600" 
        />
      </div>
    </div>
  );
}

export default MobileControls;