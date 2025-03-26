import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Trail, useGLTF, Text, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '@/lib/stores/useGame';
import { useAudio } from '@/lib/stores/useAudio';
import { useGuest } from '@/lib/stores/useGuest';
import { useMultiplayer } from '@/lib/stores/useMultiplayer';
import { GLTF } from 'three-stdlib';

// Define model interfaces
type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh
  }
  materials: {
    [key: string]: THREE.Material | THREE.MeshStandardMaterial
  }
};

// Preload the model
useGLTF.preload('/models/trader_character.glb');

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
  const modelRef = useRef<THREE.Group>(null);
  
  // Load the 3D character model
  const [modelLoaded, setModelLoaded] = useState(false);
  const { scene: characterModel, animations } = useGLTF('/models/trader_character.glb') as GLTFResult;
  const { actions, mixer } = useAnimations(animations, modelRef);
  
  // Audio
  const { playHit, enableVoiceChat, voiceChatEnabled, getMicrophoneStream, updateAudioPosition } = useAudio();
  
  // Get the camera
  const { camera } = useThree();
  
  // Multiplayer voice chat integration
  const { toggleVoiceChat } = useMultiplayer();
  
  // Handle voice chat toggle with T key
  useEffect(() => {
    const handleVoiceChatToggle = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        // Toggle the voice chat in the audio store
        const newState = !voiceChatEnabled;
        
        if (newState) {
          // Enable voice chat
          enableVoiceChat().then(success => {
            if (success) {
              console.log('Voice chat enabled');
              toggleVoiceChat(true);
            } else {
              console.log('Failed to enable voice chat');
            }
          });
        } else {
          // Disable voice chat
          console.log('Voice chat disabled');
          toggleVoiceChat(false);
        }
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleVoiceChatToggle);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleVoiceChatToggle);
    };
  }, [enableVoiceChat, voiceChatEnabled, toggleVoiceChat]);
  
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
  const initialJumpPrevented = useRef(false);
  
  // Use a randomly selected customization
  const [customizationIndex, setCustomizationIndex] = useState(() => {
    return Math.floor(Math.random() * TRADER_CUSTOMIZATIONS.length);
  });
  
  // Get guest state
  const { guestUsername, isGuest } = useGuest();
  
  // Active customization state
  const [currentCustomization, setCurrentCustomization] = useState<PlayerCustomization>(() => {
    // Start with a randomly selected customization
    const baseCustomization = TRADER_CUSTOMIZATIONS[customizationIndex];
    
    // If we're a guest, use guest username
    if (isGuest) {
      return {
        ...baseCustomization,
        username: guestUsername
      };
    }
    
    return baseCustomization;
  });
  
  // Update customization when guest username changes
  useEffect(() => {
    if (isGuest) {
      setCurrentCustomization(prev => ({
        ...prev,
        username: guestUsername
      }));
    }
  }, [guestUsername, isGuest]);
  
  // Expose the update function to the window object so it can be called from outside
  useEffect(() => {
    // Function to update player customization from external components
    const updatePlayerCustomization = (newCustomization: PlayerCustomization) => {
      console.log("Updating player customization:", newCustomization);
      
      // If we're a guest, preserve the guest username
      if (isGuest) {
        setCurrentCustomization({
          ...newCustomization,
          username: guestUsername
        });
      } else {
        setCurrentCustomization(newCustomization);
      }
    };
    
    // Expose the function globally
    (window as any).updatePlayerCustomization = updatePlayerCustomization;
    
    // Cleanup on unmount
    return () => {
      delete (window as any).updatePlayerCustomization;
    };
  }, [guestUsername, isGuest]);
  
  // Get game state
  const { phase, start } = useGame();
  
  // Get multiplayer state and functions
  const { connect, disconnect, updatePlayerPosition, connected } = useMultiplayer();
  
  // Connect to multiplayer when player is created
  useEffect(() => {
    if (!connected && currentCustomization) {
      // Connect to multiplayer with current customization
      connect(currentCustomization.username, currentCustomization);
      console.log('Connected to multiplayer as', currentCustomization.username);
    }
    
    // Disconnect on unmount
    return () => {
      if (connected) {
        disconnect();
        console.log('Disconnected from multiplayer');
      }
    };
  }, [connect, disconnect, connected, currentCustomization]);
  
  // Reset jump prevention when game phase changes to "ready" (restart)
  useEffect(() => {
    if (phase === 'ready') {
      initialJumpPrevented.current = false;
      console.log('Game restarted, reset jump prevention flag');
    }
  }, [phase]);
  
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
  
  // Initialize 3D model
  useEffect(() => {
    if (characterModel) {
      console.log('3D Character model loaded');
      
      // Apply customizations to the model materials
      characterModel.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Apply colors based on customization
          if (child.material.name.includes('body') || child.material.name.includes('Body')) {
            child.material.color = new THREE.Color(currentCustomization.bodyColor);
            child.material.emissive = new THREE.Color(currentCustomization.bodyEmissive);
            child.material.emissiveIntensity = 0.3;
          } else if (child.material.name.includes('head') || child.material.name.includes('Head')) {
            child.material.color = new THREE.Color(currentCustomization.headColor);
            child.material.emissive = new THREE.Color(currentCustomization.headEmissive);
            child.material.emissiveIntensity = 0.3;
          }
          
          // Ensure shadows are set up
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      setModelLoaded(true);
    }
  }, [characterModel, currentCustomization]);
  
  // Update animations based on movement
  useEffect(() => {
    if (mixer) {
      // If we have animations, we'd play them here
      console.log('Animation mixer initialized');
      
      // If there's an "idle" animation, play it by default
      if (actions.idle) {
        actions.idle.play();
      }
      
      // If there's a "walk" animation, we'd trigger it during movement
      if (actions.walk) {
        console.log('Walk animation available');
      }
      
      // If there's a "run" animation, we'd trigger it during sprinting
      if (actions.run) {
        console.log('Run animation available');
      }
    }
  }, [actions, mixer]);
  
  // Debugging logs
  useEffect(() => {
    console.log('Player component mounted');
    console.log('Default position:', playerPosition.current);
    console.log('Available animations:', Object.keys(actions));
    
    return () => {
      console.log('Player component unmounted');
    };
  }, [actions]);
  

  
  // Game loop for player movement and animation
  useFrame((state, delta) => {
    // Update animation mixer on each frame
    if (mixer) {
      mixer.update(delta);
    }
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
      
      // Ensure we prevent auto-jump at game start
      if (!initialJumpPrevented.current) {
        initialJumpPrevented.current = true;
        console.log('Key pressed: Space');
        return;
      }
      
      if (playerOnGround.current) {
        // First jump
        playerVelocity.current.y = jumpHeight;
        playerOnGround.current = false;
        doubleJumpAvailable.current = true;
        lastJumpTime.current = now;
        playHit?.(); // Play jump sound
        console.log('Player jumped');
      } else if (doubleJumpAvailable.current && (now - lastJumpTime.current > jumpCooldown)) {
        // Double jump if available and cooldown has passed
        playerVelocity.current.y = jumpHeight * 0.8;
        doubleJumpAvailable.current = false;
        lastJumpTime.current = now;
        playHit?.(); // Play jump sound
        console.log('Player double jumped');
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
    
    // We're now controlling trail visibility with conditional rendering
    // so we don't need this code anymore
    
    // Make camera follow player with some smoothing
    const targetCameraPos = new THREE.Vector3(
      playerPosition.current.x + 8, 
      playerPosition.current.y + 6, 
      playerPosition.current.z + 8
    );
    
    camera.position.lerp(targetCameraPos, 0.05);
    camera.lookAt(playerPosition.current);
    
    // Send player position updates to multiplayer service
    if (connected) {
      // Determine current animation
      let currentAnimation = 'idle';
      if (moveX !== 0 || moveZ !== 0) {
        currentAnimation = isSprinting ? 'run' : 'walk';
      }
      if (!playerOnGround.current) {
        currentAnimation = 'jump';
      }
      
      // Send position, rotation and animation to multiplayer service
      const currentPosition: [number, number, number] = 
        [playerPosition.current.x, playerPosition.current.y, playerPosition.current.z];
      
      updatePlayerPosition(
        currentPosition,
        playerRotation.current,
        currentAnimation
      );
      
      // Update spatial audio positions for proximity voice chat
      if (voiceChatEnabled) {
        // Get all players from the multiplayer service and update their audio positions
        const { getAllPlayers, getClientId } = useMultiplayer.getState();
        const players = getAllPlayers();
        const clientId = getClientId();
        
        players.forEach(player => {
          if (player.id !== clientId) {
            updateAudioPosition(
              player.id,
              player.position,
              currentPosition,
              playerRotation.current
            );
          }
        });
      }
    }
  });
  
  // Player rank system based on score/trades
  const [playerScore, setPlayerScore] = useState(0);
  const [playerRank, setPlayerRank] = useState('Novice Trader');
  
  // Determine rank based on score
  useEffect(() => {
    if (playerScore >= 1000) {
      setPlayerRank('Elite Trader');
    } else if (playerScore >= 500) {
      setPlayerRank('Pro Trader');
    } else if (playerScore >= 200) {
      setPlayerRank('Expert Trader');
    } else if (playerScore >= 100) {
      setPlayerRank('Advanced Trader');
    } else if (playerScore >= 50) {
      setPlayerRank('Intermediate Trader');
    } else {
      setPlayerRank('Novice Trader');
    }
  }, [playerScore]);
  
  // Open player info panel instead of changing character on click
  const openPlayerInfo = () => {
    console.log('Player info panel opened');
    // Here we would normally open a UI panel with player stats
    // For now, just increment score for testing
    setPlayerScore(prev => prev + 10);
  };
  
  return (
    <group ref={playerGroup} position={[0, 1, 0]} onClick={openPlayerInfo}>
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
        {currentCustomization.username}
      </Text>
      
      {/* Role display */}
      <Text
        position={[0, 2.5, 0]}
        color={currentCustomization.bodyColor}
        anchorX="center"
        anchorY="middle"
        fontSize={0.25}
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {playerRank}
      </Text>
      
      {/* Trail effect for running */}
      {(isSprinting && (getKeys().forward || getKeys().backward || getKeys().left || getKeys().right)) ? (
        <Trail
          ref={trailRef}
          width={1}
          length={5}
          color={currentCustomization.trailColor}
          attenuation={(width) => width / 5}
        >
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={currentCustomization.trailColor} />
          </mesh>
        </Trail>
      ) : null}
      
      {/* Player body */}
      <mesh 
        ref={bodyRef}
        position={[0, 0.75, 0]}
        castShadow
      >
        <boxGeometry args={currentCustomization.bodyScale} />
        <meshStandardMaterial 
          color={currentCustomization.bodyColor} 
          emissive={currentCustomization.bodyEmissive}
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
        <sphereGeometry args={currentCustomization.headScale} />
        <meshStandardMaterial 
          color={currentCustomization.headColor} 
          emissive={currentCustomization.headEmissive}
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
            color={currentCustomization.trailColor} 
            transparent 
            opacity={0.5} 
          />
        </mesh>
      )}
      
      {/* Voice chat indicator */}
      {voiceChatEnabled && (
        <group position={[0, 3.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          {/* Microphone icon */}
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.05, 0.15, 0.05]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, -0.1, 0.1]}>
            <boxGeometry args={[0.1, 0.05, 0.05]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      )}
      
      {/* Point light to make the player glow */}
      <pointLight
        position={[0, 1, 0]}
        intensity={0.5}
        color={currentCustomization.bodyColor}
        distance={3}
      />
      
      {/* 3D Character Model */}
      <Suspense fallback={null}>
        {modelLoaded && (
          <group 
            ref={modelRef}
            position={[0, 0, 0]}
            scale={[2.5, 2.5, 2.5]}
            rotation={[0, Math.PI, 0]}
          >
            <primitive object={characterModel.clone()} castShadow receiveShadow />
          </group>
        )}
      </Suspense>
    </group>
  );
}