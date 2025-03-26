import React, { useEffect } from 'react';
import { KeyboardControls } from '@react-three/drei';

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
  jump = 'jump',
}

function KeyboardControlsImplementation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(`Key pressed: ${e.code}`);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return null;
}

export default function GameControls({ children }: { children?: React.ReactNode }) {
  // Define keyboard mappings for the game
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.interact, keys: ['KeyE'] },
    { name: Controls.jump, keys: ['Space'] },
  ];
  
  return (
    <>
      <KeyboardControls map={keyMap}>
        <KeyboardControlsImplementation />
        {children}
      </KeyboardControls>
    </>
  );
}