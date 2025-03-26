import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Trail, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '@/lib/stores/useGame';
import { useAudio } from '@/lib/stores/useAudio';

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
  jump = 'jump',
  sprint = 'sprint',
}

export interface PlayerCustomization {
  bodyColor: string;
  headColor: string;
  bodyEmissive: string;
  headEmissive: string;
  bodyScale: [number, number, number];
  headScale: [number, number, number];
  trailColor: string;
  username: string;
  role: string;
}

const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  bodyColor: '#3b82f6',
  headColor: '#60a5fa',
  bodyEmissive: '#1e40af',
  headEmissive: '#1d4ed8',
  bodyScale: [1, 1.5, 0.6],
  headScale: [0.7, 0.7, 0.7],
  trailColor: '#93c5fd',
  username: 'Trader',
  role: 'Pro Trader',
};

const TRADER_CUSTOMIZATIONS: PlayerCustomization[] = [
  {
    bodyColor: '#3b82f6', // Blue
    headColor: '#60a5fa',
    bodyEmissive: '#1e40af',
    headEmissive: '#1d4ed8',
    bodyScale: [1, 1.5, 0.6],
    headScale: [0.7, 0.7, 0.7],
    trailColor: '#93c5fd',
    username: 'BlueTrader',
    role: 'Crypto Specialist',
  },
  {
    bodyColor: '#65a30d', // Green
    headColor: '#84cc16',
    bodyEmissive: '#365314',
    headEmissive: '#4d7c0f',
    bodyScale: [1, 1.5, 0.6],
    headScale: [0.7, 0.7, 0.7],
    trailColor: '#bef264',
    username: 'GreenTrader',
    role: 'Stock Analyst',
  },
  {
    bodyColor: '#be123c', // Red
    headColor: '#e11d48',
    bodyEmissive: '#881337',
    headEmissive: '#9f1239',
    bodyScale: [1, 1.5, 0.6],
    headScale: [0.7, 0.7, 0.7],
    trailColor: '#fda4af',
    username: 'RedTrader',
    role: 'Forex Expert',
  },
  {
    bodyColor: '#7e22ce', // Purple
    headColor: '#a855f7',
    bodyEmissive: '#581c87',
    headEmissive: '#6b21a8',
    bodyScale: [1, 1.5, 0.6],
    headScale: [0.7, 0.7, 0.7],
    trailColor: '#d8b4fe',
    username: 'PurpleTrader',
    role: 'Signal Trader',
  },
  {
    bodyColor: '#eab308', // Yellow/Gold
    headColor: '#facc15',
    bodyEmissive: '#854d0e',
    headEmissive: '#a16207',
    bodyScale: [1, 1.5, 0.6],
    headScale: [0.7, 0.7, 0.7],
    trailColor: '#fef08a',
    username: 'GoldTrader',
    role: 'Elite Trader',
  },
];

