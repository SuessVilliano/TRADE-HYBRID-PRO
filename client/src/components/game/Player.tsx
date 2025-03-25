import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";

// Define our control keys for the game - must match Controls.tsx
enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
  jump = 'jump',
}

// Define player customization options
export interface PlayerCustomization {
  bodyColor: string;
  headColor: string;
  bodyEmissive: string;
  headEmissive: string;
  bodyScale: [number, number, number];
  headScale: [number, number, number];
}

const DEFAULT_CUSTOMIZATION: PlayerCustomization = {
  bodyColor: "#4285F4",
  headColor: "#34A853",
  bodyEmissive: "#1a53ff",
  headEmissive: "#34A853",
  bodyScale: [1, 1.5, 1],
  headScale: [0.4, 0.4, 0.4],
}

export default function Player() {
  const playerRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 0.5, 0));
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const yVelocity = useRef(0);
  const isJumping = useRef(false);
  const isGrounded = useRef(true);
  const cameraRotation = useRef(0);
  const lastTapTime = useRef({ forward: 0, backward: 0, left: 0, right: 0 });
  const isSprinting = useRef(false);
  const sprintTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const gamePhase = useGame(state => state.phase);
  const playHitSound = useAudio(state => state.playHit);
  const playSuccessSound = useAudio(state => state.playSuccess);
  
  // State for player customization
  const [customization, setCustomization] = useState<PlayerCustomization>(DEFAULT_CUSTOMIZATION);
  
  // Get keyboard controls state without re-rendering
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Handle camera rotation with mouse/touch
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gamePhase !== "playing") return;
      
      // Only rotate camera if right mouse button is pressed
      if (e.buttons === 2) {
        cameraRotation.current += e.movementX * 0.01;
      }
    };
    
    // Prevent context menu on right-click
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("contextmenu", preventContextMenu);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [gamePhase]);
  
  // Handle jumping with space bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase !== "playing") return;
      
      // Jump with space bar
      if (e.code === "Space" && isGrounded.current) {
        yVelocity.current = 10; // Initial jump velocity
        isJumping.current = true;
        isGrounded.current = false;
        console.log("Jumping!");
        playSuccessSound();
      }
    };
    
    // Add listener
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gamePhase, playSuccessSound]);
  
  // Check for double tap to sprint
  const checkDoubleTap = (key: 'forward' | 'backward' | 'left' | 'right') => {
    const now = Date.now();
    const lastTap = lastTapTime.current[key];
    
    // If double tap (within 300ms)
    if (now - lastTap < 300) {
      if (!isSprinting.current) {
        console.log(`Double tap ${key} - sprinting!`);
        isSprinting.current = true;
        playSuccessSound();
        
        // Reset sprint after 1.5 seconds
        if (sprintTimeout.current) {
          clearTimeout(sprintTimeout.current);
        }
        
        sprintTimeout.current = setTimeout(() => {
          isSprinting.current = false;
          console.log("Sprint ended");
        }, 1500);
      }
    }
    
    // Update last tap time
    lastTapTime.current[key] = now;
  };
  
  useFrame((state, delta) => {
    if (!playerRef.current || gamePhase !== "playing") return;

    // Get current control states
    const { forward, backward, left, right, interact } = getKeys();
    
    // Reset direction
    direction.current.set(0, 0, 0);
    
    // Create a rotation matrix for camera rotation
    const rotationMatrix = new THREE.Matrix4().makeRotationY(cameraRotation.current);
    
    // Get camera direction vector and apply rotation
    const cameraDirection = new THREE.Vector3(0, 0, -1).applyMatrix4(rotationMatrix);
    cameraDirection.y = 0; // Keep movement on xz plane
    cameraDirection.normalize();
    
    // Calculate forward/backward direction relative to camera
    if (forward) {
      direction.current.add(cameraDirection);
      console.log("Moving forward");
      checkDoubleTap('forward');
    }
    if (backward) {
      direction.current.sub(cameraDirection);
      console.log("Moving backward");
      checkDoubleTap('backward');
    }
    
    // Calculate right vector based on camera direction
    const rightVector = new THREE.Vector3(
      cameraDirection.z,
      0,
      -cameraDirection.x
    ).normalize();
    
    // Calculate left/right direction relative to camera
    if (right) {
      direction.current.add(rightVector);
      console.log("Moving right");
      checkDoubleTap('right');
    }
    if (left) {
      direction.current.sub(rightVector);
      console.log("Moving left");
      checkDoubleTap('left');
    }
    
    // Normalize direction if we're moving in multiple directions
    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();
      
      // Apply movement with a speed factor
      const baseSpeed = 5; // Base speed in units per second
      const sprintMultiplier = isSprinting.current ? 2 : 1; // Double speed when sprinting
      const speed = baseSpeed * sprintMultiplier;
      
      velocity.current.x = direction.current.x * speed * delta;
      velocity.current.z = direction.current.z * speed * delta;
      
      // Update position
      playerRef.current.position.x += velocity.current.x;
      playerRef.current.position.z += velocity.current.z;
      
      // Set rotation to match direction (look where we're going)
      if (direction.current.length() > 0) {
        const angle = Math.atan2(direction.current.x, direction.current.z);
        playerRef.current.rotation.y = angle;
      }
      
      // Log movement
      console.log(`Player moving: x=${playerRef.current.position.x.toFixed(2)}, z=${playerRef.current.position.z.toFixed(2)}`);
    }
    
    // Handle jumping and gravity
    // Apply gravity
    const gravity = 20; // Gravity force
    yVelocity.current -= gravity * delta;
    
    // Update y position based on velocity
    playerRef.current.position.y += yVelocity.current * delta;
    
    // Check if player is on ground
    if (playerRef.current.position.y <= 0.5) { // 0.5 is the default height
      playerRef.current.position.y = 0.5;
      yVelocity.current = 0;
      
      if (!isGrounded.current) {
        isGrounded.current = true;
        isJumping.current = false;
        console.log("Landed on ground");
      }
    }
    
    // Handle interact button
    if (interact) {
      console.log("Interact pressed at position:", playerRef.current.position);
      playHitSound();
    }
    
    // Update camera position to follow player
    // Create offset based on camera rotation
    const distance = 6;
    const height = 3;
    
    // Apply rotation to get camera position
    const offset = new THREE.Vector3(0, height, distance).applyMatrix4(rotationMatrix);
    const playerPos = playerRef.current.position.clone();
    
    // Set target position
    targetPosition.current.copy(playerPos).add(offset);
    
    // Smoothly move camera to follow player
    state.camera.position.lerp(targetPosition.current, 0.1);
    
    // Look at player
    const lookAtPos = playerPos.clone();
    lookAtPos.y += 1; // Look slightly above the player
    state.camera.lookAt(lookAtPos);
  });
  
  // Start the game when player is ready
  useEffect(() => {
    // Add a global function to update player customization
    (window as any).updatePlayerCustomization = (newCustomization: Partial<PlayerCustomization>) => {
      setCustomization(prev => ({
        ...prev,
        ...newCustomization
      }));
    };
    
    console.log("Player ready - starting game");
    const startGame = useGame.getState().start;
    startGame();
    
    // Return cleanup function
    return () => {
      const endGame = useGame.getState().end;
      endGame();
      delete (window as any).updatePlayerCustomization;
    };
  }, []);
  
  return (
    <mesh ref={playerRef} position={[0, 0.5, 0]} castShadow receiveShadow>
      {/* Player body - customizable */}
      <boxGeometry args={customization.bodyScale} />
      <meshStandardMaterial 
        color={customization.bodyColor} 
        emissive={customization.bodyEmissive} 
        emissiveIntensity={0.5} 
      />
      
      {/* Player head - customizable */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[...customization.headScale]} />
        <meshStandardMaterial 
          color={customization.headColor} 
          emissive={customization.headEmissive} 
          emissiveIntensity={0.3} 
        />
      </mesh>
    </mesh>
  );
}
