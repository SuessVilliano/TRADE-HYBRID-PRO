import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useGLTF, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useControlsStore } from '@/lib/stores/useControlsStore';

// Define our control keys
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

// Player customization interface (exported for use in other components)
export interface PlayerCustomization {
  bodyColor: string;
  eyeColor: string;
  hatColor?: string;
  hatType?: 'none' | 'cap' | 'top_hat' | 'beanie';
  accessory?: 'none' | 'glasses' | 'mustache';
  height?: number;
  scale?: number;
  username?: string;
}

interface PlayerProps {
  position?: [number, number, number];
  controlsEnabled?: boolean;
  // Add any other props as needed
}

export function Player({ position = [0, 1, 0], controlsEnabled: propControlsEnabled }: PlayerProps) {
  // Use the global controls store to properly integrate with the controls toggle system
  const { controlsEnabled: storeControlsEnabled } = useControlsStore();
  
  // Combine prop and store controls - this allows override via props but defaults to store
  const isControlsEnabled = propControlsEnabled !== undefined ? propControlsEnabled : storeControlsEnabled;
  
  // Physics body reference
  const [ref, api] = useBox(() => ({
    mass: 1,
    type: 'Dynamic',
    position: position,
    args: [1, 2, 1]
  }));
  
  // State for player movement
  const velocity = useRef<[number, number, number]>([0, 0, 0]);
  const positionRef = useRef<[number, number, number]>(position);
  const [playerModel, setPlayerModel] = useState<THREE.Group | null>(null);
  
  // Get keyboard controls state (non-reactive for use in useFrame)
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Handle physics body updates
  useEffect(() => {
    // Store velocity and position updates from physics
    const unsubVelocity = api.velocity.subscribe((v) => (velocity.current = v));
    const unsubPosition = api.position.subscribe((p) => (positionRef.current = p));
    
    // Log controls state for debugging
    console.log('Player controls enabled:', isControlsEnabled);
    
    return () => {
      // Clean up subscriptions
      unsubVelocity();
      unsubPosition();
    };
  }, [api, isControlsEnabled]);

  // Player animation/movement logic
  useFrame((state) => {
    // Only process controls if they're enabled
    if (isControlsEnabled) {
      // Get current control keys
      const { forward, back, left, right, jump } = getKeys();
      
      // Movement speed
      const speed = 5;
      
      // Calculate movement direction based on keys
      let moveX = 0;
      let moveZ = 0;
      
      if (forward) moveZ -= speed;
      if (back) moveZ += speed;
      if (left) moveX -= speed;
      if (right) moveX += speed;
      
      // Apply movement as impulse
      if (moveX !== 0 || moveZ !== 0) {
        api.velocity.set(moveX, velocity.current[1], moveZ);
      }
      
      // Jump when spacebar is pressed and player is on ground
      if (jump && Math.abs(velocity.current[1]) < 0.1) {
        api.velocity.set(velocity.current[0], 10, velocity.current[2]);
      }
    } else {
      // When controls are disabled, stop movement
      if (Math.abs(velocity.current[0]) > 0.1 || Math.abs(velocity.current[2]) > 0.1) {
        api.velocity.set(0, velocity.current[1], 0);
      }
    }
    
    // Update camera to follow player
    state.camera.position.set(
      positionRef.current[0] + 5,
      positionRef.current[1] + 5,
      positionRef.current[2] + 5
    );
    state.camera.lookAt(
      positionRef.current[0],
      positionRef.current[1],
      positionRef.current[2]
    );
  });
  
  return (
    <group>
      <group ref={ref as any}>
        {/* If we have a player model, use it, otherwise use a fallback */}
        {playerModel ? (
          <primitive object={playerModel} />
        ) : (
          <>
            {/* Fallback player representation if model fails to load */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 2, 1]} />
              <meshStandardMaterial color="#43a7f0" />
            </mesh>
            
            {/* Eyes for the fallback player */}
            <mesh position={[0.25, 0.8, 0.51]} castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="white" />
              <mesh position={[0, 0, 0.05]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
              </mesh>
            </mesh>
            
            <mesh position={[-0.25, 0.8, 0.51]} castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="white" />
              <mesh position={[0, 0, 0.05]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
              </mesh>
            </mesh>
            
            {/* Glow effect for better visibility */}
            <pointLight position={[0, 1, 0]} intensity={0.5} color="#43a7f0" />
          </>
        )}
      </group>
    </group>
  );
}