import React, { useEffect } from 'react';
import { KeyboardControls } from '@react-three/drei';

// Define control keys
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  sprint = 'sprint',
  crouch = 'crouch',
  interact = 'interact',
  map = 'map',
}

interface GameControlsProps {
  children: React.ReactNode;
}

export default function GameControls({ children }: GameControlsProps) {
  // Log when controls are initialized
  useEffect(() => {
    console.log("GameControls component mounted");
    console.log("Available controls:", Object.values(Controls));
    return () => console.log("GameControls component unmounted");
  }, []);
  
  // Define key mappings
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
    { name: Controls.sprint, keys: ['ShiftLeft', 'ShiftRight'] },
    { name: Controls.crouch, keys: ['ControlLeft', 'ControlRight', 'KeyC'] },
    { name: Controls.interact, keys: ['KeyE', 'KeyF'] },
    { name: Controls.map, keys: ['KeyM'] },
  ];
  
  return (
    <KeyboardControls map={keyMap}>
      {children}
    </KeyboardControls>
  );
}