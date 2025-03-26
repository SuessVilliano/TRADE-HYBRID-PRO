import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
  jump = 'jump',
}

export interface PlayerCustomization {
  bodyColor: string;
  headColor: string;
  bodyEmissive: string;
  headEmissive: string;
  bodyScale: [number, number, number];
  headScale: [number, number, number];
}

const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  bodyColor: '#3b82f6',
  headColor: '#60a5fa',
  bodyEmissive: '#1e40af',
  headEmissive: '#1d4ed8',
  bodyScale: [1, 1.5, 0.6],
  headScale: [0.7, 0.7, 0.7],
};

export default function Player() {
  // References to the player meshes
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const playerGroup = useRef<THREE.Group>(null);
  
  // Player state
  const playerSpeed = 0.15;
  const jumpHeight = 0.4;
  const gravity = 0.02;
  const playerPosition = useRef(new THREE.Vector3(0, 1, 0));
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const playerOnGround = useRef(true);
  const playerRotation = useRef(0);
  
  // Get keyboard controls
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Debugging logs
  useEffect(() => {
    console.log('Player component mounted');
    console.log('Default position:', playerPosition.current);
    
    return () => {
      console.log('Player component unmounted');
    };
  }, []);
  
  // Game loop for player movement
  useFrame(() => {
    const keys = getKeys();
    
    // Apply gravity
    if (!playerOnGround.current) {
      playerVelocity.current.y -= gravity;
    }
    
    // Handle jumping
    if (keys.jump && playerOnGround.current) {
      playerVelocity.current.y = jumpHeight;
      playerOnGround.current = false;
    }
    
    // Calculate movement based on current rotation
    let moveX = 0;
    let moveZ = 0;
    
    if (keys.forward) moveZ = -playerSpeed;
    if (keys.backward) moveZ = playerSpeed;
    if (keys.left) moveX = -playerSpeed;
    if (keys.right) moveX = playerSpeed;
    
    // Apply movement
    playerPosition.current.x += moveX;
    playerPosition.current.z += moveZ;
    playerPosition.current.y += playerVelocity.current.y;
    
    // Check ground collision
    if (playerPosition.current.y <= 1) {
      playerPosition.current.y = 1;
      playerVelocity.current.y = 0;
      playerOnGround.current = true;
    }
    
    // Update group position
    if (playerGroup.current) {
      playerGroup.current.position.copy(playerPosition.current);
      
      // Update rotation based on movement direction
      if (moveX !== 0 || moveZ !== 0) {
        playerRotation.current = Math.atan2(moveX, moveZ);
        playerGroup.current.rotation.y = playerRotation.current;
      }
    }
  });
  
  // Get current customization
  const customization = DEFAULT_CUSTOMIZATION;
  
  return (
    <group ref={playerGroup} position={[0, 1, 0]}>
      {/* Player body */}
      <mesh 
        ref={bodyRef}
        position={[0, 0.75, 0]}
        castShadow
      >
        <boxGeometry args={customization.bodyScale} />
        <meshStandardMaterial 
          color={customization.bodyColor} 
          emissive={customization.bodyEmissive}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Player head */}
      <mesh 
        ref={headRef}
        position={[0, 1.85, 0]}
        castShadow
      >
        <sphereGeometry args={customization.headScale} />
        <meshStandardMaterial 
          color={customization.headColor} 
          emissive={customization.headEmissive}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}