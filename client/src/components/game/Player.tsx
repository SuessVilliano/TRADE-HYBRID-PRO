import { useRef, useEffect } from "react";
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
}

export default function Player() {
  const playerRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 0.5, 0));
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const gamePhase = useGame(state => state.phase);
  const playHitSound = useAudio(state => state.playHit);
  
  // Get keyboard controls state without re-rendering
  const [, getKeys] = useKeyboardControls<Controls>();
  
  useFrame((state, delta) => {
    if (!playerRef.current || gamePhase !== "playing") return;

    // Get current control states
    const { forward, backward, left, right, interact } = getKeys();
    
    // Reset direction
    direction.current.set(0, 0, 0);
    
    // Get camera direction vector (normalized)
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Keep movement on xz plane
    cameraDirection.normalize();
    
    // Calculate forward/backward direction relative to camera
    if (forward) {
      direction.current.add(cameraDirection);
    }
    if (backward) {
      direction.current.sub(cameraDirection);
    }
    
    // Calculate left/right direction relative to camera
    const rightVector = new THREE.Vector3(
      cameraDirection.z,
      0,
      -cameraDirection.x
    ).normalize();
    
    if (right) {
      direction.current.add(rightVector);
    }
    if (left) {
      direction.current.sub(rightVector);
    }
    
    // Normalize direction if we're moving in multiple directions
    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();
      
      // Apply movement with a speed factor
      const speed = 5; // speed in units per second
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
    
    // Handle interact button
    if (interact) {
      console.log("Interact pressed at position:", playerRef.current.position);
      playHitSound();
    }
    
    // Update camera position to follow player
    const cameraOffset = new THREE.Vector3(0, 3, 6); // Position camera above and behind player
    const playerPos = playerRef.current.position.clone();
    
    targetPosition.current.copy(playerPos).add(cameraOffset);
    
    // Smoothly move camera to follow player
    state.camera.position.lerp(targetPosition.current, 0.1);
    state.camera.lookAt(playerPos);
  });
  
  // Start the game when player is ready
  useEffect(() => {
    console.log("Player ready - starting game");
    const startGame = useGame.getState().start;
    startGame();
    
    // Return cleanup function
    return () => {
      const endGame = useGame.getState().end;
      endGame();
    };
  }, []);
  
  return (
    <mesh ref={playerRef} position={[0, 0.5, 0]} castShadow receiveShadow>
      {/* Player body */}
      <boxGeometry args={[0.6, 1, 0.6]} />
      <meshStandardMaterial color="#4285F4" />
      
      {/* Player head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#34A853" />
      </mesh>
    </mesh>
  );
}
