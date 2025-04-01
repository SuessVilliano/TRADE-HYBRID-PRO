import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useKeyboardControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Import Controls enum
import { Controls } from './Game';

interface PlayerProps {
  position: [number, number, number];
}

/**
 * Player component for the 3D metaverse environment
 */
const Player: React.FC<PlayerProps> = ({ position }) => {
  // Reference to the model's mesh
  const modelRef = useRef<THREE.Group>();
  
  // Flag to check if we should use the 3D model or a simple box
  const [useModel, setUseModel] = useState(true);
  
  // Load the trader character model
  // Fall back to simple box if model fails to load
  const { scene: model, nodes } = useGLTF('/models/trader_character.glb', true, 
    undefined, 
    (error) => {
      console.error('Failed to load player model:', error);
      setUseModel(false);
    }
  );
  
  useEffect(() => {
    if (model) {
      // Clone the model to avoid issues with multiple uses
      const clonedModel = model.clone();
      
      // Set cast shadow for all meshes in the model
      clonedModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Store the cloned model in the ref
      modelRef.current = clonedModel;
    }
  }, [model]);

  // Create a box physics object for the player
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    type: 'Dynamic',
    args: [1, 2, 1], // Width, height, depth
  }));

  // Store velocity state
  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    // Subscribe to velocity changes
    const unsubscribe = api.velocity.subscribe((v) => (velocity.current = v));
    return unsubscribe;
  }, [api.velocity]);

  // Access keyboard controls without causing re-renders
  const [, getKeys] = useKeyboardControls<Controls>();

  // To track the player's rotation direction
  const rotationRef = useRef(0);

  // Handle movement in the game loop
  useFrame(() => {
    const { forward, back, left, right, jump } = getKeys();
    
    // Movement speed
    const speed = 5;
    
    // Log control states for debugging (only log when controls are active)
    if (forward || back || left || right || jump) {
      console.log('Controls:', { forward, back, left, right, jump });
      console.log('Current velocity:', velocity.current);
    }
    
    // Forward/backward movement
    if (forward) {
      api.velocity.set(0, velocity.current[1], -speed);
      rotationRef.current = Math.PI; // Facing forward (negative z)
    } else if (back) {
      api.velocity.set(0, velocity.current[1], speed);
      rotationRef.current = 0; // Facing backward (positive z)
    }
    
    // Left/right movement
    if (left) {
      api.velocity.set(-speed, velocity.current[1], velocity.current[2]);
      rotationRef.current = Math.PI / 2; // Facing left (negative x)
    } else if (right) {
      api.velocity.set(speed, velocity.current[1], velocity.current[2]);
      rotationRef.current = -Math.PI / 2; // Facing right (positive x)
    }
    
    // Rotate the model based on movement direction
    if (modelRef.current && (forward || back || left || right)) {
      modelRef.current.rotation.y = rotationRef.current;
    }
    
    // Jump
    if (jump && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], 5, velocity.current[2]);
    }
    
    // If no movement keys pressed, slow down horizontal movement
    if (!forward && !back && !left && !right) {
      api.velocity.set(
        velocity.current[0] * 0.9,
        velocity.current[1],
        velocity.current[2] * 0.9
      );
    }
  });

  return (
    <group ref={ref as React.MutableRefObject<THREE.Group>}>
      {useModel && modelRef.current ? (
        // Use the 3D model if available
        <primitive 
          object={modelRef.current} 
          scale={[0.5, 0.5, 0.5]} 
          position={[0, -1, 0]} // Adjust position to match physics box
        />
      ) : (
        // Fallback to a simple box representation
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#ff2d55" />
        </mesh>
      )}
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/trader_character.glb');

export default Player;