export default function Player() {
  // References to the player meshes
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const playerGroup = useRef<THREE.Group>(null);
  const trailRef = useRef<any>(null);
  
  // Audio
  const { playHit } = useAudio();
  
  // Get the camera
  const { camera } = useThree();
  
  // Player state
  const [isSprinting, setIsSprinting] = useState(false);
  const baseSpeed = 0.15;
  const sprintSpeed = 0.3;
  const playerSpeed = isSprinting ? sprintSpeed : baseSpeed;
  const jumpHeight = 0.5;
  const gravity = 0.02;
  const playerPosition = useRef(new THREE.Vector3(0, 1, 0));
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const playerOnGround = useRef(true);
  const playerRotation = useRef(0);
  const lastJumpTime = useRef(0);
  const doubleJumpAvailable = useRef(false);
  const jumpCooldown = 500; // milliseconds
  
  // Use a randomly selected customization
  const [customizationIndex, setCustomizationIndex] = useState(() => {
    return Math.floor(Math.random() * TRADER_CUSTOMIZATIONS.length);
  });
  
  // Get game state
  const { phase, start } = useGame();
  
  // Get keyboard controls
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Handle key events for double tap detection
  const lastKeyTimes = useRef<{[key: string]: number}>({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    jump: 0,
  });
  
  // Double tap detection threshold (milliseconds)
  const doubleTapThreshold = 300;
  
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
    if (phase !== 'playing') {
      // Start the game if not already playing
      if (phase === 'ready') {
        start();
      }
      return;
    }
    
    const keys = getKeys();
    const currentTime = Date.now();
    
    // Check for double tap sprint
    Object.entries(keys).forEach(([key, isPressed]) => {
      if (isPressed && ['forward', 'backward', 'left', 'right'].includes(key)) {
        const lastTime = lastKeyTimes.current[key] || 0;
        if (currentTime - lastTime < doubleTapThreshold) {
          // Double tap detected!
          setIsSprinting(true);
          
          // Reset sprint after 1.5 seconds
          setTimeout(() => {
            setIsSprinting(false);
          }, 1500);
        }
        lastKeyTimes.current[key] = currentTime;
      }
    });
    
    // Toggle sprint with the sprint key
    if (keys.sprint) {
      setIsSprinting(true);
    } else {
      // Only reset if we're not in a double-tap sprint
      if (isSprinting && !Object.entries(lastKeyTimes.current).some(
        ([key, time]) => currentTime - time < doubleTapThreshold
      )) {
        setIsSprinting(false);
      }
    }
    
    // Apply gravity
    if (!playerOnGround.current) {
      playerVelocity.current.y -= gravity;
    }
    
    // Handle jumping and double jumping
    if (keys.jump) {
      const now = Date.now();
      
      if (playerOnGround.current) {
        // First jump
        playerVelocity.current.y = jumpHeight;
        playerOnGround.current = false;
        doubleJumpAvailable.current = true;
        lastJumpTime.current = now;
        playHit?.(); // Play jump sound
      } else if (doubleJumpAvailable.current && (now - lastJumpTime.current > jumpCooldown)) {
        // Double jump if available and cooldown has passed
        playerVelocity.current.y = jumpHeight * 0.8;
        doubleJumpAvailable.current = false;
        lastJumpTime.current = now;
        playHit?.(); // Play jump sound
      }
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
      
      // Animate body during sprint
      if (bodyRef.current && isSprinting && (moveX !== 0 || moveZ !== 0)) {
        bodyRef.current.rotation.x = Math.sin(Date.now() * 0.01) * 0.2;
      } else if (bodyRef.current) {
        bodyRef.current.rotation.x = 0;
      }
      
      // Animate head during movement
      if (headRef.current && (moveX !== 0 || moveZ !== 0)) {
        headRef.current.rotation.y = Math.sin(Date.now() * 0.005) * 0.2;
      } else if (headRef.current) {
        headRef.current.rotation.y = 0;
      }
    }
    
    // Update trail visibility based on movement
    if (trailRef.current) {
      trailRef.current.visible = isSprinting && (moveX !== 0 || moveZ !== 0);
    }
    
    // Make camera follow player with some smoothing
    const targetCameraPos = new THREE.Vector3(
      playerPosition.current.x + 8, 
      playerPosition.current.y + 6, 
      playerPosition.current.z + 8
    );
    
    camera.position.lerp(targetCameraPos, 0.05);
    camera.lookAt(playerPosition.current);
  });
  
  // Get current customization
  const customization = TRADER_CUSTOMIZATIONS[customizationIndex];
  
  // Change character on click
  const changeCharacter = () => {
    setCustomizationIndex((prevIndex) => (prevIndex + 1) % TRADER_CUSTOMIZATIONS.length);
  };
  
  return (
    <group ref={playerGroup} position={[0, 1, 0]} onClick={changeCharacter}>
      {/* Username display */}
      <Text
        position={[0, 3, 0]}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={0.5}
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {customization.username}
      </Text>
      
      {/* Role display */}
      <Text
        position={[0, 2.5, 0]}
        color={customization.bodyColor}
        anchorX="center"
        anchorY="middle"
        fontSize={0.25}
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {customization.role}
      </Text>
      
      {/* Trail effect for running */}
      <Trail
        ref={trailRef}
        width={1}
        length={5}
        color={customization.trailColor}
        attenuation={(width) => width / 5}
        visible={false}
      >
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={customization.trailColor} />
        </mesh>
      </Trail>
      
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
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.5}
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
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Player eyes */}
      <group position={[0, 1.9, 0.3]}>
        {/* Left eye */}
        <mesh position={[-0.2, 0, 0.2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[-0.2, 0, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
        
        {/* Right eye */}
        <mesh position={[0.2, 0, 0.2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0.2, 0, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
      
      {/* Sprint indicator */}
      {isSprinting && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial 
            color={customization.trailColor} 
            transparent 
            opacity={0.5} 
          />
        </mesh>
      )}
      
      {/* Point light to make the player glow */}
      <pointLight
        position={[0, 1, 0]}
        intensity={0.5}
        color={customization.bodyColor}
        distance={3}
      />
    </group>
  );
}