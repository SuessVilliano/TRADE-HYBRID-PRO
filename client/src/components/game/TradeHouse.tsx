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
function Player() {
  const playerRef = useRef<THREE.Group>(null);
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 2, 0],
    args: [0.5, 1.8, 0.5]
  }));

  // Movement controls
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
    const { forward, backward, left, right, jump, sprint } = getKeys();
    
    // Apply movement forces based on key presses
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
    <group ref={playerRef}>
      <mesh ref={ref} castShadow>
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
    <group ref={ref}>
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
    <mesh ref={ref} receiveShadow castShadow>
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
  return (
    <KeyboardControls map={controlKeys}>
      <Canvas shadows className="w-full h-full">
        <Sky sunPosition={[100, 100, 0]} />
        <Lights />
        
        <Physics gravity={[0, -30, 0]}>
          <TradeHouseStructure />
          <TradingScreens />
          <RoomLabels />
          
          {/* Player needs to be wrapped in Suspense since it uses dynamic imports */}
          <Suspense fallback={null}>
            <Player />
            <PointerLockControls />
          </Suspense>
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
}