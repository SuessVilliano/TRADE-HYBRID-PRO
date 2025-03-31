import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  useGLTF, 
  Sky, 
  Text, 
  KeyboardControls, 
  useKeyboardControls,
  PointerLockControls,
  useHelper,
  Environment,
  Billboard
} from '@react-three/drei';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';
import { useControlsStore } from '@/lib/stores/useControlsStore';
import { useAudio } from '@/lib/stores/useAudio';
import THCCoinDisplay from './THCCoinDisplay';
import BadgeTriggerZone from './BadgeTriggerZone';
import MobileControls from './MobileControls';

// Define control keys map
const controlKeys = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft'] }
];

// Player component with first-person controls
interface PlayerProps {
  mobileControls?: boolean;
  mobileDirection?: { x: number; y: number };
  mobileJump?: boolean;
  mobileSprint?: boolean;
}

function Player({ 
  mobileControls = false, 
  mobileDirection = { x: 0, y: 0 }, 
  mobileJump = false,
  mobileSprint = false
}: PlayerProps) {
  // Get controls state for enabling/disabling movement
  const { controlsEnabled } = useControlsStore();
  const playerRef = useRef<THREE.Group>(null);
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 2, 0],
    args: [0.5, 1.8, 0.5]
  }));

  // Movement controls from keyboard
  const [, getKeys] = useKeyboardControls();
  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 2, 0]);

  // Subscribe to physics
  useEffect(() => {
    const unsubscribePosition = api.position.subscribe(v => position.current = v);
    const unsubscribeVelocity = api.velocity.subscribe(v => velocity.current = v);
    
    return () => {
      unsubscribePosition();
      unsubscribeVelocity();
    };
  }, [api]);

  // Player movement logic
  useFrame(() => {
    // Only process movement if controls are enabled
    if (!controlsEnabled) {
      // If controls are disabled, zero out the velocity to stop movement
      api.velocity.set(0, velocity.current[1], 0);
      return;
    }
    
    // Get keyboard controls if not on mobile
    const keyboard = getKeys();
    
    // Debug keyboard controls - log to console for debugging
    if (keyboard.forward || keyboard.backward || keyboard.left || keyboard.right) {
      console.log("Keyboard Controls:", {
        forward: keyboard.forward,
        backward: keyboard.backward,
        left: keyboard.left,
        right: keyboard.right
      });
    }
    
    // Determine control values based on whether we're using mobile or keyboard
    const forward = mobileControls ? mobileDirection.y < -0.2 : keyboard.forward;
    const backward = mobileControls ? mobileDirection.y > 0.2 : keyboard.backward;
    const left = mobileControls ? mobileDirection.x < -0.2 : keyboard.left;
    const right = mobileControls ? mobileDirection.x > 0.2 : keyboard.right;
    const jump = mobileControls ? mobileJump : keyboard.jump;
    const sprint = mobileControls ? mobileSprint : keyboard.sprint;
    
    // Apply movement forces based on inputs
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
    
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(sprint ? 10 : 5);
      
    api.velocity.set(direction.x, velocity.current[1], direction.z);
    
    // Handle jumping
    if (jump && Math.abs(velocity.current[1]) < 0.1) {
      api.velocity.set(velocity.current[0], 8, velocity.current[2]);
    }
    
    // Update camera and player position
    if (playerRef.current) {
      playerRef.current.position.set(position.current[0], position.current[1], position.current[2]);
    }
  });

  return (
    <group ref={playerRef as React.RefObject<THREE.Group>}>
      <mesh ref={ref as React.RefObject<THREE.Mesh>} castShadow>
        <boxGeometry args={[0.5, 1.8, 0.5]} />
        <meshStandardMaterial color="blue" transparent opacity={0} />
      </mesh>
    </group>
  );
}

// Floor component
function Floor() {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    type: 'Static'
  }));
  
  return (
    <group ref={ref as React.RefObject<THREE.Group>}>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

// Wall component
function Wall({ position, size, rotation = [0, 0, 0] }: { position: [number, number, number], size: [number, number, number], rotation?: [number, number, number] }) {
  const [ref] = useBox(() => ({ 
    position, 
    args: size,
    rotation,
    type: 'Static'
  }));
  
  return (
    <mesh ref={ref as React.RefObject<THREE.Mesh>} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#555555" />
    </mesh>
  );
}

// MarketDataScreen component
function MarketDataScreen({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const [data, setData] = useState({
    symbol: 'BTC/USD',
    price: '63,247.82',
    change: '+2.34%',
    volume: '4.2B',
    updated: new Date().toLocaleTimeString()
  });
  
  // Update market data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomChange = ((Math.random() * 5) - 2.5).toFixed(2);
      const randomPrice = (63000 + (Math.random() * 1000)).toFixed(2);
      
      setData({
        ...data,
        price: Number(randomPrice).toLocaleString(),
        change: `${Number(randomChange) > 0 ? '+' : ''}${randomChange}%`,
        updated: new Date().toLocaleTimeString()
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [data]);
  
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      <Billboard position={[0, 0, 0.1]} follow={true}>
        <Text
          color={data.change.startsWith('+') ? '#00ff00' : '#ff0000'}
          fontSize={0.6}
          maxWidth={9}
          position={[0, 1.5, 0.1]}
          textAlign="center"
        >
          {data.symbol}: {data.price}
        </Text>
        
        <Text
          color={data.change.startsWith('+') ? '#00ff00' : '#ff0000'}
          fontSize={0.4}
          position={[0, 0.8, 0.1]}
          textAlign="center"
        >
          {data.change}
        </Text>
        
        <Text
          color="white"
          fontSize={0.3}
          position={[0, 0, 0.1]}
          textAlign="center"
        >
          24h Volume: {data.volume}
        </Text>
        
        <Text
          color="#999999"
          fontSize={0.2}
          position={[0, -0.8, 0.1]}
          textAlign="center"
        >
          Last Updated: {data.updated}
        </Text>
      </Billboard>
    </group>
  );
}

// Create the main TradeHouse structure
function TradeHouseStructure() {
  // Floor dimensions
  const floorWidth = 100;
  const floorDepth = 100;
  
  // Building dimensions
  const buildingWidth = 50;
  const buildingDepth = 50;
  const buildingHeight = 20; // 4 stories
  const wallThickness = 1;
  
  return (
    <group>
      {/* Main floor */}
      <Floor />
      
      {/* Exterior walls */}
      {/* Front wall with entrance */}
      <Wall 
        position={[0, buildingHeight/2, -buildingDepth/2]} 
        size={[buildingWidth, buildingHeight, wallThickness]}
      />
      
      {/* Back wall */}
      <Wall 
        position={[0, buildingHeight/2, buildingDepth/2]} 
        size={[buildingWidth, buildingHeight, wallThickness]}
      />
      
      {/* Left wall */}
      <Wall 
        position={[-buildingWidth/2, buildingHeight/2, 0]} 
        size={[wallThickness, buildingHeight, buildingDepth]}
      />
      
      {/* Right wall */}
      <Wall 
        position={[buildingWidth/2, buildingHeight/2, 0]} 
        size={[wallThickness, buildingHeight, buildingDepth]}
      />
      
      {/* Ceiling */}
      <Wall 
        position={[0, buildingHeight, 0]} 
        size={[buildingWidth, wallThickness, buildingDepth]}
      />
      
      {/* Internal walls for different rooms/floors */}
      
      {/* 1st floor dividers */}
      <Wall 
        position={[-buildingWidth/4, 2.5, 0]} 
        size={[wallThickness, 5, buildingDepth*0.8]}
      />
      
      <Wall 
        position={[buildingWidth/4, 2.5, 0]} 
        size={[wallThickness, 5, buildingDepth*0.8]}
      />
      
      {/* 2nd floor */}
      <Wall 
        position={[0, 5, 0]} 
        size={[buildingWidth*0.95, wallThickness, buildingDepth*0.95]}
      />
      
      {/* 2nd floor dividers */}
      <Wall 
        position={[0, 7.5, buildingDepth/4]} 
        size={[buildingWidth*0.8, 5, wallThickness]}
      />
      
      <Wall 
        position={[0, 7.5, -buildingDepth/4]} 
        size={[buildingWidth*0.8, 5, wallThickness]}
      />
      
      {/* 3rd floor */}
      <Wall 
        position={[0, 10, 0]} 
        size={[buildingWidth*0.95, wallThickness, buildingDepth*0.95]}
      />
      
      {/* 3rd floor dividers */}
      <Wall 
        position={[-buildingWidth/4, 12.5, 0]} 
        size={[wallThickness, 5, buildingDepth*0.8]}
      />
      
      <Wall 
        position={[buildingWidth/4, 12.5, 0]} 
        size={[wallThickness, 5, buildingDepth*0.8]}
      />
      
      {/* 4th floor */}
      <Wall 
        position={[0, 15, 0]} 
        size={[buildingWidth*0.95, wallThickness, buildingDepth*0.95]}
      />
    </group>
  );
}

// Room labels for different areas
function RoomLabels() {
  return (
    <group>
      {/* Main entrance */}
      <Billboard position={[0, 2, -24]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          MAIN ENTRANCE
        </Text>
      </Billboard>
      
      {/* First floor rooms */}
      <Billboard position={[-15, 2, 0]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          GYM
        </Text>
      </Billboard>
      
      <Billboard position={[0, 2, 0]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          MAIN LOBBY
        </Text>
      </Billboard>
      
      <Billboard position={[15, 2, 0]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          MEDITATION SPA
        </Text>
      </Billboard>
      
      {/* Second floor rooms */}
      <Billboard position={[-15, 7, -10]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          TRAINING ROOM
        </Text>
      </Billboard>
      
      <Billboard position={[15, 7, -10]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          LIBRARY
        </Text>
      </Billboard>
      
      <Billboard position={[0, 7, 15]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          TRADING LOUNGE
        </Text>
      </Billboard>
      
      {/* Third floor rooms */}
      <Billboard position={[-15, 12, 0]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          SLEEPING QUARTERS
        </Text>
      </Billboard>
      
      <Billboard position={[0, 12, 0]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          CONFERENCE ROOM
        </Text>
      </Billboard>
      
      <Billboard position={[15, 12, 0]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          OFFICES
        </Text>
      </Billboard>
      
      {/* Fourth floor rooms */}
      <Billboard position={[0, 17, 0]} follow={true}>
        <Text fontSize={0.5} color="#ffffff">
          EXECUTIVE SUITE
        </Text>
      </Billboard>
    </group>
  );
}

// Trading screens in the main atrium
function TradingScreens() {
  return (
    <group>
      {/* Main central display wall */}
      <MarketDataScreen 
        position={[0, 10, -20]} 
        rotation={[0, 0, 0]}
      />
      
      {/* Side screens */}
      <MarketDataScreen 
        position={[-20, 10, 0]} 
        rotation={[0, Math.PI / 2, 0]}
      />
      
      <MarketDataScreen 
        position={[20, 10, 0]} 
        rotation={[0, -Math.PI / 2, 0]}
      />
    </group>
  );
}

// THC Coin displays placed throughout the trade house
function THCCoins() {
  // Handler for coin click events
  const handleCoinClick = (location: string) => {
    console.log(`THC Coin clicked at ${location}`);
    // Could open THC token info panel here in the future
  };
  
  return (
    <group>
      {/* Main lobby coin display - larger showcase */}
      <THCCoinDisplay 
        position={[0, 3, 0]} 
        scale={[2, 2, 2]} 
        animate={true}
        onClick={() => handleCoinClick('Main Lobby')} 
      />
      
      {/* Trading lounge coin */}
      <THCCoinDisplay 
        position={[0, 8, 15]} 
        scale={[1.5, 1.5, 1.5]} 
        animate={true}
        onClick={() => handleCoinClick('Trading Lounge')} 
      />
      
      {/* Executive suite premium display */}
      <THCCoinDisplay 
        position={[0, 18, 0]} 
        scale={[2.5, 2.5, 2.5]} 
        animate={true}
        onClick={() => handleCoinClick('Executive Suite')} 
      />
      
      {/* Training room coin for educational purposes */}
      <THCCoinDisplay 
        position={[-15, 8, -10]} 
        scale={[1, 1, 1]} 
        animate={true}
        onClick={() => handleCoinClick('Training Room')} 
      />
      
      {/* Conference room presentation coin */}
      <THCCoinDisplay 
        position={[0, 13, 0]} 
        scale={[1.8, 1.8, 1.8]} 
        animate={true}
        onClick={() => handleCoinClick('Conference Room')} 
      />
    </group>
  );
}

// Badge trigger zones throughout the trade house
function BadgeTriggerZones() {
  // Handle location visited event for additional effects if needed
  const handleLocationVisited = (locationId: string) => {
    console.log(`📍 Location visited: ${locationId}`);
  };
  
  return (
    <group>
      {/* Trading Floor - Main Lobby */}
      <BadgeTriggerZone 
        locationId="trade_floor" 
        position={[0, 2, 0]} 
        size={[10, 3, 10]} 
        color="#4A90E2" 
        onLocationVisited={handleLocationVisited}
      />
      
      {/* Education Center - Training Room */}
      <BadgeTriggerZone 
        locationId="education_center" 
        position={[-15, 7, -10]} 
        size={[8, 3, 8]} 
        color="#50E3C2" 
        onLocationVisited={handleLocationVisited}
      />
      
      {/* Social Hub - Meditation Spa */}
      <BadgeTriggerZone 
        locationId="social_hub" 
        position={[15, 2, 0]} 
        size={[8, 3, 8]} 
        color="#9013FE" 
        onLocationVisited={handleLocationVisited}
      />
      
      {/* Signal Room - Trading Lounge */}
      <BadgeTriggerZone 
        locationId="signal_room" 
        position={[0, 7, 15]} 
        size={[8, 3, 8]} 
        color="#F5A623" 
        onLocationVisited={handleLocationVisited}
      />
      
      {/* Crypto Exchange - Conference Room */}
      <BadgeTriggerZone 
        locationId="crypto_exchange" 
        position={[0, 12, 0]} 
        size={[8, 3, 8]} 
        color="#7ED321" 
        onLocationVisited={handleLocationVisited}
      />
      
      {/* THC Vault - Executive Suite */}
      <BadgeTriggerZone 
        locationId="thc_vault" 
        position={[0, 17, 0]} 
        size={[10, 3, 10]} 
        color="#E91E63" 
        onLocationVisited={handleLocationVisited}
      />
    </group>
  );
}

// Light sources
function Lights() {
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  //useHelper(mainLightRef, THREE.DirectionalLightHelper, 5, 'red');
  
  return (
    <>
      {/* Main directional light with shadows */}
      <directionalLight
        ref={mainLightRef}
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Additional light sources for the atrium */}
      <pointLight position={[0, 15, 0]} intensity={0.8} castShadow />
      <pointLight position={[15, 5, 15]} intensity={0.5} />
      <pointLight position={[-15, 5, -15]} intensity={0.5} />
      
      {/* Colored accent lights */}
      <pointLight position={[-15, 5, 0]} intensity={0.3} color="#0066ff" />
      <pointLight position={[15, 5, 0]} intensity={0.3} color="#ff6600" />
    </>
  );
}

// Main TradeHouse component
export default function TradeHouse() {
  const [mobileControls, setMobileControls] = useState(false);
  const [moveDirection, setMoveDirection] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const { controlsEnabled } = useControlsStore();
  
  // Set that we're in the metaverse for audio context
  useEffect(() => {
    const audioStore = useAudio.getState();
    audioStore.setInMetaverse(true);
    
    // If in metaverse mode, try to play music
    audioStore.playMusic();
    
    console.log("TradeHouse component mounted, audio initialized");
    
    // Clean up on unmount
    return () => {
      audioStore.setInMetaverse(false);
      audioStore.pauseMusic();
    };
  }, []);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768;
      setMobileControls(isMobile);
      console.log("Mobile detection:", { isMobile, width: window.innerWidth });
    };
    
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Handle mobile joystick movement
  const handleMobileMove = (x: number, y: number) => {
    console.log("Mobile move:", { x, y });
    // Invert Y axis for intuitive controls (pushing up should move forward)
    setMoveDirection({ x, y: -y });
  };
  
  // Handle jump on mobile
  const handleMobileJump = (jumping: boolean) => {
    console.log("Mobile jump:", jumping);
    setIsJumping(jumping);
  };
  
  // Handle sprint on mobile
  const handleMobileSprint = (sprinting: boolean) => {
    console.log("Mobile sprint:", sprinting);
    setIsSprinting(sprinting);
  };
  
  // Handle action on mobile
  const handleMobileAction = () => {
    console.log("Mobile action triggered");
    // Additional action handling can be added here
  };
  
  return (
    <>
      <KeyboardControls map={controlKeys}>
        <Canvas shadows className="w-full h-full">
          <Sky sunPosition={[100, 100, 0]} />
          <Lights />
          
          <Physics gravity={[0, -30, 0]}>
            <TradeHouseStructure />
            <TradingScreens />
            <RoomLabels />
            <THCCoins />
            <BadgeTriggerZones />
            
            {/* Player needs to be wrapped in Suspense since it uses dynamic imports */}
            <Suspense fallback={null}>
              <Player 
                mobileControls={mobileControls} 
                mobileDirection={moveDirection} 
                mobileJump={isJumping}
                mobileSprint={isSprinting}
              />
              {/* Only activate pointer lock when we're in navigation mode and not on mobile */}
              {!mobileControls && controlsEnabled && <PointerLockControls />}
              
              {/* Show initial instruction tooltip when not on mobile */}
              {!mobileControls && !controlsEnabled && (
                <Billboard position={[0, 2, -5]} follow={true}>
                  <Text fontSize={0.5} color="#ffffff" maxWidth={20} textAlign="center">
                    Click the "Move Character" button in the top-right corner to navigate
                  </Text>
                </Billboard>
              )}
              
              {/* Show mobile instruction tooltip */}
              {mobileControls && (
                <Billboard position={[0, 2, -5]} follow={true}>
                  <Text fontSize={0.5} color="#ffffff" maxWidth={20} textAlign="center">
                    Use the joystick on the left to move around
                  </Text>
                </Billboard>
              )}
            </Suspense>
          </Physics>
        </Canvas>
      </KeyboardControls>
      
      {/* Use the improved MobileControls component */}
      {mobileControls && (
        <MobileControls 
          onDirectionChange={handleMobileMove}
          onJump={handleMobileJump}
          onSprint={handleMobileSprint}
          onAction={handleMobileAction}
        />
      )}
    </>
  );
}